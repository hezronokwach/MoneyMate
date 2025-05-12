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
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {navLinks.map((link) => (
          <ListItem button key={link.text} component={RouterLink} to={link.path}>
            <ListItemText primary={link.text} />
          </ListItem>
        ))}
        {!user ? (
          <>
            <ListItem button component={RouterLink} to="/login">
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={RouterLink} to="/register">
              <ListItemText primary="Register" />
            </ListItem>
          </>
        ) : (
          <ListItem button onClick={logout}>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MoneyMate
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navLinks.map((link) => (
              <Button
                key={link.text}
                color="inherit"
                component={RouterLink}
                to={link.path}
                sx={{ mx: 1 }}
              >
                {link.text}
              </Button>
            ))}
            {!user ? (
              <>
                <Button color="inherit" component={RouterLink} to="/login" sx={{ mx: 1 }}>
                  Login
                </Button>
                <Button color="inherit" component={RouterLink} to="/register" sx={{ mx: 1 }}>
                  Register
                </Button>
              </>
            ) : (
              <Button color="inherit" onClick={logout} sx={{ mx: 1 }}>
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