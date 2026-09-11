const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { createOrder, getOrderById, verifyOrderPayment } = require('../controllers/orderController');

router.post('/', upload.array('customerFiles', 5), createOrder);
router.post('/:id/verify-payment', verifyOrderPayment);
router.get('/:id', getOrderById);

module.exports = router;
