import express from 'express';
const router = express.Router();
import {
  registerSupplier,
  supplierLogin,
  getSupplierById,
  registerWholesaler,
  wholesalerLogin,
  getWholesalerById,
  getPendingSupplierRequests,
  getPendingWholesalerRequests,
  approveSupplier,
  rejectSupplier,
  approveWholesaler,
  rejectWholesaler,
  getApprovedSuppliers,
  getRejectedSuppliers,
  getApprovedWholesalers,
  getRejectedWholesalers,
} from '../controllers/registerRequestController.js';
import { upload } from '../middleware/multer.js';



// Registration routes
router.post('/register-supplier', upload.fields([
  { name: 'businessProof', maxCount: 1 },
  { name: 'storeImage', maxCount: 1 }
]), registerSupplier);
router.post('/register-wholesaler', upload.fields([
  { name: 'businessProof', maxCount: 1 },
  { name: 'storeImage', maxCount: 1 }
]), registerWholesaler);

// Login routes
router.post('/supplier-login', supplierLogin);
router.post('/wholesaler-login', wholesalerLogin);


// Get pending requests
router.get('/supplier-requests', getPendingSupplierRequests);
router.get('/wholesaler-requests', getPendingWholesalerRequests);

// Admin approval and rejection routes for suppliers
router.put('/approve-supplier/:id', approveSupplier);
router.put('/reject-supplier/:id', rejectSupplier);

// Admin approval and rejection routes for wholesalers
router.put('/approve-wholesaler/:id', approveWholesaler);
router.put('/reject-wholesaler/:id', rejectWholesaler);


router.get('/approved-suppliers', getApprovedSuppliers);
router.get('/rejected-suppliers', getRejectedSuppliers);

// Define routes for wholesalers
router.get('/approved-wholesalers', getApprovedWholesalers);
router.get('/rejected-wholesalers', getRejectedWholesalers);

router.get('/get-supplier/:supplierId', getSupplierById);
router.get('/get-wholesaler/:wholesalerId', getWholesalerById);




export default router;