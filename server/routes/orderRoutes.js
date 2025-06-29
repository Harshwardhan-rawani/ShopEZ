const express = require('express');
const orderController = require('../controllers/orderController');
const router = express.Router();

router.post('/create-after-payment', orderController.createAfterPayment);
router.post('/cashfree', orderController.createCashfreeSession);
router.get('/user', orderController.getUserOrders);
router.get('/', orderController.getAll);
router.get('/:orderId/customer', orderController.getOrderCustomerDetails);
router.put('/:orderId/status', orderController.updateOrderStatus);

module.exports = router;
