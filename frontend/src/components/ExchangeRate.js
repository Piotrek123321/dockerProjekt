import React, { useState } from 'react';
import axios from 'axios';

const ExchangeRate = () => {
    const [currency, setCurrency] = useState('');
    const [exchangeRate, setExchangeRate] = useState(null);

    const fetchExchangeRate = async () => {
        try {
            const response = await axios.get(`/auth/exchange-rate/${currency}`);
            setExchangeRate(response.data.exchangeRate);
        } catch (error) {
            alert('Błąd pobierania kursu walut');
        }
    };

    return (
        <div>
            <h2>Kurs walut</h2>
            <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="Podaj kod waluty (np. DKK)"
            />
            <button onClick={fetchExchangeRate}>Sprawdź kurs</button>
            {exchangeRate && <p>Kurs {currency}: {exchangeRate} PLN</p>}
        </div>
    );
};

export default ExchangeRate;
