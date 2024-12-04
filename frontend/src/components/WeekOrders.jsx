import { Box, Grid, TextField, Typography, Button, Alert, IconButton } from "@mui/material";
import React, { useState } from "react";
import { format, toZonedTime } from 'date-fns-tz'; // Para lidar com fuso horário
import api from "../api";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import DeleteComponent from "./deleteComponent";

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
    editable, isPendingOrder, isCreating = false,
    userPendencyName = null, status = null, pendencyType = null,
    userPendencyId = null
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
    const [deletedOrder, setDeletedOrder] = useState(false);

    const Key = isPendingOrder ? (weekLabel + index) : (
        weekLabel + userPendencyName + status
    )

    const borderColor = status === "approved" ?
        "green" : status === "pending" ?
            "orange" : "#ddd";

    const handleInputChange = (product, value) => {
        setQuantities((prev) => ({
            ...prev,
            [product]: parseInt(value, 10) || 0
        }));
    };

    const handleSave = async () => {
        const formattedDate = format(zonedDate, 'yyyy-MM-dd')

        let updatedOrders;
        let apiEndPointType;

        if (isPendingOrder) {
            updatedOrders = PRODUCTS.map((product) => ({
                product,
                quantity: quantities[product],
                date_of_delivery: formattedDate,
                recipient: userPendencyId,
                status: status
            }))
            apiEndPointType = 'pending-orders';
            console.log(updatedOrders);
        } else {
            updatedOrders = PRODUCTS.map((product) => ({
                product,
                quantity: quantities[product],
            date_of_delivery: formattedDate
            }))
            apiEndPointType = 'orders';
        }

        try {
            await api.post(`api/${apiEndPointType}/update/`, { orders: updatedOrders })

        } catch (error) {
            console.error('Erro ao enviar os pedidos: ', error)
        }

        onSave(updatedOrders, true);
        setIsEditing(false);
    }

    const handleCancel = () => {
        setQuantities(originalQuantities)
        setIsEditing(false)
        if (isCreating) {
            onSave(null, false)
        }

    }

    const onDelete = () => {
        setDeletedOrder(true)
    }


    const renderDefaultButton = () => {

        let buttonText = '';
        let buttonColor = '';

        if (status === 'pending') {
            if (pendencyType === 'recipient') {
                buttonText = 'Editar Solicitação'
                buttonColor = 'orange'
            } else if (pendencyType === 'requester') {
                buttonText = 'Aprovar'
                buttonColor = 'orange'
            }
        }
        else {
            buttonText = 'Editar'
            buttonColor = 'primary'
        }

        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                {/* Botão de editar */}
                <Button
                    sx={{ border: `1px solid ${buttonColor}` }}
                    variant="outlined"
                    color={buttonColor}
                    onClick={() => setIsEditing(true)}
                    disabled={!editable}
                >
                    {buttonText}
                </Button>

                {/* Componente de deletar */}
                <DeleteComponent weekLabel={weekLabel} onDelete={onDelete} />

                {/* Alerta informativo (se não for editável) */}
                {!editable && (
                    <Alert severity="info" sx={{ padding: 0.5 }}>
                        Edição só é permitida até a quarta-feira 12h anterior
                    </Alert>
                )}
            </Box>

        )
    }

    if (deletedOrder) {
        return null
    };

    return (
        <Box
            sx={{
                marginBottom: 3, padding: 2, border: `1px solid ${borderColor}`,
                borderRadius: '8px'
            }}
            key={Key}
        >




            {/* Ícone e texto */}
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                {status === "approved" && (
                    <>
                        <CheckCircleIcon sx={{ color: 'green', marginRight: 1 }} />
                        <Typography variant="subtitle2" color="green">
                            Ordem aprovada
                        </Typography>
                    </>
                )}
                {status === "pending" && (
                    <>
                        <HourglassEmptyIcon sx={{ color: 'orange', marginRight: 1 }} />
                        <Typography variant="subtitle2" color="orange">
                            {pendencyType === 'recipient' ? (
                                `Pendente da Aprovação de ${userPendencyName.split(' ')[0]}`

                            ) : (
                                'Pendente da Minha Aprovação'

                            )}
                        </Typography>
                    </>
                )}
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                {weekLabel} ({format(zonedDate, 'dd/MM/yyyy')})
                {pendencyType === 'receiver' && (
                    <>
                        <br />

                        `Solicitação para ${userPendencyName}`
                    </>
                )}
            </Typography>
            <Grid container spacing={2}>
                {PRODUCTS.map((product) => {
                    const quantity = quantities[product]
                    window.quantity = quantities;
                    if (quantity === 0 && !isEditing) {
                        return null
                    }

                    return (
                        <Grid item xs={12} sm={6} key={product + quantity} sx={{ display: 'flex', alignItems: 'center' }}>
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
                                    {quantity} unidade(s)
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
                        {renderDefaultButton()}
                    </>
                )}
            </Box>


        </Box >
    )
}

export default WeekOrders;