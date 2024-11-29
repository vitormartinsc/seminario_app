import React from "react";
import WeekOrders from "./WeekOrders"; // Certifique-se de que este caminho está correto

const OpenOrders = ({ ordersGroupedByWeek }) => {
    return (
        <div>
            {/* Exibindo os pedidos agrupados por week_label */}
            {Object.keys(ordersGroupedByWeek).map((weekLabel, index) => (
                <WeekOrders
                    index={index} // Adicione uma chave única para ajudar o React na renderização
                    weekLabel={weekLabel}
                    key={weekLabel}
                    date={ordersGroupedByWeek[weekLabel].date}
                    orders={ordersGroupedByWeek[weekLabel].orders}
                    onSave={(updatedOrders) => {
                        console.log("Salvar para backend", updatedOrders);
                    }}
                    editable={ordersGroupedByWeek[weekLabel].editable}
                />
            ))}
        </div>
    );
};

export default OpenOrders;
