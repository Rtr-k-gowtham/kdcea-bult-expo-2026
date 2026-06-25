import React, { useState, useRef } from 'react';
import {
    Box, Typography, TextField, Button, Paper, Grid, Divider, CircularProgress, Alert
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    Badge as BadgeIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import { registerVisitor } from '../services/api';
import { useReactToPrint } from 'react-to-print';

const VisitorPassCard = React.forwardRef(({ visitor }, ref) => {
    if (!visitor) return null;

    const regDate = new Date(visitor.created_at);
    const formattedDate = regDate.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = regDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });

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
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Registration</Typography>
                        <Typography variant="body2" color="#333">{formattedDate} at {formattedTime}</Typography>
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

const VisitorRegistration = () => {
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [registeredVisitor, setRegisteredVisitor] = useState(null);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);

    const passRef = useRef();
    const handlePrintPass = useReactToPrint({
        contentRef: passRef,
        documentTitle: registeredVisitor ? `Visitor_Pass_${registeredVisitor.visitor_id}` : 'Visitor_Pass',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setAlreadyRegistered(false);

        if (!name.trim() || !mobile.trim()) {
            setError('Please enter both name and mobile number.');
            return;
        }

        if (!/^[0-9]{10}$/.test(mobile.trim())) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        setLoading(true);
        try {
            const res = await registerVisitor({ name: name.trim(), mobile: mobile.trim() });
            if (res.data.status === 'success') {
                setRegisteredVisitor(res.data.data);
                if (res.data.already_registered) {
                    setAlreadyRegistered(true);
                }
            } else {
                setError(res.data.message || 'Registration failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setName('');
        setMobile('');
        setRegisteredVisitor(null);
        setAlreadyRegistered(false);
        setError('');
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f7fa', p: 2 }}>
            <Paper elevation={0} sx={{ maxWidth: 500, width: '100%', borderRadius: 4, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                {/* Header */}
                <Box sx={{ bgcolor: '#002266', p: 4, textAlign: 'center', color: 'white' }}>
                    <img src="/LOGO (2).png" alt="KDCEA Logo" style={{ maxWidth: '80px', marginBottom: '12px' }} />
                    <Typography variant="h5" fontWeight="800">KARUR BUILD EXPO 2026</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85, mt: 1 }}>Visitor Registration Portal</Typography>
                </Box>

                <Box sx={{ p: 4 }}>
                    {!registeredVisitor ? (
                        /* Registration Form */
                        <form onSubmit={handleSubmit}>
                            <Typography variant="h6" fontWeight="700" mb={3} color="#1a1a1a">
                                <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#002266' }} />
                                Register as Visitor
                            </Typography>

                            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                            <TextField
                                label="Full Name"
                                variant="outlined"
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                sx={{ mb: 3 }}
                                placeholder="Enter your full name"
                                required
                            />
                            <TextField
                                label="Mobile Number"
                                variant="outlined"
                                fullWidth
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                sx={{ mb: 3 }}
                                placeholder="Enter 10-digit mobile number"
                                inputProps={{ maxLength: 10 }}
                                required
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={loading}
                                sx={{
                                    bgcolor: '#002266',
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    py: 1.5,
                                    fontSize: '16px',
                                    '&:hover': { bgcolor: '#003399' }
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Register Now'}
                            </Button>
                        </form>
                    ) : (
                        /* Success + Pass Card */
                        <Box textAlign="center">
                            <VisitorPassCard ref={passRef} visitor={registeredVisitor} />

                            {alreadyRegistered ? (
                                <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                                    You are already registered! Here is your Visitor Pass.
                                </Alert>
                            ) : (
                                <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                                    Registration successful! Your Visitor Pass is ready.
                                </Alert>
                            )}

                            {/* On-screen Pass Preview */}
                            <Paper elevation={0} sx={{ border: '2px solid #002266', borderRadius: 3, overflow: 'hidden', mb: 3, textAlign: 'left' }}>
                                <Box sx={{ bgcolor: '#002266', color: 'white', p: 2, textAlign: 'center' }}>
                                    <Typography variant="subtitle1" fontWeight="bold">KARUR BUILD EXPO 2026</Typography>
                                    <Typography variant="caption">Visitor Pass</Typography>
                                </Box>
                                <Box sx={{ p: 3 }}>
                                    <Typography variant="h4" fontWeight="900" color="#002266" textAlign="center" letterSpacing={1} mb={2}>
                                        {registeredVisitor.visitor_id}
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Grid container spacing={1}>
                                        <Grid item xs={12}>
                                            <Typography variant="caption" color="text.secondary">Name</Typography>
                                            <Typography variant="body1" fontWeight="700">{registeredVisitor.name}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="caption" color="text.secondary">Mobile</Typography>
                                            <Typography variant="body1" fontWeight="600">{registeredVisitor.mobile}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="caption" color="text.secondary">Status</Typography>
                                            <Typography variant="body1" fontWeight="600" color={registeredVisitor.status === 'Checked In' ? 'green' : '#ef6c00'}>
                                                {registeredVisitor.status}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Paper>

                            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<DownloadIcon />}
                                    onClick={() => handlePrintPass()}
                                    sx={{
                                        bgcolor: '#002266',
                                        fontWeight: 700,
                                        borderRadius: 2,
                                        py: 1.5,
                                        '&:hover': { bgcolor: '#003399' }
                                    }}
                                >
                                    Download Pass
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={handleReset}
                                    sx={{
                                        fontWeight: 700,
                                        borderRadius: 2,
                                        py: 1.5,
                                        borderColor: '#002266',
                                        color: '#002266',
                                        borderWidth: '2px',
                                        '&:hover': { borderWidth: '2px' }
                                    }}
                                >
                                    Register Another
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default VisitorRegistration;
