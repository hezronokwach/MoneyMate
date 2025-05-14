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
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
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

function Reports() {
  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState(dayjs().subtract(6, 'month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [budgetMonth, setBudgetMonth] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [monthlySavings, setMonthlySavings] = useState([]);
  const [categorySpending, setCategorySpending] = useState({ categories: [], totalExpenses: 0 });
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [budgetAdherence, setBudgetAdherence] = useState([]);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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

  const fetchCategorySpending = async () => {
    setLoading(true);
    setError('');
    try {
      const formattedStartDate = startDate.format('YYYY-MM-DD');
      const formattedEndDate = endDate.format('YYYY-MM-DD');
      const data = await api.get(`/reports/spending-by-category?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
      setCategorySpending(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch category spending data');
    } finally {
      setLoading(false);
    }
  };

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

  const fetchBudgetAdherence = async () => {
    setLoading(true);
    setError('');
    try {
      const year = budgetMonth.year();
      const month = budgetMonth.month() + 1;
      const data = await api.get(`/reports/budget-adherence?year=${year}&month=${month}`);
      setBudgetAdherence(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch budget adherence data');
      setBudgetAdherence([]);
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilter = () => {
    if (activeTab === 0) {
      fetchMonthlySavings();
    } else if (activeTab === 1) {
      fetchCategorySpending();
    } else if (activeTab === 2) {
      fetchMonthlySpending();
    }
  };

  const applyBudgetMonthFilter = () => {
    fetchBudgetAdherence();
  };

  const renderMonthlySavingsChart = () => {
    return (
      <Box sx={{ mt: 4, bgcolor: '#ffffff', borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
        <SectionTitle bgcolor="#1976d2">
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Monthly Savings Contributions
          </Typography>
        </SectionTitle>
        <Box sx={{ p: 3 }}>
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
      </Box>
    );
  };

  const renderCategorySpendingChart = () => {
    return (
      <Box sx={{ mt: 4, bgcolor: '#ffffff', borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
        <SectionTitle bgcolor="#1976d2">
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Spending by Category
          </Typography>
        </SectionTitle>
        <Box sx={{ p: 3 }}>
          {!categorySpending.categories || categorySpending.categories.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
              No expense data available for the selected period.
            </Typography>
          ) : (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  height: 400, 
                  width: '100%',
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  bgcolor: '#e3f2fd',
                  border: '1px solid #bbdefb',
                  borderRadius: 2,
                  p: 2,
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie
                        data={categorySpending.categories}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="category"
                        paddingAngle={2}
                      >
                        {categorySpending.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`Ksh. ${value.toFixed(2)}`, 'Amount']}
                        labelFormatter={(name) => `Category: ${name}`}
                      />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{ paddingTop: 20 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <TableContainer component={Paper} sx={{ 
                  maxHeight: 400, 
                  overflow: 'auto',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                  borderRadius: 2
                }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#1976d2' }}>
                        <TableCell sx={{ color: '#1976d2', fontWeight: 'bold' }}>Category</TableCell>
                        <TableCell sx={{ color: '#1976d2', fontWeight: 'bold' }}>Amount</TableCell>
                        <TableCell sx={{ color: '#1976d2', fontWeight: 'bold' }}>Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categorySpending.categories.map((category) => (
                        <TableRow key={category.category} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                          <TableCell>{category.category}</TableCell>
                          <TableCell>Ksh. {category.amount.toFixed(2)}</TableCell>
                          <TableCell>{category.percentage}%</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: '#e3f2fd' }}>
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
      </Box>
    );
  };

  const renderMonthlySpendingChart = () => {
    return (
      <Box sx={{ mt: 4, bgcolor: '#ffffff', borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
        <SectionTitle bgcolor="#1976d2">
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Monthly Spending Trends
          </Typography>
        </SectionTitle>
        <Box sx={{ p: 3 }}>
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
      </Box>
    );
  };

  const renderBudgetAdherenceTable = () => {
    return (
      <Box sx={{ mt: 4, bgcolor: '#ffffff', borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
        <SectionTitle bgcolor="#1976d2">
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Budget Adherence for {budgetMonth.format('MMMM YYYY')}
          </Typography>
        </SectionTitle>
        <Box sx={{ p: 3 }}>
          {!budgetAdherence || budgetAdherence.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
              No budget data available for {budgetMonth.format('MMMM YYYY')}.
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 440, overflow: 'auto', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)', borderRadius: 2 }}>
              <Table stickyHeader>
                <TableHead >
                  <TableRow sx={{ bgcolor: '#1976d2' }}>
                    <TableCell sx={{ color: '#1976d2', fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ color: '#1976d2', fontWeight: 'bold' }}>Budgeted</TableCell>
                    <TableCell sx={{ color: '#1976d2', fontWeight: 'bold' }}>Spent</TableCell>
                    <TableCell sx={{ color: '#1976d2', fontWeight: 'bold' }}>Remaining</TableCell>
                    <TableCell sx={{ color: '#1976d2', fontWeight: 'bold' }}>% Used</TableCell>
                    <TableCell sx={{ color: '#1976d2', fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {budgetAdherence.map((budget) => (
                    <TableRow key={budget.category || budget.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                      <TableCell>{budget.category}</TableCell>
                      <TableCell>Ksh. {parseFloat(budget.budgeted).toFixed(2)}</TableCell>
                      <TableCell>Ksh. {parseFloat(budget.spent).toFixed(2)}</TableCell>
                      <TableCell 
                        sx={{ 
                          color: parseFloat(budget.remaining) >= 0 ? '#4caf50' : '#f44336',
                          fontWeight: 'medium'
                        }}
                      >
                        Ksh. {parseFloat(budget.remaining).toFixed(2)}
                      </TableCell>
                      <TableCell>{parseFloat(budget.percentUsed).toFixed(0)}%</TableCell>
                      <TableCell
                        sx={{
                          color: budget.status === 'Under Budget' ? '#4caf50' : '#f44336',
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
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1400, mx: 'auto', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
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

      {error && (
        <Alert severity="error" sx={{ mb: 3, maxWidth: 1000, mx: 'auto' }}>
          {error}
        </Alert>
      )}

      <Box sx={{ maxWidth: 1200, mx: 'auto', bgcolor: '#ffffff', borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
        <SectionTitle bgcolor="#1976d2">
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Report Options
          </Typography>
        </SectionTitle>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ bgcolor: '#e3f2fd', borderBottom: 1, borderColor: 'divider' }}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Monthly Savings" />
          <Tab label="Spending by Category" />
          <Tab label="Monthly Spending" />
          <Tab label="Budget Adherence" />
        </Tabs>

        {activeTab !== 3 && (
          <Box sx={{ p: 3, bgcolor: '#ffffff' }}>
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
                    borderRadius: 1,
                  }}
                >
                  Apply Filter
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 3 && (
          <Box sx={{ p: 3, bgcolor: '#ffffff' }}>
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
                    borderRadius: 1,
                  }}
                >
                  Apply Filter
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

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
      </Box>
    </Box>
  );
}

export default Reports;