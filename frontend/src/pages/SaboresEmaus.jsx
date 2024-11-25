import React, { useState, useEffect } from 'react';
import api from "../api";
import { Box, Button, Typography, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'
import WeekOrders from '../components/WeekOrders';
import '../styles/ListItem.css';

const SaboresEmaus = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Função para buscar os pedidos
    const fetchEditableOrders = async () => {
        setLoading(true);
        
        try {
            const response = await api.get('/api/orders/editable/'); // Endpoint da API
            setOrders(response.data);
            //window.orders = response.data
            setLoading(false);
        } catch (error) {
            console.error("Erro ao buscar pedidos", error);
            setLoading(false);
        }
    };

    // Chama a função para buscar os pedidos quando o componente for montado
    useEffect(() => {
        fetchEditableOrders();
    }, []);

    // Agrupar os pedidos por week_label e incluir a data da sexta-feira
    const groupOrdersByWeek = () => {
        return orders.reduce((acc, order) => {
            const { week_label, date_of_delivery, product, quantity } = order;
            const date = new Date(date_of_delivery + 'T00:00:00');
            // Se não existir o week_label, cria uma nova entrada no objeto
            if (!acc[week_label]) {
                acc[week_label] = { date: date, orders: {} };
            }

            // Adiciona diretamente o produto ao grupo
            acc[week_label].orders[product] = quantity
            //window.orders = acc;
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
        <Box sx={{ padding: 3 }}    >
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
            {Object.keys(ordersGroupedByWeek).map((weekLabel, index) => (
                <WeekOrders
                    weekLabel={weekLabel}
                    index={index}
                    date={ordersGroupedByWeek[weekLabel].date}
                    orders={ordersGroupedByWeek[weekLabel].orders}
                    onSave={(updatedOrders) => {
                        fetchEditableOrders();
                        console.log('salvar para backend', updatedOrders);
                    }}

                />


            ))}
        </Box>
    )

};

export default SaboresEmaus;
