// import express from 'express';
// import { getProducts, getProductById, createProduct, updateProducts, deleteProduct } from '../controllers/productControllers.js'; // Assuming you have these controllers
// import { protect,checkRole} from '../middleware/authMiddleware.js';
// import { upload } from '../middleware/multer.js'
// const router = express.Router();


// // Item-related routes with role-based access control
// router.get('/view', getProducts); // Pass the role to check in checkRole
// router.get('/view/:id', getProductById);
// router.post('/create', protect,checkRole(['admin', 'supplier']), upload.array("images", 2), createProduct);
// router.put('/update/:id', protect,checkRole(['admin', 'supplier']), updateProducts);
// router.delete('/delete/:id', protect,checkRole(['admin', 'supplier']), deleteProduct);



// export default router;

import express from 'express';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getApprovedProducts,
  getRejectedProducts,
  getPendingProducts,
  getAdminPendingProducts,
  approveProduct,
  rejectProduct,
  getAdminApprovedProducts,
  getAdminRejectedProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from '../controllers/productControllers.js';
import { upload } from '../middleware/multer.js';
import { authenticateUser } from '../middleware/authMiddleware.js';



const router = express.Router();

// Supplier routes

router.post('/supplier/products', upload.fields([
  { name: 'imageUrls', maxCount: 1 },
]),authenticateUser, createProduct); // Add Product
router.put('/supplier/products/:id', updateProduct); // Update Product
router.delete('/supplier/products/:id', deleteProduct); // Delete Product
router.get('/supplier/products/approved', getApprovedProducts); // Get Approved Products
router.get('/supplier/products/rejected', getRejectedProducts); // Get Rejected Products
router.get('/supplier/products/pending', getPendingProducts); // Get Pending Products

// Admin routes
router.get('/admin/products/pending', getAdminPendingProducts); // Get Pending Products
router.post('/admin/products/:id/approve', approveProduct); // Approve Product
router.post('/admin/products/:id/reject', rejectProduct); // Reject Product
router.get('/admin/products/approved', getAdminApprovedProducts); // Get Approved Products
router.get('/admin/products/rejected', getAdminRejectedProducts); // Get Rejected Products
router.post('/admin/products', upload.fields([
  { name: 'imageUrls', maxCount: 1 },
]), adminCreateProduct); // Add Product
router.put('/admin/products/:id', adminUpdateProduct); // Update Product
router.delete('/admin/products/:id', adminDeleteProduct); // Delete Product

export default router;
