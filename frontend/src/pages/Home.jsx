import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

function Home() {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="100vh" 
      bgcolor="#f0f0f5"
    >
      <Typography variant="h4" gutterBottom>
        Bem-vindo!
      </Typography>
      
      <Box 
        component="nav"
        display="flex" 
        flexDirection="column" 
        alignItems="center"
        gap={2}
        mt={3}
      >
        <Link to="#" style={{ textDecoration: 'none', color: '#3f51b5', fontSize: '18px' }}>
          Sabores Emaus
        </Link>
        <Link to="#" style={{ textDecoration: 'none', color: '#3f51b5', fontSize: '18px' }}>
          Lavanderia
        </Link>
        <Link to="#" style={{ textDecoration: 'none', color: '#3f51b5', fontSize: '18px' }}>
          Agenda da Semana
        </Link>
      </Box>
    </Box>
  );
}

export default Home;
