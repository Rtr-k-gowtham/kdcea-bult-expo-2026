import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Container, Typography, Grid, Card, CardContent, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Chip, Drawer, List, ListItem, ListItemIcon, 
  ListItemText, AppBar, Toolbar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  useMediaQuery, useTheme, TextField, MenuItem
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  ListAlt as ListAltIcon, 
  ExitToApp as LogoutIcon,
  Visibility as VisibilityIcon,
  CloudDownload as DownloadIcon,
  Print as PrintIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { getDashboardStats, getBookings, approveBooking, rejectBooking } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import HallMaster from './masters/HallMaster';
import CategoryMaster from './masters/CategoryMaster';
import StallMaster from './masters/StallMaster';
import PaymentCollection from './PaymentCollection';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const drawerWidth = 240;

const BookingSlipTemplate = React.forwardRef(({ booking }, ref) => {
    if (!booking) return null;
    return (
        <div style={{ display: 'none' }}>
            <Box ref={ref} sx={{ p: 5, bgcolor: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
                {/* Header with Logo */}
                <Box textAlign="center" mb={4}>
                    <img src="/LOGO (2).png" alt="KDCEA Logo" style={{ maxWidth: '150px', marginBottom: '15px' }} />
                    <Typography variant="h4" fontWeight="bold" color="black">KARUR BUILD EXPO 2026</Typography>
                    <Typography variant="h6" color="black" fontWeight="bold" mt={1}>STALL BOOKING CONFIRMATION SLIP</Typography>
                </Box>

                <Divider sx={{ mb: 4, borderColor: 'black' }} />

                {/* Event Details */}
                <Box mb={4}>
                    <Typography variant="body1" fontWeight="bold">Event Details:</Typography>
                    <Typography variant="body2" mt={1}><strong>Venue:</strong> Prem Mahal No 18 New Byepass Road, Road, Salem Bypass Rd, Karur, Tamil Nadu 639002</Typography>
                    <Typography variant="body2" mt={0.5}><strong>Organizer:</strong> Karur District Civil Engineers Association (KDCEA)</Typography>
                </Box>

                {/* Booking Details */}
                <Typography variant="h6" fontWeight="bold" mb={1} color="black">Applicant Details</Typography>
                <TableContainer sx={{ mb: 4 }}>
                    <Table size="small">
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', width: '30%', borderBottom: 'none', py: 0.5 }}>Booking ID</TableCell>
                                <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>{booking.booking_id}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none', py: 0.5 }}>Company Name</TableCell>
                                <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>{booking.company_name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none', py: 0.5 }}>Contact Person</TableCell>
                                <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>{booking.contact_person}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none', py: 0.5 }}>Mobile Number</TableCell>
                                <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>{booking.mobile}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none', py: 0.5 }}>Email Address</TableCell>
                                <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>{booking.email}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none', py: 0.5 }}>Company Address</TableCell>
                                <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>{booking.address}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography variant="h6" fontWeight="bold" mb={1} color="black">Stall Allocation</Typography>
                <TableContainer sx={{ mb: 4 }}>
                    <Table size="small">
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', width: '30%', borderBottom: 'none', py: 0.5 }}>Assigned Hall</TableCell>
                                <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>{booking.hall_name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none', py: 0.5 }}>Stall Number</TableCell>
                                <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>{booking.stall_no}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none', py: 0.5 }}>Approval Date</TableCell>
                                <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>{new Date(booking.approved_at || booking.created_at).toLocaleString()}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Important Notices */}
                <Box mt={4} mb={4}>
                    <Typography variant="body1" color="black" fontWeight="bold" gutterBottom>
                        Important Payment Notice:
                    </Typography>
                    <Typography variant="body2" color="black">
                        To secure your stall allocation, an advance payment of <strong>50% of the total amount</strong> must be completed on or before <strong>July 10th, 2026</strong>. Please ensure timely payment to avoid cancellation of your booking.
                    </Typography>
                </Box>

                {/* Footer Notes */}
                <Box mt={4} textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                        Congratulations! Your stall at Karur Build Expo 2026 has been successfully confirmed.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold" mt={1}>
                        Please present this confirmation slip at the venue registration desk.
                    </Typography>
                </Box>
            </Box>
        </div>
    );
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('applications');
  const [stats, setStats] = useState({
    total_stalls: 0, available_stalls: 0, pending: 0, approved: 0, rejected: 0
  });
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('stall');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
      setMobileOpen(!mobileOpen);
  };
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Print capabilities
  const printRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedBooking ? `Booking_Slip_${selectedBooking.booking_id || selectedBooking.company_name}` : 'Booking_Slip',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const statsRes = await getDashboardStats();
      if(statsRes.data.status === 'success') setStats(statsRes.data.data);
      
      const bookingsRes = await getBookings();
      if(bookingsRes.data.status === 'success') setBookings(bookingsRes.data.data);
    } catch (err) {
      if(err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    if(window.confirm('Are you sure you want to approve this booking?')) {
        try {
            await approveBooking(id);
            fetchData();
            setModalOpen(false);
        } catch(err) {
            alert('Failed to approve');
        }
    }
  };

  const handleReject = async (id) => {
    if(window.confirm('Are you sure you want to reject this booking?')) {
        try {
            await rejectBooking(id);
            fetchData();
            setModalOpen(false);
        } catch(err) {
            alert('Failed to reject');
        }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const StatCard = ({ title, value, color }) => (
    <Card sx={{ borderLeft: `6px solid ${color}`, height: '100%' }}>
      <CardContent>
        <Typography color="text.secondary" gutterBottom fontWeight="500">{title}</Typography>
        <Typography variant="h4" component="div" fontWeight="bold">{value}</Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'grey.100', minHeight: '100vh' }}>
      
      {isMobile && (
          <AppBar position="fixed" sx={{ width: '100%', bgcolor: '#002266', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
              <Toolbar>
                  <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                      <MenuIcon />
                  </IconButton>
                  <Typography variant="h6" noWrap component="div" fontWeight="bold">
                      KBE 2026 Admin
                  </Typography>
              </Toolbar>
          </AppBar>
      )}

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#002266', color: 'white' },
        }}
      >
        <Toolbar>
            <Typography variant="h6" fontWeight="bold" sx={{ width: '100%', textAlign: 'center', py: 1 }}>
                KBE 2026 Admin
            </Typography>
        </Toolbar>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {/* 
            <ListItem button selected={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <ListItemIcon sx={{ color: 'white' }}><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Overview" />
            </ListItem>
            */}
            <ListItem button selected={activeTab === 'applications'} onClick={() => setActiveTab('applications')} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <ListItemIcon sx={{ color: 'white' }}><ListAltIcon /></ListItemIcon>
              <ListItemText primary="Applications" />
            </ListItem>
            <ListItem button selected={activeTab === 'payments'} onClick={() => setActiveTab('payments')} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <ListItemIcon sx={{ color: 'white' }}><AccountBalanceWalletIcon /></ListItemIcon>
              <ListItemText primary="Payment Collection" />
            </ListItem>
            {/*
            <ListItem button selected={activeTab === 'halls'} onClick={() => setActiveTab('halls')} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <ListItemIcon sx={{ color: 'white' }}><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Hall Master" />
            </ListItem>
            <ListItem button selected={activeTab === 'categories'} onClick={() => setActiveTab('categories')} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <ListItemIcon sx={{ color: 'white' }}><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Category Master" />
            </ListItem>
            <ListItem button selected={activeTab === 'stalls'} onClick={() => setActiveTab('stalls')} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <ListItemIcon sx={{ color: 'white' }}><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Stall Master" />
            </ListItem>
            */}
          </List>
        </Box>
        <Box sx={{ mt: 'auto', mb: 2 }}>
            <List>
                <ListItem button onClick={handleLogout} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                    <ListItemIcon sx={{ color: 'white' }}><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: isMobile ? 7 : 0, width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` }, maxWidth: '100vw', overflowX: 'hidden' }}>
        
        {activeTab === 'dashboard' && (
            <Box>
                <Typography variant="h4" fontWeight="800" mb={4} sx={{ color: '#002266' }}>Analytics Overview</Typography>
                
                {/* Top Stat Cards */}
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: '#e3f2fd', border: '1px solid #90caf9', height: '100%' }}>
                            <Typography color="#1565c0" fontWeight="600" variant="subtitle2" gutterBottom>Total Stalls</Typography>
                            <Typography variant="h3" fontWeight="800" color="#0d47a1">{stats.total_stalls || 0}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: '#e8f5e9', border: '1px solid #a5d6a7', height: '100%' }}>
                            <Typography color="#2e7d32" fontWeight="600" variant="subtitle2" gutterBottom>Available Stalls</Typography>
                            <Typography variant="h3" fontWeight="800" color="#1b5e20">{stats.available_stalls || 0}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: '#fff3e0', border: '1px solid #ffcc80', height: '100%' }}>
                            <Typography color="#e65100" fontWeight="600" variant="subtitle2" gutterBottom>Pending Apps</Typography>
                            <Typography variant="h3" fontWeight="800" color="#e65100">{stats.pending || 0}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: '#f3e5f5', border: '1px solid #ce93d8', height: '100%' }}>
                            <Typography color="#7b1fa2" fontWeight="600" variant="subtitle2" gutterBottom>Approved</Typography>
                            <Typography variant="h3" fontWeight="800" color="#4a148c">{stats.approved || 0}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: '#ffebee', border: '1px solid #ef9a9a', height: '100%' }}>
                            <Typography color="#c62828" fontWeight="600" variant="subtitle2" gutterBottom>Rejected</Typography>
                            <Typography variant="h3" fontWeight="800" color="#b71c1c">{stats.rejected || 0}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: '#e0f2f1', border: '1px solid #80cbc4', height: '100%' }}>
                            <Typography color="#00695c" fontWeight="600" variant="subtitle2" gutterBottom>Total Revenue</Typography>
                            <Typography variant="h4" fontWeight="800" color="#004d40" sx={{ mt: 1 }}>₹{(stats.total_revenue || 0).toLocaleString('en-IN')}</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        )}

        {activeTab === 'applications' && (() => {
            const processedBookings = bookings
                .filter(b => {
                    if (!searchTerm) return true;
                    const term = searchTerm.toLowerCase();
                    return (
                        (b.company_name && b.company_name.toLowerCase().includes(term)) ||
                        (b.booking_id && b.booking_id.toLowerCase().includes(term)) ||
                        (b.contact_person && b.contact_person.toLowerCase().includes(term)) ||
                        (b.stall_no && b.stall_no.toString().includes(term))
                    );
                })
                .sort((a, b) => {
                    let valA, valB;
                    if (sortBy === 'name') {
                        valA = (a.company_name || '').toLowerCase();
                        valB = (b.company_name || '').toLowerCase();
                    } else if (sortBy === 'stall') {
                        valA = parseInt(a.stall_no) || 0;
                        valB = parseInt(b.stall_no) || 0;
                    } else {
                        valA = new Date(a.created_at || 0).getTime();
                        valB = new Date(b.created_at || 0).getTime();
                    }
                    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                });

            return (
            <Box>
                <Typography variant="h5" fontWeight="800" mb={3} sx={{ color: '#002266' }}>Manage Applications</Typography>
                
                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} mb={4} p={2} sx={{ bgcolor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <TextField 
                        label="Search by Company, ID, Contact, Stall..."
                        variant="outlined"
                        size="small"
                        sx={{ flexGrow: 1 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <TextField
                        select
                        label="Sort By"
                        variant="outlined"
                        size="small"
                        sx={{ width: { xs: '100%', md: '200px' } }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <MenuItem value="date">Date</MenuItem>
                        <MenuItem value="name">Company Name</MenuItem>
                        <MenuItem value="stall">Stall Number</MenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Order"
                        variant="outlined"
                        size="small"
                        sx={{ width: { xs: '100%', md: '150px' } }}
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <MenuItem value="desc">Descending</MenuItem>
                        <MenuItem value="asc">Ascending</MenuItem>
                    </TextField>
                </Box>

                {isMobile ? (
                    <Grid container spacing={2}>
                        {processedBookings.map((b) => {
                            const isApproved = b.status === 'Approved';
                            const isRejected = b.status === 'Rejected';
                            const bgColor = isApproved ? '#f0fdf4' : (isRejected ? '#fff5f5' : '#fff8e1');
                            const textColor = isApproved ? '#2e7d32' : (isRejected ? '#d32f2f' : '#f57f17');

                            return (
                                <Grid item xs={12} key={b.id}>
                                    <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #eaeaea', bgcolor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0' }}>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                                                    ID: {b.booking_id || '-'}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1.2, color: '#1a1a1a' }}>
                                                    {b.company_name}
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                label={b.status} 
                                                sx={{ 
                                                    fontWeight: 'bold', 
                                                    borderRadius: '8px',
                                                    bgcolor: isApproved ? '#e8f5e9' : isRejected ? '#ffebee' : '#fff3e0',
                                                    color: isApproved ? '#2e7d32' : isRejected ? '#c62828' : '#ef6c00',
                                                }} 
                                                size="small" 
                                            />
                                        </Box>
                                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary" display="block">Contact Person</Typography>
                                                    <Typography variant="body2" fontWeight="600" color="#333" noWrap>{b.contact_person}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary" display="block">Mobile Number</Typography>
                                                    <Typography variant="body2" fontWeight="600" color="#333">{b.mobile}</Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Box sx={{ bgcolor: '#f4f6f8', p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                                        <Typography variant="body2" color="text.secondary">Allocation:</Typography>
                                                        <Typography variant="body2" fontWeight="700" color="primary.main">{b.hall_name} - {b.stall_no}</Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                            <Box mt={2}>
                                                <Button 
                                                    variant="outlined" 
                                                    fullWidth 
                                                    onClick={() => openDetailsModal(b)}
                                                    sx={{ 
                                                        borderRadius: 2, 
                                                        textTransform: 'none', 
                                                        fontWeight: 700, 
                                                        borderWidth: '2px',
                                                        '&:hover': { borderWidth: '2px' }
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                        {processedBookings.length === 0 && (
                            <Grid item xs={12}>
                                <Typography align="center" py={3} color="text.secondary">No applications match your search criteria.</Typography>
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
                                    <TableCell fontWeight="bold">Contact</TableCell>
                                    <TableCell fontWeight="bold">Hall & Stall</TableCell>
                                    <TableCell fontWeight="bold">Status</TableCell>
                                    <TableCell align="center" fontWeight="bold">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedBookings.map((b) => (
                                <TableRow key={b.id} hover>
                                    <TableCell>{b.booking_id || '-'}</TableCell>
                                    <TableCell fontWeight="500">{b.company_name}</TableCell>
                                    <TableCell>{b.contact_person}<br/><Typography variant="caption" color="text.secondary">{b.mobile}</Typography></TableCell>
                                    <TableCell>{b.hall_name} - {b.stall_no}</TableCell>
                                    <TableCell>
                                    <Chip 
                                        label={b.status} 
                                        color={b.status === 'Approved' ? 'success' : b.status === 'Rejected' ? 'error' : 'warning'} 
                                        size="small" 
                                    />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button variant="outlined" size="small" startIcon={<VisibilityIcon />} onClick={() => openDetailsModal(b)}>
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                                {processedBookings.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" py={4}>No applications match your search criteria.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
            </Box>
            );
        })()}

        {activeTab === 'halls' && <HallMaster />}
        {activeTab === 'categories' && <CategoryMaster />}
        {activeTab === 'stalls' && <StallMaster />}
        {activeTab === 'payments' && <PaymentCollection />}

      </Box>

      {/* Details Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        {selectedBooking && (
            <>
                <BookingSlipTemplate ref={printRef} booking={selectedBooking} />

                <DialogTitle sx={{ bgcolor: '#002266', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Application Details - {selectedBooking.company_name}</Typography>
                    <Box display="flex" gap={2} alignItems="center">
                        <Chip 
                            label={selectedBooking.status} 
                            color={selectedBooking.status === 'Approved' ? 'success' : selectedBooking.status === 'Rejected' ? 'error' : 'warning'} 
                        />
                        {selectedBooking.status === 'Approved' && (
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                startIcon={<PrintIcon />} 
                                onClick={() => handlePrint()}
                                size="small"
                            >
                                Download Slip
                            </Button>
                        )}
                    </Box>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Contact Person</Typography>
                            <Typography variant="body1" fontWeight="500" gutterBottom>{selectedBooking.contact_person}</Typography>
                            
                            <Typography variant="caption" color="text.secondary">Mobile</Typography>
                            <Typography variant="body1" fontWeight="500" gutterBottom>{selectedBooking.mobile}</Typography>

                            <Typography variant="caption" color="text.secondary">Email</Typography>
                            <Typography variant="body1" fontWeight="500" gutterBottom>{selectedBooking.email}</Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Requested Category</Typography>
                            <Typography variant="body1" fontWeight="500" gutterBottom>{selectedBooking.category_name}</Typography>

                            <Typography variant="caption" color="text.secondary">Hall & Stall</Typography>
                            <Typography variant="body1" fontWeight="500" gutterBottom>{selectedBooking.hall_name} - Stall {selectedBooking.stall_no}</Typography>

                            <Typography variant="caption" color="text.secondary">Application Date</Typography>
                            <Typography variant="body1" fontWeight="500" gutterBottom>{new Date(selectedBooking.created_at).toLocaleString()}</Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">Company Address</Typography>
                            <Typography variant="body1" fontWeight="500" gutterBottom>{selectedBooking.address}</Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">Product / Service Description</Typography>
                            <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                                <Typography variant="body2">{selectedBooking.product_description}</Typography>
                            </Paper>
                        </Grid>


                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
                    {selectedBooking.status === 'Pending' && (
                        <>
                            <Button variant="contained" color="success" onClick={() => handleApprove(selectedBooking.id)}>
                                Approve Application
                            </Button>
                            <Button variant="contained" color="error" onClick={() => handleReject(selectedBooking.id)}>
                                Reject Application
                            </Button>
                        </>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Button onClick={() => setModalOpen(false)} color="inherit">Close</Button>
                </DialogActions>
            </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
