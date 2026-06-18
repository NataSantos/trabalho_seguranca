const express = require('express');
const resumeRoutes = require('./routes/resumeRoutes');
const authRoutes = require('./routes/authRoutes');
const { securityHeaders } = require('./middleware/security');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(securityHeaders);

app.use(authRoutes);
app.use(resumeRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada.' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor.' });
});

module.exports = app;
