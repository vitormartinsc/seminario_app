import React, { useState, useEffect, useMemo } from 'react';
import { format, toZonedTime } from 'date-fns-tz'; // Para lidar com fuso horário
import { Box, Select, MenuItem, Button, Typography, Stack } from '@mui/material';
import api from "../api";
import WeekOrders from './WeekOrders';

const NewWeekOrder = ({ onClose }) => {
    const [availableWeeks, setAvailableWeeks] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [hasCreatedOrder, setHasCreatedOrder] = useState(false);
    const [userNameList, setUserNameList] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [currentUser, setCurrentUser] = useState('')

    const timeZone = 'America/Sao_Paulo'; // Ajuste o fuso horário para o Brasil

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            const currentUser = (`${user.first_name} ${user.last_name}`)
            setSelectedUser(currentUser);
            setCurrentUser(currentUser);
        }
        fetchAvailableWeeks();
        fetchUserNameList();
    }, []);


    const fetchAvailableWeeks = async () => {
        try {
            const response = await api.get('/api/orders/available-dates/');
            setAvailableWeeks(response.data);
        } catch (error) {
            console.error('Erro ao buscar semanas disponíveis:', error);
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

    window.availableWeeks = availableWeeks

    const handleUserChange = (userName) => {
        setSelectedUser(userName)
    };

    return (
        <Box>
            {!hasCreatedOrder ? (
                <Box>
                    {selectedUser === currentUser ? (
                        <Typography variant="h6" gutterBottom>
                            Criar Novo Pedido
                        </Typography>
                    ) : (
                        <Typography variant="h6" gutterBottom>
                            Criar Nova Solicitação
                        </Typography>
                    )}

                    {/* Select para selecionar uma semana */}
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
                    {/* Select para selecionar um usuário */}
                    <Select
                        value={userNameList.length > 0 ? selectedUser : ""}
                        onChange={(e) => handleUserChange(e.target.value)}  // Alterado para onChange
                        fullWidth
                        displayEmpty
                        sx={{ mb: 2 }}
                    >
                        {userNameList && userNameList.length > 0 ? (
                            userNameList.map((user) => (
                                <MenuItem
                                    key={user.id}
                                    value={user.name}  // Passando o ID do usuário como value
                                >
                                    {user.name}  {/* Exibe o nome completo */}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>Sem usuários disponíveis</MenuItem>
                        )}
                    </Select>

                    <Stack spacing={2} direction="row" justifyContent="left"
                        sx={{ mb: 3 }}>

                        {selectedUser === currentUser ? (
                           <Button
                           variant="outlined"
                           onClick={handleCreateOrder}
                           sx={{
                               marginBottom: 3,
                               border: '2px solid #66BB6A',  // Borda verde suave
                               '&:hover': {
                                   backgroundColor: '#81C784',  // Verde mais forte no hover
                                   borderColor: '#388E3C',  // Borda mais escura no hover
                               },
                           }}
                       >
                           Criar Pedido
                       </Button>
                        ):(
                       
                       <Button
                           variant="outlined"
                           onClick={handleCreateOrder}
                           sx={{
                               marginBottom: 3,
                               border: '2px solid #FFEB3B',  // Borda amarela suave
                               '&:hover': {
                                   backgroundColor: '#FFEE58',  // Amarelo mais forte no hover
                                   borderColor: '#FBC02D',  // Borda mais escura no hover
                               },
                           }}
                       >
                           Criar Solicitação
                       </Button>
                        )
                    }

                        <Button
                            variant="outlined"
                            color='secondary'
                            onClick={() => onClose(false)}
                            sx={{ marginBottom: 3 }}
                        >
                            Cancelar
                        </Button>
                    </Stack>
                </Box>
            ) : (
                <WeekOrders
                    weekLabel={selectedWeek.week_label}
                    date={selectedWeek.date}
                    orders={{}}
                    onSave={(newOrder) => {
                        console.log('Salvar para backend:', newOrder);
                        onClose(true)
                    }}
                    isCreating={true}
                    editable={true}
                />
            )}
        </Box>
    );
};

export default NewWeekOrder;
