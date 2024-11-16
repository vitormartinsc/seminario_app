import React from 'react';
import { TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { ptBR } from '@mui/x-date-pickers/locales';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState } from 'react';

function isFutureFriday(date) {
    const isFriday = date.day() === 5;
    const isFuture = date.isAfter(dayjs(), 'day');
    return isFriday && isFuture;
}

const CustomDatePicker = ({ label, value, onChange }) => {

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} locale={ptBR}>
            <DatePicker
                label={label}
                value={value}
                onChange={onChange}
                //value={selectedDate}
                //onChange={(newValue) => setSelectedDate(newValue)}
                shouldDisableDate={(date) => !isFutureFriday(date)} // Desabilita datas que não são sextas-feiras futuras
                slotProps={{
                    textField: {
                        helperText: "Escolha apenas sextas-feiras futuras",
                        inputProps: { readOnly: true },
                    },
                }}
                //renderInput={(params) => <TextField {...params} />}
            />
        </LocalizationProvider>
    );
};

export default CustomDatePicker;
