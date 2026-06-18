const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'curriculo-app-secret-key-change-in-production';

function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '2h' });
}

function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Autenticação necessária.' });
    }

    try {
        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
}

module.exports = { generateToken, authenticate, JWT_SECRET };
