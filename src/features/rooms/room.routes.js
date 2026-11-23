const express              = require('express');
const router               = express.Router();
const { protect, authorize } = require('../../middleware/auth.middleware');
const { ROLES }            = require('../../config/constants');
const ctrl                 = require('./room.controller');

router.post('/:propertyId/rooms', protect, authorize(ROLES.PARTNER), ctrl.addRoomType);
router.get('/:propertyId/rooms',  ctrl.getRoomTypes);
router.put('/rooms/:roomId',      protect, authorize(ROLES.PARTNER), ctrl.updateRoomType);
router.delete('/rooms/:roomId',   protect, authorize(ROLES.PARTNER), ctrl.deleteRoomType);

module.exports = router;

