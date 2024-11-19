import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Button, IconButton, TextField, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CustomDatePicker from '../components/CustomDatePicker';
import api from '../api';

const CreateOrder = () => {
  const [orders, setOrders] = useState({});
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [monthSummary, setMonthSummary] = useState([]);
  const [weekSummary, setWeekSummary] = useState([]);
  const [monthOrdersCount, setmonthOrdersCount] = useState(0);
  const [weekOrdersCount, setweekOrdersCount] = useState(0);

  const fetchOrdersSummary = async () => {
    try {
      const response = await api.get('/api/orders/previous/summary/');
      setMonthSummary(response.data.month_summary);
      setWeekSummary(response.data.week_summary)
    } catch (error) {
      console.error("Erro ao buscar o resumo dos pedidos: ", error);
    }

  }

  const updateOrderCounts = (selectedDate) => {
    if (!selectedDate) {
      setmonthOrdersCount(0);
      setweekOrdersCount(0);
      return
    } else {

      const selectedYear = selectedDate.year();
      const selectedMonth = selectedDate.month() + 1; // o mês começa no zero
      const selectedWeek = selectedDate.week();

      const monthData = monthSummary.find(
        (entry) =>
          entry.year === selectedYear &&
          entry.month === selectedMonth
      );

      window.monthSummary = monthSummary;

      setmonthOrdersCount(monthData ? monthData.total_quantity : 0);



      const weekData = weekSummary.find(
        (entry) =>
          entry.year === selectedYear &&
          entry.month === selectedMonth &&
          entry.week === selectedWeek

      )
      setweekOrdersCount(weekData ? weekData.total_quantity : 0);


    }

  }

  // Buscar o resumo do usuário ao carregar a página
  useEffect(() => {
    fetchOrdersSummary();
  }, [])

  useEffect(() => {
    updateOrderCounts(deliveryDate);
  }, [deliveryDate, monthSummary, weekSummary]);


  const availableProducts = [
    "Tradicional",
    "Tradicional Sem Açúcar",
    "Cenoura com Chocolate",
    "Farofa",
    "Antepasto",
    "Brioche",
    "Browne",
  ];

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

  const handleSubmit = async () => {
    const totalQuantity = Object.values(orders).reduce(
      (sum, quantity) => sum + quantity, 0
    );
    if (totalQuantity === 0) {
      alert("Por favor, selecione ao menos um pedido!");
      return;
    }

    try {
      // Formatar deliveryDate como string no formato ISO (YYYY-MM-DD)
      const formattedDate = deliveryDate.format("YYYY-MM-DD");

      // Preparar os dados de pedido
      const orderData = Object.entries(orders)
        .map(([product, quantity]) => ({
          product,
          quantity,
          date_of_delivery: formattedDate, // Adicionando a data de entrega formatada
        }));

      // Enviar para o backend
      const response = await api.post("/api/orders/create/", orderData);

      if (response.status === 201) {
        alert("Pedido enviado com sucesso!");
        setOrders({}); // Limpar os pedidos
        setDeliveryDate(null); // Limpar a data de entrega
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar o pedido. Tente novamente.");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', textAlign: 'center', padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Criar Pedido
      </Typography>
      <Grid container spacing={2}>
        {availableProducts.map((product) => (
          <Grid item xs={12} key={product}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                padding: 1,
                border: "1px solid #ddd",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
              }}
            >
              {/* Nome do produto */}
              <Typography
                sx={{
                  flex: 1,
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {product}
              </Typography>

              {/* Botões de controle */}
              <Box display="flex" alignItems="center" justifyContent="flex-end">
                <IconButton onClick={() => handleDecrease(product)}>
                  <RemoveIcon />
                </IconButton>
                <TextField
                  size="small"
                  value={orders[product] || 0}
                  inputProps={{ readOnly: true }}
                  sx={{
                    width: 50,
                    textAlign: "center",
                    "& input": { textAlign: "center" }, // Centraliza o texto
                  }}
                />
                <IconButton onClick={() => handleIncrease(product)}>
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Escolha uma sexta-feira para a entrega do pedido:
        </Typography>
      </Grid>

      {/* CustomDatePicker ocupando largura total */}
      <Grid item xs={12}>
        <CustomDatePicker
          label="Data de entrega"
          value={deliveryDate}
          onChange={setDeliveryDate}
          fullWidth
        />
      </Grid>

      <Box sx={{ marginTop: 2 }}>
        <Alert severity="info">
          {monthOrdersCount > 0
            ? `Para este mês, você já solicitou ${monthOrdersCount} produtos.`
            : "Você ainda não solicitou produtos para este mês."}
          <br />
          {weekOrdersCount > 0
            ? `Para esta semana, você já solicitou ${weekOrdersCount} produtos.`
            : "Você ainda não solicitou produtos para esta semana."}
        </Alert>
      </Box>

      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!deliveryDate} // Desabilitado sem uma data válida
          fullWidth
        >
          Enviar Pedido
        </Button>
      </Grid>
    </Box>
  )
};

export default CreateOrder;
