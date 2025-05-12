const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(process.env.DATABASE_PATH || path.join(__dirname, '../../moneymate.db'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      date TEXT,
      amount REAL,
      category_id INTEGER,
      description TEXT,
      type TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      name TEXT,
      type TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      month TEXT,
      category_id INTEGER,
      amount REAL,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS savings_goals (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      name TEXT,
      target_amount REAL,
      deadline TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
});

module.exports = db;