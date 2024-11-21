import React from 'react';
import { Button, Typography, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function SaboresEmaus() {
    const navigate = useNavigate();

    const handleMakeOrder = () => {
        navigate('/fazer-pedido');
    }

    const handleViewCompletedOrders = () => {
        navigate('/historico-pedidos');
    }

    const handleEditOpenOrders = () => {
        
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
                    width: '100%',
                    gap: 2,
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Sabores Emaus
                </Typography>

                {/* Botão para Agendar Pedido */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleMakeOrder}
                    fullWidth
                    style={{ marginBottom: "15px", padding: "12px" }}
                >
                    Agendar Pedido
                </Button>

                {/* Botão para Editar/Visualizar Pedidos Abertos */}
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleEditOpenOrders}
                    fullWidth
                    style={{ marginBottom: "15px", padding: "12px" }}
                >
                    Pedidos Pendentes
                </Button>

                {/* Botão para Visualizar Histórico de Pedidos Finalizados */}
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleViewCompletedOrders}
                    fullWidth
                    style={{ padding: "12px" }}
                >
                    Histórico de Pedidos
                </Button>
            </Box>
        </Container>
    );
}

export default SaboresEmaus;
