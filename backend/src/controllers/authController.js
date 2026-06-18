const User = require('../models/User');
const bcrypt = require('bcryptjs');
const otplib = require('otplib');
const qrcode = require('qrcode');
const { generateToken } = require('../middleware/auth');

const controller = {
    register(req, res) {
        const { email, password } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({ error: 'E-mail inválido.' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres.' });
        }

        const existing = User.findByEmail(email.trim().toLowerCase());
        if (existing) {
            return res.status(409).json({ error: 'E-mail já cadastrado.' });
        }

        const { id, code } = User.create(email.trim().toLowerCase(), password);

        res.status(201).json({
            id,
            message: 'Cadastro realizado! Verifique seu e-mail com o código enviado.',
            code // Em produção, enviar por e-mail
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
        res.json({ token, user: { id: user.id, email: user.email } });
    },

    twoFactorAuthenticate(req, res) {
        const { userId, code } = req.body;
        const user = User.findById(userId);

        if (!user || !user.two_factor_enabled || !user.two_factor_secret) {
            return res.status(400).json({ error: '2FA não configurado.' });
        }

        const result = otplib.verifySync({ token: code, secret: user.two_factor_secret, window: 2 });
        if (!result.valid) {
            return res.status(401).json({ error: 'Código 2FA inválido.' });
        }

        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, email: user.email } });
    },

    twoFactorSetup(req, res) {
        const user = User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        // Reusa secret existente se 2FA ainda não foi ativado (evita race condition no StrictMode)
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

        const result = otplib.verifySync({ token: code, secret: user.two_factor_secret, window: 2 });
        if (!result.valid) {
            return res.status(401).json({ error: 'Código inválido. Tente novamente.' });
        }

        User.enableTwoFactor(user.id);
        res.json({ message: '2FA ativado com sucesso!' });
    },

    me(req, res) {
        const user = User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
        res.json({ id: user.id, email: user.email, two_factor_enabled: !!user.two_factor_enabled });
    }
};

module.exports = controller;
