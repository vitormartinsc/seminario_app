import React, { useEffect, useState } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { ptBR } from '@mui/x-date-pickers/locales';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function isFutureFriday(date) {
    const isFriday = date.day() === 5;
    const isFuture = date.isAfter(dayjs(), 'day');
    return isFriday && isFuture;
}

function getNextFriday() {
    const today = dayjs();
    const dayOfWeek = today.day();
    const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - (dayOfWeek - 5);
    return today.add(daysUntilFriday, 'day');
}

const CustomDatePicker = ({ label, value, onChange }) => {
    const [internalValue, setInternalValue] = useState(value || getNextFriday());

    useEffect(() => {
        if (!value) {
            setInternalValue(getNextFriday());
            if (onChange) {
                onChange(getNextFriday());
            }
        }
    }, [value, onChange]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} locale={ptBR}>
            <DatePicker
                label={label}
                value={internalValue}
                onChange={(newValue) => {
                    setInternalValue(newValue);
                    if (onChange) onChange(newValue);
                }}
                format="DD/MM/YYYY"
                shouldDisableDate={(date) => !isFutureFriday(date)} // Desabilita datas que não são sextas-feiras futuras
                slotProps={{
                    textField: {
                        helperText: "Escolha apenas sextas-feiras futuras",
                        inputProps: { readOnly: true },
                    },
                }}
            />
        </LocalizationProvider>
    );
};

export default CustomDatePicker;
