const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

if (process.env.MAIL_USER && process.env.MAIL_PASS) {
    transporter.verify().then(() => {
        console.log('[mail] Conectado ao servidor SMTP com sucesso.');
    }).catch(err => {
        console.error('[mail] Falha na conexão SMTP:', err.message);
    });
}

module.exports = transporter;
