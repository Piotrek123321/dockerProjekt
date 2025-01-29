import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import ExchangeRates from './components/ExchangeRates'; // Usuń import handleDeleteAccount
import EditProfile from './components/EditProfile';
import DeleteAccount from './components/DeleteAccount';
import ChangePassword from './components/ChangePassword';
import EditAccounts from './components/EditAccounts';
import Success from './components/Success';
const App = () => {



    return (
        <Router>
           <Routes>
    <Route
        path="/"
        element={
            <div>
                <h1>Witamy w naszym kantorze</h1>
                <Link to="/login">
                    <button>Zaloguj</button>
                </Link>
                <Link to="/register">
                    <button>Zarejestruj</button>
                </Link>
            </div>
        }
    />
    <Route path="/register" element={<AuthForm type="register" />} />
    <Route path="/login" element={<AuthForm type="login" />} />
    <Route
        path="/exchange-rates"
        element={
            <div>
                <ExchangeRates />
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginTop: '20px',
                        gap: '10px',
                    }}
                >
                    <Link to="/edit-profile">
                        <button>Zmień dane</button>
                    </Link>
                    <Link to="/delete-account">
                        <button>Usuń konto</button>
                    </Link>
                    <Link to="/change-password">
                        <button>Zmień hasło</button>
                    </Link>
                    <Link to="/" onClick={() => localStorage.removeItem('userEmail')}>
                        <button>Wyloguj</button>
                    </Link>
                </div>
            </div>
        }
    />
    <Route path="/edit-profile" element={<EditProfile />} />
    <Route path="/edit-accounts" element={<EditAccounts />} />
    <Route path="/delete-account" element={<DeleteAccount />} />
    <Route path="/change-password" element={<ChangePassword />} />
    <Route path="/success" element={<Success />} /> {/* Nowa trasa */}
</Routes>

        </Router>
    );
};

export default App;
