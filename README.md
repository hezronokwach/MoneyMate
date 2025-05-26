# MoneyMate

MoneyMate is a personal expense tracker built with React, Express.js, and SQLite3. It features expense tracking, budgeting, savings goals, and basic user authentication. Designed as a second-year project, it includes a dashboard, reports, and more to help users manage their finances effectively.

## Tech Stack
- **Frontend**: React, React Router, Material-UI, Recharts
- **Backend**: Express.js, SQLite3
- **Authentication**: bcrypt, JWT

## Features
- Dashboard with financial overview
- Expense and income tracking
- Budget management
- Savings goals
- Financial reports and analytics
- User authentication

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/MoneyMate.git
   cd MoneyMate
   ```

2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

3. Create a `.env` file in the server directory with the following content:
   ```
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   The server will run on http://localhost:5000

### Frontend Setup
1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```
   The application will open in your browser at http://localhost:3000

## Usage
1. Register a new account or log in with existing credentials
2. Use the dashboard to view your financial overview
3. Add transactions through the Expenses page
4. Set up budgets and savings goals
5. View detailed reports of your financial activity

## Deployment
- The frontend is deployed on Vercel: https://money-mate-ruby.vercel.app
- The backend can be deployed on any Node.js hosting service

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
