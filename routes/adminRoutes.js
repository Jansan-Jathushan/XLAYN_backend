

import express from 'express'
import multer from 'multer';
import User from '../Models/userModels.js';
import Product from '../Models/productModels.js';
const router = express.Router();

// ==================== User Management ====================

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user role
router.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==================== Product Management ====================

// Create a new product
router.post('/products', upload.single('image'), async (req, res) => {
    try {
        const newProduct = new Product({
            name: req.body.name,
            type: req.body.type,
            image: req.file.path,
        });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a product
router.put('/products/:id', upload.single('image'), async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            type: req.body.type,
            image: req.file ? req.file.path : undefined,
        }, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a product
router.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==================== Supplier Product Requests ====================

// Get all supplier product requests
router.get('/supplier-products', async (req, res) => {
    try {
        const requests = await SupplierRequest.find();
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Approve a supplier product request
router.put('/supplier-products/:id/approve', async (req, res) => {
    try {
        const request = await SupplierRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Create the product from the request
        const newProduct = new Product({
            name: request.productName,
            type: request.productType,
            image: request.productImage, // Assuming you have this in your request model
            // Add other product details as needed
        });

        await newProduct.save();

        // Delete the approved request
        await SupplierRequest.findByIdAndDelete(req.params.id);

        res.json({ message: 'Request approved and product created', product: newProduct });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Reject a supplier product request
router.put('/supplier-products/:id/reject', async (req, res) => {
    try {
        const request = await SupplierRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Delete the rejected request
        await SupplierRequest.findByIdAndDelete(req.params.id);

        res.json({ message: 'Request rejected' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});




// Get supplier requests
router.get('/supplier-requests', async (req, res) => {
  try {
    const requests = await SupplierRequest.find();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supplier requests', error });
  }
});

// Approve supplier request
// router.post('/approve-supplier/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const supplierRequest = await SupplierRequest.findById(id);
    
//     // Logic to change user role in your user database
//     // e.g., User.findByIdAndUpdate(supplierRequest.userId, { role: 'supplier' });
    
//     await supplierRequest.remove();
//     res.status(200).json({ message: 'Supplier request approved!' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error approving supplier request', error });
//   }
// });

router.post('/approve-supplier/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find the supplier request by id
      const supplierRequest = await SupplierRequest.findById(id);
      
      // If supplier request is not found
      if (!supplierRequest) {
        return res.status(404).json({ message: 'Supplier request not found' });
      }
  
      // Find the user associated with this supplier request
      const user = await User.findById(supplierRequest.userId);
      
      // If user is not found
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update user role to 'supplier'
      user.role = 'supplier';
      await user.save();
  
      // Remove the supplier request after approving
      await supplierRequest.remove();
  
      // Respond with success
      res.status(200).json({ message: 'Supplier request approved!' });
    } catch (error) {
      // Return a 500 error in case something goes wrong
      res.status(500).json({ message: 'Error approving supplier request', error });
    }
  });
  

export default router;

