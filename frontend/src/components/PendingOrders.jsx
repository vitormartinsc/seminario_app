import React, { useState } from "react";
import { Button, Stack, Grid, Box, Tab, Tabs, Typography } from "@mui/material";

const PendingOrders = ({ pendingOrders, userNameList }) => {
    const [activeTab, setActiveTab] = useState("by-current-user");

    // Recupera o usuário atual do localStorage com verificação
    const user = JSON.parse(localStorage.getItem("user")) || {};

    // Filtra pedidos criados pelo usuário atual
    const ordersCreatedByUser = pendingOrders.filter((order) => order.requester === user.id);
    // Filtra pedidos atribuídos ao usuário atual
    const ordersAssignedToUser = pendingOrders.filter((order) => order.recipient === user.id);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    console.log(userNameList)

    const groupOrdersByWeek = () => {
        return ordersCreatedByUser.reduce((acc, order) => {
            const { week_label, date_of_delivery, product, quantity, editable, recipient, status } = order;
            const date = new Date(date_of_delivery + 'T00:00:00');
            const recipientName = userNameList.find((user) => user.id === recipient).name;
            console.log(recipient)
            // Se não existir o week_label, cria uma nova entrada no objeto
            if (!acc[week_label]) {
                acc[week_label] = {
                    date: date,
                    orders: {}, // Aqui vai armazenar agrupamentos por recipient e status
                    editable: editable,
                };
            }
    
            // Se não existir o recipient, cria uma entrada para ele
            if (!acc[week_label].orders[recipientName]) {
                acc[week_label].orders[recipientName] = {};
            }
    
            // Se não existir o status dentro do recipient, cria uma entrada para ele
            if (!acc[week_label].orders[recipientName][status]) {
                acc[week_label].orders[recipientName][status] = [];
            }
    
            // Adiciona o pedido no grupo correto (dentro de recipient e status)
            acc[week_label].orders[recipientName][status].push({
                product,
                quantity,
                date,
                editable,
            });
    
            return acc;
        }, {});
    };
    
    const test = groupOrdersByWeek();
    console.log(test)

    return (
        <Box sx={{ padding: 3 }}>
            {/* Tabs para alternar entre pedidos */}
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                sx={{ marginBottom: 3 }}
            >
                <Tab label="Criadas Por Mim" value="by-current-user" />
                <Tab label="Atribuídas a Mim" value="to-current-user" />
            </Tabs>

            {/* Exibe o conteúdo baseado na aba ativa */}
        </Box>
    )
}

export default PendingOrders