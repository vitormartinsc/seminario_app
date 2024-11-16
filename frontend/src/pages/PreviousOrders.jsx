import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import api from "../api";

function PreviousOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get("/api/orders/previous/");
                const groupedOrders = groupByBatchId(res.data);
                setOrders(groupedOrders);
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

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Seus Pedidos Anteriores
            </Typography>
            <Grid container spacing={2}>
                {Object.entries(orders).map(([batchId, batchOrders]) => (
                    <Grid item xs={12} sm={6} md={4} key={batchId}>
                        <Card variant="outlined" sx={{ height: "100%" }}>
                            <CardContent>
                                <Typography variant="h6" color="primary">
                                    Pedido Batch: {batchId}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    {`Data: ${new Date(batchOrders[0].date).toLocaleDateString()}`}
                                </Typography>
                                <Box>
                                    {batchOrders.map((order) => (
                                        <Typography key={order.id} variant="body1">
                                            {`${order.product} - ${order.quantity} unidade(s)`}
                                        </Typography>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default PreviousOrders;
