import React, { useState } from 'react';
import { Box, Typography, Grid, Button, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CustomDatePicker from '../components/CustomDatePicker';

const CreateOrder = () => {
  const [orders, setOrders] = useState({});
  const [deliveryDate, setDeliveryDate] = useState(null);

  const availableProducts = ['Tradicional', 'Cenoura com Chocolate', 'Brioche'];

  const handleIncrease = (product) => {
    setOrders((prevOrders) => ({
      ...prevOrders,
      [product]: (prevOrders[product] || 0) + 1,
    }));
  };

  const handleDecrease = (product) => {
    setOrders((prevOrders) => ({
      ...prevOrders,
      [product]: Math.max((prevOrders[product] || 0) - 1, 0),
    }));
  };

  const handleSubmit = () => {
    console.log({ orders, deliveryDate });
    // Lógica para enviar o pedido
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', textAlign: 'center', padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Criar Pedido
      </Typography>
      <Grid container spacing={2}>
        {availableProducts.map((product) => (
          <Grid item xs={12} sm={6} key={product}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography>{product}</Typography>
              <Box>
                <IconButton onClick={() => handleDecrease(product)}>
                  <RemoveIcon />
                </IconButton>
                <TextField
                  size="small"
                  value={orders[product] || 0}
                  slotProps={{input: {readOnly: true }}}
                  sx={{ width: 50, textAlign: 'center' }}
                />
                <IconButton onClick={() => handleIncrease(product)}>
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ marginTop: 3, textAlign: 'left' }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Escolha uma sexta-feira para a entrega do pedido:
        </Typography>
        <CustomDatePicker
          label="Data de entrega"
          value={deliveryDate}
          onChange={setDeliveryDate}
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ marginTop: 3 }}
        disabled={!deliveryDate} // Desabilitado sem uma data válida
      >
        Enviar Pedido
      </Button>
    </Box>
  );
};

export default CreateOrder;
