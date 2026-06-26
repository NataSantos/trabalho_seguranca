const { Router } = require('express');
const controller = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.post('/api/auth/register', controller.register);
router.post('/api/auth/verify-email', controller.verifyEmail);
router.post('/api/auth/login', controller.login);
router.post('/api/auth/2fa/authenticate', controller.twoFactorAuthenticate);
router.post('/api/auth/2fa/setup', authenticate, controller.twoFactorSetup);
router.post('/api/auth/2fa/verify', authenticate, controller.twoFactorVerify);
router.put('/api/auth/password', authenticate, controller.changePassword);
router.post('/api/auth/forgot-password', controller.forgotPassword);
router.post('/api/auth/verify-reset-code', controller.verifyResetCode);
router.post('/api/auth/reset-password', controller.resetPassword);
router.get('/api/auth/me', authenticate, controller.me);
router.put('/api/auth/profile', authenticate, controller.updateProfile);

module.exports = router;
