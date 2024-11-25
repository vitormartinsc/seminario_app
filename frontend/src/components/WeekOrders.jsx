import { Box, Grid, TextField, Typography, Button } from "@mui/material";
import React, { useState } from "react";
import { format } from 'date-fns'; // Usando date-fns para formatar a data
import api from "../api";

const PRODUCTS = [
    'Tradicional',
    'Tradicional Sem Açúcar',
    'Cenoura com Chocolate',
    'Farofa',
    'Antepasto',
    'Brioche',
    'Browne'
];

const WeekOrders = ({ weekLabel, index, date, orders, onSave }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [quantities, setQuantities] = useState(() =>
        PRODUCTS.reduce((acc, product) => {
            window.orders = orders
            const existingOrder = orders[product];
            acc[product] = existingOrder ? existingOrder : 0;
            return acc
        }, {})
    )

    const handleInputChange = (product, value) => {
        setQuantities((prev) => ({
            ...prev,
            [product]: parseInt(value, 10) || 0
        }));
    };

    const handleSave = async () => {
        const formattedDate = format(date, 'yyyy-MM-dd')

        const updatedOrders = PRODUCTS.map((product) => ({
            product,
            quantity: quantities[product],
            date_of_delivery: formattedDate
        })).filter((order) => order.quantity > 0);

        try {
            console.log(updatedOrders);
            await api.post('/api/orders/update/', { orders: updatedOrders })

        } catch (error) {
            console.error('Erro ao enviar os pedidos: ', error) 
        }   
    
        onSave(updatedOrders);
        setIsEditing(false);
    }
    
    return (
        <Box
            sx={{
                marginBottom: 3, padding: 2, border: '1px solid #ddd',
                borderRadius: '8px'
            }}
            key={weekLabel + index}
        >
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                {weekLabel} ({format(date, 'dd/MM/yyyy')})
            </Typography>
            <Grid container spacing={2}>
                {PRODUCTS.map((product) => {
                    const quantity = quantities[product]
                    window.quantity = quantities;
                    if (quantity === 0 && !isEditing) {
                        return null
                    }

                    return (
                        <Grid item xs={12} sm={6} key={product} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flexShrink: 0 }}>
                                {product}
                            </Typography>

                            {isEditing ? (
                                <TextField
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => handleInputChange(product, e.target.value)}
                                    inputProps={{ min: 0 }}
                                    sx={{
                                        width: '60px', // Ajusta a largura do input
                                        height: '30px', // Ajusta a altura do input
                                        marginLeft: 2,
                                        '& .MuiInputBase-root': {
                                            height: '100%', // Garante que a altura do input ocupe todo o espaço
                                        }
                                    }}
                                />
                            ) : (
                                <Typography sx={{ marginLeft: 2 }}>
                                    Quantidade: {quantity} unidade(s)
                                </Typography>
                            )}
                        </Grid>
                    )

                })}
            </Grid>
            <Box sx={{ marginTop: 2 }}>
                {isEditing ? (
                    <Button variant="contained" color="primary" onClick={handleSave}>
                        Salvar
                    </Button>
                ) : (
                    <Button variant="outlined" color="primary" onClick={() => setIsEditing(true)}>
                        Editar
                    </Button>
                )}
            </Box>

        </Box >
    )
}

export default WeekOrders;