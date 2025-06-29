const express = require('express');
const productController = require('../controllers/productController');
const router = express.Router();

router.get('/', productController.getAll);
router.get('/by-category', productController.getByCategory);
router.post('/recommended', productController.getRecommended);
router.get('/:id', productController.getOne);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.remove);

module.exports = router;
