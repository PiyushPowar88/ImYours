const express = require('express');
const router = express.Router();
const formController = require('../controllers/form.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// Public
router.get('/:serviceId', formController.getForm);

// Admin only
router.post('/', authMiddleware, adminMiddleware, formController.addField);
router.put('/reorder', authMiddleware, adminMiddleware, formController.reorderFields);
router.put('/:id', authMiddleware, adminMiddleware, formController.updateField);
router.delete('/:id', authMiddleware, adminMiddleware, formController.deleteField);

module.exports = router;