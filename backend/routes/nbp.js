const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/exchange-rates', async (req, res) => {
    const currencies = ['USD', 'EUR', 'GBP', 'CHF'];
    try {
        const responses = await Promise.all(
            currencies.map(currency =>
                axios.get(`http://api.nbp.pl/api/exchangerates/rates/A/${currency}/?format=json`)
            )
        );

        const rates = responses.map((response, index) => ({
            currency: currencies[index],
            rate: response.data.rates[0].mid,
        }));

        res.json(rates);
    } catch (error) {
        console.error('Błąd pobierania danych z NBP:', error.message);
        res.status(500).json({ message: 'Nie udało się pobrać kursów walut' });
    }
});

module.exports = router;
