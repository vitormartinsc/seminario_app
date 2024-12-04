import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import api from "../api";

const DeleteComponent = ({ weekLabel, onDelete }) => {
    const [openConfirm, setOpenConfirm] = useState(false);

    const handleOpenConfirm = () => setOpenConfirm(true);
    const handleCloseConfirm = () => setOpenConfirm(false)

    const handleDeleteOrder = async () => {
        try {
            const response = await api.post('/api/orders/delete/', { weekLabel });
            if (response.status === 200) {
                onDelete();
                alert(response.data.message);
            }
        } catch (error) {
            if (error.response) {
                alert(error.response.data.message);
            } else {
                alert('Ocorreu um erro ao tentar deletar esse pedido')
            }
        } finally {
            handleCloseConfirm();
        }
    };

    return (
        <>
            {/* Botão Deletar */}
            <Button
                variant='outlined'
                color='error'
                onClick={handleOpenConfirm}>
                Deletar
            </Button>

            {/* Dialog de Confirmação */}
            <Dialog
                open={openConfirm}
                onClose={handleCloseConfirm}

            >
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem Certeza que deseja deletar o pedido da semana <strong>{weekLabel}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseConfirm} color='primary'>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteOrder} color='error' variant='contained'>Deletar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DeleteComponent;