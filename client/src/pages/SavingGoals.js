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
import {  
  Savings as SavingsIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import api from '../utils/api';

// Styled components for card titles
const SectionTitle = styled(Box)(({ theme, bgcolor = '#1976d2' }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  backgroundColor: bgcolor,
  marginBottom: theme.spacing(2),
}));

function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totalSavings, setTotalSavings] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    deadline: null,
  });
  const [editId, setEditId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [achieveDialogOpen, setAchieveDialogOpen] = useState(false);
  const [achieveGoalId, setAchieveGoalId] = useState(null);
  const [achieveGoalData, setAchieveGoalData] = useState(null);
  const [achieveFormData, setAchieveFormData] = useState({
    expenseCategory: '',
    description: '',
  });
  const [achieveError, setAchieveError] = useState('');

  // Fetch goals, categories, and total savings on mount
  useEffect(() => {
    fetchGoals();
    fetchCategories();
    fetchTotalSavings();
  }, []);

  const fetchTotalSavings = async () => {
    try {
      const transactions = await api.get('/transactions?type=savings');
      const validSavingsTransactions = transactions.filter(t => t.type === 'savings');
      const total = validSavingsTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      setTotalSavings(Math.max(0, total));
    } catch (err) {
      console.error('Failed to fetch total savings:', err);
    }
  };

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

  const fetchCategories = async () => {
    try {
      const data = await api.get('/categories');
      const expenseCategories = data.filter(cat => cat.type === 'expense' || cat.type === undefined);
      setCategories(expenseCategories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAchieveInputChange = (e) => {
    const { name, value } = e.target;
    setAchieveFormData({ ...achieveFormData, [name]: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, deadline: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
      setTimeout(() => setSuccess(''), 2000);
      fetchTotalSavings();
    } catch (err) {
      setError(err.message || 'Failed to save savings goal');
    }
  };

  const handleEdit = (goal) => {
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount,
      deadline: dayjs(goal.deadline),
    });
    setEditId(goal.id);
  };

  const handleDeleteOpen = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/savings-goals/${deleteId}`);
      setSuccess('Savings goal deleted successfully');
      fetchGoals();
      handleDeleteClose();
      setTimeout(() => setSuccess(''), 2000);
      fetchTotalSavings();
    } catch (err) {
      setError(err.message || 'Failed to delete savings goal');
    }
  };

  const handleAchieveOpen = (goal) => {
    setAchieveGoalId(goal.id);
    setAchieveGoalData(goal);
    setAchieveFormData({
      expenseCategory: '',
      description: `Spent savings for: ${goal.name}`,
    });
    setAchieveError('');
    setAchieveDialogOpen(true);
  };

  const handleAchieveClose = () => {
    setAchieveDialogOpen(false);
    setAchieveGoalId(null);
    setAchieveGoalData(null);
    setAchieveFormData({
      expenseCategory: '',
      description: '',
    });
    setAchieveError('');
  };

  const handleAchieveGoal = async () => {
    if (!achieveFormData.expenseCategory) {
      setAchieveError('Please select an expense category');
      return;
    }

    try {
      await api.post(`/savings-goals/${achieveGoalId}/achieve`, achieveFormData);
      setSuccess('Goal marked as achieved and expense recorded');
      fetchGoals();
      handleAchieveClose();
      setTimeout(() => setSuccess(''), 2000);
      fetchTotalSavings();
    } catch (err) {
      if (err.message && err.message.includes('Not enough savings')) {
        setAchieveError(err.message);
      } else {
        setError(err.message || 'Failed to mark goal as achieved');
        handleAchieveClose();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      target_amount: '',
      deadline: null,
    });
    setEditId(null);
  };

  const getDaysRemaining = (deadline) => {
    const today = dayjs();
    const deadlineDate = dayjs(deadline);
    const daysRemaining = deadlineDate.diff(today, 'day');
    return daysRemaining >= 0 ? daysRemaining : 0;
  };

  const hasEnoughSavings = (goal) => {
    return goal.current_savings >= goal.target_amount;
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

      {/* Savings Summary Section */}
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          mb: 4,
          bgcolor: '#ffffff',
          borderRadius: 2,
          boxShadow: 2,
          overflow: 'hidden',
        }}
      >
        <SectionTitle bgcolor="#1976d2">
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Savings Summary
          </Typography>
        </SectionTitle>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          gap: 2, 
          p: 3 
        }}>
          <Box
            sx={{
              flex: 1,
              p: 2,
              bgcolor: '#e3f2fd',
              borderRadius: 2,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #bbdefb',
              minWidth: { xs: '100%', md: '0' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SavingsIcon sx={{ color: '#1976d2', mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: '#1976d2' }}>
                Total Savings
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Ksh. {totalSavings.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Total money you've saved
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 2,
              bgcolor: '#fff8e1',
              borderRadius: 2,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ffecb3',
              minWidth: { xs: '100%', md: '0' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SavingsIcon sx={{ color: '#ff9800', mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: '#ff9800' }}>
                Allocated to Goals
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
              Ksh. {goals.filter(goal => !goal.achieved).reduce((total, goal) => total + Math.min(goal.current_savings, goal.target_amount), 0).toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Savings assigned to active goals
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 2,
              bgcolor: '#e8f5e9',
              borderRadius: 2,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #c8e6c9',
              minWidth: { xs: '100%', md: '0' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SavingsIcon sx={{ color: '#4caf50', mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: '#4caf50' }}>
                Available Savings
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
              Ksh. {Math.max(0, totalSavings - goals.filter(goal => !goal.achieved).reduce((total, goal) => total + Math.min(goal.current_savings, goal.target_amount), 0)).toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Savings not allocated to any goal
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 2,
              bgcolor: '#f3e5f5',
              borderRadius: 2,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e1bee7',
              minWidth: { xs: '100%', md: '0' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SavingsIcon sx={{ color: '#9c27b0', mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: '#9c27b0' }}>
                Goals Achieved
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
              {goals.filter(goal => goal.achieved).length} / {goals.length}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {goals.length > 0 ? `${Math.round((goals.filter(goal => goal.achieved).length / goals.length) * 100)}% completion rate` : 'No goals created yet'}
            </Typography>
          </Box>
        </Box>
      </Box>

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
          bgcolor: '#ffffff',
          borderRadius: 2,
          boxShadow: 2,
          maxWidth: 800,
          mx: 'auto',
          overflow: 'hidden',
        }}
      >
        <SectionTitle bgcolor="#1976d2">
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            {editId ? 'Edit Savings Goal' : 'Add Savings Goal'}
          </Typography>
        </SectionTitle>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              sx={{ flex: 1 }}
              variant="outlined"
            />
            <TextField
              label="Target Amount"
              name="target_amount"
              type="number"
              value={formData.target_amount}
              onChange={handleInputChange}
              required
              sx={{ flex: 1 }}
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
                    sx: { flex: 1 },
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
              size="large"
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
                size="large"
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Savings Goals Table */}
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <SectionTitle bgcolor="#1976d2">
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Your Savings Goals
          </Typography>
        </SectionTitle>
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
          <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
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
                  const canAchieve = hasEnoughSavings(goal);

                  return (
                    <TableRow
                      key={goal.id}
                      sx={{
                        '&:hover': { bgcolor: '#f5f5f5' },
                        bgcolor: isAchieved ? '#e8f5e9' : isOverdue ? '#fff8e1' : 'inherit',
                      }}
                    >
                      <TableCell>{goal.name}</TableCell>
                      <TableCell>Ksh. {goal.target_amount.toFixed(2)}</TableCell>
                      <TableCell>Ksh. {goal.current_savings.toFixed(2)}</TableCell>
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
                                    daysRemaining < 7 && progress < 80 ? '#ff9800' : '#1976d2',
                              },
                            }}
                          />
                          <Typography>{progress.toFixed(0)}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {isAchieved ? (
                          <span style={{ color: 'green' }}>Achieved</span>
                        ) : canAchieve ? (
                          <span style={{ color: '#1976d2' }}>Ready to Achieve</span>
                        ) : (
                          <span style={{ color: '#0288d1' }}>In Progress</span>
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
                            {goal.current_savings > 0 && (
                              <Button
                                variant="outlined"
                                onClick={() => handleAchieveOpen(goal)}
                                sx={{
                                  mr: 1,
                                  mb: 1,
                                  borderColor: '#4caf50',
                                  color: '#4caf50',
                                  borderRadius: 1,
                                }}
                                size="small"
                                disabled={!canAchieve}
                                title={!canAchieve ? `Need Ksh. ${(goal.target_amount - goal.current_savings).toFixed(2)} more` : ''}
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
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, bgcolor: '#ffffff', borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
        <SectionTitle bgcolor="#1976d2">
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Savings Tips for Students
          </Typography>
        </SectionTitle>
        <Box sx={{ p: 3 }}>
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
          <Button onClick={handleDeleteClose} sx={{ color: '#1976d2' }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" sx={{ borderRadius: 1 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Achieve Goal Dialog */}
      <Dialog open={achieveDialogOpen} onClose={handleAchieveClose} maxWidth="sm" fullWidth>
        <DialogTitle>Achieve Savings Goal</DialogTitle>
        <DialogContent>
          {achieveError ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {achieveError}
            </Alert>
          ) : (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                You're about to mark "{achieveGoalData?.name}" as achieved. This will:
              </DialogContentText>
              <Box component="ul" sx={{ pl: 4, mb: 3 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Create an expense transaction for Ksh. {achieveGoalData?.target_amount?.toFixed(2)}
                </Typography>
                <Typography component="li" variant="body2">
                  Mark this savings goal as achieved
                </Typography>
              </Box>
            </>
          )}
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
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': { backgroundColor: '#388e3c' },
              borderRadius: 1,
            }}
            disabled={!!achieveError}
          >
            Achieve Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SavingsGoals;