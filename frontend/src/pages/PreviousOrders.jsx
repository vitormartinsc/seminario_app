import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CircularProgress, TextField, MenuItem, Button } from "@mui/material";
import api from "../api";


function PreviousOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState("");
    const [filterType, setFilterType] = useState("date");
    const [filteredOrders, setFilteredOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get("/api/orders/previous/");
                const groupedOrders = groupByBatchId(res.data);
                setOrders(groupedOrders);
                setFilteredOrders(groupedOrders);
                window.orders = groupedOrders;
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const groupByBatchId = (orders) => {
        return orders.reduce((acc, order) => {
            const { batch_id } = order;
            if (!acc[batch_id]) {
                acc[batch_id] = [];
            }
            acc[batch_id].push(order);
            return acc;
        }, {});
    };

    const handleFilter = () => {
        // Se não houver uma data de filtro, exibe todos os pedidos
        if (!filterDate) {
            setFilteredOrders(orders);
            return;
        }
    
        // Converte filterDate em um objeto Date para comparações
        const filterDateObj = new Date(filterDate);
        window.filterDate = filterDate;
    
        const filtered = {};
    
        // Itera sobre os pedidos
        Object.entries(orders).forEach(([batchId, batchOrders]) => {
            // Converte a data do primeiro pedido no lote para um objeto Date
            const batchDateObj = new Date(batchOrders[0][filterType]);
    
            // Compara apenas a data (ano, mês, dia)
            if (batchDateObj.toISOString().substring(0, 10) === filterDate) {
                filtered[batchId] = batchOrders;
            }
        });
        
        // Atualiza o estado com os pedidos filtrados
        setFilteredOrders(filtered);
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Seus Pedidos Anteriores
            </Typography>

            {/* Filtros */}
            <Box sx={{ display: "flex", gap: 2, marginBottom: 3, alignItems: "center" }}>
                <TextField
                    select
                    label="Filtrar por"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    sx={{ width: "200px" }}
                >
                    <MenuItem value="date">Data do Pedido</MenuItem>
                    <MenuItem value="date_of_delivery">Data de Entrega</MenuItem>
                </TextField>
                <TextField
                    type="date"
                    label="Selecionar Data"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    sx={{ width: "200px" }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <Button variant="contained" color="primary" onClick={handleFilter}>
                    Filtrar
                </Button>
            </Box>

            {/* Lista de Pedidos */}
            <Grid container spacing={3} direction="column">
                {Object.keys(filteredOrders).length === 0 ? (
                    <Typography variant="body1" color="textSecondary">
                        Nenhum pedido encontrado.
                    </Typography>
                ) : (
                    Object.entries(filteredOrders).map(([batchId, batchOrders]) => (
                        <Grid item xs={12} key={batchId}>
                            <Card
                                variant="outlined"
                                sx={{
                                    padding: 2,
                                    boxShadow: 2,
                                    borderRadius: 2,
                                    backgroundColor: "#f9f9f9"
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ marginBottom: 2 }}>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            sx={{ marginBottom: 0.5 }}
                                        >
                                            <strong>Pedido em:</strong> {new Date(batchOrders[0].date.substring(0, 10) + 'T00:00:00').toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            <strong>Entrega em:</strong> {new Date(batchOrders[0].date_of_delivery + 'T00:00:00').toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Box component="ul" sx={{ padding: 0, listStyle: "none" }}>
                                        {batchOrders.map((order) => (
                                            <li key={order.id}>
                                                <Typography variant="body1">
                                                    {`${order.product} - ${order.quantity} unidade(s)`}
                                                </Typography>
                                            </li>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
}

export default PreviousOrders;
