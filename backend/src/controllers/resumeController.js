/**
 * CONTROLLER - ResumeController
 * Gerencia as requisições HTTP e coordena Model + Validator.
 * 
 * PROTEÇÃO HISTORY MANIPULATION:
 * O padrão POST-REDIRECT-GET é implementado no frontend:
 * após POST bem-sucedido, o React navega para outra rota via
 * React Router, impedindo reenvio acidental do formulário.
 */
const Resume = require('../models/Resume');
const { validate } = require('../validators/resumeValidator');

const controller = {
    /**
     * GET /api/resumes
     * Retorna a listagem de currículos em JSON.
     */
    list(req, res) {
        const resumes = Resume.findAll();
        res.json(resumes);
    },

    /**
     * POST /api/resumes
     * Cria um novo currículo.
     * Valida dados, retorna 400 com erros ou 201 com o ID criado.
     */
    store(req, res) {
        const data = {
            name: (req.body.name || '').trim(),
            phone: (req.body.phone || '').trim(),
            email: (req.body.email || '').trim(),
            website: (req.body.website || '').trim(),
            experience: (req.body.experience || '').trim()
        };

        const errors = validate(data);

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        const id = Resume.create(data);
        res.status(201).json({ id });
    },

    /**
     * GET /api/resumes/:id
     * Retorna os detalhes de um currículo.
     */
    view(req, res) {
        const resume = Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ error: 'Currículo não encontrado.' });
        }

        res.json(resume);
    }
};

module.exports = controller;
