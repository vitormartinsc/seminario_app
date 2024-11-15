import React, { useState } from "react";
import { Button, Typography, IconButton, Box, Grid, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import api from "../api";
import { useNavigate } from "react-router-dom";

const availableProducts = [
  "Tradicional",
  "Tradicional Sem Açúcar",
  "Cenoura com Chocolate",
  "Farofa",
  "Antepasto",
  "Brioche",
  "Browne",
];

function CreateOrder() {
  const [orders, setOrders] = useState({});
  const navigate = useNavigate();

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
    const orderData = Object.entries(orders).map(([product, quantity]) => ({
      product,
      quantity,
    }));

    if (orderData.length === 0) {
      alert("Por favor, adicione pelo menos um produto ao pedido!");
      return;
    }

    try {
      const res = await api.post("/api/orders/create/", orderData);
      if (res.status === 201) {
        alert("Pedido enviado com sucesso!");
        navigate("/sabores-emaus"); // Retorna à página principal
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar o pedido. Tente novamente.");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", textAlign: "center", padding: 2 }}>
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
                  inputProps={{ readOnly: true }}
                  sx={{ width: 50, textAlign: "center" }}
                />
                <IconButton onClick={() => handleIncrease(product)}>
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ marginTop: 3 }}
      >
        Enviar Pedido
      </Button>
    </Box>
  );
}

export default CreateOrder;
