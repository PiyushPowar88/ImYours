const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slot.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

router.get('/', slotController.getSlots);
router.get('/admin/all', authMiddleware, adminMiddleware, slotController.getAllSlotsAdmin);

router.post('/', authMiddleware, adminMiddleware, slotController.createSlot);
router.post('/bulk', authMiddleware, adminMiddleware, slotController.bulkCreateSlots);
router.put('/:id', authMiddleware, adminMiddleware, slotController.updateSlot);
router.delete('/:id', authMiddleware, adminMiddleware, slotController.deleteSlot);

module.exports = router;