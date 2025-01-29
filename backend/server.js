const express = require('express');
const cors = require('cors'); // Dodaj cors
const app = express();
const authRoutes = require('./routes/auth'); // Import tras z pliku auth.js
const nbpRoutes = require('./routes/nbp'); // Import tras z pliku nbp.js (kursy walut)
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PD30b2KiwwaVW0iiRNwxP3BE0O8pEc0RhMO0VbKLqint8d03a1z2F7MukRAhXQh4RikYrSLMyxNrT8z0ciKKK8A004j1xBhTh');
const stripeRoutes = require('./routes/stripe');



// Middleware
app.use(cors()); // Dodaj cors, aby zezwolić na żądania z innego portu
app.use(express.json()); // Middleware do parsowania JSON

// Trasy
app.use('/auth', authRoutes); // Podłączenie tras autoryzacji
app.use('/nbp', nbpRoutes); // Podłączenie tras do kursów walut
app.use('/stripe', stripeRoutes);


// Testowa trasa
app.get('/', (req, res) => {
    res.send('Backend działa!');
});

// Obsługa błędów
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Coś poszło nie tak!' });
});

// Start serwera
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
