import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, TextField, Button, Paper, Grid, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Card, CardContent, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Divider,
    useMediaQuery, useTheme, MenuItem
} from '@mui/material';
import {
    People as PeopleIcon,
    Today as TodayIcon,
    CheckCircle as CheckCircleIcon,
    HourglassEmpty as PendingIcon,
    Search as SearchIcon,
    Login as CheckInIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import { getVisitorStats, searchVisitors, getAllVisitors, checkInVisitor } from '../services/api';
import { useReactToPrint } from 'react-to-print';

const VisitorPassPrint = React.forwardRef(({ visitor }, ref) => {
    if (!visitor) return null;
    return (
        <div style={{ display: 'none' }}>
            <Box ref={ref} sx={{ width: '400px', p: 0, bgcolor: 'white', fontFamily: 'Arial, sans-serif' }}>
                <Box sx={{ bgcolor: '#002266', color: 'white', p: 3, textAlign: 'center' }}>
                    <img src="/LOGO (2).png" alt="KDCEA Logo" style={{ maxWidth: '80px', marginBottom: '10px' }} />
                    <Typography variant="h5" fontWeight="bold">KARUR BUILD EXPO 2026</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>Visitor Pass</Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant="h4" fontWeight="900" color="#002266" letterSpacing={1}>{visitor.visitor_id}</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Visitor Name</Typography>
                        <Typography variant="h6" fontWeight="700" color="#1a1a1a">{visitor.name}</Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Mobile Number</Typography>
                        <Typography variant="body1" fontWeight="600" color="#333">{visitor.mobile}</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            Prem Mahal, Salem Bypass Rd, Karur, Tamil Nadu 639002
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </div>
    );
});

const VisitorDashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [stats, setStats] = useState({ total_visitors: 0, today_visitors: 0, checked_in: 0, pending: 0, recent: [] });
    const [visitors, setVisitors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkInLoading, setCheckInLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

    // Check-in dialog
    const [checkInOpen, setCheckInOpen] = useState(false);
    const [checkInQuery, setCheckInQuery] = useState('');
    const [staffName, setStaffName] = useState('');

    // Print pass
    const [selectedVisitor, setSelectedVisitor] = useState(null);
    const passRef = useRef();
    const handlePrintPass = useReactToPrint({
        contentRef: passRef,
        documentTitle: selectedVisitor ? `Visitor_Pass_${selectedVisitor.visitor_id}` : 'Visitor_Pass',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, visitorsRes] = await Promise.all([
                getVisitorStats(),
                getAllVisitors()
            ]);
            if (statsRes.data.status === 'success') setStats(statsRes.data.data);
            if (visitorsRes.data.status === 'success') setVisitors(visitorsRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchData();
            return;
        }
        setLoading(true);
        try {
            const res = await searchVisitors(searchTerm.trim());
            if (res.data.status === 'success') setVisitors(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!checkInQuery.trim()) return;
        setCheckInLoading(true);
        try {
            const payload = {};
            if (checkInQuery.trim().startsWith('EVT-')) {
                payload.visitor_id = checkInQuery.trim();
            } else {
                payload.mobile = checkInQuery.trim();
            }
            if (staffName.trim()) payload.entry_staff = staffName.trim();

            const res = await checkInVisitor(payload);
            if (res.data.status === 'success') {
                setAlert({ show: true, message: `${res.data.data.name} has been checked in successfully!`, severity: 'success' });
                setCheckInOpen(false);
                setCheckInQuery('');
                setStaffName('');
                fetchData();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Check-in failed.';
            setAlert({ show: true, message: msg, severity: 'error' });
        } finally {
            setCheckInLoading(false);
        }
    };

    const handleDownloadPass = (visitor) => {
        setSelectedVisitor(visitor);
        setTimeout(() => handlePrintPass(), 300);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '-';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    };

    const statCards = [
        { title: 'Total Visitors', value: stats.total_visitors, icon: <PeopleIcon sx={{ fontSize: 32 }} />, color: '#002266', bgColor: '#e3f2fd' },
        { title: "Today's Visitors", value: stats.today_visitors, icon: <TodayIcon sx={{ fontSize: 32 }} />, color: '#0277bd', bgColor: '#e1f5fe' },
        { title: 'Checked In', value: stats.checked_in, icon: <CheckCircleIcon sx={{ fontSize: 32 }} />, color: '#2e7d32', bgColor: '#e8f5e9' },
        { title: 'Pending', value: stats.pending, icon: <PendingIcon sx={{ fontSize: 32 }} />, color: '#ef6c00', bgColor: '#fff3e0' },
    ];

    return (
        <Box>
            <VisitorPassPrint ref={passRef} visitor={selectedVisitor} />

            <Typography variant="h5" fontWeight="800" mb={3} sx={{ color: '#002266' }}>Visitor Management</Typography>

            {alert.show && (
                <Alert severity={alert.severity} sx={{ mb: 3 }} onClose={() => setAlert({ ...alert, show: false })}>
                    {alert.message}
                </Alert>
            )}

            {/* Stat Cards */}
            <Grid container spacing={3} mb={4}>
                {statCards.map((s, i) => (
                    <Grid item xs={6} md={3} key={i}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', bgcolor: s.bgColor, height: '100%' }}>
                            <Box sx={{ color: s.color, mb: 1 }}>{s.icon}</Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="600" display="block">{s.title}</Typography>
                            <Typography variant="h3" fontWeight="800" color={s.color}>{s.value}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Action Bar */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, mb: 4, border: '1px solid #e0e0e0' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Search by Visitor ID, Name, or Mobile..."
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<SearchIcon />}
                            onClick={handleSearch}
                            sx={{ bgcolor: '#002266', '&:hover': { bgcolor: '#003399' }, fontWeight: 700, borderRadius: 2, textTransform: 'none', py: 1 }}
                        >
                            Search
                        </Button>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<CheckInIcon />}
                            onClick={() => setCheckInOpen(true)}
                            sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' }, fontWeight: 700, borderRadius: 2, textTransform: 'none', py: 1 }}
                        >
                            Check-In Visitor
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Visitors Table / Cards */}
            {loading ? (
                <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
            ) : isMobile ? (
                <Grid container spacing={2}>
                    {visitors.map((v) => (
                        <Grid item xs={12} key={v.id}>
                            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eaeaea' }}>
                                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight="bold">{v.visitor_id}</Typography>
                                        <Typography variant="h6" fontWeight="800" color="#1a1a1a">{v.name}</Typography>
                                    </Box>
                                    <Chip
                                        label={v.status}
                                        size="small"
                                        sx={{
                                            fontWeight: 'bold',
                                            borderRadius: '8px',
                                            bgcolor: v.status === 'Checked In' ? '#e8f5e9' : '#fff3e0',
                                            color: v.status === 'Checked In' ? '#2e7d32' : '#ef6c00',
                                        }}
                                    />
                                </Box>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Mobile</Typography>
                                            <Typography variant="body2" fontWeight="600">{v.mobile}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Registered</Typography>
                                            <Typography variant="body2" fontWeight="600">{formatDate(v.created_at)}</Typography>
                                        </Grid>
                                        {v.status === 'Checked In' && (
                                            <>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">Entry Time</Typography>
                                                    <Typography variant="body2" fontWeight="600">{formatTime(v.entry_time)}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">Staff</Typography>
                                                    <Typography variant="body2" fontWeight="600">{v.entry_staff || '-'}</Typography>
                                                </Grid>
                                            </>
                                        )}
                                    </Grid>
                                    <Box mt={2}>
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            startIcon={<DownloadIcon />}
                                            onClick={() => handleDownloadPass(v)}
                                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, borderWidth: '2px', '&:hover': { borderWidth: '2px' } }}
                                        >
                                            Download Pass
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                    {visitors.length === 0 && (
                        <Grid item xs={12}>
                            <Typography align="center" py={3} color="text.secondary">No visitors found.</Typography>
                        </Grid>
                    )}
                </Grid>
            ) : (
                <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Visitor ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Mobile</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Registered</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Entry Time</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Staff</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {visitors.map((v) => (
                                    <TableRow key={v.id} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{v.visitor_id}</TableCell>
                                        <TableCell>{v.name}</TableCell>
                                        <TableCell>{v.mobile}</TableCell>
                                        <TableCell>{formatDate(v.created_at)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={v.status}
                                                size="small"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    bgcolor: v.status === 'Checked In' ? '#e8f5e9' : '#fff3e0',
                                                    color: v.status === 'Checked In' ? '#2e7d32' : '#ef6c00',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{v.entry_time ? `${formatDate(v.entry_date)} ${formatTime(v.entry_time)}` : '-'}</TableCell>
                                        <TableCell>{v.entry_staff || '-'}</TableCell>
                                        <TableCell align="center">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<DownloadIcon />}
                                                onClick={() => handleDownloadPass(v)}
                                                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                                            >
                                                Pass
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {visitors.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">No visitors found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Check-In Dialog */}
            <Dialog open={checkInOpen} onClose={() => setCheckInOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#2e7d32', color: 'white', fontWeight: 700 }}>
                    <CheckInIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Check-In Visitor
                </DialogTitle>
                <DialogContent sx={{ p: 4, mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Enter the Visitor ID (e.g., EVT-2026-0001) or mobile number to check in the visitor.
                    </Typography>
                    <TextField
                        label="Visitor ID or Mobile Number"
                        variant="outlined"
                        fullWidth
                        value={checkInQuery}
                        onChange={(e) => setCheckInQuery(e.target.value)}
                        sx={{ mb: 3 }}
                        placeholder="EVT-2026-0001 or 9876543210"
                        autoFocus
                    />
                    <TextField
                        label="Entry Staff Name"
                        variant="outlined"
                        fullWidth
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        placeholder="Name of the staff at entry gate"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Button onClick={() => setCheckInOpen(false)} color="inherit">Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCheckIn}
                        disabled={checkInLoading || !checkInQuery.trim()}
                        sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' }, fontWeight: 700 }}
                    >
                        {checkInLoading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Check-In'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default VisitorDashboard;
