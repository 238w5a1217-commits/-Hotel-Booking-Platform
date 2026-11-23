const express              = require('express');
const router               = express.Router();
const { protect, authorize } = require('../../middleware/auth.middleware');
const { ROLES }            = require('../../config/constants');
const ctrl                 = require('./admin.controller');

router.use(protect, authorize(ROLES.ADMIN));

router.get('/dashboard',                ctrl.getDashboard);
router.get('/properties',               ctrl.getProperties);
router.patch('/properties/:id/approve', ctrl.approveProperty);
router.patch('/properties/:id/reject',  ctrl.rejectProperty);
router.get('/users',                    ctrl.getAllUsers);
router.patch('/users/:id/block',        ctrl.blockUser);

module.exports = router;

