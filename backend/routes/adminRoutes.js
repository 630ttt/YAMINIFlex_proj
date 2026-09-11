const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  getDesigns,
  getDesignById,
  createDesign,
  updateDesign,
  deleteDesign,
} = require('../controllers/designController');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { getOrders, updateOrder } = require('../controllers/orderController');
const { getCustomers, getCustomerById } = require('../controllers/customerController');

router.use(protectAdmin);

// Designs
router.get('/designs', getDesigns);
router.get('/designs/:id', getDesignById);
router.post(
  '/designs',
  upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'fullImage', maxCount: 1 }]),
  createDesign
);
router.put(
  '/designs/:id',
  upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'fullImage', maxCount: 1 }]),
  updateDesign
);
router.delete('/designs/:id', deleteDesign);

// Categories
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', upload.single('image'), createCategory);
router.put('/categories/:id', upload.single('image'), updateCategory);
router.delete('/categories/:id', deleteCategory);

// Orders
router.get('/orders', getOrders);
router.put('/orders/:id', upload.single('finalDesignFile'), updateOrder);

// Customers
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);

module.exports = router;
