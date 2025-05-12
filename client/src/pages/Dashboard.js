import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@mui/material';

function Dashboard() {
  const { logout } = useContext(AuthContext);
  return (
    <div>
      <h1>Dashboard Page</h1>
      <Button onClick={logout} variant="contained">Logout</Button>
    </div>
  );
}

export default Dashboard;