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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import api from '../utils/api';

// Budgets page to manage monthly budgets per category
function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    month: '',
    category_id: '',
    amount: '',
  });
  const [editId, setEditId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);


  const [summary, setSummary] = useState({ totalBudgeted: 0, totalRemaining: 0 });


  // Update summary whenever budgets or expenses change
  useEffect(() => {
    const newSummary = budgets.reduce(
      (acc, b) => {
        // Calculate actual spent amount for this budget
        const spent = calculateSpentAmount(b.category, b.month);
        acc.totalBudgeted += b.amount;
        acc.totalRemaining += b.amount - spent;
        return acc;
      },
      { totalBudgeted: 0, totalRemaining: 0 }
    );
    setSummary(newSummary);
  }, [budgets, expenses]);

  // Fetch budgets, categories, and expenses on mount
  useEffect(() => {
    fetchBudgets();
    fetchCategories();
    fetchExpenses();
  }, []);

  // Fetch budgets from backend
  const fetchBudgets = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/budgets');
      setBudgets(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const data = await api.get('/categories');
      setCategories(data.filter(cat => cat.type === 'expense')); // Only expense categories
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
    }
  };

  // Fetch all expenses to calculate spent amounts
  const fetchExpenses = async () => {
    try {
      const data = await api.get('/transactions');
      // Filter to only include expense transactions
      setExpenses(data.filter(transaction => transaction.type === 'expense'));
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    }
  };

  // Calculate how much has been spent for a specific category and month
  const calculateSpentAmount = (categoryName, month) => {
    // Filter expenses by category and month
    return expenses
      .filter(expense => 
        expense.category === categoryName && 
        expense.date.startsWith(month) // Match YYYY-MM format
      )
      .reduce((total, expense) => total + expense.amount, 0);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate and submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate inputs
    if (!formData.month || !formData.month.match(/^\d{4}-\d{2}$/)) {
      setError('Month must be in YYYY-MM format');
      return;
    }
    if (!formData.category_id) {
      setError('Category is required');
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    const payload = {
      month: formData.month,
      category_id: parseInt(formData.category_id),
      amount: parseFloat(formData.amount),
    };

    try {
      if (editId) {
        await api.put(`/budgets/${editId}`, payload);
        setSuccess('Budget updated successfully');
      } else {
        await api.post('/budgets', payload);
        setSuccess('Budget added successfully');
      }
      fetchBudgets();
      resetForm();
      setTimeout(() => setSuccess(''), 2000); // Clear success message
    } catch (err) {
      setError(err.message || 'Failed to save budget');
    }
  };

  // Start editing a budget
  const handleEdit = (budget) => {
    setFormData({
      month: budget.month,
      category_id: budget.category_id,
      amount: budget.amount,
    });
    setEditId(budget.id);
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
      await api.delete(`/budgets/${deleteId}`);
      setSuccess('Budget deleted successfully');
      fetchBudgets();
      handleDeleteClose();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message || 'Failed to delete budget');
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setFormData({
      month: '',
      category_id: '',
      amount: '',
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
        Budgets
      </Typography>

      {/* Summary Statistics */}
      <Grid
        container
        spacing={0.5} // Reduced spacing between cards
        sx={{
          maxWidth: 900, // Reduced max width
          mx: 'auto',
          mb: 4,
          justifyContent: 'center', // Center the cards
        }}
      >
        <Grid item xs={12} sm={5}> {/* Adjusted width for better centering */}
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
            }}
          >
            <CardContent>
              <Typography variant="h6" color="#1976d2" gutterBottom>
                Total Budgeted
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                ${summary.totalBudgeted.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={5}> {/* Adjusted width for better centering */}
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
            }}
          >
            <CardContent>
              <Typography variant="h6" color="#1976d2" gutterBottom>
                Total Remaining
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: summary.totalRemaining >= 0 ? 'green' : 'red',
                }}
              >
                ${summary.totalRemaining.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

      {/* Budget Form */}
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
          {editId ? 'Edit Budget' : 'Add Budget'}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Month (YYYY-MM)"
            name="month"
            value={formData.month}
            onChange={handleInputChange}
            required
            sx={{ flex: { xs: '1 1 100%', sm: '1 1 180px' } }}
            variant="outlined"
            placeholder="2025-05"
          />
          <FormControl sx={{ flex: { xs: '1 1 100%', sm: '1 1 180px' } }}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleInputChange}
            required
            sx={{ flex: { xs: '1 1 100%', sm: '1 1 180px' } }}
            variant="outlined"
          />
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
            {editId ? 'Update Budget' : 'Add Budget'}
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

      {/* Budgets Table */}
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
          Budgets
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
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Month</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Budget Amount</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Spent</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Remaining</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {budgets.map((budget) => {
                  // Calculate actual spent amount for this budget
                  const spent = calculateSpentAmount(budget.category, budget.month);
                  const remaining = budget.amount - spent;
                  
                  return (
                    <TableRow
                      key={budget.id}
                      sx={{
                        '&:hover': { bgcolor: '#f5f5f5' },
                      }}
                    >
                      <TableCell>{budget.category}</TableCell>
                      <TableCell>{budget.month}</TableCell>
                      <TableCell>${budget.amount.toFixed(2)}</TableCell>
                      <TableCell>${spent.toFixed(2)}</TableCell>
                      <TableCell sx={{ color: remaining >= 0 ? 'green' : 'red' }}>
                        ${remaining.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          onClick={() => handleEdit(budget)}
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
                          onClick={() => handleDeleteOpen(budget.id)}
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
          Are you sure you want to delete this budget?
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

export default Budgets;
