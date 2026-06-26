const db = require('../config/database');
const bcrypt = require('bcryptjs');

const PASSWORD_HISTORY_LIMIT = 5;

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
    },

    updatePassword(userId, newHashedPassword) {
        const stmt = db.prepare('UPDATE users SET password = ? WHERE id = ?');
        stmt.run(newHashedPassword, userId);
        User.addPasswordHistory(userId, newHashedPassword);
    },

    addPasswordHistory(userId, hashedPassword) {
        const insert = db.prepare('INSERT INTO password_history (user_id, password) VALUES (?, ?)');
        insert.run(userId, hashedPassword);
        const del = db.prepare(`
            DELETE FROM password_history WHERE id IN (
                SELECT id FROM password_history WHERE user_id = ? ORDER BY created_at DESC LIMIT -1 OFFSET ?
            )
        `);
        del.run(userId, PASSWORD_HISTORY_LIMIT);
    },

    isPasswordInHistory(userId, newPassword) {
        const stmt = db.prepare('SELECT password FROM password_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
        const rows = stmt.all(userId, PASSWORD_HISTORY_LIMIT);
        return rows.some(row => bcrypt.compareSync(newPassword, row.password));
    },

    setResetCode(userId, code) {
        const stmt = db.prepare('UPDATE users SET reset_code = ? WHERE id = ?');
        stmt.run(code, userId);
    },

    findByResetCode(code) {
        const stmt = db.prepare('SELECT * FROM users WHERE reset_code = ?');
        return stmt.get(code) || null;
    },

    clearResetCode(userId) {
        const stmt = db.prepare('UPDATE users SET reset_code = NULL WHERE id = ?');
        stmt.run(userId);
    },

    updateName(userId, name) {
        const stmt = db.prepare('UPDATE users SET name = ? WHERE id = ?');
        stmt.run(name, userId);
    }
};

module.exports = User;
