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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Container,
  Grid,
  Fade
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
  Settings as SettingsIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../utils/api';
import dayjs from 'dayjs';

// Styled components
const SummaryCard = styled(Card)(({ theme }) => ({
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

const CardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

// Enhanced section title component
const SectionTitle = styled(Box)(({ theme, bgcolor = '#1976d2' }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  backgroundColor: bgcolor,
  marginBottom: theme.spacing(2),
}));

const ActionCard = ({ icon, text, onClick }) => (
  <Paper
    sx={{
      p: 2,
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: 4,
      },
      borderRadius: 2,
    }}
    onClick={onClick}
  >
    {icon}
    <Typography sx={{ mt: 1, fontWeight: 'medium' }}>{text}</Typography>
  </Paper>
);

// Gradients for summary cards
const gradients = {
  income: 'linear-gradient(to right, #4caf50, #81c784)',
  expenses: 'linear-gradient(to right, #f44336, #e57373)',
  balance: 'linear-gradient(to right, #2196f3, #64b5f6)',
  savings: 'linear-gradient(to right, #ff9800, #ffb74d)',
};

// Section background colors
const sectionColors = {
  budget: '#3949ab',
  transactions: '#00796b',
  savings: '#d84315',
  summary: '#1976d2'
};

function Dashboard() {
  const { user } = useContext(AuthContext);
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
        // Get summary data from transactions/summary endpoint
        try {
          const summaryData = await api.get('/transactions/summary');
          if (summaryData) {
            // Use the server-calculated net balance
            const totalIncome = summaryData.total_income || 0;
            const totalExpenses = summaryData.total_expenses || 0;
            const totalSavings = summaryData.total_savings || 0;
            const netBalance = summaryData.net_balance || 0;

            // Calculate monthly data
            const transactions = await api.get('/transactions');
            const currentMonth = dayjs().format('YYYY-MM');
            const monthlyIncome = transactions
              .filter(t => t.type === 'income' && dayjs(t.date).format('YYYY-MM') === currentMonth)
              .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
            const monthlyExpenses = transactions
              .filter(t => t.type === 'expense' && dayjs(t.date).format('YYYY-MM') === currentMonth)
              .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

            setSummary({
              totalIncome,
              totalExpenses,
              totalSavings,
              netBalance,
              monthlyIncome,
              monthlyExpenses
            });
            setFinancialTip(generateFinancialTip(summary, budgets));
          }
        } catch (err) {
          console.error('Error fetching summary data:', err);
        }

        // Fetch budgets
        try {
          const budgetsData = await api.get('/budgets');
          if (budgetsData && budgetsData.length > 0) {
            const sortedBudgets = budgetsData.sort((a, b) => {
              const aPercentage = (parseFloat(a.spent) / parseFloat(a.amount)) * 100;
              const bPercentage = (parseFloat(b.spent) / parseFloat(b.amount)) * 100;
              return bPercentage - aPercentage;
            }).slice(0, 5);
            setBudgets(sortedBudgets);
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
          const transactionsData = await api.get('/transactions', { params: { limit: 5 } });
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
    if (summaryData.netBalance < 0) {
      return "Your expenses are exceeding your income. Consider reviewing your budget to find areas where you can cut back.";
    }
    if (summaryData.totalSavings < summaryData.totalIncome * 0.1) {
      return "Try to save at least 10% of your income. Small, consistent savings add up over time!";
    }
    const overBudgetCategories = budgetsData.filter(budget => parseFloat(budget.spent) > parseFloat(budget.amount));
    if (overBudgetCategories.length > 0) {
      return `You're over budget in ${overBudgetCategories.length} categories. Check your budget page for details.`;
    }
    return "You're doing great with your finances! Keep up the good work and consider setting new savings goals.";
  };

  // Format currency
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
        </Box>

        {/* Error message if any */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Financial Summary Cards with Fade Animation */}
        <Fade in timeout={300}>
          <Box sx={{ mb: 6 }}>
            <SectionTitle bgcolor={sectionColors.summary}>
              <AssessmentIcon sx={{ color: 'white', mr: 1.5, fontSize: 28 }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Financial Summary
              </Typography>
            </SectionTitle>
            <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
              {[
                { label: 'Total Income', value: summary.totalIncome, type: 'income', icon: <TrendingUpIcon sx={{ color: 'white', fontSize: 30 }} /> },
                { label: 'Total Expenses', value: summary.totalExpenses, type: 'expenses', icon: <TrendingDownIcon sx={{ color: 'white', fontSize: 30 }} /> },
                { label: 'Net Balance', value: summary.netBalance, type: 'balance', icon: <AccountBalanceIcon sx={{ color: 'white', fontSize: 30 }} /> },
                { label: 'Total Savings', value: summary.totalSavings, type: 'savings', icon: <SavingsIcon sx={{ color: 'white', fontSize: 30 }} /> },
              ].map((stat) => (
                <Grid item xs={12} sm={6} md={3} key={stat.label}>
                  <SummaryCard>
                    <CardHeader sx={{ background: gradients[stat.type] }}>
                      <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {stat.label}
                      </Typography>
                      {stat.icon}
                    </CardHeader>
                    <CardContent sx={{ pt: 2, pb: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {formatCurrency(stat.value)}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {stat.type === 'income' && `This month: ${formatCurrency(summary.monthlyIncome)}`}
                        {stat.type === 'expenses' && `This month: ${formatCurrency(summary.monthlyExpenses)}`}
                        {stat.type === 'balance' && (stat.value >= 0 ? 'Positive balance' : 'Negative balance')}
                        {stat.type === 'savings' && (summary.totalIncome > 0 ? `${Math.round((stat.value / summary.totalIncome) * 100)}% of income` : '0% of income')}
                      </Typography>
                    </CardContent>
                  </SummaryCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* Financial Tip with Fade Animation */}
        <Fade in timeout={500}>
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
        </Fade>

        {/* Main Dashboard Content with Fade Animation */}
        <Fade in timeout={700}>
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={4} justifyContent="center">
              {/* Budget Overview */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 0, height: '100%', overflow: 'hidden', borderRadius: 2 }}>
                  <SectionTitle bgcolor={sectionColors.budget}>
                    <AttachMoneyIcon sx={{ color: 'white', mr: 1.5, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      Budget Overview
                    </Typography>
                  </SectionTitle>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
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
                                <TableRow key={budget.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
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
                                      sx={{ height: 8, borderRadius: 4 }}
                                      color={isOverBudget ? 'error' : 'success'}
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Recent Transactions */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 0, height: '100%', overflow: 'hidden', borderRadius: 2 }}>
                  <SectionTitle bgcolor={sectionColors.transactions}>
                    <HistoryIcon sx={{ color: 'white', mr: 1.5, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      Recent Transactions
                    </Typography>
                  </SectionTitle>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
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
                              <TableCell>Type</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>Category</TableCell>
                              <TableCell align="right">Amount</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {recentTransactions.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {transaction.type === 'income' ? <ArrowUpwardIcon color="success" fontSize="small" sx={{ mr: 0.5 }} /> : <ArrowDownwardIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />}
                                    {transaction.type}
                                  </Box>
                                </TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell>{transaction.category}</TableCell>
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
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>

        {/* Savings Goals with Fade Animation */}
        <Fade in timeout={900}>
          <Box sx={{ mb: 4 }}>
            <Paper sx={{ p: 0, overflow: 'hidden', borderRadius: 2 }}>
              <SectionTitle bgcolor={sectionColors.savings}>
                <FlagIcon sx={{ color: 'white', mr: 1.5, fontSize: 28 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Savings Goals
                </Typography>
              </SectionTitle>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
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
                  <Box sx={{ overflowX: 'auto' }} >
                    <Grid container spacing={2} justifyContent="center">
                      {savingsGoals.map((goal) => {
                        const targetAmount = parseFloat(goal.target_amount) || 0;
                        const currentAmount = parseFloat(goal.current_savings) || 0;
                        const progress = targetAmount > 0 ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100) : 0;

                        return (
                          <Grid item xs={12} sm={6} md={4} key={goal.id}>
                            <Card sx={{
                              height: '100%',  // Keep full height
                              display: 'flex',
                              flexDirection: 'column',
                              boxShadow: 3,
                              transition: 'transform 0.2s',
                              '&:hover': { transform: 'scale(1.02)' }
                            }}>
                              <Box sx={{
                                bgcolor: '#ff9800',
                                p: 1.5,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                                  {goal.name}
                                </Typography>
                                <SavingsIcon sx={{ color: 'white' }} />
                              </Box>
                              <CardContent sx={{
                                flexGrow: 1,  // Allow content to grow
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                p: 2  // Reduce padding
                              }}>
                                <Box>
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
                                      value={progress}
                                      sx={{ height: 8, borderRadius: 4 }}
                                      color={progress >= 100 ? 'success' : 'primary'}
                                    />
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">
                                      {formatCurrency(currentAmount)}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      color={progress >= 100 ? '#4caf50' : '#1976d2'}
                                    >
                                      {progress}%
                                    </Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                              <CardActions sx={{ p: 1 }}>  {/* Reduce padding */}
                                <Button size="small" onClick={() => navigateTo(`/savings`)}>
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
              </Box>
            </Paper>
          </Box>
        </Fade>

        <Fade in timeout={1100}>
          <Box sx={{ mt: 4 }}>
            <SectionTitle bgcolor="#1976d2">
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
            </SectionTitle>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={6} sm={4} md={2}>
                <ActionCard
                  icon={<AddIcon fontSize="large" color="primary" />}
                  text="Add Transaction"
                  onClick={() => navigateTo('/expenses')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <ActionCard
                  icon={<AttachMoneyIcon fontSize="large" color="secondary" />}
                  text="Manage Budgets"
                  onClick={() => navigateTo('/budget')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <ActionCard
                  icon={<SavingsIcon fontSize="large" sx={{ color: '#ff9800' }} />}
                  text="Savings Goals"
                  onClick={() => navigateTo('/savings')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <ActionCard
                  icon={<BarChartIcon fontSize="large" sx={{ color: '#4caf50' }} />}
                  text="View Reports"
                  onClick={() => navigateTo('/reports')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <ActionCard
                  icon={<ReceiptIcon fontSize="large" sx={{ color: '#607d8b' }} />}
                  text="All Transactions"
                  onClick={() => navigateTo('/expenses')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <ActionCard
                  icon={<SettingsIcon fontSize="large" sx={{ color: '#9c27b0' }} />}
                  text="Help & Support"
                  onClick={() => navigateTo('/help')}
                />
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Box>
    </Container>
  );
}

export default Dashboard;
