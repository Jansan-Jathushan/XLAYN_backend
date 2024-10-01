// // controllers/userRoles.js
// import productModels from "../Models/productModels.js"
// import cloudinary from "../utils/cloudinary.js";
// // Function to get all items
// export const getProducts = async (req, res) => {
//     try {
//       const items = await productModels.find();
//       res.status(200).json(items);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server error');
//     }
//   };
  
//   // Function to get an item by ID
//   export const getProductById = async (req, res) => {
//     try {
//       const item = await productModels.findById(req.params.id);
//       if (!item) {
//         return res.status(404).json({ msg: 'Product not found' });
//       }
//       res.status(200).json(item);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server error');
//     }
//   };
  
 
//   export const createProduct = async (req, res) => {
//     const { name, type, items} = req.body;
//       const file=req.files;
//       console.log(file);

//       const uploader = async(path) => { 
//         const res=await cloudinary.uploader.upload(path);
//         console.log(res);
//         return res.secure_url
//       };
//       const urls = [];
//       const files = req.files;
//       for (const file of files) {
//         const { path } = file;
//         const newpath = await uploader(path);
//         console.log(newpath);
//         urls.push(newpath);
//         // fs.unlinkSync(path);
//       }
//     console.log(urls);

//     try {
//       const item = new productModels({ name, type, items,
//         imageUrls:urls });

//       await item.save();
//       res.status(200).json(item);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('server error');
//     }
//   };

//   // export const createProduct = async (req, res) => {
//   //   try {
//   //     const file = req.file;  // For a single file, req.file is used
//   //     if (!file) {
//   //       return res.status(400).json({ message: 'No file uploaded' });
//   //     }
  
//   //     const result = await cloudinary.uploader.upload(file.path); // Upload the file to Cloudinary
  
//   //     // Handle the uploaded file result
//   //     return res.status(200).json({ message: 'Product created successfully', imageUrl: result.secure_url });
  
//   //   } catch (error) {
//   //     return res.status(500).json({ message: error.message });
//   //   }
//   // };
  
//   // Function to update an item
  
//   export const updateProducts = async (req, res) => {
//     try {
//       let item = await productModels.findById(req.params.id);
//       if (!item) {
//         return res.status(404).json({ msg: 'Product not found' });
//       }
  
//       // Update item details
//       item = await productModels.findByIdAndUpdate(req.params.id, req.body, { new: true });
  
//       res.status(200).json(item);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server error');
//     }
//   };


//   export const deleteProduct = async (req, res) => {
//     try {
//       let item = await productModels.findById(req.params.id);
//       if (!item) {
//         return res.status(404).json({ msg: 'Product not found' });
//       }
  
//       // delete item details
//       item = await productModels.findByIdAndDelete(req.params.id, { new: true });
  
//       res.status(200).json({message:"product deleted",item:item});
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server error');
//     }
//   };



import productModels from "../Models/productModels.js";
import cloudinary from "../utils/cloudinary.js";
import asyncHandler from 'express-async-handler';
import nodemailer from "nodemailer";

// Setup Nodemailers
// const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Using environment variable
    pass: process.env.GMAIL_PASS, // Using environment variable
  },
});


// Function to notify supplier
const notifySupplier = async (supplierEmail, productName, status) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: supplierEmail,
    subject: `Your product "${productName}" has been ${status}`,
    text: `Your product "${productName}" has been ${status} by the admin.`,
  };

  await transporter.sendMail(mailOptions);
};

// Supplier: Add Product
export const createProduct = async (req, res) => {
  const { name, type, weight, price, stock, description } = req.body;
  const SupplierId = req.user.id;  // Assuming req.user contains the logged-in supplier's data

// console.log(req.body);
  const imageUrls = req.files['imageUrls'] && req.files['imageUrls'].length > 0 ? req.files['imageUrls'][0].path : null;

try {
  // Check if file is uploaded
  if (!imageUrls) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }
  console.log(req.files);

    // Create a new product
    const item = new productModels({
      name,
      type,
      weight,
      price,
      stock,
      description,
      imageUrls, // Store the image path
      supplier: SupplierId,
      status: 'pending', // Set initial status to pending
    });

    // Save the product in the database
    await item.save();

    res.status(200).json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Supplier: Update Product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, type, weight, price, stock, description } = req.body;

  try {
    const item = await productModels.findById(id);
    if (!item) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Update the product details only if they are provided
    if (name) item.name = name;
    if (type) item.type = type;
    if (weight) item.weight = weight;
    if (price) item.price = price;
    if (stock) item.stock = stock;
    if (description) item.description = description;

    await item.save();
    res.status(200).json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// Supplier: Delete Product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await productModels.findById(id);
    if (!item) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    await productModels.findByIdAndDelete(id);
    res.status(200).json({ msg: 'Product deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Supplier: Get Approved Products
export const getApprovedProducts = async (req, res) => {
  const supplierId = req.user.id; // Assuming you have user information in req.user
  try {
    const items = await productModels.find({ supplier: supplierId, status: 'approved' });
    res.status(200).json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Supplier: Get Rejected Products
export const getRejectedProducts = async (req, res) => {
  const supplierId = req.user.id;
  try {
    const items = await productModels.find({ supplier: supplierId, status: 'rejected' });
    res.status(200).json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Supplier: Get Pending Products
export const getPendingProducts = async (req, res) => {
  console.log(req.user.id);
  const supplierId = req.user;
  try {
    const items = await productModels.find({ supplier: supplierId, status: 'pending' });
    res.status(200).json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Admin: Get Pending Products
export const getAdminPendingProducts = async (req, res) => {
  try {
    const items = await productModels.find({ status: 'pending' });
    res.status(200).json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Admin: Approve Product
export const approveProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await productModels.findById(id);
    if (!item) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    item.status = 'approved';
    await item.save();
    await notifySupplier(item.supplier.email, item.name, 'approved'); // Notify supplier

    res.status(200).json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Admin: Reject Product
export const rejectProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await productModels.findById(id);
    if (!item) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    item.status = 'rejected';
    await item.save();
    await notifySupplier(item.supplier.email, item.name, 'rejected'); // Notify supplier

    res.status(200).json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Admin: Get Approved Products
export const getAdminApprovedProducts = async (req, res) => {
  try {
    const items = await productModels.find({ status: 'approved' });
    res.status(200).json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Admin: Get Rejected Products
export const getAdminRejectedProducts = async (req, res) => {
  try {
    const items = await productModels.find({ status: 'rejected' });
    res.status(200).json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Admin: Add Product
export const adminCreateProduct = async (req, res) => {
  const { name, type, weight, price, stock, description, supplier } = req.body;

  // Handle multiple image uploads, similar to supplier logic
  const imageUrls = req.files['imageUrls'] && req.files['imageUrls'].length > 0 ? req.files['imageUrls'][0].path : null;

  try {
    // Check if the file is uploaded
    if (!imageUrls) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    console.log(req.files); // Debugging to see uploaded files

    // Create a new product
    const item = new productModels({
      name,
      type,
      weight,
      price,
      stock,
      description,
      imageUrls, // Store the image path
      supplier,
      status: 'approved', // Directly approved by admin
    });

    // Save the product in the database
    await item.save();

    res.status(200).json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
// Admin: Update Product
export const adminUpdateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, type, weight, price, stock, description } = req.body;

  try {
    const item = await productModels.findById(id);
    if (!item) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Update the product details
    item.name = name;
    item.type = type;
    item.weight = weight;
    item.price = price;
    item.stock = stock;
    item.description = description;

    await item.save();
    res.status(200).json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Admin: Delete Product
export const adminDeleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await productModels.findById(id);
    if (!item) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    await productModels.findByIdAndDelete(id);
    res.status(200).json({ msg: 'Product deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
