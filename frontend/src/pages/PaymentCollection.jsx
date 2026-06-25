import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, Grid, TextField, MenuItem, Divider,
    Card, CardContent, useMediaQuery, useTheme
} from '@mui/material';
import {
    CurrencyRupee as CurrencyRupeeIcon,
    ReceiptLong as ReceiptIcon,
    Visibility as VisibilityIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { getBookings, getPayments, addPayment } from '../services/api';
import html2pdf from 'html2pdf.js';

const BillTemplate = React.forwardRef(({ booking, payments }, ref) => {
    if (!booking) return null;
    const totalAmount = parseFloat(booking.tariff_amount || 0);
    const paidAmount = parseFloat(booking.amount_paid || 0);
    const balance = totalAmount - paidAmount;

    return (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <Box ref={ref} sx={{ p: 5, bgcolor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', width: '800px' }}>
                <Box textAlign="center" mb={4}>
                    <img src="/LOGO (2).png" alt="KDCEA Logo" style={{ maxWidth: '150px', marginBottom: '15px' }} />
                    <Typography variant="h4" fontWeight="bold" color="black">KARUR BUILD EXPO 2026</Typography>
                    <Typography variant="h6" color="black" fontWeight="bold" mt={1}>PAYMENT RECEIPT & BILL</Typography>
                </Box>
                <Divider sx={{ mb: 4, borderColor: 'black' }} />

                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                        <Typography variant="body2"><strong>Booking ID:</strong> {booking.booking_id}</Typography>
                        <Typography variant="body2"><strong>Company:</strong> {booking.company_name}</Typography>
                        <Typography variant="body2"><strong>Contact:</strong> {booking.contact_person} ({booking.mobile})</Typography>
                    </Grid>
                    <Grid item xs={6} textAlign="right">
                        <Typography variant="body2"><strong>Date:</strong> {new Date().toLocaleDateString()}</Typography>
                        <Typography variant="body2"><strong>Hall:</strong> {booking.hall_name}</Typography>
                        <Typography variant="body2"><strong>Stall:</strong> {booking.stall_no}</Typography>
                    </Grid>
                </Grid>

                <Typography variant="h6" fontWeight="bold" mb={1} color="black">Payment Ledger</Typography>
                <TableContainer sx={{ mb: 4 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ borderBottom: '1px solid black', fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ borderBottom: '1px solid black', fontWeight: 'bold' }}>Mode</TableCell>
                                <TableCell sx={{ borderBottom: '1px solid black', fontWeight: 'bold' }}>Ref No</TableCell>
                                <TableCell align="right" sx={{ borderBottom: '1px solid black', fontWeight: 'bold' }}>Amount Paid (₹)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>{p.payment_date}</TableCell>
                                    <TableCell sx={{ textTransform: 'capitalize', borderBottom: 'none', py: 0.5 }}>{p.payment_mode}</TableCell>
                                    <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>{p.reference_no || '-'}</TableCell>
                                    <TableCell align="right" sx={{ borderBottom: 'none', py: 0.5 }}>{parseFloat(p.amount).toLocaleString('en-IN')}</TableCell>
                                </TableRow>
                            ))}
                            {payments.length === 0 && (
                                <TableRow><TableCell colSpan={4} align="center" sx={{ borderBottom: 'none' }}>No payments recorded yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Grid container justifyContent="flex-end">
                    <Grid item xs={6}>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none', py: 0.5 }}>Total Tariff</TableCell>
                                    <TableCell align="right" sx={{ borderBottom: 'none', py: 0.5 }}>₹{totalAmount.toLocaleString('en-IN')}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'black', borderBottom: 'none', py: 0.5 }}>Total Paid</TableCell>
                                    <TableCell align="right" sx={{ color: 'black', borderBottom: 'none', py: 0.5 }}>₹{paidAmount.toLocaleString('en-IN')}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'black', borderBottom: 'none', py: 1 }}>Balance Due</TableCell>
                                    <TableCell align="right" sx={{ color: 'black', fontWeight: 'bold', borderBottom: 'none', py: 1 }}>₹{balance.toLocaleString('en-IN')}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>
                </Grid>
            </Box>
        </div>
    );
});

export default function PaymentCollection() {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [payments, setPayments] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        payment_mode: 'bank_transfer',
        payment_date: new Date().toISOString().split('T')[0],
        reference_no: '',
        remarks: ''
    });

    const printRef = useRef();
    const handlePrint = () => {
        const element = printRef.current;
        if (!element) return;

        const opt = {
            margin: 0.5,
            filename: selectedBooking ? `Bill_${selectedBooking.booking_id}.pdf` : 'Bill.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    const fetchBookings = async () => {
        try {
            const res = await getBookings();
            if (res.data.status === 'success') {
                // Only show Approved bookings for payment collection
                const approved = res.data.data.filter(b => b.status === 'Approved');
                setBookings(approved);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const openPaymentModal = async (booking) => {
        setSelectedBooking(booking);
        setModalOpen(true);
        // Reset form to balance amount
        const total = parseFloat(booking.tariff_amount || 0);
        const paid = parseFloat(booking.amount_paid || 0);
        const balance = total - paid;

        setPaymentForm({
            amount: balance > 0 ? balance : 0,
            payment_mode: 'bank_transfer',
            payment_date: new Date().toISOString().split('T')[0],
            reference_no: '',
            remarks: ''
        });

        // Fetch past payments
        try {
            const res = await getPayments(booking.id);
            if (res.data.status === 'success') {
                setPayments(res.data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRecordPayment = async () => {
        if (!paymentForm.amount || paymentForm.amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        try {
            const payload = {
                ...paymentForm,
                booking_id: selectedBooking.id
            };
            const res = await addPayment(payload);
            if (res.data.status === 'success') {
                alert('Payment recorded successfully');
                setModalOpen(false);
                fetchBookings();
            } else {
                alert('Failed to record payment');
            }
        } catch (err) {
            console.error(err);
            alert('Error recording payment');
        }
    };

    const getPaymentStatus = (paid, total) => {
        if (paid <= 0) return { label: 'No amount received', color: 'error' };
        if (paid < total) return { label: 'Part amount received', color: 'info' };
        return { label: 'Full amount received', color: 'success' };
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredBookings = bookings.filter(b => {
        const total = parseFloat(b.tariff_amount || 0);
        const paid = parseFloat(b.amount_paid || 0);
        
        let matchesSearch = true;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            matchesSearch = (
                b.booking_id?.toString().toLowerCase().includes(term) ||
                b.company_name?.toLowerCase().includes(term) ||
                b.contact_person?.toLowerCase().includes(term) ||
                b.mobile?.toLowerCase().includes(term)
            );
        }

        let matchesFilter = true;
        if (statusFilter !== 'all') {
            if (statusFilter === 'no_amount' && paid > 0) matchesFilter = false;
            if (statusFilter === 'part_amount' && (paid === 0 || paid >= total)) matchesFilter = false;
            if (statusFilter === 'full_amount' && paid < total) matchesFilter = false;
        }

        return matchesSearch && matchesFilter;
    });

    return (
        <Box>
            <Typography variant="h4" fontWeight="800" mb={4} sx={{ color: '#002266' }}>Payment Collection</Typography>
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <TextField 
                        label="Search by Booking ID, Company, Contact..."
                        variant="outlined"
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                        }}
                        sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        select
                        label="Filter by Status"
                        variant="outlined"
                        fullWidth
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ bgcolor: 'white', borderRadius: 1 }}
                    >
                        <MenuItem value="all">All Bookings</MenuItem>
                        <MenuItem value="no_amount">No Amount Received</MenuItem>
                        <MenuItem value="part_amount">Part Amount Received</MenuItem>
                        <MenuItem value="full_amount">Full Amount Received</MenuItem>
                    </TextField>
                </Grid>
            </Grid>

            {isMobile ? (
                <Grid container spacing={2}>
                    {filteredBookings.map((b) => {
                        const total = parseFloat(b.tariff_amount || 0);
                        const paid = parseFloat(b.amount_paid || 0);
                        const balance = total - paid;
                        const status = getPaymentStatus(paid, total);

                        return (
                            <Grid item xs={12} key={b.id}>
                                <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #eaeaea', bgcolor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0' }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                                                ID: {b.booking_id}
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1.2, color: '#1a1a1a' }}>
                                                {b.company_name}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            label={status.label} 
                                            sx={{ 
                                                fontWeight: 'bold', 
                                                borderRadius: '8px',
                                                bgcolor: balance > 0 ? '#ffebee' : '#e8f5e9',
                                                color: balance > 0 ? '#c62828' : '#2e7d32',
                                            }} 
                                            size="small" 
                                        />
                                    </Box>
                                    
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Grid container spacing={2} sx={{ mb: 1.5 }}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary" display="block">Total Tariff</Typography>
                                                <Typography variant="body1" fontWeight="700" color="#333">₹{total.toLocaleString('en-IN')}</Typography>
                                            </Grid>
                                            <Grid item xs={6} textAlign="right">
                                                <Typography variant="caption" color="text.secondary" display="block">Amount Paid</Typography>
                                                <Typography variant="body1" fontWeight="700" color="success.main">₹{paid.toLocaleString('en-IN')}</Typography>
                                            </Grid>
                                        </Grid>
                                        
                                        <Box sx={{ bgcolor: balance > 0 ? '#fff5f5' : '#f4f6f8', p: 1.5, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary" fontWeight="600">Balance Due</Typography>
                                            <Typography variant="h6" fontWeight="800" color={balance > 0 ? "error.main" : "text.secondary"}>₹{balance.toLocaleString('en-IN')}</Typography>
                                        </Box>

                                        <Box mt={2}>
                                            <Button 
                                                variant={balance > 0 ? "contained" : "outlined"}
                                                color={balance > 0 ? "primary" : "success"}
                                                fullWidth 
                                                startIcon={balance > 0 ? <CurrencyRupeeIcon /> : <VisibilityIcon />} 
                                                onClick={() => openPaymentModal(b)}
                                                sx={{ 
                                                    borderRadius: 2, 
                                                    textTransform: 'none', 
                                                    fontWeight: 700, 
                                                    py: 1,
                                                    boxShadow: 'none',
                                                    ...(balance <= 0 && { borderWidth: '2px', '&:hover': { borderWidth: '2px' } })
                                                }}
                                            >
                                                {balance > 0 ? 'Record Payment' : 'View Details'}
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                    {filteredBookings.length === 0 && (
                        <Grid item xs={12}>
                            <Typography align="center" py={3}>No bookings match your criteria.</Typography>
                        </Grid>
                    )}
                </Grid>
            ) : (
                <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                    <TableCell fontWeight="bold">Booking ID</TableCell>
                                    <TableCell fontWeight="bold">Company Name</TableCell>
                                    <TableCell fontWeight="bold">Total Amount</TableCell>
                                    <TableCell fontWeight="bold">Paid Amount</TableCell>
                                    <TableCell fontWeight="bold">Balance</TableCell>
                                    <TableCell fontWeight="bold">Status</TableCell>
                                    <TableCell align="center" fontWeight="bold">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bookings.map((b) => {
                                    const total = parseFloat(b.tariff_amount || 0);
                                    const paid = parseFloat(b.amount_paid || 0);
                                    const balance = total - paid;
                                    const status = getPaymentStatus(paid, total);

                                    return (
                                        <TableRow key={b.id} hover>
                                            <TableCell>{b.booking_id}</TableCell>
                                            <TableCell fontWeight="500">{b.company_name}</TableCell>
                                            <TableCell>₹{total.toLocaleString('en-IN')}</TableCell>
                                            <TableCell sx={{ color: paid > 0 ? 'success.main' : 'inherit', fontWeight: 'bold' }}>
                                                ₹{paid.toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell sx={{ color: balance > 0 ? 'error.main' : 'inherit', fontWeight: 'bold' }}>
                                                ₹{balance.toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={status.label} color={status.color} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton color="success" onClick={() => openPaymentModal(b)} title="Record Payment / View Details">
                                                    <CurrencyRupeeIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {bookings.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 5 }}>No approved bookings found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Payment Modal */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
                {selectedBooking && (
                    <>
                        <BillTemplate ref={printRef} booking={{
                            ...selectedBooking,
                            amount_paid: selectedBooking.amount_paid || payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
                        }} payments={payments} />

                        <DialogTitle sx={{ bgcolor: '#002266', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Payments - {selectedBooking.company_name}</Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<ReceiptIcon />}
                                onClick={() => handlePrint()}
                                size="small"
                            >
                                Generate Bill
                            </Button>
                        </DialogTitle>
                        <DialogContent dividers sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f9f9f9' }}>
                            <Grid container spacing={4}>
                                {/* Left Side: Past Payments */}
                                <Grid item xs={12} md={7}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Payment History</Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead sx={{ bgcolor: 'grey.200' }}>
                                                <TableRow>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Mode</TableCell>
                                                    <TableCell align="right">Amount (₹)</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {payments.map(p => (
                                                    <TableRow key={p.id}>
                                                        <TableCell>{p.payment_date}</TableCell>
                                                        <TableCell sx={{ textTransform: 'capitalize' }}>{p.payment_mode}</TableCell>
                                                        <TableCell align="right" fontWeight="bold">{parseFloat(p.amount).toLocaleString('en-IN')}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {payments.length === 0 && (
                                                    <TableRow><TableCell colSpan={3} align="center">No payments recorded</TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>

                                {/* Right Side: Record Payment Form */}
                                <Grid item xs={12} md={5}>
                                    <Paper sx={{ p: 3, borderRadius: 2 }} elevation={2}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">Record New Payment</Typography>

                                        <TextField
                                            label="Amount (₹)"
                                            type="number"
                                            fullWidth
                                            size="small"
                                            margin="normal"
                                            value={paymentForm.amount}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                        />
                                        <TextField
                                            select
                                            label="Payment Mode"
                                            fullWidth
                                            size="small"
                                            margin="normal"
                                            value={paymentForm.payment_mode}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, payment_mode: e.target.value })}
                                        >
                                            <MenuItem value="cash">Cash</MenuItem>
                                            <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                                            <MenuItem value="upi">UPI</MenuItem>
                                            <MenuItem value="cheque">Cheque</MenuItem>
                                        </TextField>
                                        <TextField
                                            label="Payment Date"
                                            type="date"
                                            fullWidth
                                            size="small"
                                            margin="normal"
                                            InputLabelProps={{ shrink: true }}
                                            value={paymentForm.payment_date}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                                        />
                                        <TextField
                                            label="Reference No (Optional)"
                                            fullWidth
                                            size="small"
                                            margin="normal"
                                            value={paymentForm.reference_no}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, reference_no: e.target.value })}
                                        />
                                        <TextField
                                            label="Remarks (Optional)"
                                            fullWidth
                                            size="small"
                                            margin="normal"
                                            multiline
                                            rows={2}
                                            value={paymentForm.remarks}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                                        />

                                        <Button
                                            variant="contained"
                                            color="success"
                                            fullWidth
                                            sx={{ mt: 2 }}
                                            onClick={handleRecordPayment}
                                        >
                                            Save Payment
                                        </Button>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button onClick={() => setModalOpen(false)} color="inherit">Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}
