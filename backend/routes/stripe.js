const express = require('express');
const Stripe = require('stripe');
const { Pool } = require('pg');
const router = express.Router();

const stripe = Stripe('sk_test_51PD30b2KiwwaVW0iiRNwxP3BE0O8pEc0RhMO0VbKLqint8d03a1z2F7MukRAhXQh4RikYrSLMyxNrT8z0ciKKK8A004j1xBhTh');

const pool = new Pool({
    user: 'user',
    host: 'db',
    database: 'mydatabase',
    password: 'password',
    port: 5432,
});

router.post('/create-checkout-session', async (req, res) => {
    const { amount, currency, userId } = req.body;

    if (!amount || !currency || !userId) {
        return res.status(400).json({ message: 'Kwota, waluta i userId są wymagane!' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: `Wpłata ${currency}`,
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
        });

        const query = `
            UPDATE users 
            SET balance_${currency.toLowerCase()} = balance_${currency.toLowerCase()} + $1 
            WHERE id = $2
        `;
        await pool.query(query, [amount, userId]);

        res.json({ url: session.url });
    } catch (error) {
        console.error('Błąd przy tworzeniu sesji Stripe:', error);
        res.status(500).json({ message: 'Błąd serwera przy tworzeniu sesji Stripe' });
    }
});

module.exports = router;
