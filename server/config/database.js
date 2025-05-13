const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(
  process.env.DATABASE_PATH || path.join(__dirname, 'moneymate.db'),
  (err) => {
    if (err) {
      console.error('Database connection error:', err);
      throw err;
    }
    console.log('Connected to moneymate.db');
  }
);

// Seed default categories for a user
const seedCategories = (userId, callback) => {
  const defaultCategories = [
    { name: 'Food', type: 'expense' },
    { name: 'Transport', type: 'expense' },
    { name: 'Clothing', type: 'expense' },
    { name: 'Upkeep', type: 'income' },
    { name: 'Side-Hustle', type: 'income' },
    { name: 'Other', type: 'expense' },
    { name: 'Luxury', type: 'expense' },
    { name: 'Electronics', type: 'expense' },
    { name: 'Education', type: 'expense' },
    { name: 'Savings', type: 'savings' },
  ];

  // Check if user already has categories
  db.get(
    'SELECT COUNT(*) as count FROM categories WHERE user_id = ?',
    [userId],
    (err, row) => {
      if (err) {
        console.error('Error checking categories for user:', err);
        callback(err);
        return;
      }
      if (row.count > 0) {
        console.log(`User ${userId} already has categories, skipping seeding`);
        callback(null);
        return;
      }

      // Seed categories
      let errors = [];
      let completed = 0;
      defaultCategories.forEach((cat) => {
        db.run(
          `INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)`,
          [userId, cat.name, cat.type],
          (err) => {
            if (err) {
              console.error(`Error seeding category ${cat.name} for user ${userId}:`, err);
              errors.push(err);
            } else {
              console.log(`Seeded category ${cat.name} for user ${userId}`);
            }
            completed++;
            if (completed === defaultCategories.length) {
              callback(errors.length > 0 ? errors : null);
            }
          }
        );
      });
    }
  );
};

db.serialize(() => {
  // Create users table
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`,
    (err) => {
      if (err) console.error('Error creating users table:', err);
      else console.log('Users table created or exists');
    }
  );

  // Create transactions table
  db.run(
    `CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    (err) => {
      if (err) console.error('Error creating transactions table:', err);
      else console.log('Transactions table created or exists');
    }
  );

  // Create categories table
  db.run(
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      type TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`,
    (err) => {
      if (err) console.error('Error creating categories table:', err);
      else console.log('Categories table created or exists');
    }
  );

  // Create budgets table
  db.run(
    `CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      month TEXT,
      category_id INTEGER,
      amount REAL,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )`,
    (err) => {
      if (err) console.error('Error creating budgets table:', err);
      else console.log('Budgets table created or exists');
    }
  );

  // Create savings_goals table
  db.run(
    `CREATE TABLE IF NOT EXISTS savings_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      target_amount REAL,
      deadline TEXT,
      achieved INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`,
    (err) => {
      if (err) console.error('Error creating savings_goals table:', err);
      else console.log('Savings_goals table created or exists');
    }
  );
});

module.exports = { db, seedCategories };
