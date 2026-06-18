const { Router } = require('express');
const controller = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.post('/api/auth/register', controller.register);
router.post('/api/auth/verify-email', controller.verifyEmail);
router.post('/api/auth/login', controller.login);
router.post('/api/auth/2fa/authenticate', controller.twoFactorAuthenticate);
router.get('/api/auth/2fa/setup', authenticate, controller.twoFactorSetup);
router.post('/api/auth/2fa/verify', authenticate, controller.twoFactorVerify);
router.get('/api/auth/me', authenticate, controller.me);

module.exports = router;
