const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/budgets - Retrieve all budgets for the user with spending
router.get('/', auth, (req, res) => {
  try {
    db.all(
      `SELECT b.id, b.month, b.amount, c.name AS category, c.id AS category_id,
              COALESCE((
                SELECT SUM(t.amount)
                FROM transactions t
                WHERE t.user_id = b.user_id
                  AND t.category = c.name
                  AND t.type = 'expense'
                  AND SUBSTR(t.date, 1, 7) = b.month
              ), 0) AS spent
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = ?`,
      [req.user.id],
      (err, budgets) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error fetching budgets' });
        }
        res.json(budgets);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error fetching budgets' });
  }
});

// POST /api/budgets - Create a new budget
router.post('/', auth, (req, res) => {
  const { month, category_id, amount } = req.body;

  if (!month || !category_id || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Month, category, and positive amount are required' });
  }

  try {
    // Verify category belongs to user
    db.get(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?',
      [category_id, req.user.id],
      (err, category) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error verifying category' });
        }
        if (!category) {
          return res.status(400).json({ message: 'Invalid category' });
        }

        db.run(
          `INSERT INTO budgets (user_id, month, category_id, amount) VALUES (?, ?, ?, ?)`,
          [req.user.id, month, category_id, amount],
          function (err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ message: 'Server error creating budget' });
            }
            res.status(201).json({ id: this.lastID, month, category_id, amount });
          }
        );
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error creating budget' });
  }
});

// PUT /api/budgets/:id - Update a budget
router.put('/:id', auth, (req, res) => {
  const { month, category_id, amount } = req.body;
  const budgetId = req.params.id;

  if (!month || !category_id || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Month, category, and positive amount are required' });
  }

  try {
    // Verify budget and category
    db.get(
      'SELECT id FROM budgets WHERE id = ? AND user_id = ?',
      [budgetId, req.user.id],
      (err, budget) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error verifying budget' });
        }
        if (!budget) {
          return res.status(404).json({ message: 'Budget not found' });
        }

        db.get(
          'SELECT id FROM categories WHERE id = ? AND user_id = ?',
          [category_id, req.user.id],
          (err, category) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ message: 'Server error verifying category' });
            }
            if (!category) {
              return res.status(400).json({ message: 'Invalid category' });
            }

            db.run(
              `UPDATE budgets SET month = ?, category_id = ?, amount = ? WHERE id = ?`,
              [month, category_id, amount, budgetId],
              (err) => {
                if (err) {
                  console.error('Database error:', err);
                  return res.status(500).json({ message: 'Server error updating budget' });
                }
                res.json({ id: budgetId, month, category_id, amount });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error updating budget' });
  }
});

// DELETE /api/budgets/:id - Delete a budget
router.delete('/:id', auth, (req, res) => {
  const budgetId = req.params.id;

  try {
    db.get(
      'SELECT id FROM budgets WHERE id = ? AND user_id = ?',
      [budgetId, req.user.id],
      (err, budget) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error verifying budget' });
        }
        if (!budget) {
          return res.status(404).json({ message: 'Budget not found' });
        }

        db.run(
          `DELETE FROM budgets WHERE id = ?`,
          [budgetId],
          (err) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ message: 'Server error deleting budget' });
            }
            res.json({ message: 'Budget deleted' });
          }
        );
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error deleting budget' });
  }
});

module.exports = router;