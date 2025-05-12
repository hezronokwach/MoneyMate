import React from 'react';
import { Box, Typography } from '@mui/material';

function Footer() {
  return (
    <Box
      sx={{
        py: 2,
        textAlign: 'center',
        backgroundColor: 'background.paper',
        mt: 'auto',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        MoneyMate © {new Date().getFullYear()}
      </Typography>
    </Box>
  );
}

export default Footer;