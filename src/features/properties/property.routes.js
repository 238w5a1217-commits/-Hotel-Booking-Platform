const express              = require('express');
const router               = express.Router();
const { protect, authorize } = require('../../middleware/auth.middleware');
const { ROLES }            = require('../../config/constants');
const ctrl                 = require('./property.controller');

router.post('/',         protect, authorize(ROLES.PARTNER), ctrl.createProperty);
router.get('/my',        protect, authorize(ROLES.PARTNER), ctrl.getMyProperties);
router.put('/:id',       protect, authorize(ROLES.PARTNER), ctrl.updateProperty);
router.delete('/:id',    protect, authorize(ROLES.PARTNER), ctrl.deleteProperty);
router.get('/:id',       ctrl.getPropertyById);

module.exports = router;

