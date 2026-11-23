const express              = require('express');
const router               = express.Router();
const { protect, authorize } = require('../../middleware/auth.middleware');
const { ROLES }            = require('../../config/constants');
const ctrl                 = require('./booking.controller');

router.use(protect);

router.post('/',           authorize(ROLES.GUEST),   ctrl.createBooking);
router.get('/my',          authorize(ROLES.GUEST),   ctrl.getMyBookings);
router.get('/breakdown',   authorize(ROLES.GUEST),   ctrl.getPriceBreakdown);
router.post('/:id/cancel', authorize(ROLES.GUEST),   ctrl.cancelBooking);
router.get('/partner/all', authorize(ROLES.PARTNER), ctrl.getPartnerBookings);
router.get('/',            authorize(ROLES.ADMIN),   ctrl.getAllBookings);
router.get('/:id',         ctrl.getBookingById);

module.exports = router;

