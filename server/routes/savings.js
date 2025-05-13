const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/savings-goals - Retrieve all savings goals for the user with progress
router.get('/', auth, (req, res) => {
  try {
    db.all(
      `SELECT sg.id, sg.name, sg.target_amount, sg.deadline,
              COALESCE((
                SELECT SUM(t.amount)
                FROM transactions t
                WHERE t.user_id = sg.user_id
                  AND t.type = 'savings'
              ), 0) AS current_savings
       FROM savings_goals sg
       WHERE sg.user_id = ?`,
      [req.user.id],
      (err, goals) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error fetching savings goals' });
        }
        res.json(goals);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error fetching savings goals' });
  }
});

// POST /api/savings-goals - Create a new savings goal
router.post('/', auth, (req, res) => {
  const { name, target_amount, deadline } = req.body;

  if (!name || !target_amount || target_amount <= 0 || !deadline) {
    return res.status(400).json({ message: 'Name, positive target amount, and deadline are required' });
  }

  try {
    db.run(
      `INSERT INTO savings_goals (user_id, name, target_amount, deadline) VALUES (?, ?, ?, ?)`,
      [req.user.id, name, target_amount, deadline],
      function (err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error creating savings goal' });
        }
        res.status(201).json({ id: this.lastID, name, target_amount, deadline });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error creating savings goal' });
  }
});

// PUT /api/savings-goals/:id - Update a savings goal
router.put('/:id', auth, (req, res) => {
  const { name, target_amount, deadline } = req.body;
  const goalId = req.params.id;

  if (!name || !target_amount || target_amount <= 0 || !deadline) {
    return res.status(400).json({ message: 'Name, positive target amount, and deadline are required' });
  }

  try {
    db.get(
      'SELECT id FROM savings_goals WHERE id = ? AND user_id = ?',
      [goalId, req.user.id],
      (err, goal) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error verifying savings goal' });
        }
        if (!goal) {
          return res.status(404).json({ message: 'Savings goal not found' });
        }

        db.run(
          `UPDATE savings_goals SET name = ?, target_amount = ?, deadline = ? WHERE id = ?`,
          [name, target_amount, deadline, goalId],
          (err) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ message: 'Server error updating savings goal' });
            }
            res.json({ id: goalId, name, target_amount, deadline });
          }
        );
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error updating savings goal' });
  }
});

// DELETE /api/savings-goals/:id - Delete a savings goal
router.delete('/:id', auth, (req, res) => {
  const goalId = req.params.id;

  try {
    db.get(
      'SELECT id FROM savings_goals WHERE id = ? AND user_id = ?',
      [goalId, req.user.id],
      (err, goal) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error verifying savings goal' });
        }
        if (!goal) {
          return res.status(404).json({ message: 'Savings goal not found' });
        }

        db.run(
          `DELETE FROM savings_goals WHERE id = ?`,
          [goalId],
          (err) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ message: 'Server error deleting savings goal' });
            }
            res.json({ message: 'Savings goal deleted' });
          }
        );
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error deleting savings goal' });
  }
});

module.exports = router;
