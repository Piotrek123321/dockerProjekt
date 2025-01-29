import React, { useState } from 'react';
import axios from 'axios';

const EditAccounts = () => {
    const [currencyCode, setCurrencyCode] = useState('');
    const email = localStorage.getItem('userEmail');

    const handleAddAccount = async () => {
        try {
            await axios.post('http://localhost:5000/auth/accounts', { email, currencyCode });
            alert('Konto zostało dodane!');
        } catch (error) {
            alert(error.response?.data?.message || 'Błąd dodawania konta');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await axios.delete('http://localhost:5000/auth/accounts', {
                data: { email, currencyCode },
            });
            alert('Konto zostało usunięte!');
        } catch (error) {
            alert(error.response?.data?.message || 'Błąd usuwania konta');
        }
    };

    return (
        <div>
            <h2>Edytuj Konta</h2>
            <input
                type="text"
                placeholder="Kod waluty (np. USD)"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
            />
            <button onClick={handleAddAccount}>Dodaj Konto</button>
            <button onClick={handleDeleteAccount}>Usuń Konto</button>
        </div>
    );
};

export default EditAccounts;
