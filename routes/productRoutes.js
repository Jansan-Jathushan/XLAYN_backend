import express from 'express';
import { getProducts, getProductById, createProduct, updateProducts, deleteProduct } from '../controllers/productControllers.js'; // Assuming you have these controllers
import { protect,checkRole} from '../middleware/authMiddleware.js';
const router = express.Router();


// Item-related routes with role-based access control
router.get('/view', getProducts); // Pass the role to check in checkRole
router.get('/view/:id', getProductById);
router.post('/create', protect,checkRole(['admin']), createProduct);
router.put('/update/:id', protect,checkRole(['admin']), updateProducts);
router.delete('/delete/:id', protect,checkRole(['admin']), deleteProduct);



export default router;