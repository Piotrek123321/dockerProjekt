import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    const handleChangePassword = async () => {
        const email = localStorage.getItem('userEmail');
        if (!email) {
            alert('Nie jesteś zalogowany.');
            navigate('/login');
            return;
        }

        try {
            const response = await axios.put(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/auth/change-password`, {
                email,
                oldPassword,
                newPassword,
            });
            alert(response.data.message);
            navigate('/exchange-rates');
        } catch (error) {
            console.error('Błąd podczas zmiany hasła:', error);
            alert('Błąd podczas zmiany hasła.');
        }
    };

    return (
        <div>
            <h2>Zmień hasło</h2>
            <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Stare hasło"
            />
            <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nowe hasło"
            />
            <button onClick={handleChangePassword}>Zmień hasło</button>
            <button onClick={() => navigate('/exchange-rates')}>Powróć na stronę z kursami</button>
        </div>
    );
};

export default ChangePassword;
