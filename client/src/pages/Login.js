import React, { useState, useContext } from 'react';
import { TextField, Button, Typography, Box, Alert, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Styled components for card titles
const SectionTitle = styled(Box)(({ theme, bgcolor = '#1976d2' }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  backgroundColor: bgcolor,
  marginBottom: theme.spacing(2),
}));

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1400, mx: 'auto', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: '#1976d2',
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 4,
        }}
      >
        Login to MoneyMate
      </Typography>
      <Paper
        sx={{
          maxWidth: 400,
          mx: 'auto',
          bgcolor: '#ffffff',
          borderRadius: 2,
          boxShadow: 2,
          overflow: 'hidden',
        }}
      >
        <SectionTitle bgcolor="#1976d2">
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Sign In
          </Typography>
        </SectionTitle>
        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              variant="outlined"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#0d47a1' },
                borderRadius: 1,
                py: 1.5,
              }}
              size="large"
            >
              Login
            </Button>
            <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Don’t have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontWeight: 'medium',
                }}
              >
                Register
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;