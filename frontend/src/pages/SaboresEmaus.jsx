import React, { useState, useEffect } from 'react';
import api from "../api";
import { Box, Button, Typography, Grid, Tabs, Tab } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'
import WeekOrders from '../components/WeekOrders';
import '../styles/ListItem.css';
import NewWeekOrder from '../components/newWeekOrder';
import OpenOrders from '../components/openOrders';
import PendingOrders from '../components/PendingOrders';


const SaboresEmaus = () => {
    const [orders, setOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([])
    const [loading, setLoading] = useState(true);
    const [creatingNewWeekOrder, setCreatingNewWeekOrder] = useState(false)
    const [activeTab, setActiveTab] = useState('open-orders')
    const [userNameList, setUserNameList] = useState([]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

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

    // Função para buscar os pedidos pendentes
    const fetchPendingOrders = async () => {
        setLoading(true);

        try {
            const response = await api.get('/api/orders/pending/'); // Endpoint da API
            setPendingOrders(response.data);
            //window.orders = response.data
            setLoading(false);
        } catch (error) {
            console.error("Erro ao buscar pedidos", error);
            setLoading(false);
        }
    };

    const fetchUserNameList = async () => {

        try {
            const response = await api.get('/api/users/')
            setUserNameList(response.data);
            window.users = response.data

        } catch (error) {
            console.error('Erro ao buscar usuários')
        }

    }

    // Chama a função para buscar os pedidos quando o componente for montado
    useEffect(() => {
        fetchEditableOrders();
        fetchPendingOrders();
        fetchUserNameList();
    }, []);

    // Agrupar os pedidos por week_label e incluir a data da sexta-feira
    const groupOrdersByWeek = () => {
        return orders.reduce((acc, order) => {
            const { week_label, date_of_delivery, product, quantity, editable } = order;
            const date = new Date(date_of_delivery + 'T00:00:00');
            // Se não existir o week_label, cria uma nova entrada no objeto
            if (!acc[week_label]) {
                acc[week_label] = { date: date, orders: {}, editable: editable };
            }

            // Adiciona diretamente o produto ao grupo
            acc[week_label].orders[product] = quantity
            //window.orders = acc;
            return acc;
        }, {});
    };

    if (loading) {
        return <Typography variant="h6">Carregando pedidos...</Typography>;
    }

    const ordersGroupedByWeek = groupOrdersByWeek()

    return (
        <Box sx={{ padding: 3 }}>
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                sx={{ marginBottom: 3 }}
            >
                <Tab label="Pedidos Agendados" value="open-orders" />
                <Tab label="Solicitações" value="pending-orders" />
                <Tab label="Histórico" value="history-orders" />
            </Tabs>

            {/* Conteúdo das Abas */}
            {activeTab === "open-orders" && (
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Pedidos Agendados
                    </Typography>

                    {creatingNewWeekOrder ? (
                        <NewWeekOrder
                            onClose={(reload) => {
                                if (reload) {
                                    window.location.reload();
                                }
                                setCreatingNewWeekOrder(false);
                            }}
                            userNameList={userNameList}
                        />
                    ) : (
                        <Grid container spacing={2} justifyContent="left" sx={{ mb: 2 }}>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setCreatingNewWeekOrder(true)} // Botão Novo +
                                >
                                    Novo +
                                </Button>
                            </Grid>
                        </Grid>
                    )}

                    {/* Componentes de Pedidos Agendados */}
                    <OpenOrders
                        ordersGroupedByWeek={ordersGroupedByWeek}
                        fetchEditableOrders={fetchEditableOrders}
                    />
                </Box>
            )}

            {activeTab === "pending-orders" && (
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Solicitações
                    </Typography>
                    {/* Conteúdo da aba Solicitações */}
                    <PendingOrders 
                    pendingOrders={pendingOrders}
                    userNameList={userNameList}
                    /> 
                </Box>
            )}

            {activeTab === "history-orders" && (
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Histórico
                    </Typography>
                    {/* Conteúdo da aba Histórico */}
                    {/* <HistoryOrders /> */}
                </Box>
            )}
        </Box>
    );

};

export default SaboresEmaus;
