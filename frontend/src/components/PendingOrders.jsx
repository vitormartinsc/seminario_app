import React, { useState } from "react";
import { Button, Stack, Grid, Box, Tab, Tabs, Typography } from "@mui/material";
import WeekOrders from "./WeekOrders";

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

    const groupOrdersByWeek = (pendingOrders, pendencyType) => {
        return pendingOrders.reduce((acc, order) => {
            const { week_label, date_of_delivery, product, quantity, editable, status } = order;
            const userPendency = order[pendencyType]
            const date = new Date(date_of_delivery + 'T00:00:00');
            const userPendencyName = userNameList.find((user) => user.id === userPendency).name;
            // Se não existir o week_label, cria uma nova entrada no objeto
            if (!acc[week_label]) {
                acc[week_label] = {}
            }

            // Se não existir o userPendency, cria uma entrada para ele
            if (!acc[week_label][userPendencyName]) {
                acc[week_label][userPendencyName] = {};
            }

            // Se não existir o status dentro do userPendency, cria uma entrada para ele
            if (!acc[week_label][userPendencyName][status]) {
                acc[week_label][userPendencyName][status] = [];
            }

            // Adiciona o pedido no grupo correto (dentro de userPendency e status)
            acc[week_label][userPendencyName][status] = {
                date: date,
                orders: {},
                editable: editable,
                week_label: week_label,
                userPendency: userPendency
            };

            acc[week_label][userPendencyName][status].orders[product] = quantity
            return acc;
        }, {});
    };

    const groupedOrdersCreatedByUser = groupOrdersByWeek(ordersCreatedByUser, 'recipient');
    const groupedOrdersAssignedToUser = groupOrdersByWeek(ordersAssignedToUser, 'requester');
    console.log(groupedOrdersAssignedToUser)

    const renderPendingOrders = (groupedPendingOrders, pendencyType) => {
        const weekOrdersList = [];

        Object.keys(groupedPendingOrders).forEach((weekLabel) => {
            Object.keys(groupedPendingOrders[weekLabel]).forEach((userPendency) => {
                Object.keys(groupedPendingOrders[weekLabel][userPendency]).forEach((status) => {
                    const pendingOrder = groupedPendingOrders[weekLabel][userPendency][status];
                    console.log(pendingOrder)
                    weekOrdersList.push(
                        <WeekOrders
                            key={`${weekLabel}-${userPendency}-${status}`} // Chave única para cada componente
                            isPendingOrder={true}
                            userPendency={userPendency}
                            pendencyType={pendencyType}
                            status={status}
                            weekLabel={weekLabel}
                            date={pendingOrder.date}
                            orders={pendingOrder.orders}
                            editable={pendingOrder.editable}
                            onSave={(updatedOrders) => {
                                console.log('Salvar para backend', updatedOrders);
                            }}
                        />
                    );
                });
            });
        });

        return weekOrdersList;
    };


    return (
        <Box>
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
            {
                activeTab === 'by-current-user' && (
                    renderPendingOrders(
                        groupedOrdersCreatedByUser,
                        'recipient'
                    )
                )
            }
            {
                activeTab === 'to-current-user' && (
                    renderPendingOrders(
                        groupedOrdersAssignedToUser,
                        'requester'
                    )
                )
            }

        </Box>
    )
}


export default PendingOrders