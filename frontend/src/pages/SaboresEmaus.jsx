import React, { useState, useEffect } from 'react';
import api from "../api";
import { Box, Button, Typography, Paper } from '@mui/material';
import { format } from 'date-fns'; // Usando date-fns para formatar a data

const SaboresEmaus = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Função para buscar os pedidos
    const fetchOrders = async () => {
        try {
            const response = await api.get('/api/orders/'); // Endpoint da API
            setOrders(response.data);
            window.orders = response.data
            setLoading(false);
        } catch (error) {
            console.error("Erro ao buscar pedidos", error);
            setLoading(false);
        }
    };

    // Chama a função para buscar os pedidos quando o componente for montado
    useEffect(() => {
        fetchOrders();
    }, []);

    // Agrupar os pedidos por week_label e incluir a data da sexta-feira
    const groupOrdersByWeek = () => {
        return orders.reduce((acc, order) => {
            const { week_label, date_of_delivery } = order;
            const date = new Date(date_of_delivery);
            const formattedDate = format(date, 'dd/MM/yyyy'); // Formatar a data

            // Se não existir o week_label, cria uma nova entrada no objeto
            if (!acc[week_label]) {
                acc[week_label] = { date: formattedDate, orders: [] };
            }

            acc[week_label].orders.push(order);
            return acc;
        }, {});
    };

    // Função para criar o botão de Novo +
    const handleNewOrder = () => {
        console.log("Abrir modal ou página para criar novo pedido");
        // Redirecionar para a página de novo pedido ou abrir um modal
    };

    if (loading) {
        return <Typography variant="h6">Carregando pedidos...</Typography>;
    }

    const ordersGroupedByWeek = groupOrdersByWeek();

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Sabores Emaús
            </Typography>

            {/* Botão Novo + */}
            <Button
                variant="contained"
                color="primary"
                onClick={handleNewOrder}
                sx={{ marginBottom: 3 }}
            >
                Novo +
            </Button>

            {/* Exibindo os pedidos agrupados por week_label */}
            {Object.keys(ordersGroupedByWeek).map((weekLabel) => (
                <Box key={weekLabel} sx={{ marginBottom: 3 }}>
                    <Paper sx={{ padding: 2 }}>
                        {/* Título com week_label e data */}
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {weekLabel} ({ordersGroupedByWeek[weekLabel].date})
                        </Typography>
                        {/* Listando os pedidos dessa semana */}
                        {ordersGroupedByWeek[weekLabel].orders.map((order) => (
                            <Box key={order.id} sx={{ padding: 1 }}>
                                <Typography>
                                    Produto: {order.product} - Quantidade: {order.quantity}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Data de entrega: {ordersGroupedByWeek[weekLabel].date}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Box>
            ))}
        </Box>
    );
};

export default SaboresEmaus;
