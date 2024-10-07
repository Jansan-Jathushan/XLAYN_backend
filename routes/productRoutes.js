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
  getAllApprovedProducts,
  getApprovedProductById
} from '../controllers/productControllers.js';
import { upload } from '../middleware/multer.js';
import { authenticateUser , protectAdmin } from '../middleware/authMiddleware.js';



const router = express.Router();

// Supplier routes

router.post('/supplier/add-products', upload.fields([
  { name: 'imageUrls', maxCount: 1 },
]),authenticateUser, createProduct); // Add Product
router.put('/supplier/products/:id',authenticateUser, updateProduct); // Update Product
router.delete('/supplier/products/:id',authenticateUser, deleteProduct); // Delete Product
router.get('/supplier/products/approved',authenticateUser, getApprovedProducts); // Get Approved Products
router.get('/supplier/products/rejected',authenticateUser, getRejectedProducts); // Get Rejected Products
router.get('/supplier/products/pending', authenticateUser, getPendingProducts); // Get Pending Products

// Admin routes
router.get('/admin/products/pending', getAdminPendingProducts); // Get Pending Products
router.post('/admin/products/:id/approve', approveProduct); // Approve Product
router.post('/admin/products/:id/reject', rejectProduct); // Reject Product
router.get('/admin/products/approved', getAdminApprovedProducts); // Get Approved Products
router.get('/admin/products/rejected', getAdminRejectedProducts); // Get Rejected Products
router.post('/admin/add-products', upload.array('imageUrls', 5), protectAdmin, (req, res, next) => {
  console.log(req.files); // Log the uploaded files
  next();
}, adminCreateProduct);
router.put('/admin/products/:id', adminUpdateProduct); // Update Product
router.delete('/admin/products/:id', adminDeleteProduct); // Delete Product

// User routs

router.get('/products', getAllApprovedProducts);  //User get approved product
router.get('/products/:id', getApprovedProductById);  //User get approved ById


export default router;
