import { Box, Grid, TextField, Typography } from "@mui/material";
import React, { useState } from "react";

const PRODUCTS = [
    'Tradicional',
    'Tradicional Sem Açúcar',
    'Cenoura com Chocolate',
    'Farofa',
    'Antepasto',
    'Brioche',
    'Browne'
];

const WeekOrders = ({ weekLabel, date, orders, onSave }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [quantities, setQuantities] = useState(() =>
        PRODUCTS.reduce((acc, product) => {
            const existingOrder = orders.find((o) => o.product === product);
            acc[product] = existingOrder ? existingOrder.quantity : 0;
            return acc
        }, {})
    )

    const handleInputChange = (product, value) => {
        setQuantities((prev) => ({
            ...prev,
            [product]: parseInt(value, 10) || 0
        }));
    };

    const handleSave = () => {
        setIsEditing(false);
        const updatedOrders = PRODUCTS.map((product) => ({
            product,
            quantity: quantities[product]
        })).filter((order) => order.quantity > 0);

        onSave(updatedOrders);
    }

    return (
        <Box sx={{ marginBottom: 3, padding: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                {weekLabel} ({date})
            </Typography>
            <Grid container spacing={2}>
                {PRODUCTS.map((product) => {
                    const quantity = quantities[product]
                    if (quantity === 0 && !isEditing) {
                        return null
                    }

                    return (
                        <Grid itex xs={12} key={product}>
                            <Typography variant="subtitle" sx={{ fontWeight: 'bold' }}>
                                {product}
                            </Typography>
                            {isEditing ? (
                                <TextField
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => handleInputChange(product, e.target.value)}
                                    slotProps={{
                                        input: { min: 0 }
                                    }}
                                    sx={{ width: '100px' }}
                                />

                            ) : (
                                <Typography>
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