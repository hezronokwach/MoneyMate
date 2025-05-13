import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import api from '../utils/api';

// Savings Goals page to manage savings goals
function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    deadline: null,
  });
  const [editId, setEditId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch goals on mount
  useEffect(() => {
    fetchGoals();
  }, []);

  // Fetch savings goals from backend
  const fetchGoals = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/savings-goals');
      setGoals(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch savings goals');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData({ ...formData, deadline: date });
  };

  // Validate and submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate inputs
    if (!formData.name) {
      setError('Name is required');
      return;
    }
    if (!formData.target_amount || formData.target_amount <= 0) {
      setError('Target amount must be a positive number');
      return;
    }
    if (!formData.deadline) {
      setError('Deadline is required');
      return;
    }

    const payload = {
      name: formData.name,
      target_amount: parseFloat(formData.target_amount),
      deadline: dayjs(formData.deadline).format('YYYY-MM-DD'),
    };

    try {
      if (editId) {
        await api.put(`/savings-goals/${editId}`, payload);
        setSuccess('Savings goal updated successfully');
      } else {
        await api.post('/savings-goals', payload);
        setSuccess('Savings goal added successfully');
      }
      fetchGoals();
      resetForm();
      setTimeout(() => setSuccess(''), 2000); // Clear success message
    } catch (err) {
      setError(err.message || 'Failed to save savings goal');
    }
  };

  // Start editing a goal
  const handleEdit = (goal) => {
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount,
      deadline: dayjs(goal.deadline),
    });
    setEditId(goal.id);
  };

  // Open delete confirmation dialog
  const handleDeleteOpen = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  // Confirm deletion
  const handleDelete = async () => {
    try {
      await api.delete(`/savings-goals/${deleteId}`);
      setSuccess('Savings goal deleted successfully');
      fetchGoals();
      handleDeleteClose();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message || 'Failed to delete savings goal');
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setFormData({
      name: '',
      target_amount: '',
      deadline: null,
    });
    setEditId(null);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1400, mx: 'auto', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: '#1976d2',
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 4,
        }}
      >
        Savings Goals
      </Typography>

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, maxWidth: 1000, mx: 'auto' }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, maxWidth: 1000, mx: 'auto' }}>
          {success}
        </Alert>
      )}

      {/* Savings Goal Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mb: 4,
          p: 3,
          bgcolor: '#ffffff',
          borderRadius: 2,
          boxShadow: 2,
          maxWidth: 800,
          mx: 'auto',
        }}
      >
        <Typography variant="h6" sx={{ color: '#1976d2', mb: 2, fontWeight: 'medium' }}>
          {editId ? 'Edit Savings Goal' : 'Add Savings Goal'}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            sx={{ flex: { xs: '1 1 100%', sm: '1 1 180px' } }}
            variant="outlined"
          />
          <TextField
            label="Target Amount"
            name="target_amount"
            type="number"
            value={formData.target_amount}
            onChange={handleInputChange}
            required
            sx={{ flex: { xs: '1 1 100%', sm: '1 1 180px' } }}
            variant="outlined"
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Deadline"
              value={formData.deadline}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  required: true,
                  sx: { flex: { xs: '1 1 100%', sm: '1 1 180px' } },
                  variant: 'outlined',
                },
              }}
            />
          </LocalizationProvider>
        </Box>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#0d47a1' },
              borderRadius: 1,
              px: 3,
            }}
          >
            {editId ? 'Update Goal' : 'Add Goal'}
          </Button>
          {editId && (
            <Button
              variant="outlined"
              onClick={resetForm}
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                borderRadius: 1,
                px: 3,
              }}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>

      {/* Savings Goals Table */}
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography
          variant="h5"
          sx={{
            color: '#1976d2',
            fontWeight: 'bold',
            mb: 2,
            textAlign: 'center',
          }}
        >
          Savings Goals
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ boxShadow: 2, borderRadius: 2 }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#1976d2' }}>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Target Amount</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Current Savings</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Deadline</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Progress</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {goals.map((goal) => {
                  const progress = Math.min((goal.current_savings / goal.target_amount) * 100, 100);
                  return (
                    <TableRow
                      key={goal.id}
                      sx={{
                        '&:hover': { bgcolor: '#f5f5f5' },
                      }}
                    >
                      <TableCell>{goal.name}</TableCell>
                      <TableCell>${goal.target_amount.toFixed(2)}</TableCell>
                      <TableCell>${goal.current_savings.toFixed(2)}</TableCell>
                      <TableCell>{goal.deadline}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ width: 100, bgcolor: '#e0e0e0' }}
                          />
                          <Typography>{progress.toFixed(0)}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          onClick={() => handleEdit(goal)}
                          sx={{
                            mr: 1,
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            borderRadius: 1,
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteOpen(goal.id)}
                          sx={{ borderRadius: 1 }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this savings goal?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteClose}
            sx={{ color: '#1976d2' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            sx={{ borderRadius: 1 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SavingsGoals;