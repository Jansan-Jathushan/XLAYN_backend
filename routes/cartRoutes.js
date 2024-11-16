import express from 'express';
import { addToCart, getCartById, updateCartItem, removeCartItem, clearCart } from '../controllers/cartControllers.js';

const router = express.Router();

// Route to add item to cart
router.post('/cart', addToCart);

// Route to get cart by userId
router.get('/cart/:userId', getCartById);

// Route to update cart item quantity by userId and productId
router.put('/cart', updateCartItem);

// Route to remove an item from the cart by userId and productId
router.delete('/cart/item', removeCartItem);

// Route to clear the entire cart by userId
router.delete('/cart/:userId', clearCart);

export default router;
