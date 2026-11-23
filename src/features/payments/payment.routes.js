const express              = require('express');
const router               = express.Router();
const { protect, authorize } = require('../../middleware/auth.middleware');
const { ROLES }            = require('../../config/constants');
const ctrl                 = require('./payment.controller');

router.use(protect, authorize(ROLES.GUEST));

router.post('/mock-pay',     ctrl.mockPay);
router.post('/create-order', ctrl.createOrder);
router.post('/verify',       ctrl.verifyPayment);

module.exports = router;

