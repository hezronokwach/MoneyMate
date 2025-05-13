import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import api from '../utils/api';

// Reports page to visualize financial data
function Reports() {
  // State for tab selection
  const [activeTab, setActiveTab] = useState(0);
  
  // State for date range
  const [startDate, setStartDate] = useState(dayjs().subtract(6, 'month'));
  const [endDate, setEndDate] = useState(dayjs());
  
  // State for budget adherence month selection
  const [budgetMonth, setBudgetMonth] = useState(dayjs());
  
  // State for loading and error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for report data
  const [monthlySavings, setMonthlySavings] = useState([]);
  const [categorySpending, setCategorySpending] = useState({ categories: [], totalExpenses: 0 });
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [budgetAdherence, setBudgetAdherence] = useState([]);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 0) {
      fetchMonthlySavings();
    } else if (activeTab === 1) {
      fetchCategorySpending();
    } else if (activeTab === 2) {
      fetchMonthlySpending();
    } else if (activeTab === 3) {
      fetchBudgetAdherence();
    }
  }, [activeTab]);
  
  // Fetch monthly savings data
  const fetchMonthlySavings = async () => {
    setLoading(true);
    setError('');
    try {
      const formattedStartDate = startDate.format('YYYY-MM-DD');
      const formattedEndDate = endDate.format('YYYY-MM-DD');
      
      const data = await api.get(`/reports/monthly-savings?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
      setMonthlySavings(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch monthly savings data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch spending by category data
  const fetchCategorySpending = async () => {
    setLoading(true);
    setError('');
    try {
      const formattedStartDate = startDate.format('YYYY-MM-DD');
      const formattedEndDate = endDate.format('YYYY-MM-DD');
      
      console.log(`Fetching category spending from ${formattedStartDate} to ${formattedEndDate}`);
      
      const data = await api.get(`/reports/spending-by-category?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
      console.log('Category spending data:', data);
      setCategorySpending(data);
    } catch (err) {
      console.error('Error fetching category spending:', err);
      setError(err.message || 'Failed to fetch category spending data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch monthly spending data
  const fetchMonthlySpending = async () => {
    setLoading(true);
    setError('');
    try {
      const formattedStartDate = startDate.format('YYYY-MM-DD');
      const formattedEndDate = endDate.format('YYYY-MM-DD');
      
      const data = await api.get(`/reports/monthly-spending?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
      setMonthlySpending(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch monthly spending data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch budget adherence data
  const fetchBudgetAdherence = async () => {
    setLoading(true);
    setError('');
    try {
      const year = budgetMonth.year();
      const month = budgetMonth.month() + 1;
      
      console.log(`Fetching budget adherence for ${year}-${month}`);
      
      const data = await api.get(`/reports/budget-adherence?year=${year}&month=${month}`);
      console.log('Budget adherence data:', data);
      setBudgetAdherence(data || []);
    } catch (err) {
      console.error('Error fetching budget adherence:', err);
      setError(err.message || 'Failed to fetch budget adherence data');
      setBudgetAdherence([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Apply date filter
  const applyDateFilter = () => {
    if (activeTab === 0) {
      fetchMonthlySavings();
    } else if (activeTab === 1) {
      fetchCategorySpending();
    } else if (activeTab === 2) {
      fetchMonthlySpending();
    }
  };
  
  // Apply budget month filter
  const applyBudgetMonthFilter = () => {
    fetchBudgetAdherence();
  };
  
  // Render monthly savings chart
  const renderMonthlySavingsChart = () => {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
          Monthly Savings Contributions
        </Typography>
        
        {monthlySavings.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
            No savings data available for the selected period.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={monthlySavings}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45} 
                textAnchor="end"
                height={70}
                interval={0}
              />
              <YAxis 
                label={{ value: 'Amount (Ksh.)', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip formatter={(value) => [`Ksh. ${value.toFixed(2)}`, 'Amount']} />
              <Legend />
              <Bar 
                dataKey="amount" 
                name="Savings" 
                fill="#4caf50"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    );
  };
  
  // Render spending by category chart
  const renderCategorySpendingChart = () => {
    console.log('Rendering category spending chart with data:', categorySpending);
    
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
          Spending by Category
        </Typography>
        
        {!categorySpending.categories || categorySpending.categories.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
            No expense data available for the selected period.
          </Typography>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                height: 400, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpending.categories}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({cx, cy, midAngle, innerRadius, outerRadius, percent, index}) => {
                        const category = categorySpending.categories[index].category;
                        return `${category}: ${(percent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {categorySpending.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`Ksh. ${value.toFixed(2)}`, 'Amount']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categorySpending.categories.map((category) => (
                      <TableRow key={category.category}>
                        <TableCell>{category.category}</TableCell>
                        <TableCell>Ksh. {category.amount.toFixed(2)}</TableCell>
                        <TableCell>{category.percentage}%</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Ksh. {categorySpending.totalExpenses.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        )}
      </Box>
    );
  };
  
  // Render monthly spending chart
  const renderMonthlySpendingChart = () => {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
          Monthly Spending Trends
        </Typography>
        
        {monthlySpending.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
            No expense data available for the selected period.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={monthlySpending}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45} 
                textAnchor="end"
                height={70}
                interval={0}
              />
              <YAxis 
                label={{ value: 'Amount (Ksh.)', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip formatter={(value) => [`Ksh. ${value.toFixed(2)}`, 'Amount']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                name="Expenses" 
                stroke="#f44336" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
    );
  };
  
  // Render budget adherence table
  const renderBudgetAdherenceTable = () => {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
          Budget Adherence for {budgetMonth.format('MMMM YYYY')}
        </Typography>
        
        {!budgetAdherence || budgetAdherence.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
            No budget data available for {budgetMonth.format('MMMM YYYY')}.
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 440, overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Budgeted</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Spent</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Remaining</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>% Used</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {budgetAdherence.map((budget) => (
                  <TableRow key={budget.category || budget.id}>
                    <TableCell>{budget.category}</TableCell>
                    <TableCell>Ksh. {parseFloat(budget.budgeted).toFixed(2)}</TableCell>
                    <TableCell>Ksh. {parseFloat(budget.spent).toFixed(2)}</TableCell>
                    <TableCell 
                      sx={{ 
                        color: parseFloat(budget.remaining) >= 0 ? 'green' : 'red',
                        fontWeight: 'medium'
                      }}
                    >
                      Ksh. {parseFloat(budget.remaining).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {parseFloat(budget.percentUsed).toFixed(0)}%
                    </TableCell>
                    <TableCell
                      sx={{
                        color: budget.status === 'Under Budget' ? 'green' : 'red',
                        fontWeight: 'medium'
                      }}
                    >
                      {budget.status}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
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
        Financial Reports
      </Typography>
      
      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, maxWidth: 1000, mx: 'auto' }}>
          {error}
        </Alert>
      )}
      
      {/* Report Tabs */}
      <Paper sx={{ maxWidth: 1200, mx: 'auto', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Monthly Savings" />
          <Tab label="Spending by Category" />
          <Tab label="Monthly Spending" />
          <Tab label="Budget Adherence" />
        </Tabs>
        
        {/* Date Range Filter (for tabs 0-2) */}
        {activeTab !== 3 && (
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  onClick={applyDateFilter}
                  fullWidth
                  sx={{
                    height: '56px',
                    backgroundColor: '#1976d2',
                    '&:hover': { backgroundColor: '#0d47a1' },
                  }}
                >
                  Apply Filter
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Month Selector (for tab 3) */}
        {activeTab === 3 && (
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Select Month"
                    value={budgetMonth}
                    onChange={setBudgetMonth}
                    views={['year', 'month']}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  onClick={applyBudgetMonthFilter}
                  fullWidth
                  sx={{
                    height: '56px',
                    backgroundColor: '#1976d2',
                    '&:hover': { backgroundColor: '#0d47a1' },
                  }}
                >
                  Apply Filter
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Report Content */}
        <Box sx={{ p: 3 }}>
          {!loading && (
            <>
              {activeTab === 0 && renderMonthlySavingsChart()}
              {activeTab === 1 && renderCategorySpendingChart()}
              {activeTab === 2 && renderMonthlySpendingChart()}
              {activeTab === 3 && renderBudgetAdherenceTable()}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default Reports;
