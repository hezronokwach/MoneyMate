
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import api from '../utils/api';

// Expenses page to manage transactions
function Expenses() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    type: '',
    category: '',
    date: null,
    description: '',
  });
  const [editId, setEditId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Calculate summary statistics
  const summary = transactions.reduce(
    (acc, t) => {
      if (t.type === 'income') {
        acc.totalIncome += t.amount;
      } else if (t.type === 'expense') {
        acc.totalExpense += t.amount;
      } else if (t.type === 'savings') {
        acc.totalSavings += t.amount;
      }
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, totalSavings: 0 }
  );
  summary.netBalance = summary.totalIncome - summary.totalExpense - summary.totalSavings;

  // Fetch transactions and categories on mount
  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/transactions');
      setTransactions(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const data = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If type changes, reset category to ensure it matches the new type
    if (name === 'type') {
      setFormData({ ...formData, [name]: value, category: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };

  // Validate savings transaction
  const validateSavingsTransaction = (formData) => {
    // Only validate for new savings transactions with positive amounts
    if (formData.type === 'savings' && parseFloat(formData.amount) > 0) {
      // If editing an existing transaction, we need to account for the original amount
      let additionalSavings = parseFloat(formData.amount);
      
      if (editId) {
        // Find the original transaction
        const originalTransaction = transactions.find(t => t.id === editId);
        if (originalTransaction && originalTransaction.type === 'savings') {
          // Only count the difference as additional savings
          additionalSavings = parseFloat(formData.amount) - originalTransaction.amount;
        }
      }
      
      // Only validate if there's an increase in savings
      if (additionalSavings > 0) {
        // Calculate available balance
        const availableBalance = summary.totalIncome - 
                                summary.totalExpense - 
                                summary.totalSavings;
        
        // For editing, add back the original savings amount if it was a savings transaction
        const adjustedBalance = editId && transactions.find(t => t.id === editId)?.type === 'savings' 
          ? availableBalance + transactions.find(t => t.id === editId).amount 
          : availableBalance;
        
        // Check if this savings transaction would create a negative balance
        if (adjustedBalance < additionalSavings) {
          return {
            isValid: false,
            errorMessage: `Not enough funds available. You have $${adjustedBalance.toFixed(2)} available, but are trying to save $${additionalSavings.toFixed(2)}.`
          };
        }
      }
    }
    
    return { isValid: true };
  };

  // Validate and submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!formData.amount || formData.amount <= 0) {
      setError('Amount must be a positive number');
      return;
    }
    if (!formData.type) {
      setError('Type is required');
      return;
    }
    if (!formData.category && (formData.type === 'expense' || formData.type === 'savings')) {
      setError('Category is required for expenses and savings');
      return;
    }
    if (!formData.date) {
      setError('Date is required');
      return;
    }

    // Validate savings transaction
    const savingsValidation = validateSavingsTransaction(formData);
    if (!savingsValidation.isValid) {
      setError(savingsValidation.errorMessage);
      return;
    }

    const payload = {
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: dayjs(formData.date).format('YYYY-MM-DD'),
      description: formData.description,
    };

    try {
      if (editId) {
        await api.put(`/transactions/${editId}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      fetchTransactions();
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    }
  };

  // Start editing a transaction
  const handleEdit = (transaction) => {
    setFormData({
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: dayjs(transaction.date),
      description: transaction.description || '',
    });
    setEditId(transaction.id);
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
      await api.delete(`/transactions/${deleteId}`);
      fetchTransactions();
      handleDeleteClose();
    } catch (err) {
      setError(err.message || 'Failed to delete transaction');
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setFormData({
      amount: '',
      type: '',
      category: '',
      date: null,
      description: '',
    });
    setEditId(null);
  };

  // Filter categories based on selected type
  const filteredCategories = categories.filter(cat => 
    formData.type === 'income' ? cat.type === 'income' : 
    formData.type === 'expense' ? cat.type === 'expense' : 
    formData.type === 'savings' ? cat.type === 'savings' : 
    true
  );

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
        Expenses
      </Typography>

      {/* Summary Statistics */}
      <Grid
        container
        spacing={0.5} // Reduced spacing between cards
        sx={{
          maxWidth: 1000, // Slightly increased max width to accommodate 4 cards
          mx: 'auto',
          mb: 4,
          justifyContent: 'center', // Center the cards
        }}
      >
        <Grid item xs={12} sm={6} md={3}> {/* Adjusted width for 4 cards */}
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
              bgcolor: '#e3f2fd',
            }}
          >
            <CardContent>
              <Typography variant="h6" color="#1976d2" gutterBottom>
                Total Income
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                ${summary.totalIncome.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}> {/* Adjusted width for 4 cards */}
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
              bgcolor: '#ffebee',
            }}
          >
            <CardContent>
              <Typography variant="h6" color="#1976d2" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                ${summary.totalExpense.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}> {/* Adjusted width for 4 cards */}
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
              bgcolor: '#e8f5e9',
            }}
          >
            <CardContent>
              <Typography variant="h6" color="#1976d2" gutterBottom>
                Total Savings
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                ${summary.totalSavings.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}> {/* Adjusted width for 4 cards */}
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
              bgcolor: '#f3e5f5',
            }}
          >
            <CardContent>
              <Typography variant="h6" color="#1976d2" gutterBottom>
                Net Balance
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: summary.netBalance >= 0 ? 'green' : 'red',
                }}
              >
                ${summary.netBalance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, maxWidth: 1000, mx: 'auto' }}>
          {error}
        </Alert>
      )}

      {/* Transaction Form */}
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
          {editId ? 'Edit Transaction' : 'Add Transaction'}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
          <FormControl sx={{ flex: { xs: '1 1 100%', sm: '1 1 180px' } }}>
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
              <MenuItem value="savings">Savings</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ flex: { xs: '1 1 100%', sm: '1 1 180px' } }}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required={formData.type !== ''}
              disabled={!formData.type}
            >
              {filteredCategories.map((cat) => (
                <MenuItem key={cat.id} value={cat.name}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              value={formData.date}
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
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            sx={{ flex: '1 1 100%' }}
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
            {editId ? 'Update Transaction' : 'Add Transaction'}
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

      {/* Transactions Table */}
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
          Recent Transactions
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
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    sx={{
                      '&:hover': { bgcolor: '#f5f5f5' },
                    }}
                  >
                    <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span style={{ 
                        color: transaction.type === 'income' ? 'green' : 
                               transaction.type === 'savings' ? 'blue' : 'red' 
                      }}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.description || '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        onClick={() => handleEdit(transaction)}
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
                        onClick={() => handleDeleteOpen(transaction.id)}
                        sx={{ borderRadius: 1 }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this transaction?
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

export default Expenses;
