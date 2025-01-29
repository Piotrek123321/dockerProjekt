import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/authForm.css';

const EditProfile = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [age, setAge] = useState('');
    const [nickname, setNickname] = useState('');

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            alert('Użytkownik nie jest zalogowany!');
        }
    }, []);

    useEffect(() => {
        if (!email) return;
        const fetchProfileData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/auth/get-profile`, {
                    params: { email },
                });
                const { first_name, last_name, age, nickname } = response.data;
                setFirstName(first_name || '');
                setLastName(last_name || '');
                setAge(age || '');
                setNickname(nickname || '');
            } catch (error) {
                console.error('Błąd podczas pobierania danych profilu:', error);
                alert('Nie udało się pobrać danych profilu.');
            }
        };

        fetchProfileData();
    }, [email, API_BASE_URL]);

    const handleSave = async () => {
        try {
            const response = await axios.put(`${API_BASE_URL}/auth/edit-profile`, {
                email,
                firstName,
                lastName,
                age,
                nickname,
            });
            alert(response.data.message || 'Profil został zaktualizowany!');
            navigate('/exchange-rates');
        } catch (error) {
            console.error('Błąd podczas zapisywania profilu:', error);
            alert('Nie udało się zaktualizować profilu.');
        }
    };

    return (
        <div className="auth-form">
            <h2>Edytuj profil</h2>
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
            <div className="button-group">
                <button onClick={handleSave} className="submit-btn">
                    Zapisz
                </button>
                <button onClick={() => navigate('/exchange-rates')} className="back-btn">
                    Powróć do kursów walut
                </button>
            </div>
        </div>
    );
};

export default EditProfile;
