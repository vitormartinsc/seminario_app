import React, { useState, useEffect, useMemo } from 'react';
import { format, toZonedTime } from 'date-fns-tz';
import { Box, Select, MenuItem, Button, Typography, Stack, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import api from "../api";
import WeekOrders from './WeekOrders';

const NewWeekOrder = ({ onClose, userNameList }) => {
    const [availableWeeks, setAvailableWeeks] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [hasCreatedOrder, setHasCreatedOrder] = useState(false);
    const [selectedUser, setSelectedUser] = useState('');
    const [currentUser, setCurrentUser] = useState('');
    const [isPendingOrder, setIsPendingOrder] = useState(false);
    const [orderType, setOrderType] = useState('comum-order');  // Novo estado para definir o tipo de pedido (agendar ou solicitar)
    const [open, setOpen] = useState(true); // Controla a exibição do modal
    const [userPendencyName, setUserPendencyName] = useState(null);
    const [userPendencyId, setUserPendencyId] = useState(null);
    const [pendencyType, setPendencyType] = useState(null)
    const [status, setStatus] = useState(null)

    const [openDialog, setOpenDialog] = useState(false); // Controle do diálogo de confirmação

    const timeZone = 'America/Sao_Paulo';

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            const currentUser = `${user.first_name} ${user.last_name}`;
            setCurrentUser(currentUser);
        }
        fetchAvailableWeeks();
    }, []);

    const fetchAvailableWeeks = async () => {
        try {
            const response = await api.get('/api/orders/available-dates/');
            setAvailableWeeks(response.data.filter((week) => week.editable));
        } catch (error) {
            console.error('Erro ao buscar semanas disponíveis:', error);
        }
    };

    const handleWeekChange = (value) => {
        const week = JSON.parse(value);
        console.log(week)
        setSelectedWeek(week);
    };

    const handleCreateOrder = (orderType) => {
        if (!selectedWeek) {
            alert('Selecione uma semana!');
            return;
        }

        if (orderType === 'pending-order' && !selectedUser) {
            alert('Selecione um usuário!');
            return;
        }

        if (orderType === 'comum-order') {
            if (selectedWeek.has_existing_order) {
                setOpenDialog(true);  // Abre o diálogo para confirmação
                return;  // Impede a execução do restante do código até a confirmação
            }
            setIsPendingOrder(false);
        } else if (orderType === 'pending-order') {
            setIsPendingOrder(true);
            setUserPendencyId(
                userNameList.find((user) => user.name === selectedUser).id
            );
            setUserPendencyName(selectedUser);
            setPendencyType('recipient');
            setStatus('pending');
        }

        setHasCreatedOrder(true);
    };

    const formattedWeeks = useMemo(() => {
        return availableWeeks.map((week) => {
            const zonedDate = toZonedTime(week.date, timeZone);
            return {
                ...week,
                formattedDate: format(zonedDate, 'dd/MM/yyyy'),
            };
        });
    }, [availableWeeks]);

    const handleUserChange = (userName) => {
        setSelectedUser(userName);
    };

    // Filtra o usuário atual da lista de nomes
    const filteredUserList = userNameList.filter((user) => user.name !== currentUser);

    // Componente do diálogo de confirmação
    const ConfirmReplaceOrderDialog = () => {
        return (
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Substituir Pedido</DialogTitle>
                <DialogContent>
                    <p>Você já tem um pedido para esta data. Deseja substituir o pedido existente?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => {
                            setOpenDialog(false);
                            setIsPendingOrder(false);
                            // Lógica para substituir a ordem existente pode ser implementada aqui
                        }}
                        color="primary"
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
                {orderType === 'comum-order' ? 'Criar Novo Pedido' : 'Criar Nova Solicitação'}
            </DialogTitle>
            <DialogContent>
                {!hasCreatedOrder ? (
                    <Box>
                        {/* Seleção do tipo de pedido (agendar ou solicitar) */}
                        <Select
                            value={orderType}
                            onChange={(e) => setOrderType(e.target.value)}
                            fullWidth
                            sx={{ marginBottom: 2 }}
                        >
                            <MenuItem value="comum-order">Agendar Pedido</MenuItem>
                            <MenuItem value="pending-order">Fazer Solicitação</MenuItem>
                        </Select>

                        {/* Se o pedido for uma solicitação, exibe o campo de seleção de usuário */}
                        {orderType === 'pending-order' && (
                            <Select
                                value={selectedUser || ""}
                                onChange={(e) => handleUserChange(e.target.value)}
                                fullWidth
                                displayEmpty
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="" disabled>Selecione um usuário</MenuItem>
                                {filteredUserList.length > 0 ? (
                                    filteredUserList.map((user) => (
                                        <MenuItem key={user.id} value={user.name}>
                                            {user.name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>Sem usuários disponíveis</MenuItem>
                                )}
                            </Select>
                        )}

                        {/* Seleção da semana */}
                        <Select
                            value={selectedWeek ? JSON.stringify(selectedWeek) : ''}
                            onChange={(e) => handleWeekChange(e.target.value)}
                            fullWidth
                            displayEmpty
                            sx={{ marginBottom: 2 }}
                        >
                            <MenuItem value="" disabled>Selecione uma semana</MenuItem>
                            {formattedWeeks.map((week) => (
                                <MenuItem key={week.week_label} value={JSON.stringify(week)}>
                                    {week.week_label} ({week.formattedDate})
                                </MenuItem>
                            ))}
                        </Select>

                        <Stack spacing={2} direction="row" justifyContent="left" sx={{ mb: 3 }}>
                            {orderType === 'comum-order' ? (
                                <Button
                                    variant="outlined"
                                    onClick={() => handleCreateOrder('comum-order')}
                                    sx={{
                                        marginBottom: 3,
                                        border: '2px solid #66BB6A',
                                        '&:hover': { backgroundColor: '#81C784', borderColor: '#388E3C' },
                                    }}
                                >
                                    Criar Pedido
                                </Button>
                            ) : (
                                <Button
                                    variant="outlined"
                                    onClick={() => handleCreateOrder('pending-order')}
                                    sx={{
                                        marginBottom: 3,
                                        border: '2px solid #FFEB3B',
                                        '&:hover': { backgroundColor: '#FFEE58', borderColor: '#FBC02D' },
                                    }}
                                >
                                    Criar Solicitação
                                </Button>
                            )}

                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => { onClose(false); setOpen(false); }}
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
                        onSave={(newOrder, shouldReload) => {
                            console.log('Salvar para backend:', newOrder);
                            onClose(shouldReload);
                            setOpen(false);
                        }}
                        isCreating={true}
                        editable={true}
                        isPendingOrder={isPendingOrder}
                        userPendencyName={userPendencyName}
                        userPendencyId={userPendencyId}
                        pendencyType={pendencyType}
                        status={status}
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => { onClose(false); setOpen(false); }} color="primary">
                    Fechar
                </Button>
            </DialogActions>

            {/* Exibe o diálogo de substituição de pedido */}
            <ConfirmReplaceOrderDialog />
        </Dialog>
    );
};

export default NewWeekOrder;
