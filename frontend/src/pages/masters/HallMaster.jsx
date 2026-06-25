import React, { useState, useEffect } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { adminGetHalls, adminAddHall, adminUpdateHall, adminDeleteHall } from '../../services/api';

const HallMaster = () => {
    const [halls, setHalls] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingHall, setEditingHall] = useState(null);
    const [formData, setFormData] = useState({ hall_name: '', hall_code: '', description: '', status: 'Active' });

    useEffect(() => { fetchHalls(); }, []);

    const fetchHalls = async () => {
        try {
            const res = await adminGetHalls();
            if(res.data.status === 'success') setHalls(res.data.data);
        } catch(e) { console.error(e); }
    };

    const handleOpen = (hall = null) => {
        setEditingHall(hall);
        if(hall) {
            setFormData({ hall_name: hall.hall_name, hall_code: hall.hall_code || '', description: hall.description || '', status: hall.status || 'Active' });
        } else {
            setFormData({ hall_name: '', hall_code: '', description: '', status: 'Active' });
        }
        setModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if(editingHall) {
                await adminUpdateHall({ ...formData, id: editingHall.id });
            } else {
                await adminAddHall(formData);
            }
            setModalOpen(false);
            fetchHalls();
        } catch(e) {
            alert('Error saving hall. Name must be unique.');
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure? This might fail if the hall is mapped to categories/stalls.')) {
            try {
                await adminDeleteHall(id);
                fetchHalls();
            } catch(e) {
                alert('Cannot delete hall. Ensure it has no linked categories or stalls.');
            }
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">Hall Master</Typography>
                <Button variant="contained" onClick={() => handleOpen()}>+ Add Hall</Button>
            </Box>
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell fontWeight="bold">Hall ID</TableCell>
                            <TableCell fontWeight="bold">Hall Name</TableCell>
                            <TableCell fontWeight="bold">Hall Code</TableCell>
                            <TableCell fontWeight="bold">Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {halls.map((h) => (
                            <TableRow key={h.id}>
                                <TableCell>{h.id}</TableCell>
                                <TableCell>{h.hall_name}</TableCell>
                                <TableCell>{h.hall_code || '-'}</TableCell>
                                <TableCell>{h.status}</TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary" onClick={() => handleOpen(h)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(h.id)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
                <DialogTitle>{editingHall ? 'Edit Hall' : 'Add New Hall'}</DialogTitle>
                <DialogContent dividers>
                    <TextField fullWidth margin="dense" label="Hall Name" value={formData.hall_name} onChange={(e) => setFormData({...formData, hall_name: e.target.value})} />
                    <TextField fullWidth margin="dense" label="Hall Code" value={formData.hall_code} onChange={(e) => setFormData({...formData, hall_code: e.target.value})} />
                    <TextField fullWidth margin="dense" label="Description" multiline rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Status</InputLabel>
                        <Select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} label="Status">
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default HallMaster;
