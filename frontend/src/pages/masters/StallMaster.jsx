import React, { useState, useEffect } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, IconButton, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, UploadFile as UploadIcon } from '@mui/icons-material';
import { adminGetStalls, adminAddStall, adminUpdateStall, adminDeleteStall, adminGetHalls, adminBulkImportStalls } from '../../services/api';
import * as XLSX from 'xlsx';

const StallMaster = () => {
    const [stalls, setStalls] = useState([]);
    const [halls, setHalls] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStall, setEditingStall] = useState(null);
    const [formData, setFormData] = useState({ stall_no: '', hall_id: '', stall_size: '3m x 3m', tariff_amount: '50000', status: 'Available' });

    useEffect(() => { 
        fetchData(); 
    }, []);

    const fetchData = async () => {
        try {
            const res = await adminGetStalls();
            if(res.data.status === 'success') setStalls(res.data.data);
            
            const hallRes = await adminGetHalls();
            if(hallRes.data.status === 'success') setHalls(hallRes.data.data);
        } catch(e) { console.error(e); }
    };

    const handleOpen = (stall = null) => {
        setEditingStall(stall);
        if(stall) {
            setFormData({ stall_no: stall.stall_no, hall_id: stall.hall_id, stall_size: stall.stall_size || '3m x 3m', tariff_amount: stall.tariff_amount || '50000', status: stall.status });
        } else {
            setFormData({ stall_no: '', hall_id: '', stall_size: '3m x 3m', tariff_amount: '50000', status: 'Available' });
        }
        setModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if(editingStall) {
                await adminUpdateStall({ ...formData, id: editingStall.id });
            } else {
                await adminAddStall(formData);
            }
            setModalOpen(false);
            fetchData();
        } catch(e) {
            alert('Error saving stall. Ensure Stall No is unique within the hall.');
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure?')) {
            try {
                await adminDeleteStall(id);
                fetchData();
            } catch(e) {
                alert('Cannot delete stall. It might be linked to a booking.');
            }
        }
    };

    // Bulk Excel Upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const bstr = event.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            
            // Format data for backend
            // Excel columns expected: hall_id, stall_no, stall_size, tariff_amount
            if(data.length > 0 && confirm(`Ready to import ${data.length} stalls?`)) {
                try {
                    const res = await adminBulkImportStalls(data);
                    if(res.data.status === 'success') {
                        const { imported, updated, failed } = res.data.data;
                        alert(`Import Complete!\nImported: ${imported}\nUpdated: ${updated}\nFailed: ${failed}`);
                        fetchData();
                    }
                } catch(error) {
                    alert("Import failed. Ensure columns are: hall_id, stall_no, stall_size, tariff_amount");
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">Stall Master</Typography>
                <Box display="flex" gap={2}>
                    <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                        Bulk Excel Import
                        <input type="file" hidden accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                    </Button>
                    <Button variant="contained" onClick={() => handleOpen()}>+ Add Stall</Button>
                </Box>
            </Box>
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell fontWeight="bold">Stall No</TableCell>
                            <TableCell fontWeight="bold">Hall Name</TableCell>
                            <TableCell fontWeight="bold">Size</TableCell>
                            <TableCell fontWeight="bold">Tariff (₹)</TableCell>
                            <TableCell fontWeight="bold">Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stalls.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell fontWeight="bold">{s.stall_no}</TableCell>
                                <TableCell>{s.hall_name}</TableCell>
                                <TableCell>{s.stall_size}</TableCell>
                                <TableCell>₹{parseFloat(s.tariff_amount).toLocaleString('en-IN')}</TableCell>
                                <TableCell>
                                    <Chip size="small" label={s.status} color={s.status === 'Available' ? 'success' : s.status === 'Pending' ? 'warning' : 'error'} />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary" onClick={() => handleOpen(s)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(s.id)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
                <DialogTitle>{editingStall ? 'Edit Stall' : 'Add New Stall'}</DialogTitle>
                <DialogContent dividers>
                    <TextField fullWidth margin="dense" label="Stall Number (e.g. A-10)" value={formData.stall_no} onChange={(e) => setFormData({...formData, stall_no: e.target.value})} />
                    
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Assign to Hall</InputLabel>
                        <Select value={formData.hall_id} onChange={(e) => setFormData({...formData, hall_id: e.target.value})} label="Assign to Hall">
                            {halls.map(h => <MenuItem key={h.id} value={h.id}>{h.hall_name}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <TextField fullWidth margin="dense" label="Stall Size (e.g. 4.5m x 2.4m)" value={formData.stall_size} onChange={(e) => setFormData({...formData, stall_size: e.target.value})} />
                    <TextField fullWidth margin="dense" type="number" label="Tariff Amount (₹)" value={formData.tariff_amount} onChange={(e) => setFormData({...formData, tariff_amount: e.target.value})} />
                    
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Status</InputLabel>
                        <Select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} label="Status">
                            <MenuItem value="Available">Available</MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Locked">Locked</MenuItem>
                            <MenuItem value="Booked">Booked</MenuItem>
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

export default StallMaster;
