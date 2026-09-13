// const express = require('express');
// const router = express.Router();
// const serviceController = require('../controllers/service.controller');
// const authMiddleware = require('../middleware/auth.middleware');
// const adminMiddleware = require('../middleware/admin.middleware');
// const upload = require('../middleware/upload.middleware');

// // Public
// router.get('/', serviceController.getServices);
// router.get('/:id', serviceController.getServiceById);

// // Admin only
// router.post('/', authMiddleware, adminMiddleware, upload.single('image'), serviceController.createService);
// router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), serviceController.updateService);
// router.delete('/:id', authMiddleware, adminMiddleware, serviceController.deleteService);
// router.get('/admin/all', authMiddleware, adminMiddleware, serviceController.getServices);

// module.exports = router;

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const upload = require('../middleware/upload.middleware');

const serviceImages = upload.fields([
//   { name: 'image', maxCount: 1 },
  { name: 'hostPhoto', maxCount: 1 },
]);

router.get('/admin/all', authMiddleware, adminMiddleware, serviceController.getServices);
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);

router.post('/', authMiddleware, adminMiddleware, serviceImages, serviceController.createService);
router.put('/:id', authMiddleware, adminMiddleware, serviceImages, serviceController.updateService);
router.delete('/:id', authMiddleware, adminMiddleware, serviceController.deleteService);

module.exports = router;