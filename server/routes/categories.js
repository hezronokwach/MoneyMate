const express = require('express');
const router = express.Router();
const { db, seedCategories } = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/categories - Retrieve all categories for the user
router.get('/', auth, (req, res) => {
  try {
    db.all(
      `SELECT * FROM categories WHERE user_id = ?`,
      [req.user.id],
      (err, categories) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error fetching categories' });
        }
        if (categories.length === 0) {
          // Seed categories if none exist
          seedCategories(req.user.id, (seedErr) => {
            if (seedErr) {
              console.error('Error seeding categories:', seedErr);
              return res.status(500).json({ message: 'Server error seeding categories' });
            }
            // Fetch categories again after seeding
            db.all(
              `SELECT * FROM categories WHERE user_id = ?`,
              [req.user.id],
              (err, newCategories) => {
                if (err) {
                  console.error('Database error:', err);
                  return res.status(500).json({ message: 'Server error fetching categories' });
                }
                res.json(newCategories);
              }
            );
          });
        } else {
          res.json(categories);
        }
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
});

module.exports = router;