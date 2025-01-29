import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DeleteAccount = () => {
    const navigate = useNavigate();

    const handleDeleteAccount = async () => {
        const email = localStorage.getItem('userEmail');
        if (!email) {
            alert('Nie można usunąć konta. Użytkownik nie jest zalogowany.');
            return;
        }

        try {
            const response = await axios.delete('http://localhost:5000/auth/delete-account', {
                data: { email },
            });

            if (response.status === 200) {
                alert('Konto zostało pomyślnie usunięte!');
                localStorage.removeItem('userEmail');
                navigate('/login');
            }
        } catch (error) {
            if (error.response?.data?.message === 'Do konta przypisane są środki') {
                alert('Nie można usunąć konta - pozostały środki na saldzie!');
            } else {
                alert('Błąd usuwania konta.');
            }
            console.error('Błąd podczas usuwania konta:', error);
        }
    };

    return (
        <div>
            <h2>Usuń konto</h2>
            <button onClick={handleDeleteAccount}>Usuń konto</button>
            <button onClick={() => navigate('/exchange-rates')}>Anuluj</button>
        </div>
    );
};

export default DeleteAccount;
