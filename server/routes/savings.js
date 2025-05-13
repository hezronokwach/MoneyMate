const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/savings-goals - Retrieve all savings goals for the user with progress
router.get('/', auth, (req, res) => {
  try {
    db.all(
      `SELECT sg.id, sg.name, sg.target_amount, sg.deadline, sg.achieved,
              COALESCE((
                SELECT SUM(t.amount)
                FROM transactions t
                WHERE t.user_id = sg.user_id
                  AND t.type = 'savings'
              ), 0) AS current_savings
       FROM savings_goals sg
       WHERE sg.user_id = ?
       ORDER BY sg.achieved ASC, sg.deadline ASC`,
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
      `INSERT INTO savings_goals (user_id, name, target_amount, deadline, achieved) VALUES (?, ?, ?, ?, 0)`,
      [req.user.id, name, target_amount, deadline],
      function (err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error creating savings goal' });
        }
        res.status(201).json({ id: this.lastID, name, target_amount, deadline, achieved: 0 });
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

// POST /api/savings-goals/:id/achieve - Mark a goal as achieved and create expense transaction
router.post('/:id/achieve', auth, (req, res) => {
  const goalId = req.params.id;
  const { expenseCategory, description } = req.body;
  
  if (!expenseCategory) {
    return res.status(400).json({ message: 'Expense category is required' });
  }

  try {
    // Get the goal details and current savings
    db.get(
      `SELECT sg.id, sg.name, sg.target_amount, sg.achieved,
              COALESCE((
                SELECT SUM(t.amount)
                FROM transactions t
                WHERE t.user_id = sg.user_id
                  AND t.type = 'savings'
              ), 0) AS current_savings
       FROM savings_goals sg
       WHERE sg.id = ? AND sg.user_id = ?`,
      [goalId, req.user.id],
      (err, goal) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error fetching savings goal' });
        }
        
        if (!goal) {
          return res.status(404).json({ message: 'Savings goal not found' });
        }
        
        if (goal.achieved) {
          return res.status(400).json({ message: 'This goal has already been achieved' });
        }

        // Check if there's enough savings to achieve the goal
        if (goal.current_savings < goal.target_amount) {
          return res.status(400).json({ 
            message: `Not enough savings to achieve this goal. You need $${(goal.target_amount - goal.current_savings).toFixed(2)} more.`,
            current_savings: goal.current_savings,
            target_amount: goal.target_amount,
            shortfall: goal.target_amount - goal.current_savings
          });
        }

        // Begin transaction
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');

          // 1. Mark the goal as achieved
          db.run(
            `UPDATE savings_goals SET achieved = 1 WHERE id = ?`,
            [goalId],
            (err) => {
              if (err) {
                console.error('Database error marking goal as achieved:', err);
                db.run('ROLLBACK');
                return res.status(500).json({ message: 'Server error marking goal as achieved' });
              }

              const today = new Date().toISOString().split('T')[0];
              const goalDesc = description || `Spent savings for: ${goal.name}`;
              
              // 2. Create an expense transaction for the target amount
              db.run(
                `INSERT INTO transactions (user_id, amount, date, description, type, category)
                 VALUES (?, ?, ?, ?, 'expense', ?)`,
                [req.user.id, goal.target_amount, today, goalDesc, expenseCategory],
                function(err) {
                  if (err) {
                    console.error('Database error creating expense transaction:', err);
                    db.run('ROLLBACK');
                    return res.status(500).json({ message: 'Server error creating expense transaction' });
                  }
                  
                  const expenseTransactionId = this.lastID;
                  
                  // 3. Create a negative savings transaction to reduce the savings balance
                  db.run(
                    `INSERT INTO transactions (user_id, amount, date, description, type, category)
                     VALUES (?, ?, ?, ?, 'savings', 'Savings')`,
                    [req.user.id, -goal.target_amount, today, `Used savings for: ${goal.name}`],
                    function(err) {
                      if (err) {
                        console.error('Database error creating negative savings transaction:', err);
                        db.run('ROLLBACK');
                        return res.status(500).json({ message: 'Server error updating savings balance' });
                      }
                      
                      // Commit the transaction
                      db.run('COMMIT', (err) => {
                        if (err) {
                          console.error('Database error committing transaction:', err);
                          db.run('ROLLBACK');
                          return res.status(500).json({ message: 'Server error completing the operation' });
                        }
                        
                        // Calculate remaining savings after achieving the goal
                        const remainingSavings = goal.current_savings - goal.target_amount;
                        
                        res.json({ 
                          message: 'Goal marked as achieved and expense recorded',
                          goal_id: goalId,
                          expense_amount: goal.target_amount,
                          remaining_savings: remainingSavings,
                          expense_transaction_id: expenseTransactionId,
                          savings_transaction_id: this.lastID
                        });
                      });
                    }
                  );
                }
              );
            }
          );
        });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error achieving savings goal' });
  }
});

module.exports = router;
