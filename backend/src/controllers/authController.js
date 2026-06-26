const User = require('../models/User');
const bcrypt = require('bcryptjs');
const otplib = require('otplib');
const qrcode = require('qrcode');
const { generateToken } = require('../middleware/auth');
const { sendVerificationCode, sendPasswordResetCode } = require('../services/mailService');

const PASSWORD_REGEX = /(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;

const controller = {
    register(req, res) {
        const { email, password } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({ error: 'E-mail inválido.' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres.' });
        }
        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ error: 'Senha deve conter pelo menos uma letra maiúscula e um caractere especial.' });
        }

        const existing = User.findByEmail(email.trim().toLowerCase());
        if (existing) {
            return res.status(409).json({ error: 'E-mail já cadastrado.' });
        }

        const { id, code } = User.create(email.trim().toLowerCase(), password);

        sendVerificationCode(email.trim().toLowerCase(), code);

        res.status(201).json({
            id,
            message: 'Cadastro realizado! Verifique seu e-mail com o código enviado.'
        });
    },

    verifyEmail(req, res) {
        const { email, code } = req.body;
        const ok = User.verifyEmail(email.trim().toLowerCase(), code);

        if (!ok) {
            return res.status(400).json({ error: 'Código de verificação inválido.' });
        }

        res.json({ message: 'E-mail verificado com sucesso!' });
    },

    login(req, res) {
        const { email, password } = req.body;
        const user = User.findByEmail(email.trim().toLowerCase());

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
        }

        if (!user.email_verified) {
            return res.status(403).json({
                error: 'E-mail não verificado.',
                requiresVerification: true,
                email: user.email
            });
        }

        if (user.two_factor_enabled) {
            return res.json({
                requiresTwoFactor: true,
                userId: user.id,
                message: 'Código 2FA necessário.'
            });
        }

        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name || user.email.split('@')[0] } });
    },

    twoFactorAuthenticate(req, res) {
        const { userId, code } = req.body;
        const user = User.findById(userId);

        if (!user || !user.two_factor_enabled || !user.two_factor_secret) {
            return res.status(400).json({ error: '2FA não configurado.' });
        }

        const result = otplib.verifySync({ token: code, secret: user.two_factor_secret, epochTolerance: 60 });
        if (!result.valid) {
            return res.status(401).json({ error: 'Código 2FA inválido.' });
        }

        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name || user.email.split('@')[0] } });
    },

    twoFactorSetup(req, res) {
        const { password } = req.body;
        const user = User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        if (!password || !bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({ error: 'Senha inválida.' });
        }

        const secret = user.two_factor_secret && !user.two_factor_enabled
            ? user.two_factor_secret
            : otplib.generateSecret();

        if (!user.two_factor_secret || user.two_factor_enabled) {
            User.setTwoFactorSecret(user.id, secret);
        }

        const uri = otplib.generateURI({ secret, issuer: 'Curriculos', label: user.email });

        qrcode.toDataURL(uri, (err, dataUrl) => {
            if (err) return res.status(500).json({ error: 'Erro ao gerar QR Code.' });
            res.json({ secret, qrcode: dataUrl });
        });
    },

    twoFactorVerify(req, res) {
        const { code } = req.body;
        const user = User.findById(req.userId);

        if (!user || !user.two_factor_secret) {
            return res.status(400).json({ error: '2FA não iniciado. Faça o setup primeiro.' });
        }

        const result = otplib.verifySync({ token: code, secret: user.two_factor_secret, epochTolerance: 60 });
        if (!result.valid) {
            return res.status(401).json({ error: 'Código inválido. Tente novamente.' });
        }

        User.enableTwoFactor(user.id);
        res.json({ message: '2FA ativado com sucesso!' });
    },

    changePassword(req, res) {
        const { currentPassword, newPassword } = req.body;
        const user = User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        if (!currentPassword || !bcrypt.compareSync(currentPassword, user.password)) {
            return res.status(400).json({ error: 'Senha atual inválida.' });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres.' });
        }
        if (!PASSWORD_REGEX.test(newPassword)) {
            return res.status(400).json({ error: 'Nova senha deve conter pelo menos uma letra maiúscula e um caractere especial.' });
        }

        if (User.isPasswordInHistory(user.id, newPassword)) {
            return res.status(400).json({ error: 'Esta senha já foi usada anteriormente. Escolha uma diferente.' });
        }

        const hashed = bcrypt.hashSync(newPassword, 10);
        User.updatePassword(user.id, hashed);

        res.json({ message: 'Senha alterada com sucesso!' });
    },

    verifyResetCode(req, res) {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'E-mail e código são obrigatórios.' });
        }

        const user = User.findByResetCode(code);
        if (!user || user.email !== email.trim().toLowerCase()) {
            return res.status(400).json({ error: 'Código de recuperação inválido.' });
        }

        res.json({ message: 'Código válido.' });
    },

    forgotPassword(req, res) {
        const { email } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({ error: 'E-mail inválido.' });
        }

        const user = User.findByEmail(email.trim().toLowerCase());

        if (user) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            User.setResetCode(user.id, code);
            sendPasswordResetCode(email.trim().toLowerCase(), code);
        }

        res.json({ message: 'Se o e-mail estiver cadastrado, você receberá um código de recuperação.' });
    },

    resetPassword(req, res) {
        const { email, code, newPassword } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'E-mail e código são obrigatórios.' });
        }

        const user = User.findByResetCode(code);
        if (!user || user.email !== email.trim().toLowerCase()) {
            return res.status(400).json({ error: 'Código de recuperação inválido.' });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres.' });
        }
        if (!PASSWORD_REGEX.test(newPassword)) {
            return res.status(400).json({ error: 'Nova senha deve conter pelo menos uma letra maiúscula e um caractere especial.' });
        }

        if (User.isPasswordInHistory(user.id, newPassword)) {
            return res.status(400).json({ error: 'Esta senha já foi usada anteriormente. Escolha uma diferente.' });
        }

        const hashed = bcrypt.hashSync(newPassword, 10);
        User.updatePassword(user.id, hashed);
        User.clearResetCode(user.id);

        res.json({ message: 'Senha redefinida com sucesso!' });
    },

    me(req, res) {
        const user = User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
        res.json({ id: user.id, email: user.email, name: user.name || user.email.split('@')[0], two_factor_enabled: !!user.two_factor_enabled });
    },

    updateProfile(req, res) {
        const { name } = req.body;
        const user = User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Nome é obrigatório.' });
        }

        User.updateName(req.userId, name.trim());
        res.json({ message: 'Perfil atualizado com sucesso!', name: name.trim() });
    }
};

module.exports = controller;
