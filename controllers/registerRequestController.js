import Supplier from '../Models/supplierModel.js';
import Wholesaler from '../Models/wholesalerModel.js';
import asyncHandler from 'express-async-handler';

// Register Supplier
const registerSupplier = asyncHandler(async (req, res) => {
  const { username, businessName, email, password, address, bankAccountInfo } = req.body;

  // File paths from uploaded files
  const businessProof = req.files.businessProof ? req.files.businessProof[0].path : null;
  const storeImage = req.files.storeImage ? req.files.storeImage[0].path : null;

  // Check for missing required fields
  if (!username || !businessName || !businessProof || !storeImage || !email || !password || !address || !bankAccountInfo) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  // Check if the supplier already exists
  const supplierExists = await Supplier.findOne({ email });
  if (supplierExists) {
    res.status(400).json({ message: 'Supplier already exists' });
    return;
  }

  // Create a new supplier
  const supplier = await Supplier.create({
    username,
    businessName,
    businessProof,
    storeImage,
    email,
    password,
    address,
    bankAccountInfo
  });

  if (supplier) {
    res.status(201).json({
      message: 'Supplier registered successfully',
      supplierId: supplier._id,
    });
  } else {
    res.status(400).json({ message: 'Invalid supplier data' });
  }
});



// Register Wholesaler
const registerWholesaler = async (req, res) => {
  try {
    // Extracting fields from request body
    const { username, businessName, address, bankAccountInfo, email, password } = req.body;

    // Accessing files uploaded through multer
    const businessProof = req.files['businessProof'] ? req.files['businessProof'][0].path : null;
    const storeImage = req.files['storeImage'] ? req.files['storeImage'][0].path : null;

    // Check if all required fields and files are present
    if (!username || !businessName || !address || !bankAccountInfo || !email || !password || !businessProof || !storeImage) {
      return res.status(400).json({ message: 'All fields are required, including businessProof and storeImage.' });
    }

    // Create new wholesaler object
    const newWholesaler = new Wholesaler({
      username,
      businessName,
      address,
      businessProof,
      storeImage,
      bankAccountInfo,
      email,
      password
    });

    // Save wholesaler to the database
    await newWholesaler.save();

    // Success response
    res.status(201).json({ message: 'Wholesaler registration successful!' });
  } catch (error) {
    // Error handling
    res.status(400).json({ error: 'Error registering wholesaler.' });
  }
};

// Get Pending Supplier Requests
const getPendingSupplierRequests = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ status: 'pending' });
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching pending supplier requests.' });
  }
};

// Get Pending Wholesaler Requests
const getPendingWholesalerRequests = async (req, res) => {
  try {
    const wholesalers = await Wholesaler.find({ status: 'pending' });
    res.status(200).json(wholesalers);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching pending wholesaler requests.' });
  }
};

// Approve Supplier Request
const approveSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, { status: 'approved', role: 'supplier' }, { new: true });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }
    res.status(200).json({ message: 'Supplier approved successfully!', supplier });
  } catch (error) {
    res.status(400).json({ error: 'Error approving supplier.' });
  }
};

// Reject Supplier Request
const rejectSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }
    res.status(200).json({ message: 'Supplier rejected successfully!', supplier });
  } catch (error) {
    res.status(400).json({ error: 'Error rejecting supplier.' });
  }
};

// Approve Wholesaler Request
const approveWholesaler = async (req, res) => {
  try {
    const wholesaler = await Wholesaler.findByIdAndUpdate(req.params.id, { status: 'approved', role: 'wholesaler' }, { new: true });
    if (!wholesaler) {
      return res.status(404).json({ error: 'Wholesaler not found.' });
    }
    res.status(200).json({ message: 'Wholesaler approved successfully!', wholesaler });
  } catch (error) {
    res.status(400).json({ error: 'Error approving wholesaler.' });
  }
};

// Reject Wholesaler Request
const rejectWholesaler = async (req, res) => {
  try {
    const wholesaler = await Wholesaler.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!wholesaler) {
      return res.status(404).json({ error: 'Wholesaler not found.' });
    }
    res.status(200).json({ message: 'Wholesaler rejected successfully!', wholesaler });
  } catch (error) {
    res.status(400).json({ error: 'Error rejecting wholesaler.' });
  }
};


// Get all approved suppliers
const getApprovedSuppliers = async (req, res) => {
  try {
    const approvedSuppliers = await Supplier.find({ status: 'approved' });
    res.status(200).json(approvedSuppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching approved suppliers', error });
  }
};

// Get all rejected suppliers
 const getRejectedSuppliers = async (req, res) => {
  try {
    const rejectedSuppliers = await Supplier.find({ status: 'rejected' });
    res.status(200).json(rejectedSuppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rejected suppliers', error });
  }
};

// Get all approved wholesalers
 const getApprovedWholesalers = async (req, res) => {
  try {
    const approvedWholesalers = await Wholesaler.find({ status: 'approved' });
    res.status(200).json(approvedWholesalers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching approved wholesalers', error });
  }
};

// Get all rejected wholesalers
 const getRejectedWholesalers = async (req, res) => {
  try {
    const rejectedWholesalers = await Wholesaler.find({ status: 'rejected' });
    res.status(200).json(rejectedWholesalers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rejected wholesalers', error });
  }
};

export {
  registerSupplier,
  registerWholesaler,
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
};





























































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































  
