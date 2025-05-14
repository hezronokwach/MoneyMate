const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// GET /api/dashboard/summary - Get financial summary for dashboard
router.get('/summary', auth, (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    // Format month string (e.g., "2023-05")
    const currentMonthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    
    // Get first day of current month
    const firstDayOfMonth = `${currentMonthStr}-01`;
    
    // Get last day of current month
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    const lastDayOfMonth = `${currentMonthStr}-${lastDay.toString().padStart(2, '0')}`;
    
    // Get total income
    db.get(
      `SELECT SUM(amount) as totalIncome 
       FROM transactions 
       WHERE user_id = ? AND type = 'income'`,
      [userId],
      (err, incomeResult) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
        }
        
        // Get total expenses
        db.get(
          `SELECT SUM(amount) as totalExpenses 
           FROM transactions 
           WHERE user_id = ? AND type = 'expense'`,
          [userId],
          (err, expenseResult) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ message: 'Server error' });
            }
            
            // Get monthly income
            db.get(
              `SELECT SUM(amount) as monthlyIncome 
               FROM transactions 
               WHERE user_id = ? AND type = 'income' 
               AND date BETWEEN ? AND ?`,
              [userId, firstDayOfMonth, lastDayOfMonth],
              (err, monthlyIncomeResult) => {
                if (err) {
                  console.error('Database error:', err);
                  return res.status(500).json({ message: 'Server error' });
                }
                
                // Get monthly expenses
                db.get(
                  `SELECT SUM(amount) as monthlyExpenses 
                   FROM transactions 
                   WHERE user_id = ? AND type = 'expense' 
                   AND date BETWEEN ? AND ?`,
                  [userId, firstDayOfMonth, lastDayOfMonth],
                  (err, monthlyExpenseResult) => {
                    if (err) {
                      console.error('Database error:', err);
                      return res.status(500).json({ message: 'Server error' });
                    }
                    
                    // Get total savings - Using transactions table with type='savings'
                    db.get(
                      `SELECT SUM(amount) as totalSavings 
                       FROM transactions 
                       WHERE user_id = ? AND type = 'savings'`,
                      [userId],
                      (err, savingsResult) => {
                        if (err) {
                          console.error('Database error:', err);
                          return res.status(500).json({ message: 'Server error' });
                        }
                        
                        // Calculate summary data
                        const totalIncome = incomeResult.totalIncome || 0;
                        const totalExpenses = expenseResult.totalExpenses || 0;
                        const totalSavings = savingsResult.totalSavings || 0;
                        const netBalance = totalIncome - totalExpenses - totalSavings;
                        const monthlyIncome = monthlyIncomeResult.monthlyIncome || 0;
                        const monthlyExpenses = monthlyExpenseResult.monthlyExpenses || 0;
                        
                        // Return summary data
                        res.json({
                          totalIncome,
                          totalExpenses,
                          totalSavings,
                          netBalance,
                          monthlyIncome,
                          monthlyExpenses
                        });
                      }
                    );
                  }
                );
              }
            );
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
