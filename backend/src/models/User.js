const db = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
    findByEmail(email) {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email) || null;
    },

    findById(id) {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id) || null;
    },

    create(email, password) {
        const hashed = bcrypt.hashSync(password, 10);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const stmt = db.prepare(`
            INSERT INTO users (email, password, email_verification_code)
            VALUES (?, ?, ?)
        `);
        const result = stmt.run(email, hashed, code);
        return { id: result.lastInsertRowid, code };
    },

    verifyEmail(email, code) {
        const user = User.findByEmail(email);
        if (!user || user.email_verification_code !== code) return false;
        const stmt = db.prepare('UPDATE users SET email_verified = 1, email_verification_code = NULL WHERE id = ?');
        stmt.run(user.id);
        return true;
    },

    setTwoFactorSecret(userId, secret) {
        const stmt = db.prepare('UPDATE users SET two_factor_secret = ? WHERE id = ?');
        stmt.run(secret, userId);
    },

    enableTwoFactor(userId) {
        const stmt = db.prepare('UPDATE users SET two_factor_enabled = 1 WHERE id = ?');
        stmt.run(userId);
    }
};

module.exports = User;
