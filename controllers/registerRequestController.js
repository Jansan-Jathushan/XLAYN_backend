import Supplier from '../Models/supplierModel.js';
import Wholesaler from '../Models/wholesalerModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import cloudinary from "../config/cloudinaryConfig.js";
import dotenv from 'dotenv';
import { uploadToCloudinary } from '../middleware/multer.js'; // Assuming `uploadToCloudinary` is in `utils/upload.js`


dotenv.config(); // Load environment variables from .env file


// Setup Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your email
    pass: process.env.GMAIL_PASS,    // App password from Gmail
  },
});

// Send email function
const sendEmail = (email, subject, text) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email: ', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};



// Register Supplier
// const registerSupplier = asyncHandler(async (req, res) => {
//   const { username, businessName, email, password, address, bankAccountInfo } = req.body;

//   // Upload business proof to Cloudinary
//   let businessProofUrl = null;
// if (req.files.businessProof) {
//   try {
//     const result = await cloudinary.uploader.upload(req.files.businessProof[0].path, {
//       folder: 'suppliers/business_proofs',
//     });
//     businessProofUrl = result.secure_url; // Get the URL from Cloudinary
//   } catch (error) {
//     return res.status(500).json({ message: 'Error uploading business proof', error });
//   }
// }

// let storeImageUrl = null;
// if (req.files.storeImage) {
//   try {
//     const result = await cloudinary.uploader.upload(req.files.storeImage[0].path, {
//       folder: 'suppliers/store_images',
//     });
//     storeImageUrl = result.secure_url; // Get the URL from Cloudinary
//   } catch (error) {
//     return res.status(500).json({ message: 'Error uploading store image', error });
//   }
// }


//   // Check for missing required fields
//   if (!username || !businessName || !businessProofUrl || !storeImageUrl || !email || !password || !address || !bankAccountInfo) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }

//   // Check if the supplier already exists
//   const supplierExists = await Supplier.findOne({ email });
//   if (supplierExists) {
//     return res.status(400).json({ message: 'Supplier already exists' });
//   }

//   // Hash the password before saving
//   const salt = await bcrypt.genSalt(10); // Generate a salt
//   const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

//   // Create a new supplier
//   const supplier = await Supplier.create({
//     username,
//     businessName,
//     businessProof: businessProofUrl, // Save the Cloudinary URL
//     storeImage: storeImageUrl, // Save the Cloudinary URL
//     email,
//     password: hashedPassword,
//     address,
//     bankAccountInfo
//   });

//   if (supplier) {
//     res.status(201).json({
//       message: 'Supplier registered successfully',
//       supplierId: supplier._id,
//     });
//   } else {
//     res.status(400).json({ message: 'Invalid supplier data' });
//   }
// });


const registerSupplier = asyncHandler(async (req, res) => {
  const { username, businessName, email, password, address, bankAccountInfo } = req.body;

  // Validate required fields
  if (!username || !businessName || !email || !password || !address || !bankAccountInfo) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Check if the supplier already exists
  const supplierExists = await Supplier.findOne({ email });
  if (supplierExists) {
    return res.status(400).json({ success: false, message: 'Supplier already exists' });
  }

  let businessProofUrl = null;
  let storeImageUrl = null;

  try {
    // Upload files to Cloudinary
    if (req.files && req.files.businessProof) {
      businessProofUrl = await uploadToCloudinary(req.files.businessProof[0].buffer, 'suppliers/business_proofs');
    }

    if (req.files && req.files.storeImage) {
      storeImageUrl = await uploadToCloudinary(req.files.storeImage[0].buffer, 'suppliers/store_images');
    }

    // Validate uploaded files
    if (!businessProofUrl || !storeImageUrl) {
      return res.status(400).json({ success: false, message: 'Business proof and store image are required' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a new supplier
  const supplier = await Supplier.create({
    username,
    businessName,
    businessProof: businessProofUrl,
    storeImage: storeImageUrl,
    email,
    password: hashedPassword,
    address,
    bankAccountInfo,
  });

  if (supplier) {
    res.status(201).json({
      success: true,
      message: 'Supplier registered successfully',
      supplierId: supplier._id,
    });
  } else {
    res.status(400).json({ success: false, message: 'Invalid supplier data' });
  }
});



// Supplier login
const supplierLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password presence
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const supplier = await Supplier.findOne({ email });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    if (supplier.status !== 'approved') {
      return res.status(403).json({ message: 'Supplier not approved' });
    }

    const isMatch = await bcrypt.compare(password, supplier.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with the supplier role
    const token = jwt.sign(
      { id: supplier._id, role: 'supplier' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      supplier: {
        id: supplier._id,
        username: supplier.username,
        email: supplier.email,
        role: supplier.role,
        status: supplier.status,
      },
    });
  } catch (error) {
    console.error("Error during supplier login:", error);
    res.status(500).json({ message: 'Server error' });
  }
});



const getSupplierById = asyncHandler(async (req, res) => {
  const { supplierId } = req.params;

  try {
    // Find the supplier by their ID
    const supplier = await Supplier.findById(supplierId);

    // Check if supplier exists
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Return the supplier details
    res.status(200).json({
      supplierId: supplier._id,
      username: supplier.username,
      businessName: supplier.businessName,
      businessProof: supplier.businessProof,
      storeImage: supplier.storeImage,
      email: supplier.email,
      address: supplier.address,
      bankAccountInfo: supplier.bankAccountInfo,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving supplier details', error });
  }
});



// Register Wholesaler
// const registerWholesaler = async (req, res) => {
//   try {
//     // Extracting fields from request body
//     const { username, businessName, address, bankAccountInfo, email, password } = req.body;

//     // Upload business proof to Cloudinary
//     let businessProofUrl = null;
//     if (req.files['businessProof']) {
//       try {
//         const result = await cloudinary.uploader.upload(req.files['businessProof'][0].path, {
//           folder: 'wholesalers/business_proofs', // Optional: Specify folder
//         });
//         businessProofUrl = result.secure_url; // Get the secure URL of the uploaded file
//       } catch (error) {
//         return res.status(500).json({ message: 'Error uploading business proof', error: error.message });
//       }
//     }

//     // Upload store image to Cloudinary
//     let storeImageUrl = null;
//     if (req.files['storeImage']) {
//       try {
//         const result = await cloudinary.uploader.upload(req.files['storeImage'][0].path, {
//           folder: 'wholesalers/store_images', // Optional: Specify folder
//         });
//         storeImageUrl = result.secure_url; // Get the secure URL of the uploaded file
//       } catch (error) {
//         return res.status(500).json({ message: 'Error uploading store image', error: error.message });
//       }
//     }

//     // Check if all required fields and files are present
//     if (!username || !businessName || !address || !bankAccountInfo || !email || !password || !businessProofUrl || !storeImageUrl) {
//       return res.status(400).json({ message: 'All fields are required, including businessProof and storeImage.' });
//     }

//     // Hash the password before saving
//     const salt = await bcrypt.genSalt(10); // Generate a salt
//     const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

//     // Create new wholesaler object
//     const newWholesaler = new Wholesaler({
//       username,
//       businessName,
//       address,
//       businessProof: businessProofUrl,  // Use Cloudinary URL
//       storeImage: storeImageUrl,  // Use Cloudinary URL
//       bankAccountInfo,
//       email,
//       password: hashedPassword,
//     });

//     // Save wholesaler to the database
//     await newWholesaler.save();

//     // Success response
//     res.status(201).json({ message: 'Wholesaler registration successful!' });
//   } catch (error) {
//     // Error handling
//     res.status(400).json({ error: 'Error registering wholesaler.', details: error.message });
//   }
// };


const registerWholesaler = asyncHandler(async (req, res) => {
  const { username, businessName, address, bankAccountInfo, email, password } = req.body;

  // Validate required fields
  if (!username || !businessName || !address || !bankAccountInfo || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  let businessProofUrl = null;
  let storeImageUrl = null;

  try {
    // Upload files to Cloudinary
    if (req.files && req.files.businessProof) {
      businessProofUrl = await uploadToCloudinary(req.files.businessProof[0].buffer, 'wholesalers/business_proofs');
    }

    if (req.files && req.files.storeImage) {
      storeImageUrl = await uploadToCloudinary(req.files.storeImage[0].buffer, 'wholesalers/store_images');
    }

    // Validate uploaded files
    if (!businessProofUrl || !storeImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Business proof and store image uploads are required.',
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new wholesaler object
    const newWholesaler = await Wholesaler.create({
      username,
      businessName,
      address,
      businessProof: businessProofUrl,
      storeImage: storeImageUrl,
      bankAccountInfo,
      email,
      password: hashedPassword,
    });

    // Success response
    res.status(201).json({
      success: true,
      message: 'Wholesaler registration successful!',
      wholesalerId: newWholesaler._id,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error registering wholesaler.', details: error.message });
  }
});


// Wholesaler login
const wholesalerLogin = asyncHandler(async (req, res) => {

  const { email, password } = req.body;

  console.log("Password:", password); // Log the password extracted

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }


  try {
    const wholesaler = await Wholesaler.findOne({ email });

    if (!wholesaler) {
      return res.status(404).json({ message: 'Wholesaler not found' });
    }

    // Check if wholesaler is approved
    if (wholesaler.status !== 'approved') {
      return res.status(403).json({ message: 'Your account is not approved yet' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, wholesaler.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: wholesaler._id, role: 'wholesaler' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Wholesaler login successful',
      token,
      wholesaler: {
        id: wholesaler._id,
        email: wholesaler.email,
        role: wholesaler.role,
        status: wholesaler.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in wholesaler', error });
  }
});


const getWholesalerById = asyncHandler(async (req, res) => {
  const { wholesalerId } = req.params;

  try {
    // Find the wholesaler by their ID
    const wholesaler = await Wholesaler.findById(wholesalerId);

    // Check if the wholesaler exists
    if (!wholesaler) {
      return res.status(404).json({ message: 'Wholesaler not found' });
    }

    // Return the wholesaler details
    res.status(200).json({
      wholesalerId: wholesaler._id,
      username: wholesaler.username,
      businessName: wholesaler.businessName,
      businessProof: wholesaler.businessProof,
      storeImage: wholesaler.storeImage,
      email: wholesaler.email,
      address: wholesaler.address,
      bankAccountInfo: wholesaler.bankAccountInfo,
      createdAt: wholesaler.createdAt,
      updatedAt: wholesaler.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving wholesaler details', error: error.message });
  }
});



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

    // Send approval email
    sendEmail(supplier.email, 'Supplier Approved', 'Your supplier request has been approved.');

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

    // Send rejection email
    sendEmail(supplier.email, 'Supplier Rejected', 'Your supplier request has been rejected.');

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

    // Send approval email
    sendEmail(wholesaler.email, 'Wholesaler Approved', 'Your wholesaler request has been approved.');

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

    // Send rejection email
    sendEmail(wholesaler.email, 'Wholesaler Rejected', 'Your wholesaler request has been rejected.');

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
  
};





























































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































  

