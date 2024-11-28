import { Box, Grid, TextField, Typography, Button, Alert } from "@mui/material";
import React, { useState } from "react";
import { format, toZonedTime } from 'date-fns-tz'; // Para lidar com fuso horário
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

const WeekOrders = ({
    weekLabel, index, date, orders, onSave,
    editable, isPendingOrder, isCreating = false
}) => {
    const [isEditing, setIsEditing] = useState(isCreating)
    const originalQuantities =
        PRODUCTS.reduce((acc, product) => {
            const existingOrder = orders[product];
            acc[product] = existingOrder ? existingOrder : 0;
            return acc
        }, {})
    const [quantities, setQuantities] = useState(originalQuantities)
    const timeZone = 'America/Sao_Paulo'; // Ajuste o fuso horário para o Brasil
    const zonedDate = toZonedTime(date, timeZone);

    const handleInputChange = (product, value) => {
        setQuantities((prev) => ({
            ...prev,
            [product]: parseInt(value, 10) || 0
        }));
    };

    const handleSave = async () => {
        const formattedDate = format(zonedDate, 'yyyy-MM-dd')

        const updatedOrders = PRODUCTS.map((product) => ({
            product,
            quantity: quantities[product],
            date_of_delivery: formattedDate
        }))

        try {
            console.log(updatedOrders);
            await api.post('/api/orders/update/', { orders: updatedOrders })

        } catch (error) {
            console.error('Erro ao enviar os pedidos: ', error)
        }

        onSave(updatedOrders);
        setIsEditing(false);
    }

    const handleCancel = () => {
        setQuantities(originalQuantities)
        setIsEditing(false)
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
                {weekLabel} ({format(zonedDate, 'dd/MM/yyyy')})
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
            <Box sx={{ marginTop: 2, display: 'flex', gap: 2 }}>
                {isEditing ? (
                    <>
                        <Button variant="contained" color="primary" onClick={handleSave}>
                            Salvar
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={handleCancel}>
                            Cancelar
                        </Button>
                    </>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => setIsEditing(true)}
                                disabled={!editable}
                            >
                                Editar
                            </Button>
                            {!editable && (
                                <Alert severity="info" sx={{ padding: 0.5 }}>
                                    Edição só é permitida até a quarta-feira 12h anterior
                                </Alert>
                            )}
                        </Box>
                    </>
                )}
            </Box>


        </Box >
    )
}

export default WeekOrders;