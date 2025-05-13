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
  DialogContentText,
  DialogActions,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import api from '../utils/api';

// Savings Goals page to manage savings goals
function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
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
  
  // New state for achieve goal functionality
  const [achieveDialogOpen, setAchieveDialogOpen] = useState(false);
  const [achieveGoalId, setAchieveGoalId] = useState(null);
  const [achieveGoalData, setAchieveGoalData] = useState(null);
  const [achieveFormData, setAchieveFormData] = useState({
    expenseCategory: '',
    description: '',
  });

  // Fetch goals and categories on mount
  useEffect(() => {
    fetchGoals();
    fetchCategories();
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

  // Fetch categories for expense selection
  const fetchCategories = async () => {
    try {
      const data = await api.get('/categories');
      // Filter to only include expense categories
      const expenseCategories = data.filter(cat => cat.type === 'expense' || cat.type === undefined);
      setCategories(expenseCategories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle achieve form input changes
  const handleAchieveInputChange = (e) => {
    const { name, value } = e.target;
    setAchieveFormData({ ...achieveFormData, [name]: value });
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

  // Open achieve goal dialog
  const handleAchieveOpen = (goal) => {
    setAchieveGoalId(goal.id);
    setAchieveGoalData(goal);
    setAchieveFormData({
      expenseCategory: '',
      description: `Spent savings for: ${goal.name}`,
    });
    setAchieveDialogOpen(true);
  };

  // Close achieve goal dialog
  const handleAchieveClose = () => {
    setAchieveDialogOpen(false);
    setAchieveGoalId(null);
    setAchieveGoalData(null);
    setAchieveFormData({
      expenseCategory: '',
      description: '',
    });
  };

  // Confirm achieve goal
  const handleAchieveGoal = async () => {
    if (!achieveFormData.expenseCategory) {
      setError('Please select an expense category');
      return;
    }

    try {
      await api.post(`/savings-goals/${achieveGoalId}/achieve`, achieveFormData);
      setSuccess('Goal marked as achieved and expense recorded');
      fetchGoals();
      handleAchieveClose();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message || 'Failed to mark goal as achieved');
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

  // Calculate days remaining until deadline
  const getDaysRemaining = (deadline) => {
    const today = dayjs();
    const deadlineDate = dayjs(deadline);
    const daysRemaining = deadlineDate.diff(today, 'day');
    return daysRemaining >= 0 ? daysRemaining : 0;
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
          Your Savings Goals
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : goals.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="body1" color="text.secondary">
              You don't have any savings goals yet. Create one to start saving!
            </Typography>
          </Paper>
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
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Days Left</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Progress</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {goals.map((goal) => {
                  const progress = Math.min((goal.current_savings / goal.target_amount) * 100, 100);
                  const daysRemaining = getDaysRemaining(goal.deadline);
                  const isOverdue = daysRemaining === 0 && progress < 100;
                  const isAchieved = goal.achieved === 1;
                  
                  return (
                    <TableRow
                      key={goal.id}
                      sx={{
                        '&:hover': { bgcolor: '#f5f5f5' },
                        bgcolor: isAchieved ? '#e8f5e9' : isOverdue ? '#fff8e1' : 'inherit',
                      }}
                    >
                      <TableCell>{goal.name}</TableCell>
                      <TableCell>${goal.target_amount.toFixed(2)}</TableCell>
                      <TableCell>${goal.current_savings.toFixed(2)}</TableCell>
                      <TableCell>{dayjs(goal.deadline).format('MMM D, YYYY')}</TableCell>
                      <TableCell>
                        {isAchieved ? (
                          <Typography variant="body2" color="success.main">Completed</Typography>
                        ) : (
                          <>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ 
                              width: 100, 
                              bgcolor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: isAchieved ? '#4caf50' : 
                                        progress >= 100 ? '#4caf50' : 
                                        daysRemaining < 7 && progress < 80 ? '#ff9800' : '#1976d2'
                              }
                            }}
                          />
                          <Typography>{progress.toFixed(0)}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {isAchieved ? (
                          <Chip 
                            label="Achieved" 
                            color="success" 
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        ) : progress >= 100 ? (
                          <Chip 
                            label="Ready to Achieve" 
                            color="primary" 
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        ) : (
                          <Chip 
                            label="In Progress" 
                            color="info" 
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {!isAchieved && (
                          <>
                            <Button
                              variant="outlined"
                              onClick={() => handleEdit(goal)}
                              sx={{
                                mr: 1,
                                mb: 1,
                                borderColor: '#1976d2',
                                color: '#1976d2',
                                borderRadius: 1,
                              }}
                              size="small"
                            >
                              Edit
                            </Button>
                            {progress > 0 && (
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleAchieveOpen(goal)}
                                sx={{
                                  mr: 1,
                                  mb: 1,
                                  borderRadius: 1,
                                }}
                                size="small"
                              >
                                Achieve
                              </Button>
                            )}
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => handleDeleteOpen(goal.id)}
                              sx={{ borderRadius: 1, mb: 1 }}
                              size="small"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                        {isAchieved && (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteOpen(goal.id)}
                            sx={{ borderRadius: 1 }}
                            size="small"
                          >
                            Remove
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Savings Tips */}
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 3, bgcolor: '#e3f2fd', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h6" sx={{ color: '#1976d2', mb: 2 }}>
          Savings Tips for Students
        </Typography>
        <Typography variant="body1" paragraph>
          • Set realistic goals based on your income and expenses
        </Typography>
        <Typography variant="body1" paragraph>
          • Save small amounts regularly rather than large amounts occasionally
        </Typography>
        <Typography variant="body1" paragraph>
          • Track your progress to stay motivated
        </Typography>
        <Typography variant="body1" paragraph>
          • Use the "Savings" transaction type in the Expenses page to record money you've set aside
        </Typography>
        <Typography variant="body1">
          • When you spend your savings, use the "Achieve Goal" button to record the expense
        </Typography>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this savings goal?
            {deleteId && goals.find(g => g.id === deleteId)?.achieved === 1 && (
              <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                This goal has been achieved. Deleting it will only remove it from your history.
              </Typography>
            )}
          </DialogContentText>
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

      {/* Achieve Goal Dialog */}
      <Dialog open={achieveDialogOpen} onClose={handleAchieveClose} maxWidth="sm" fullWidth>
        <DialogTitle>Achieve Savings Goal</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            You're about to mark "{achieveGoalData?.name}" as achieved. This will:
          </DialogContentText>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Create an expense transaction for ${achieveGoalData?.current_savings?.toFixed(2)}
            </Typography>
            <Typography component="li" variant="body2">
              Mark this savings goal as achieved
            </Typography>
          </Box>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="expense-category-label">Expense Category</InputLabel>
            <Select
              labelId="expense-category-label"
              name="expenseCategory"
              value={achieveFormData.expenseCategory}
              onChange={handleAchieveInputChange}
              label="Expense Category"
              required
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={achieveFormData.description}
            onChange={handleAchieveInputChange}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAchieveClose} sx={{ color: '#1976d2' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleAchieveGoal} 
            variant="contained" 
            color="success"
            sx={{ borderRadius: 1 }}
          >
            Achieve Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SavingsGoals;
