Personal Expense Tracker Plan and Design
Project Overview

    Frontend: React.js with React Router and Material-UI.
    Backend: Express.js with SQLite3.
    Authentication: Basic authentication using bcrypt for password hashing and JWT for session management.
    Timeline: Monday to Wednesday evening (~24 hours).
    Pages: Login, Register, Dashboard, Expenses, Budget, Reports, Help.
    Optional Feature: Simplified savings goals with progress tracking.

System Design

    Architecture: Client-server with RESTful API and authentication.
        Frontend: React app with navigation, styling, and authentication context.
        Backend: Express.js server with SQLite3 and JWT-based authentication.
    Communication: HTTP requests with JWT tokens for authenticated routes.
    Authentication: Users must sign up and log in; tokens are stored in localStorage.

Database Design
Core Tables

    users
        id (INTEGER, PRIMARY KEY)
        username (TEXT, UNIQUE)
        password (TEXT, hashed with bcrypt)
    transactions
        id (INTEGER, PRIMARY KEY)
        user_id (INTEGER, FOREIGN KEY to users)
        date (TEXT, ISO format)
        amount (REAL)
        category_id (INTEGER, FOREIGN KEY to categories)
        description (TEXT)
        type (TEXT, 'expense' or 'income')
    categories
        id (INTEGER, PRIMARY KEY)
        user_id (INTEGER, FOREIGN KEY to users)
        name (TEXT)
        type (TEXT, 'expense' or 'income')
    budgets
        id (INTEGER, PRIMARY KEY)
        user_id (INTEGER, FOREIGN KEY to users)
        month (TEXT, e.g., '2023-10')
        category_id (INTEGER, FOREIGN KEY to categories, NULL for overall)
        amount (REAL)

Optional Tables (Savings)

    savings_goals
        id (INTEGER, PRIMARY KEY)
        user_id (INTEGER, FOREIGN KEY to users)
        name (TEXT)
        target_amount (REAL)
        deadline (TEXT, optional)

Notes:

    All tables are linked to users via user_id for data isolation.
    Savings progress is calculated as (total income - total expenses) and compared to target_amount.

API Endpoints
Authentication

    POST /register: Register a new user (username, password).
    POST /login: Log in and receive a JWT token.

Transactions (Authenticated)

    GET /transactions: Get user's transactions.
    POST /transactions: Add a transaction.
    PUT /transactions/:id: Update a transaction.
    DELETE /transactions/:id: Delete a transaction.

Categories (Authenticated)

    GET /categories: Get user's categories.
    POST /categories: Add a category.
    PUT /categories/:id: Update a category.
    DELETE /categories/:id: Delete a category.

Budgets (Authenticated)

    GET /budgets/:month: Get user's budgets for a month.
    POST /budgets: Set/update budgets.
    PUT /budgets/:id: Update a budget.
    DELETE /budgets/:id: Delete a budget.

Optional Savings (Authenticated)

    GET /savings-goals: Get user's savings goals.
    POST /savings-goals: Add a savings goal.
    PUT /savings-goals/:id: Update a savings goal.
    DELETE /savings-goals/:id: Delete a savings goal.

Notes:

    JWT middleware protects authenticated routes.
    user_id ensures data is user-specific.

Frontend Structure
Pages

    Login
        Form for username and password.
        Redirects to Dashboard on success.
    Register
        Form for username and password.
        Redirects to Login after registration.
    Dashboard (Authenticated)
        Expense Breakdown (pie chart)
        Income vs Spending (bar chart)
        Recent Activity (list)
        Savings Goals (progress bar: (total income - total expenses) / target_amount)
    Expenses (Authenticated)
        Recent Expenses (table/list)
        Add New Expense (form)
    Budget (Authenticated)
        Set Monthly Budget (form)
        Category Budget (list)
        Set Savings Goals (form)
    Reports (Authenticated)
        Spending Analysis (charts)
        Monthly Spending (trends)
        Budget vs Actual (comparison)
    Help
        Static instructions/FAQs

Authentication Flow

    React context manages token and user state.
    JWT token stored in localStorage.
    Token included in API request headers.

Tools

    Frontend: React Router, Material-UI, Recharts (for charts).
    Backend: Express.js, SQLite3, bcrypt, JWT.

Development Plan
Monday (Backend with Authentication)

    Morning: Set up Express.js, SQLite3, and database schema; implement /register and /login.
    Afternoon: Add JWT middleware; implement transactions and categories endpoints with user filtering.

Tuesday (Frontend Core with Authentication)

    Morning: Set up React app with React Router and Material-UI; create Login and Register pages; implement authentication context.
    Afternoon: Develop Expenses page (list and add); develop Budget page (budgets and savings goals).

Wednesday (Finalize)

    Morning: Implement Dashboard with charts and savings progress; develop Reports page with basic charts.
    Afternoon: Add Help page; test authentication and data isolation.