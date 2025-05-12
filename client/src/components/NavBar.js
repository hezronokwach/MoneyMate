import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const navLinks = [
    { text: 'Dashboard', path: '/' },
    { text: 'Expenses', path: '/expenses' },
    { text: 'Budget', path: '/budget' },
    { text: 'Reports', path: '/reports' },
    { text: 'Help', path: '/help' },
  ];

  const drawerContent = (
    <Box
      sx={{ width: 250, p: 2 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.primary.main }}>
        MoneyMate
      </Typography>
      <List>
        {navLinks.map((link) => (
          <ListItem key={link.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={link.path}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiListItemText-root': {
                    color: theme.palette.primary.main,
                    textDecoration: 'underline',
                  },
                },
              }}
            >
              <ListItemText primary={link.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 2 }}>
        {!user ? (
          <>
            <Button
              fullWidth
              variant="contained"
              component={RouterLink}
              to="/login"
              sx={{
                mb: 1,
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              }}
            >
              Login
            </Button>
            <Button
              fullWidth
              variant="contained"
              component={RouterLink}
              to="/register"
              sx={{
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              }}
            >
              Register
            </Button>
          </>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            onClick={logout}
            sx={{
              borderColor: theme.palette.grey[500],
              color: theme.palette.grey[800],
              '&:hover': {
                borderColor: theme.palette.primary.light,
                color: theme.palette.primary.light,
              },
            }}
          >
            Logout
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 'bold' }}
          >
            MoneyMate
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {navLinks.map((link) => (
              <Typography
                key={link.text}
                component={RouterLink}
                to={link.path}
                sx={{
                  mx: 2,
                  color: 'white',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#ffffff',
                    textDecoration: 'underline',
                  },
                }}
              >
                {link.text}
              </Typography>
            ))}
            {!user ? (
              <>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/login"
                  sx={{
                    mx: 1,
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/register"
                  sx={{
                    mx: 1,
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                  }}
                >
                  Register
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                onClick={logout}
                sx={{
                  mx: 1,
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: theme.palette.primary.light,
                    color: theme.palette.primary.light,
                  },
                }}
              >
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
    </>
  );
}

export default NavBar;