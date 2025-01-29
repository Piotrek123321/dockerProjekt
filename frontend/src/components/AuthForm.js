import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/authForm.css';

const AuthForm = ({ type }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [age, setAge] = useState('');
    const [nickname, setNickname] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const endpoint = type === 'register' 
            ? `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/auth/register`
            : `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/auth/login`;

        const payload = type === 'register' 
            ? { email, password, firstName, lastName, age, nickname } 
            : { email, password };

        try {
            const response = await axios.post(endpoint, payload);

            if (type === 'login') {
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userId', response.data.userId);

                alert('Zalogowano pomyślnie!');
                navigate('/exchange-rates');
            } else {
                alert(response.data.message || 'Rejestracja zakończona pomyślnie!');
                navigate('/');
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const errors = error.response.data.errors || [];
                if (errors.length > 0) {
                    alert(errors.map(err => `${err.msg} (${err.path})`).join('\n'));
                } else {
                    alert('Błąd: ' + (error.response.data.message || 'Nieznany błąd walidacji'));
                }
            } else {
                alert('Błąd: ' + (error.response?.data?.message || 'Nieznany błąd'));
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>{type === 'register' ? 'Rejestracja' : 'Logowanie'}</h2>

            {type === 'register' && (
                <>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Imię"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Nazwisko"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="number"
                            placeholder="Wiek"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Pseudonim"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="input-field"
                        />
                    </div>
                </>
            )}

            <div className="input-group">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                />
            </div>

            <div className="input-group">
                <input
                    type="password"
                    placeholder="Hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                />
            </div>

            <div className="button-group">
                <button type="submit" className="submit-btn">
                    {type === 'register' ? 'Zarejestruj' : 'Zaloguj'}
                </button>
                <button type="button" onClick={() => navigate('/')} className="back-btn">
                    Powróć na stronę główną
                </button>
            </div>
        </form>
    );
};

export default AuthForm;
