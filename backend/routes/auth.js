const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult, query } = require('express-validator');
const router = express.Router();
const { Pool } = require('pg');
const axios = require('axios');

const pool = new Pool({
    user: 'user',
    host: 'db',
    database: 'mydatabase',
    password: 'password',
    port: 5432,
});

router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Nieprawidłowy email'),
        body('password').isLength({ min: 6 }).withMessage('Hasło musi mieć co najmniej 6 znaków'),
        body('firstName').notEmpty().withMessage('Imię jest wymagane'),
        body('lastName').notEmpty().withMessage('Nazwisko jest wymagane'),
        body('age').isInt({ min: 1 }).withMessage('Wiek musi być liczbą większą niż 0'),
        body('nickname').notEmpty().withMessage('Pseudonim jest wymagany'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, firstName, lastName, age, nickname } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            await pool.query(
                `INSERT INTO users 
                (email, password, first_name, last_name, age, nickname, balance_usd, balance_eur, balance_gbp, balance_chf, balance_pln) 
                VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 0, 0, 0)`,
                [email, hashedPassword, firstName, lastName, age, nickname]
            );
            res.status(201).json({ message: 'Użytkownik zarejestrowany!' });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(400).json({ message: 'Użytkownik z tym adresem email już istnieje!' });
            }
            res.status(500).json({ message: 'Błąd serwera' });
        }
    }
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Nieprawidłowy email'),
        body('password').notEmpty().withMessage('Hasło jest wymagane'),
    ],
    async (req, res) => {
        const { email, password } = req.body;

        try {
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (result.rows.length === 0) {
                return res.status(400).json({ message: 'Nieprawidłowy email lub hasło!' });
            }

            const user = result.rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Nieprawidłowy email lub hasło!' });
            }

            const token = jwt.sign({ email: user.email }, 'secretkey', { expiresIn: '1h' });
            res.json({ token, userId: user.id });
        } catch (error) {
            res.status(500).json({ message: 'Błąd serwera' });
        }
    }
);

router.get(
    '/get-profile',
    query('email').isEmail().withMessage('Nieprawidłowy email'),
    async (req, res) => {
        const { email } = req.query;

        try {
            const result = await pool.query(
                'SELECT first_name, last_name, age, nickname FROM users WHERE email = $1',
                [email]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Użytkownik nie został znaleziony!' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ message: 'Błąd serwera' });
        }
    }
);

router.get('/accounts', async (req, res) => {
    const { email } = req.query;

    try {
        const result = await pool.query(
            `SELECT balance_usd, balance_eur, balance_gbp, balance_chf, balance_pln 
             FROM users WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony!' });
        }

        const accounts = result.rows[0];
        res.json([
            { currency: 'USD', balance: accounts.balance_usd },
            { currency: 'EUR', balance: accounts.balance_eur },
            { currency: 'GBP', balance: accounts.balance_gbp },
            { currency: 'CHF', balance: accounts.balance_chf },
            { currency: 'PLN', balance: accounts.balance_pln },
        ]);
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.put('/change-password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony!' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Stare hasło jest nieprawidłowe!' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

        res.json({ message: 'Hasło zostało zaktualizowane!' });
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.put('/edit-profile', async (req, res) => {
    const { email, firstName, lastName, age, nickname } = req.body;

    if (!email || !firstName || !lastName || !age || !nickname) {
        return res.status(400).json({ message: 'Wszystkie pola są wymagane!' });
    }

    try {
        const result = await pool.query(
            `UPDATE users 
             SET first_name = $1, last_name = $2, age = $3, nickname = $4 
             WHERE email = $5 RETURNING *`,
            [firstName, lastName, age, nickname, email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony!' });
        }

        res.json({ message: 'Profil został zaktualizowany!', user: result.rows[0] });
    } catch (error) {
        console.error('Błąd przy edycji profilu:', error);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.post('/transactions/buy', async (req, res) => {
    const { email, currency, amount } = req.body;

    try {
        const ratesResponse = await axios.get('http://api.nbp.pl/api/exchangerates/tables/A?format=json');
        const rateData = ratesResponse.data[0].rates.find((rate) => rate.code === currency);

        if (!rateData) {
            return res.status(400).json({ message: 'Nieprawidłowa waluta' });
        }

        const rate = rateData.mid * 1.05;
        const requiredPLN = amount * rate;

        const userResult = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony!' });
        }

        const user = userResult.rows[0];

        if (user.balance_pln < requiredPLN) {
            return res.status(400).json({ message: 'Brak wystarczających środków w PLN' });
        }

        await pool.query('BEGIN');
        await pool.query(
            `UPDATE users 
             SET balance_pln = balance_pln - $1, 
                 balance_${currency.toLowerCase()} = balance_${currency.toLowerCase()} + $2 
             WHERE email = $3`,
            [requiredPLN, amount, email]
        );

        const updatedBalances = await pool.query(
            `SELECT balance_usd, balance_eur, balance_gbp, balance_chf, balance_pln FROM users WHERE email = $1`,
            [email]
        );

        await pool.query('COMMIT');

        res.json({
            message: 'Kupno zakończone sukcesem',
            updatedBalances: [
                { currency: 'USD', balance: updatedBalances.rows[0].balance_usd },
                { currency: 'EUR', balance: updatedBalances.rows[0].balance_eur },
                { currency: 'GBP', balance: updatedBalances.rows[0].balance_gbp },
                { currency: 'CHF', balance: updatedBalances.rows[0].balance_chf },
                { currency: 'PLN', balance: updatedBalances.rows[0].balance_pln },
            ],
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Błąd podczas kupna waluty:', error);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.post('/transactions/sell', async (req, res) => {
    const { email, currency, amount } = req.body;

    try {
        const ratesResponse = await axios.get('http://api.nbp.pl/api/exchangerates/tables/A?format=json');
        const rateData = ratesResponse.data[0].rates.find((rate) => rate.code === currency);

        if (!rateData) {
            return res.status(400).json({ message: 'Nieprawidłowa waluta' });
        }

        const rate = rateData.mid * 0.95;
        const receivedPLN = amount * rate;

        const accountResult = await pool.query(
            `SELECT balance_pln, balance_${currency.toLowerCase()} FROM users WHERE email = $1`,
            [email]
        );

        if (accountResult.rowCount === 0) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony!' });
        }

        const { [`balance_${currency.toLowerCase()}`]: balance_currency } = accountResult.rows[0];
        if (balance_currency < amount) {
            return res.status(400).json({ message: `Brak wystarczających środków w ${currency}` });
        }

        await pool.query('BEGIN');
        await pool.query(
            `UPDATE users 
             SET balance_pln = balance_pln + $1, 
                 balance_${currency.toLowerCase()} = balance_${currency.toLowerCase()} - $2 
             WHERE email = $3`,
            [receivedPLN, amount, email]
        );

        const updatedBalances = await pool.query(
            `SELECT balance_usd, balance_eur, balance_gbp, balance_chf, balance_pln FROM users WHERE email = $1`,
            [email]
        );

        await pool.query('COMMIT');

        res.json({
            message: 'Sprzedaż zakończona sukcesem',
            updatedBalances: [
                { currency: 'USD', balance: updatedBalances.rows[0].balance_usd },
                { currency: 'EUR', balance: updatedBalances.rows[0].balance_eur },
                { currency: 'GBP', balance: updatedBalances.rows[0].balance_gbp },
                { currency: 'CHF', balance: updatedBalances.rows[0].balance_chf },
                { currency: 'PLN', balance: updatedBalances.rows[0].balance_pln },
            ],
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Błąd podczas sprzedaży waluty:', error);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.delete('/delete-account', async (req, res) => {
    const { email } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony!' });
        }

        const user = userResult.rows[0];

        if (
            user.balance_usd > 0 ||
            user.balance_eur > 0 ||
            user.balance_gbp > 0 ||
            user.balance_chf > 0 ||
            user.balance_pln > 0
        ) {
            return res.status(400).json({ message: 'Do konta przypisane są środki' });
        }

        await pool.query('DELETE FROM users WHERE email = $1', [email]);
        res.json({ message: 'Konto zostało usunięte!' });
    } catch (error) {
        console.error('Błąd przy usuwaniu konta:', error);
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

module.exports = router;
