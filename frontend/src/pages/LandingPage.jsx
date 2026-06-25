import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAllStalls } from '../services/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const [stalls, setStalls] = useState([]);

  useEffect(() => {
    getAllStalls()
      .then(res => setStalls(res.data?.data || []))
      .catch(err => console.error("Error fetching stalls:", err));
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: { xs: 8, md: 15 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Karur Build Expo 2026
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, color: 'secondary.light' }}>
            The Premier Construction & Architecture Exhibition
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            onClick={() => navigate('/book')}
            sx={{ px: 4, py: 1.5, fontSize: '1.2rem' }}
          >
            Book Your Stall Now
          </Button>
        </Container>
      </Box>

      {/* About Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" gutterBottom color="primary.main">
              About The Expo
            </Typography>
            <Typography variant="body1" paragraph fontSize="1.1rem" color="text.secondary">
              Karur Build Expo 2026 is the ultimate gathering for construction professionals, architects, real estate developers, and building material suppliers. 
              Showcase your innovative products and connect with thousands of potential clients and industry leaders over three action-packed days.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 4, boxShadow: 3 }}>
              <Typography variant="h6" color="secondary.main" gutterBottom>Event Highlights</Typography>
              <ul style={{ paddingLeft: '20px', fontSize: '1.1rem', color: '#555' }}>
                <li>101+ Exhibitors Across 5 Majestic Halls</li>
                <li>Exclusive Networking Sessions</li>
                <li>Product Launch Platforms</li>
                <li>Live Demonstrations</li>
              </ul>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Halls Information */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom color="primary.main">
            Exhibition Halls
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {['Hall A', 'Hall B', 'Hall C', 'Hall D', 'Hall E'].map((hall, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                    <Typography gutterBottom variant="h5" component="h2" color="secondary.dark">
                      {hall}
                    </Typography>
                    <Typography color="text.secondary">
                      {index === 0 && "Home Interior, Lightings, Automation, Tiles"}
                      {index === 1 && "Electrical, Plumbing, Painting, Fire Safety"}
                      {index === 2 && "Real Estate, Consultants, Industrial Equip."}
                      {index === 3 && "Furniture, Granites, Marbles"}
                      {index === 4 && "Precast, Heavy Machinery, Landscaping"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Live Stall Availability Table */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom color="primary.main" sx={{ mb: 4 }}>
          Live Stall Availability
        </Typography>
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table sx={{ minWidth: 650 }} aria-label="stalls availability table">
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Stall No.</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Hall</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Size</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Tariff (₹)</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stalls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Loading stalls or no stalls available...</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                stalls.map((stall) => (
                  <TableRow key={stall.id} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.dark' }}>Stall {stall.stall_no}</TableCell>
                    <TableCell>{stall.hall_name}</TableCell>
                    <TableCell>{stall.stall_size}</TableCell>
                    <TableCell>₹{parseFloat(stall.tariff_amount).toLocaleString('en-IN')}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={stall.status === 'Available' ? 'Available' : 'Booked'} 
                        sx={{ 
                          bgcolor: stall.status === 'Available' ? '#10b981' : '#ef4444', 
                          color: 'white', 
                          fontWeight: 'bold',
                          minWidth: '100px'
                        }} 
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.dark', color: 'white', py: 4, mt: 'auto' }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="body1">
            © 2026 Karur Build Expo. All rights reserved.
          </Typography>
          <Button color="inherit" onClick={() => navigate('/admin/login')} sx={{ mt: 2, opacity: 0.7 }}>
            Admin Login
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
