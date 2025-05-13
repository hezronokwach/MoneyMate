const express = require('express');
const router = express.Router();
const { db } = require('../config/database'); // Destructure to get the db property
const auth = require('../middleware/auth');

// POST /api/transactions - Create a new transaction
router.post('/', auth, async (req, res) => {
  console.log(req.body);
  const { amount, type, category, date, description } = req.body;

  // Validate required fields
  if (!amount || !type || !category || !date) {
    return res.status(400).json({ message: 'Amount, type, category, and date are required' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }
  if (!['income', 'expense', 'savings'].includes(type)) {
    return res.status(400).json({ message: 'Type must be income, expense, or savings' });
  }
  
  // For expenses and savings, category is required
  if ((type === 'expense' || type === 'savings') && !category) {
    return res.status(400).json({ message: 'Category is required for expense and savings transactions' });
  }

  try {
    // Use the database connection directly since it's already initialized
    db.run(
      `INSERT INTO transactions (user_id, amount, type, category, date, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, amount, type, category, date, description || ''],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error in transaction' });
        }
        res.status(201).json({ 
          message: 'Transaction created successfully',
          transactionId: this.lastID 
        });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error in transaction' });
  }
});

// GET /api/transactions - Retrieve all transactions for the user
router.get('/', auth, (req, res) => {
  try {
    db.all(
      `SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC`,
      [req.user.id],
      (err, transactions) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error getting transactions' });
        }
        res.json(transactions);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error getting transactions' });
  }
});

// GET /api/transactions/summary - Get summary of transactions
router.get('/summary', auth, (req, res) => {
  try {
    db.all(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN type = 'savings' THEN amount ELSE 0 END), 0) as total_savings
       FROM transactions
       WHERE user_id = ?`,
      [req.user.id],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error fetching transaction summary' });
        }
        
        const summary = results[0] || { total_income: 0, total_expenses: 0, total_savings: 0 };
        
        // Calculate net balance (income - expenses - savings)
        summary.net_balance = summary.total_income - summary.total_expenses - summary.total_savings;
        
        res.json(summary);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error fetching transaction summary' });
  }
});

// PUT /api/transactions/:id - Update a transaction
router.put('/:id', auth, (req, res) => {
  const { id } = req.params;
  const { amount, type, category, date, description } = req.body;

  // Validate required fields
  if (!amount || !type || !category || !date) {
    return res.status(400).json({ message: 'Amount, type, category, and date are required' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }
  if (!['income', 'expense', 'savings'].includes(type)) {
    return res.status(400).json({ message: 'Type must be income, expense, or savings' });
  }
  
  // For expenses and savings, category is required
  if ((type === 'expense' || type === 'savings') && !category) {
    return res.status(400).json({ message: 'Category is required for expense and savings transactions' });
  }

  try {
    // First check if the transaction exists and belongs to the user
    db.get(
      `SELECT * FROM transactions WHERE id = ? AND user_id = ?`,
      [id, req.user.id],
      (err, transaction) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error checking transaction' });
        }
        
        if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
        
        // Update the transaction
        db.run(
          `UPDATE transactions
           SET amount = ?, type = ?, category = ?, date = ?, description = ?
           WHERE id = ? AND user_id = ?`,
          [amount, type, category, date, description || '', id, req.user.id],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ message: 'Server error updating transaction' });
            }
            res.json({ message: 'Transaction updated successfully' });
          }
        );
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/transactions/:id - Delete a transaction
router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;

  try {
    // First check if the transaction exists and belongs to the user
    db.get(
      `SELECT * FROM transactions WHERE id = ? AND user_id = ?`,
      [id, req.user.id],
      (err, transaction) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error checking transaction' });
        }
        
        if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
        
        // Delete the transaction
        db.run(
          `DELETE FROM transactions WHERE id = ? AND user_id = ?`, 
          [id, req.user.id],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ message: 'Server error deleting transaction' });
            }
            res.json({ message: 'Transaction deleted successfully' });
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
