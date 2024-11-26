import React from 'react';
import { format } from 'date-fns'; // Usando date-fns para formatar a data
import { useState, useEffect } from 'react';
import { Box, Select, MenuItem, Button, Typography } from '@mui/material';
import api from "../api";
import WeekOrders from './WeekOrders';

const NewWeekOrder = () => {
    const [availableWeeks, setAvailableWeeks] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [hasCreatedOrder, setHasCreatedOrder] = useState(false)

    useEffect(() => {
        fetchAvailableWeeks();
    }, []);

    const fetchAvailableWeeks = async () => {
        try {
            const response = await api.get('/api/orders/available-dates/')
            setAvailableWeeks(response.data);
        } catch (error) {
            console.error('Erro ao buscar semanas disponíveis:', error);
        }
    };

    const handleWeekChange = (value) => {
        const week = JSON.parse(value)
        setSelectedWeek(week);

    }


    const handleCreateOrder = async () => {
        if (!selectedWeek) {
            alert('Selecione uma semana!');
            return;
        }

        else {
            setHasCreatedOrder(true);
        }



    }

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

    return (
        <Box>
            {!hasCreatedOrder ? (
                <Box>
                    <Typography variant="h6">Criar Novo Pedido</Typography>
                    <Select
                        value={selectedWeek ? JSON.stringify(selectedWeek) : ''} // Garante string
                        onChange={(e) => handleWeekChange(e.target.value)}
                        fullWidth
                        displayEmpty
                        sx={{ marginBottom: 2 }}
                    >
                        <MenuItem value="" disabled>
                            Selecione uma semana
                        </MenuItem>
                        {availableWeeks.map((week) => (
                            <MenuItem key={week.week_label}
                                value={JSON.stringify({ week_label: week.week_label, date: week.date })

                                }>
                                {week.week_label} ({format(week.date, 'dd/MM/yyyy')})
                            </MenuItem>
                        ))}
                    </Select>
                    <Button variant="contained" onClick={handleCreateOrder}
                        sx={{
                            marginBottom: 3
                        }}
                    >
                        Criar Pedido
                    </Button>
                </Box>
            ) :
                (
                    <WeekOrders
                        weekLabel={selectedWeek.week_label}
                        date={selectedWeek.date}
                        orders={{}}
                        onSave={(newOrder) => {
                            fetchEditableOrders();
                            console.log('salvar para backend', newOrder);
                        }}
                        isCreating={true}

                    />
                )
            }

        </Box>
    );

};

export default NewWeekOrder;
