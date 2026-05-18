const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem
} = require('../controllers/cartController');

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/remove/:id', removeFromCart);
router.put('/update/:id', updateCartItem);

module.exports = router;