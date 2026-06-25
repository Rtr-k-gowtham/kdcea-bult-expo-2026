import React, { useState, useEffect } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { adminGetCategories, adminAddCategory, adminUpdateCategory, adminDeleteCategory, adminGetHalls } from '../../services/api';

const CategoryMaster = () => {
    const [categories, setCategories] = useState([]);
    const [halls, setHalls] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCat, setEditingCat] = useState(null);
    const [formData, setFormData] = useState({ category_name: '', hall_id: '', description: '', status: 'Active' });

    useEffect(() => { 
        fetchData(); 
    }, []);

    const fetchData = async () => {
        try {
            const catRes = await adminGetCategories();
            if(catRes.data.status === 'success') setCategories(catRes.data.data);
            
            const hallRes = await adminGetHalls();
            if(hallRes.data.status === 'success') setHalls(hallRes.data.data);
        } catch(e) { console.error(e); }
    };

    const handleOpen = (cat = null) => {
        setEditingCat(cat);
        if(cat) {
            setFormData({ category_name: cat.category_name, hall_id: cat.hall_id, description: cat.description || '', status: cat.status || 'Active' });
        } else {
            setFormData({ category_name: '', hall_id: '', description: '', status: 'Active' });
        }
        setModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if(editingCat) {
                await adminUpdateCategory({ ...formData, id: editingCat.id });
            } else {
                await adminAddCategory(formData);
            }
            setModalOpen(false);
            fetchData();
        } catch(e) {
            alert('Error saving category.');
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure?')) {
            try {
                await adminDeleteCategory(id);
                fetchData();
            } catch(e) {
                alert('Cannot delete category. Ensure it has no linked bookings.');
            }
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">Category Master</Typography>
                <Button variant="contained" onClick={() => handleOpen()}>+ Add Category</Button>
            </Box>
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell fontWeight="bold">Category ID</TableCell>
                            <TableCell fontWeight="bold">Category Name</TableCell>
                            <TableCell fontWeight="bold">Assigned Hall</TableCell>
                            <TableCell fontWeight="bold">Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell>{c.id}</TableCell>
                                <TableCell>{c.category_name}</TableCell>
                                <TableCell>{c.hall_name || 'Unassigned'}</TableCell>
                                <TableCell>{c.status}</TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary" onClick={() => handleOpen(c)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(c.id)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
                <DialogTitle>{editingCat ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                <DialogContent dividers>
                    <TextField fullWidth margin="dense" label="Category Name" value={formData.category_name} onChange={(e) => setFormData({...formData, category_name: e.target.value})} />
                    
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Assign to Hall</InputLabel>
                        <Select value={formData.hall_id} onChange={(e) => setFormData({...formData, hall_id: e.target.value})} label="Assign to Hall">
                            {halls.map(h => <MenuItem key={h.id} value={h.id}>{h.hall_name}</MenuItem>)}
                        </Select>
                    </FormControl>

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

export default CategoryMaster;
