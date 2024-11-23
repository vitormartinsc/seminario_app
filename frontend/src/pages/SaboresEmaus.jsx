import React, { useState, useEffect } from 'react';
import api from "../api";
import { Box, Button, Typography, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'
import { format } from 'date-fns'; // Usando date-fns para formatar a data
import '../styles/ListItem.css'

const SaboresEmaus = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Função para buscar os pedidos
    const fetchOrders = async () => {
        try {
            const response = await api.get('/api/orders/editable/'); // Endpoint da API
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
            const { week_label, date_of_delivery, product, quantity } = order;
            const date = new Date(date_of_delivery + 'T00:00:00');
            const formattedDate = format(date, 'dd/MM/yyyy'); // Formatar a data

            // Se não existir o week_label, cria uma nova entrada no objeto
            if (!acc[week_label]) {
                acc[week_label] = { date: formattedDate, orders: [] };
            }

            // Adiciona diretamente o produto ao grupo
            acc[week_label].orders.push({ product, quantity });

            return acc;
        }, {});
    };

    // Função para criar o botão de Novo +
    const handleNewOrder = () => {
        console.log("Abrir modal ou página para criar novo pedido");
        // Redirecionar para a página de novo pedido ou abrir um modal
    };

    const handleEditOrder = () => {

    }

    const handleDeleteOrder = () => {

    }

    if (loading) {
        return <Typography variant="h6">Carregando pedidos...</Typography>;
    }

    const ordersGroupedByWeek = groupOrdersByWeek();

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Pedidos Agendados
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
                    <Paper sx={{ padding: 2, backgroundColor: '#f9f9f9' }}>
                        {/* Título com week_label e data */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {weekLabel} ({ordersGroupedByWeek[weekLabel].date})
                            </Typography>

                            {/* Botões de Editar e Apagar */}
                            <Box>
                                <Button
                                    variant="text"
                                    color="primary"
                                    startIcon={<EditIcon />}
                                    onClick={() => handleEditOrder(weekLabel)}
                                    sx={{ marginRight: 1 }}
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant="text"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleDeleteOrder(weekLabel)}
                                >
                                    Apagar
                                </Button>
                            </Box>
                        </Box>

                        {/* Listando os pedidos dessa semana */}
                        <Box sx={{ paddingLeft: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                                Pedidos:
                            </Typography>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                {Object.values(ordersGroupedByWeek[weekLabel].orders).map((order) => (
                                    <li key={`${order.product}-${weekLabel}`}>
                                        {order.product}: {order.quantity} unidade(s)
                                    </li>
                                ))}
                            </ul>
                        </Box>
                    </Paper>
                </Box>
            ))}
        </Box>
    )

};

export default SaboresEmaus;
