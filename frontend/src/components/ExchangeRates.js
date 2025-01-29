import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/exchangeRates.css';

const ExchangeRates = () => {
    const [rates, setRates] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [action, setAction] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const email = localStorage.getItem('userEmail');
    const [isDepositOpen, setDepositOpen] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [depositCurrency, setDepositCurrency] = useState('');

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await axios.get('http://localhost:5000/nbp/exchange-rates');
                setRates(response.data);
            } catch (error) {
                console.error('Błąd przy pobieraniu kursów walut:', error);
            }
        };

        const fetchAccounts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/auth/accounts', {
                    params: { email },
                });
                setAccounts(response.data);
            } catch (error) {
                console.error('Błąd przy pobieraniu kont użytkownika:', error);
            }
        };

        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('http://localhost:5000/auth/get-profile', {
                    params: { email },
                });
                setUserProfile(response.data);
            } catch (error) {
                console.error('Błąd przy pobieraniu danych użytkownika:', error);
            }
        };

        fetchRates();
        fetchAccounts();
        fetchUserProfile();
    }, [email]);

    const handleDeposit = async () => {
        setError('');
        const numericAmount = parseFloat(depositAmount);

        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Wpisano nieprawidłową kwotę');
            return;
        }

        if (!depositCurrency) {
            setError('Nie wybrano waluty');
            return;
        }

        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError('Nie można znaleźć identyfikatora użytkownika');
                return;
            }

            const response = await axios.post('http://localhost:5000/stripe/create-checkout-session', {
                amount: numericAmount,
                currency: depositCurrency,
                userId,
            });

            window.location.href = response.data.url;
        } catch (error) {
            console.error('Błąd przy tworzeniu sesji Stripe:', error);
            setError('Wystąpił problem z utworzeniem sesji Stripe');
        }
    };

    const handleTransaction = async () => {
        setError('');
        const numericAmount = parseFloat(amount);

        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Wpisano złą wartość');
            return;
        }

        if (!selectedCurrency) {
            setError('Nie wybrano waluty');
            return;
        }

        try {
            let response;

            if (action === 'buy') {
                response = await axios.post('http://localhost:5000/auth/transactions/buy', {
                    email,
                    currency: selectedCurrency,
                    amount: numericAmount,
                });
            } else if (action === 'sell') {
                response = await axios.post('http://localhost:5000/auth/transactions/sell', {
                    email,
                    currency: selectedCurrency,
                    amount: numericAmount,
                });
            }

            setAccounts((prevAccounts) =>
                prevAccounts.map((account) => {
                    const updatedAccount = response.data.updatedBalances.find(
                        (acc) => acc.currency === account.currency
                    );
                    return updatedAccount ? { ...account, balance: updatedAccount.balance } : account;
                })
            );

            alert(`Transakcja ${action === 'buy' ? 'kupna' : 'sprzedaży'} zakończona pomyślnie`);
            setAction(null);
            setSelectedCurrency('');
            setAmount('');
        } catch (error) {
            console.error('Błąd przy realizacji transakcji:', error);
            setError(
                error.response?.data?.message || 'Wystąpił błąd podczas realizacji transakcji'
            );
        }
    };

    return (
        <div className="exchange-rates-container">
            <table className="rates-table">
                <thead>
                    <tr>
                        <th>Waluta</th>
                        <th>Kurs</th>
                        <th>Kupno</th>
                        <th>Sprzedaż</th>
                    </tr>
                </thead>
                <tbody>
                    {rates.map((rate) => (
                        <tr key={rate.currency}>
                            <td>{rate.currency}</td>
                            <td>{Number(rate.rate).toFixed(4)}</td>
                            <td>{(rate.rate * 1.05).toFixed(4)}</td>
                            <td>{(rate.rate * 0.95).toFixed(4)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {userProfile && (
                <div className="user-profile">
                    <h3>Dane użytkownika:</h3>
                    <p>
                        Imię: {userProfile.first_name} <br />
                        Nazwisko: {userProfile.last_name} <br />
                        Wiek: {userProfile.age} <br />
                        Pseudonim: {userProfile.nickname}
                    </p>
                </div>
            )}

            <div className="accounts-table">
                <table>
                    <thead>
                        <tr>
                            <th>Waluta</th>
                            <th>Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account) => (
                            <tr key={account.currency}>
                                <td>{account.currency}</td>
                                <td>{Number(account.balance).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="user-actions">
                <button onClick={() => setAction('buy')}>Kupno</button>
                <button onClick={() => setAction('sell')}>Sprzedaż</button>
                <button onClick={() => setDepositOpen(true)}>Wpłać</button>
            </div>

            {action && (
                <div className="transaction-form">
                    <p>{action === 'buy' ? 'Wybierz walutę, którą chcesz kupić' : 'Wybierz walutę, którą chcesz sprzedać'}</p>
                    <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="currency-select"
                    >
                        <option value="">Wybierz walutę</option>
                        {rates.map((rate) => (
                            <option key={rate.currency} value={rate.currency}>
                                {rate.currency}
                            </option>
                        ))}
                    </select>

                    <p>Wybierz kwotę:</p>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*\.?\d*$/.test(value)) {
                                setAmount(value);
                            }
                        }}
                        className="amount-input"
                    />
                    <button onClick={handleTransaction} className="submit-btn">Potwierdź</button>
                    {error && <p className="error-message">{error}</p>}
                </div>
            )}

            {isDepositOpen && (
                <div className="deposit-form">
                    <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*\.?\d*$/.test(value)) {
                                setDepositAmount(value);
                            }
                        }}
                        placeholder="Kwota"
                        className="deposit-input"
                    />
                    <select
                        value={depositCurrency}
                        onChange={(e) => setDepositCurrency(e.target.value)}
                        className="currency-select"
                    >
                        <option value="">Wybierz walutę</option>
                        <option value="PLN">PLN</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="CHF">CHF</option>
                    </select>
                    <button onClick={handleDeposit} className="submit-btn">Dalej</button>
                    <button onClick={() => setDepositOpen(false)} className="back-btn">Powrót</button>
                    {error && <p className="error-message">{error}</p>}
                </div>
            )}
        </div>
    );
};

export default ExchangeRates;
