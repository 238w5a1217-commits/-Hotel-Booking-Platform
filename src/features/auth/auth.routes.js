const express          = require('express');
const router           = express.Router();
const { loginLimiter } = require('../../middleware/rateLimiter');
const ctrl             = require('./auth.controller');

router.post('/register', ctrl.register);
router.post('/login',    loginLimiter, ctrl.login);
router.post('/refresh',  ctrl.refreshToken);

module.exports = router;

