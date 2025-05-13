import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Container,
  Stack,
  Grid
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Savings as SavingsIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Lightbulb as LightbulbIcon,
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../utils/api';
import dayjs from 'dayjs';

// Styled components
const SummaryCard = styled(Card)(({ theme, color }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const CardHeader = styled(Box)(({ theme, color }) => ({
  backgroundColor: color,
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  fontWeight: 'bold',
  textTransform: 'none',
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    netBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0
  });
  const [budgets, setBudgets] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [financialTip, setFinancialTip] = useState('');
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Calculate summary data from transactions
        try {
          // Get all transactions
          const transactions = await api.get('/transactions');
          
          if (transactions && transactions.length > 0) {
            // Calculate total income and expenses
            const totalIncome = transactions
              .filter(t => t.type === 'income')
              .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
              
            const totalExpenses = transactions
              .filter(t => t.type === 'expense')
              .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
            
            // Calculate monthly figures
            const currentMonth = dayjs().format('YYYY-MM');
            const monthlyIncome = transactions
              .filter(t => t.type === 'income' && dayjs(t.date).format('YYYY-MM') === currentMonth)
              .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
              
            const monthlyExpenses = transactions
              .filter(t => t.type === 'expense' && dayjs(t.date).format('YYYY-MM') === currentMonth)
              .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
            
            // Calculate total savings from savings transactions
            const totalSavings = transactions
              .filter(t => t.type === 'savings')
              .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
            
            // Update summary
            const summaryData = {
              totalIncome,
              totalExpenses,
              totalSavings,
              netBalance: totalIncome - totalExpenses,
              monthlyIncome,
              monthlyExpenses
            };
            
            setSummary(summaryData);
            
            // Generate financial tip based on real data
            setFinancialTip(generateFinancialTip(summaryData, []));
          }
        } catch (err) {
          console.error('Error calculating summary data:', err);
        }
        
        // Fetch budgets
        try {
          const budgetsData = await api.get('/budgets');
          if (budgetsData && budgetsData.length > 0) {
            // Sort budgets by percentage used (descending)
            const sortedBudgets = budgetsData.sort((a, b) => {
              const aPercentage = (parseFloat(a.spent) / parseFloat(a.amount)) * 100;
              const bPercentage = (parseFloat(b.spent) / parseFloat(b.amount)) * 100;
              return bPercentage - aPercentage;
            }).slice(0, 5); // Get top 5
            setBudgets(sortedBudgets);
            
            // Update financial tip with budget data
            setFinancialTip(generateFinancialTip(summary, sortedBudgets));
          }
        } catch (err) {
          console.error('Error fetching budgets:', err);
        }
        
        // Fetch savings goals
        try {
          const goalsData = await api.get('/savings-goals');
          if (goalsData && goalsData.length > 0) {
            setSavingsGoals(goalsData);
          }
        } catch (err) {
          console.error('Error fetching savings goals:', err);
        }
        
        // Fetch recent transactions
        try {
          const transactionsData = await api.get('/transactions', { 
            params: { limit: 5 } 
          });
          
          if (transactionsData) {
            setRecentTransactions(transactionsData);
          }
        } catch (err) {
          console.error('Error fetching recent transactions:', err);
        }
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Generate a personalized financial tip
  const generateFinancialTip = (summaryData, budgetsData) => {
    if (summaryData.totalExpenses > summaryData.totalIncome) {
      return "Your expenses are exceeding your income. Consider reviewing your budget to find areas where you can cut back.";
    }
    
    if (summaryData.totalSavings < summaryData.totalIncome * 0.1) {
      return "Try to save at least 10% of your income. Small, consistent savings add up over time!";
    }
    
    const overBudgetCategories = budgetsData.filter(budget => 
      parseFloat(budget.spent) > parseFloat(budget.amount)
    );
    if (overBudgetCategories.length > 0) {
      return `You're over budget in ${overBudgetCategories.length} categories. Check your budget page for details.`;
    }
    
    return "You're doing great with your finances! Keep up the good work and consider setting new savings goals.";
  };
  
  // Format currency - with safety check for undefined values
  const formatCurrency = (amount) => {
    const value = parseFloat(amount);
    if (isNaN(value)) return 'Ksh. 0.00';
    return `Ksh. ${value.toFixed(2)}`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).format('MMM D, YYYY');
  };
  
  // Navigate to other pages
  const navigateTo = (path) => {
    navigate(path);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: { xs: 2, sm: 3 }, minHeight: '100vh' }}>
        {/* Header with welcome message */}
        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Welcome back, {user?.username || 'User'}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Here's your financial overview for {dayjs().format('MMMM YYYY')}
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={logout} 
            sx={{ mt: { xs: 2, sm: 0 } }}
            startIcon={<ArrowForwardIcon />}
          >
            Logout
          </Button>
        </Box>
        
        {/* Error message if any */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Financial Summary Cards */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', textAlign: 'center' }}>
          Financial Summary
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard>
              <CardHeader color="#4caf50">
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Total Income
                </Typography>
                <TrendingUpIcon sx={{ color: 'white', fontSize: 30 }} />
              </CardHeader>
              <CardContent sx={{ pt: 2, pb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {formatCurrency(summary.totalIncome)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This month: {formatCurrency(summary.monthlyIncome)}
                </Typography>
              </CardContent>
            </SummaryCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard>
              <CardHeader color="#f44336">
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Total Expenses
                </Typography>
                <TrendingDownIcon sx={{ color: 'white', fontSize: 30 }} />
              </CardHeader>
              <CardContent sx={{ pt: 2, pb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {formatCurrency(summary.totalExpenses)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This month: {formatCurrency(summary.monthlyExpenses)}
                </Typography>
              </CardContent>
            </SummaryCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard>
              <CardHeader color="#2196f3">
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Net Balance
                </Typography>
                <AccountBalanceIcon sx={{ color: 'white', fontSize: 30 }} />
              </CardHeader>
              <CardContent sx={{ pt: 2, pb: 1 }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 'bold', 
                  mb: 1,
                  color: summary.netBalance >= 0 ? '#4caf50' : '#f44336' 
                }}>
                  {formatCurrency(summary.netBalance)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {summary.netBalance >= 0 ? 'Positive balance' : 'Negative balance'}
                </Typography>
              </CardContent>
            </SummaryCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard>
              <CardHeader color="#ff9800">
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Total Savings
                </Typography>
                <SavingsIcon sx={{ color: 'white', fontSize: 30 }} />
              </CardHeader>
              <CardContent sx={{ pt: 2, pb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {formatCurrency(summary.totalSavings)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {summary.totalIncome > 0 
                    ? `${Math.round((summary.totalSavings / summary.totalIncome) * 100) || 0}% of income`
                    : '0% of income'}
                </Typography>
              </CardContent>
            </SummaryCard>
          </Grid>
        </Grid>
        
        {/* Financial Tip */}
        <Paper 
          sx={{ 
            p: 2, 
            mb: 4, 
            display: 'flex', 
            alignItems: 'center',
            bgcolor: '#e3f2fd',
            border: '1px solid #bbdefb',
            maxWidth: '100%',
            mx: 'auto'
          }}
        >
          <LightbulbIcon sx={{ color: '#ff9800', mr: 2, fontSize: 30, flexShrink: 0 }} />
          <Typography variant="body1">
            <strong>Financial Tip:</strong> {financialTip}
          </Typography>
        </Paper>
        
        {/* Main Dashboard Content */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={4} justifyContent="center">
            {/* Budget Overview */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    Budget Overview
                  </Typography>
                  <Button 
                    size="small" 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigateTo('/budget')}
                  >
                    View All
                  </Button>
                </Box>
                
                {budgets.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      No budgets set up yet. Create your first budget to track your spending.
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      onClick={() => navigateTo('/budget')}
                    >
                      Create Budget
                    </Button>
                  </Box>
                ) : (
                  <TableContainer sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Budget</TableCell>
                          <TableCell align="right">Spent</TableCell>
                          <TableCell align="right">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {budgets.map((budget) => {
                          const amount = parseFloat(budget.amount) || 0;
                          const spent = parseFloat(budget.spent) || 0;
                          const percentUsed = amount > 0 ? Math.round((spent / amount) * 100) : 0;
                          const isOverBudget = spent > amount;
                          
                          return (
                            <TableRow key={budget.id}>
                              <TableCell>{budget.category}</TableCell>
                              <TableCell align="right">{formatCurrency(amount)}</TableCell>
                              <TableCell align="right">{formatCurrency(spent)}</TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                  <Typography variant="body2" sx={{ mr: 1 }}>
                                    {percentUsed}%
                                  </Typography>
                                  <Chip 
                                    size="small"
                                    label={isOverBudget ? 'Over' : 'Under'}
                                    color={isOverBudget ? 'error' : 'success'}
                                    sx={{ minWidth: 60 }}
                                  />
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min(percentUsed, 100)}
                                  color={isOverBudget ? 'error' : 'success'}
                                  sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>
            
            {/* Recent Transactions */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    Recent Transactions
                  </Typography>
                  <Button 
                    size="small" 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigateTo('/expenses')}
                  >
                    View All
                  </Button>
                </Box>
                
                {recentTransactions.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      No transactions recorded yet. Add your first transaction to get started.
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      onClick={() => navigateTo('/expenses')}
                    >
                      Add Transaction
                    </Button>
                  </Box>
                ) : (
                  <TableContainer sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{formatDate(transaction.date)}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>
                              <Chip 
                                size="small" 
                                label={transaction.category}
                                color={transaction.type === 'income' ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell 
                              align="right"
                              sx={{ 
                                color: transaction.type === 'income' ? '#4caf50' : '#f44336',
                                fontWeight: 'medium'
                              }}
                            >
                              {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        {/* Savings Goals - Now in its own row */}
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 2, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                Savings Goals
              </Typography>
              <Button 
                size="small" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigateTo('/savings')}
              >
                View All
              </Button>
            </Box>
            
            {savingsGoals.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No savings goals yet. Set a goal to start tracking your progress.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => navigateTo('/savings')}
                >
                  Create Savings Goal
                </Button>
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Grid container spacing={2} justifyContent="center">
                  {savingsGoals.map((goal) => {
                    const targetAmount = parseFloat(goal.target_amount) || 0;
                    const currentAmount = parseFloat(goal.current_savings) || 0;
                    // Calculate progress but cap at 100% for display purposes
                    const rawProgress = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;
                    const displayProgress = Math.min(rawProgress, 100);
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={goal.id}>
                        <Card sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              {goal.name}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Target: {formatCurrency(targetAmount)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(goal.deadline)}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={displayProgress}
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  bgcolor: 'rgba(0,0,0,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: rawProgress > 100 ? '#ff9800' : '#4caf50'
                                  }
                                }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">
                                {formatCurrency(currentAmount)}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                fontWeight="bold"
                                color={rawProgress > 100 ? '#ff9800' : '#4caf50'}
                              >
                                {displayProgress}%
                              </Typography>
                            </Box>
                          </CardContent>
                          <CardActions>
                            <Button size="small" onClick={() => navigateTo(`/savings/${goal.id}`)}>
                              View Details
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Quick Actions */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', textAlign: 'center' }}>
            Quick Actions
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            flexWrap="wrap"
            justifyContent="center"
            sx={{ gap: 2 }}
          >
            <QuickActionButton
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigateTo('/expenses')}
              sx={{ minWidth: { xs: '100%', sm: '160px' } }}
            >
              Add Transaction
            </QuickActionButton>
            
            <QuickActionButton
              variant="contained"
              color="secondary"
              startIcon={<AttachMoneyIcon />}
              onClick={() => navigateTo('/budget')}
              sx={{ minWidth: { xs: '100%', sm: '160px' } }}
            >
              Manage Budgets
            </QuickActionButton>
            
            <QuickActionButton
              variant="contained"
              sx={{ 
                bgcolor: '#ff9800', 
                '&:hover': { bgcolor: '#f57c00' },
                minWidth: { xs: '100%', sm: '160px' }
              }}
              startIcon={<SavingsIcon />}
              onClick={() => navigateTo('/savings')}
            >
              Savings Goals
            </QuickActionButton>
            
            <QuickActionButton
              variant="contained"
              sx={{ 
                bgcolor: '#4caf50', 
                '&:hover': { bgcolor: '#388e3c' },
                minWidth: { xs: '100%', sm: '160px' }
              }}
              startIcon={<BarChartIcon />}
              onClick={() => navigateTo('/reports')}
            >
              View Reports
            </QuickActionButton>
            
            <QuickActionButton
              variant="contained"
              sx={{ 
                bgcolor: '#9c27b0', 
                '&:hover': { bgcolor: '#7b1fa2' },
                minWidth: { xs: '100%', sm: '160px' }
              }}
              startIcon={<ReceiptIcon />}
              onClick={() => navigateTo('/expenses')}
            >
              All Transactions
            </QuickActionButton>
            
            <QuickActionButton
              variant="contained"
              sx={{ 
                bgcolor: '#607d8b', 
                '&:hover': { bgcolor: '#455a64' },
                minWidth: { xs: '100%', sm: '160px' }
              }}
              startIcon={<SettingsIcon />}
              onClick={() => navigateTo('/help')}
            >
              Help & Support
            </QuickActionButton>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}

export default Dashboard;
