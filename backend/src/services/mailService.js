const transporter = require('../config/mail');

function sendEmail(to, subject, html) {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
        console.warn('[mail] MAIL_USER/MAIL_PASS não configurados. Email não enviado.');
        return Promise.resolve();
    }

    console.log('[mail] Enviando e-mail para', to, '- assunto:', subject);

    return transporter.sendMail({
        from: `"Currículos" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
        to,
        subject,
        html,
    }).then(info => {
        console.log('[mail] E-mail enviado com sucesso para', to, '| ID:', info.messageId);
    }).catch(err => {
        console.error('[mail] Erro ao enviar e-mail para', to, ':', err.message);
        if (err.response) console.error('[mail] Resposta do servidor:', err.response);
    });
}

function sendVerificationCode(email, code) {
    return sendEmail(
        email,
        'Código de Verificação - Currículos',
        `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #1e293b;">Verificação de E-mail</h2>
            <p style="color: #475569; font-size: 14px;">Seu código de verificação é:</p>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
                <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #1e293b;">${code}</span>
            </div>
            <p style="color: #94a3b8; font-size: 12px;">Este código expira em 10 minutos.</p>
        </div>`
    );
}

function sendPasswordResetCode(email, code) {
    return sendEmail(
        email,
        'Recuperação de Senha - Currículos',
        `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #1e293b;">Recuperação de Senha</h2>
            <p style="color: #475569; font-size: 14px;">Seu código de recuperação é:</p>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
                <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #1e293b;">${code}</span>
            </div>
            <p style="color: #94a3b8; font-size: 12px;">Este código expira em 10 minutos.</p>
        </div>`
    );
}

module.exports = { sendVerificationCode, sendPasswordResetCode };
