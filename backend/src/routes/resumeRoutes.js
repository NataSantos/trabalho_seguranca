const { Router } = require('express');
const controller = require('../controllers/resumeController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/api/resumes', authenticate, controller.list);
router.post('/api/resumes', authenticate, controller.store);
router.get('/api/resumes/:id', authenticate, controller.view);

module.exports = router;
