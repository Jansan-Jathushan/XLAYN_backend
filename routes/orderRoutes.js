import express from 'express';
import { createOrder, getAllOrders, getOrdersByUserId } from '../controllers/orderControllers.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to create an order (checkout)
router.post('/orders',authenticateUser, createOrder);

// Route to get all orders
router.get('/ordersget', getAllOrders);

// Route to get orders by user ID
router.get('/orders/user/:userId', getOrdersByUserId);

export default router;
