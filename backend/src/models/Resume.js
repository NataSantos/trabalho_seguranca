/**
 * MODEL - Resume
 * Responsável por todas as operações com o banco de dados.
 * 
 * PROTEÇÃO SQL INJECTION:
 * Todas as queries utilizam prepared statements com placeholders (?),
 * garantindo que os dados do usuário nunca sejam interpretados como SQL.
 */
const db = require('../config/database');

const Resume = {
    findAll() {
        const stmt = db.prepare('SELECT id, name, email FROM resumes ORDER BY created_at DESC');
        return stmt.all();
    },

    findById(id) {
        const stmt = db.prepare('SELECT * FROM resumes WHERE id = ?');
        return stmt.get(id);
    },

    create({ name, phone, email, website, experience }) {
        const stmt = db.prepare(`
            INSERT INTO resumes (name, phone, email, website, experience)
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = stmt.run(name, phone, email, website, experience);
        return result.lastInsertRowid;
    }
};

module.exports = Resume;
