import React from 'react';
import { Button, Typography, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function SaboresEmaus() {
    const navigate = useNavigate();

    const handleMakeOrder = () => {
        navigate('/fazer-pedido');
    }

    const handleViewOrders = () => {
        navigate('/pedidos-anteriores');
    }

    return (
        <Container 
            maxWidth="xs" 
            style={{
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh'
            }}
        >
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    textAlign: 'center',
                    boxShadow: 3,
                    borderRadius: 2,
                    padding: 3,
                    backgroundColor: '#fff',
                    width: '100%'
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Sabores Emaus
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleMakeOrder} 
                    fullWidth
                    style={{ marginBottom: "15px", padding: "12px" }}
                >
                    Fazer Pedido
                </Button>
                <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={handleViewOrders} 
                    fullWidth
                    style={{ padding: "12px" }}
                >
                    Ver Pedidos Anteriores
                </Button>
            </Box>
        </Container>
    );
}

export default SaboresEmaus;
