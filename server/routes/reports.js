const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/reports/monthly-savings - Get monthly savings data
router.get('/monthly-savings', auth, (req, res) => {
  try {
    // Get date range from query params or default to last 6 months
    const endDate = req.query.endDate || new Date().toISOString().split('T')[0];
    const startDate = req.query.startDate || new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0];
    
    db.all(
      `SELECT 
        strftime('%Y-%m', date) as month,
        SUM(amount) as amount
       FROM transactions
       WHERE user_id = ? 
         AND type = 'savings'
         AND date BETWEEN ? AND ?
       GROUP BY strftime('%Y-%m', date)
       ORDER BY month ASC`,
      [req.user.id, startDate, endDate],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error fetching monthly savings' });
        }
        
        // Format month names for display
        const formattedResults = results.map(item => {
          const [year, month] = item.month.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return {
            month: `${monthNames[parseInt(month) - 1]} ${year}`,
            rawMonth: item.month,
            amount: item.amount
          };
        });
        
        res.json(formattedResults);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reports/spending-by-category - Get spending by category
router.get('/spending-by-category', auth, (req, res) => {
  try {
    // Get date range from query params or default to current month
    const today = new Date();
    const endDate = req.query.endDate || today.toISOString().split('T')[0];
    
    // Default to start of current month if not specified
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const startDate = req.query.startDate || startOfMonth;
    
    db.all(
      `SELECT 
        category,
        SUM(amount) as amount
       FROM transactions
       WHERE user_id = ? 
         AND type = 'expense'
         AND date BETWEEN ? AND ?
       GROUP BY category
       ORDER BY amount DESC`,
      [req.user.id, startDate, endDate],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error fetching spending by category' });
        }
        
        // Calculate total expenses for percentage
        const totalExpenses = results.reduce((sum, item) => sum + item.amount, 0);
        
        // Add percentage to each category
        const formattedResults = results.map(item => ({
          category: item.category,
          amount: item.amount,
          percentage: totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 100) : 0
        }));
        
        res.json({
          categories: formattedResults,
          totalExpenses
        });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reports/monthly-spending - Get monthly spending trends
router.get('/monthly-spending', auth, (req, res) => {
  try {
    // Get date range from query params or default to last 6 months
    const endDate = req.query.endDate || new Date().toISOString().split('T')[0];
    const startDate = req.query.startDate || new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0];
    
    db.all(
      `SELECT 
        strftime('%Y-%m', date) as month,
        SUM(amount) as amount
       FROM transactions
       WHERE user_id = ? 
         AND type = 'expense'
         AND date BETWEEN ? AND ?
       GROUP BY strftime('%Y-%m', date)
       ORDER BY month ASC`,
      [req.user.id, startDate, endDate],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error fetching monthly spending' });
        }
        
        // Format month names for display
        const formattedResults = results.map(item => {
          const [year, month] = item.month.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return {
            month: `${monthNames[parseInt(month) - 1]} ${year}`,
            rawMonth: item.month,
            amount: item.amount
          };
        });
        
        res.json(formattedResults);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reports/budget-adherence - Get budget adherence data
router.get('/budget-adherence', auth, (req, res) => {
  try {
    // Get month from query params or default to current month
    const today = new Date();
    const year = parseInt(req.query.year) || today.getFullYear();
    const month = parseInt(req.query.month) || today.getMonth() + 1;
    
    // Format month string (e.g., "2023-05")
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    
    console.log(`Fetching budget adherence for ${monthStr}`);
    
    // First get all budgets for the month with category names
    db.all(
      `SELECT b.id, b.amount, b.month, c.name as category_name, c.id as category_id 
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = ? AND b.month = ?`,
      [req.user.id, monthStr],
      (err, budgets) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error fetching budgets' });
        }
        
        console.log('Budgets found:', budgets);
        
        // If no budgets, return empty array
        if (budgets.length === 0) {
          return res.json([]);
        }
        
        // Get all expense transactions for the month
        const startDate = `${monthStr}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${monthStr}-${lastDay.toString().padStart(2, '0')}`;
        
        console.log(`Fetching expenses from ${startDate} to ${endDate}`);
        
        // Get expense transactions joined with categories to ensure we match by category ID
        db.all(
          `SELECT t.category, c.name as category_name, c.id as category_id, SUM(t.amount) as spent
           FROM transactions t
           JOIN categories c ON t.category = c.name AND t.user_id = c.user_id
           WHERE t.user_id = ? 
             AND t.type = 'expense'
             AND t.date BETWEEN ? AND ?
           GROUP BY c.id`,
          [req.user.id, startDate, endDate],
          (err, expenses) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ message: 'Server error fetching expenses' });
            }
            
            console.log('Expenses by category:', expenses);
            
            // Create a map of category_id to spent amount
            const spentByCategory = {};
            expenses.forEach(expense => {
              spentByCategory[expense.category_id] = expense.spent;
            });
            
            console.log('Spent by category map:', spentByCategory);
            
            // Combine budget and spending data
            const adherenceData = budgets.map(budget => {
              const spent = spentByCategory[budget.category_id] || 0;
              const remaining = budget.amount - spent;
              const percentUsed = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;
              
              return {
                id: budget.id,
                category: budget.category_name,
                budgeted: budget.amount,
                spent: spent,
                remaining: remaining,
                percentUsed: percentUsed,
                status: remaining >= 0 ? 'Under Budget' : 'Over Budget'
              };
            });
            
            console.log('Final adherence data:', adherenceData);
            res.json(adherenceData);
          }
        );
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
