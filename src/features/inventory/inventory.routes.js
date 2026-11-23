const express              = require('express');
const router               = express.Router();
const { protect, authorize } = require('../../middleware/auth.middleware');
const { ROLES }            = require('../../config/constants');
const ctrl                 = require('./inventory.controller');

router.use(protect, authorize(ROLES.PARTNER));
router.post('/',           ctrl.upsertInventory);
router.get('/:roomTypeId', ctrl.getInventory);

module.exports = router;

