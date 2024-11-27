import React, { useState, useEffect, useMemo } from 'react';
import { format, toZonedTime } from 'date-fns-tz'; // Para lidar com fuso horário
import { Box, Select, MenuItem, Button, Typography } from '@mui/material';
import api from "../api";
import WeekOrders from './WeekOrders';

const NewWeekOrder = ({onClose}) => {
    const [availableWeeks, setAvailableWeeks] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [hasCreatedOrder, setHasCreatedOrder] = useState(false);
    const [loading, setLoading] = useState(false);

    const timeZone = 'America/Sao_Paulo'; // Ajuste o fuso horário para o Brasil

    useEffect(() => {
        fetchAvailableWeeks();
    }, []);

    const fetchAvailableWeeks = async () => {
        try {
            const response = await api.get('/api/orders/available-dates/');
            setAvailableWeeks(response.data);
        } catch (error) {
            console.error('Erro ao buscar semanas disponíveis:', error);
        }
    };

    const handleWeekChange = (value) => {
        const week = JSON.parse(value);
        setSelectedWeek(week);
    };

    const handleCreateOrder = async () => {
        if (!selectedWeek) {
            alert('Selecione uma semana!');
            return;
        }
        setHasCreatedOrder(true);
    };

    const fetchEditableOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/orders/editable/');
            // Lógica para lidar com os pedidos retornados
        } catch (error) {
            console.error("Erro ao buscar pedidos", error);
        } finally {
            setLoading(false);
        }
    };

    // Formata as semanas disponíveis no fuso horário correto
    const formattedWeeks = useMemo(() => {
        return availableWeeks.map((week) => {
            const zonedDate = toZonedTime(week.date, timeZone);
            return {
                ...week,
                formattedDate: format(zonedDate, 'dd/MM/yyyy'),
            };
        });
    }, [availableWeeks]);

    return (
        <Box>
            {!hasCreatedOrder ? (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Criar Novo Pedido
                    </Typography>
                    <Select
                        value={selectedWeek ? JSON.stringify(selectedWeek) : ''}
                        onChange={(e) => handleWeekChange(e.target.value)}
                        fullWidth
                        displayEmpty
                        sx={{ marginBottom: 2 }}
                    >
                        <MenuItem value="" disabled>
                            Selecione uma semana
                        </MenuItem>
                        {formattedWeeks.map((week) => (
                            <MenuItem
                                key={week.week_label}
                                value={JSON.stringify({
                                    week_label: week.week_label,
                                    date: week.date,
                                })}
                            >
                                {week.week_label} ({week.formattedDate})
                            </MenuItem>
                        ))}
                    </Select>
                    <Button
                        variant="contained"
                        onClick={handleCreateOrder}
                        sx={{ marginBottom: 3 }}
                    >
                        Criar Pedido
                    </Button>
                </Box>
            ) : (
                <WeekOrders
                    weekLabel={selectedWeek.week_label}
                    date={selectedWeek.date}
                    orders={{}}
                    onSave={(newOrder) => {
                        console.log('Salvar para backend:', newOrder);
                        fetchEditableOrders()
                        onClose()
                    }}
                    isCreating={true}
                    editable={true}
                />
            )}
        </Box>
    );
};

export default NewWeekOrder;
