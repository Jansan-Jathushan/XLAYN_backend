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
import cloudinary from "../config/cloudinaryConfig.js";
import asyncHandler from 'express-async-handler';
import nodemailer from "nodemailer";
// import { authenticateUser } from '../middleware/authMiddleware.js';

import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file
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
// export const createProduct = async (req, res) => {
//   const { name, type, weight, price, stock, description } = req.body;
//   const imageUrls = req.files && req.files.length > 0 
//     ? req.files.map(file => file.path)
//     : [];



//   try {
//     // Check if file is uploaded
//     if (!imageUrls) {
//       return res.status(400).json({ msg: 'No file uploaded' });
//     }

//     // Use the authenticated supplier data from req.user
//     const supplierId = req.user._id; 
//     const businessName = req.user.businessName; 

//     // Create a new product
//     const item = new productModels({
//       name,
//       type,
//       weight,
//       price,
//       stock,
//       description,
//       imageUrls, // Store the image path
//       supplier: supplierId, // Automatically assign the supplier ID
//       businessName, // Automatically assign the supplier's business name
//       status: 'pending', // Set initial status to pending
//     });

//     // Save the product in the database
//     await item.save();

//     res.status(200).json(item);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };



export const createProduct = async (req, res) => {
  const { name, type, weight, price, stock, description } = req.body;

  try {
    // Verify that files have been uploaded
    // if (!req.files || req.files.length === 0) {
    //   return res.status(400).json({ msg: 'No files uploaded' });
    // }

    // Upload each file to Cloudinary and collect URLs
    // const imageUrls = [];
    // for (const file of req.files) {
    //   const result = await cloudinary.uploader.upload(file.path, {
    //     folder: 'products', // Organize files in a 'products' folder on Cloudinary
    //   });
    //   imageUrls.push(result.secure_url); // Save each URL to the imageUrls array
    // }

    const imageUrls = await Promise.all(
      req.files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: 'products',
        }).then((result) => result.secure_url)
      )
    );

    // Retrieve authenticated supplier data
    const supplierId = req.user._id;
    const businessName = req.user.businessName;

    // Create a new product with the supplier data and uploaded image URLs
    const item = new productModels({
      name,
      type,
      weight,
      price,
      stock,
      description,
      imageUrls, // Cloudinary URLs for images
      supplier: supplierId,
      businessName,
      status: 'pending',
    });

    // Save the new product to the database
    await item.save();

    // Respond with the saved product
    res.status(201).json({ success: true, product: item });
  } catch (err) {
    console.error('Error in createProduct:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Supplier: Update Product
// export const updateProduct = async (req, res) => {
//   const { id } = req.params;
//   const { name, type, weight, price, stock, description } = req.body;

//   try {
//     // Find the product by ID
//     const item = await productModels.findById(id);
//     if (!item) {
//       return res.status(404).json({ msg: 'Product not found' });
//     }

//     // Validate if the logged-in supplier is the owner of the product
//     const supplierId = req.user._id; // Assuming you have the supplier ID in req.user
//     if (item.supplier.toString() !== supplierId.toString()) {
//       return res.status(403).json({ msg: 'Not authorized to update this product' });
//     }

//     // Update the product details only if they are provided
//     if (name) item.name = name;
//     if (type) item.type = type;
//     if (weight) item.weight = weight;
//     if (price) item.price = price;
//     if (stock) item.stock = stock;
//     if (description) item.description = description;

//     // Handle image upload
//     if (req.files && req.files.length > 0) {
//       const imageUrls = req.files.map(file => file.path); // Get image paths
//       item.imageUrls = imageUrls; // Update the image URLs
//     }

//     // Save the updated product in the database
//     await item.save();

//     res.status(200).json(item);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, type, weight, price, stock, description } = req.body;

  try {
    // Find the product by ID
    const item = await productModels.findById(id);
    if (!item) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Validate if the logged-in supplier is the owner of the product
    const supplierId = req.user._id; // Assuming you have the supplier ID in req.user
    if (item.supplier.toString() !== supplierId.toString()) {
      return res.status(403).json({ msg: 'Not authorized to update this product' });
    }

    // Update the product details only if they are provided
    if (name) item.name = name;
    if (type) item.type = type;
    if (weight) item.weight = weight;
    if (price) item.price = price;
    if (stock) item.stock = stock;
    if (description) item.description = description;

    // Handle image upload to Cloudinary if files are provided
    if (req.files && req.files.length > 0) {
      // Upload new images to Cloudinary
      // const imageUrls = [];
      // for (const file of req.files) {
      //   const result = await cloudinary.uploader.upload(file.path, {
      //     folder: 'products', // Organize files in a specific folder on Cloudinary
      //   });
      //   imageUrls.push(result.secure_url); // Collect image URLs
      // }

      const imageUrls = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: 'products',
          }).then((result) => result.secure_url)
        )
      );

      // Optionally, delete old images from Cloudinary (if you want to remove them)
      if (item.imageUrls && item.imageUrls.length > 0) {
        for (const oldImage of item.imageUrls) {
          const publicId = oldImage.split('/').pop().split('.')[0]; // Extract public ID
          await cloudinary.uploader.destroy(publicId); // Delete image from Cloudinary
        }
      }

      // Update the product with the new image URLs
      item.imageUrls = imageUrls;
    }

    // Save the updated product in the database
    await item.save();

    // Respond with the updated product
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

    // Check if the logged-in supplier is the owner of the product
    if (item.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to delete this product' });
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
  const supplierId = req.user._id; // Using the logged-in supplier's ID
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
  const supplierId = req.user._id; // Using the logged-in supplier's ID
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
  const supplierId = req.user._id; // Using the logged-in supplier's ID
  try {
    const items = await productModels.find({ supplier: supplierId, status: 'pending' });
    res.status(200).json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const getPendingProductsById = async (req, res) => {
  const { supplierId } = req.params; // Getting supplier ID from URL parameter
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
    // Find the product by ID and populate the supplier's email
    const item = await productModels.findById(id).populate('supplier', 'email');

    if (!item) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if the populated supplier has an email
    if (!item.supplier || !item.supplier.email) {
      return res.status(400).json({ msg: 'Supplier email not found' });
    }

    item.status = 'approved';
    await item.save();

    // Notify the supplier via email
    await notifySupplier(item.supplier.email, item.name, 'approved');

    res.status(200).json(item);
  } catch (err) {
    console.error('Error approving product:', err.message);
    res.status(500).send('Server error');
  }
};


// Admin: Reject Product
export const rejectProduct = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the product by ID and populate the supplier's email
    const item = await productModels.findById(id).populate('supplier', 'email');

    if (!item) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if the populated supplier has an email
    if (!item.supplier || !item.supplier.email) {
      return res.status(400).json({ msg: 'Supplier email not found' });
    }

    // Update the product status to "rejected"
    item.status = 'rejected';
    await item.save();

    // Notify the supplier via email
    await notifySupplier(item.supplier.email, item.name, 'rejected');

    res.status(200).json(item);
  } catch (err) {
    console.error('Error rejecting product:', err.message);
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
    console.error(err.message); const imageUrls = req.files['imageUrls'] && req.files['imageUrls'].length > 0
      ? req.files['imageUrls'][0].path
      : null;

    res.status(500).send('Server error');
  }
};

// // Admin: Add Product
// export const adminCreateProduct = async (req, res) => {
//   console.log('Request Body:', req.body);
//   console.log('Uploaded Files:', req.files); // Log uploaded files

//   const { name, type, weight, price, stock, description } = req.body;

//   const imageUrls = req.files && req.files.length > 0 
//     ? req.files.map(file => file.path)
//     : [];

//   try {
//     if (imageUrls.length === 0) {
//       console.error('No image files uploaded');
//       return res.status(400).json({ msg: 'No image files uploaded' });
//     }

//     // Ensure req.admin is defined correctly
//     if (!req.admin || !req.admin._id) {
//       console.error('Admin not found');
//       return res.status(400).json({ msg: 'Admin not authenticated properly' });
//     }

//     // Create the product model with admin as the supplier
//     const item = new productModels({
//       name,
//       type,
//       weight,
//       price,
//       stock,
//       description,
//       imageUrls,
//       supplier: req.admin._id,
//       status: 'approved',
//       businessName: 'XLAYN',
//     });

//     // Save the product to the database
//     await item.save();
//     res.status(200).json(item);
//   } catch (err) {
//     console.error('Error creating product:', err);
//     res.status(500).json({ error: 'Server error', details: err.message });
//   }
// };



export const adminCreateProduct = async (req, res) => {
  console.log('Request Body:', req.body);
  console.log('Uploaded Files:', req.files); // Log uploaded files

  const { name, type, weight, price, stock, description } = req.body;

  try {
    // Ensure files are uploaded
    // if (!req.files || req.files.length === 0) {
    //   return res.status(400).json({ msg: 'No image files uploaded' });
    // }

    // Upload images to Cloudinary
    // const imageUrls = [];
    // for (const file of req.files) {
    //   const result = await cloudinary.uploader.upload(file.path, {
    //     folder: 'products', // Organize the images in a specific folder
    //   });
    //   imageUrls.push(result.secure_url); // Collect the secure URLs of the uploaded images
    // }

    const imageUrls = await Promise.all(
      req.files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: 'products',
        }).then((result) => result.secure_url)
      )
    );

    // Ensure req.admin is defined correctly
    if (!req.admin || !req.admin._id) {
      return res.status(400).json({ msg: 'Admin not authenticated properly' });
    }

    // Create the product model with admin as the supplier
    const item = new productModels({
      name,
      type,
      weight,
      price,
      stock,
      description,
      imageUrls,
      supplier: req.admin._id,
      status: 'approved',
      businessName: 'XLAYN', // Example business name
    });

    // Save the product to the database
    await item.save();
    res.status(200).json(item);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};


export const adminGetProducts = async (req, res) => {
  try {
    // Ensure the admin is authenticated
    if (!req.admin || !req.admin._id) {
      return res.status(400).json({ msg: 'Admin not authenticated properly' });
    }

    // Find all products added by this admin
    const products = await productModels.find({ supplier: req.admin._id });

    // If no products are found
    if (products.length === 0) {
      return res.status(404).json({ msg: 'No products found for this admin' });
    }

    // Send the list of products back to the admin
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};



export const adminGetProductById = async (req, res) => {
  const { productId } = req.params; // Assuming the product ID is passed as a URL parameter

  try {
    // Ensure the admin is authenticated
    if (!req.admin || !req.admin._id) {
      return res.status(400).json({ msg: 'Admin not authenticated properly' });
    }

    // Find the product by ID and ensure it belongs to this admin
    const product = await productModels.findOne({ _id: productId, supplier: req.admin._id });

    // If the product is not found or does not belong to this admin
    if (!product) {
      return res.status(404).json({ msg: 'Product not found or does not belong to this admin' });
    }

    // Send the product details back to the admin
    res.status(200).json(product);
  } catch (err) {
    console.error('Error fetching product by ID:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};


// // Admin: Update Product
// export const adminUpdateProduct = async (req, res) => {
//   console.log('Admin:', req.admin);  // Add this line for debugging

//   const { id } = req.params;
//   const { name, type, weight, price, stock, description } = req.body;

//   console.log('Request Body:', req.body);
//   console.log('Uploaded Files:', req.files); // Log uploaded files

//   try {
//     // Find the product by ID
//     const item = await productModels.findById(id);

//     if (!item) {
//       console.error('Product not found with ID:', id);
//       return res.status(404).json({ msg: 'Product not found' });
//     }

//     // Ensure req.admin is defined correctly
//     if (!req.admin || !req.admin._id) {
//       console.error('Admin not authenticated properly');
//       return res.status(400).json({ msg: 'Admin not authenticated properly' });
//     }

//     // Update the product details only if they are provided
//     if (name) item.name = name;
//     if (type) item.type = type;
//     if (weight) item.weight = weight;
//     if (price) item.price = price;
//     if (stock) item.stock = stock;
//     if (description) item.description = description;

//     // Handle image upload
//     if (req.files && req.files.length > 0) {
//       const imageUrls = req.files.map(file => file.path); // Get image paths
//       item.imageUrls = imageUrls; // Update the image URLs
//     }

//     // Save the updated product in the database
//     await item.save();
//     console.log('Product successfully updated:', item);

//     res.status(200).json({ msg: 'Product updated successfully', item });
//   } catch (err) {
//     console.error('Error updating product:', err.message);
//     res.status(500).json({ error: 'Server error', details: err.message });
//   }
// };



export const adminUpdateProduct = async (req, res) => {
  console.log('Admin:', req.admin);  // Add this line for debugging

  const { id } = req.params;
  const { name, type, weight, price, stock, description } = req.body;

  console.log('Request Body:', req.body);
  console.log('Uploaded Files:', req.files); // Log uploaded files

  try {
    // Find the product by ID
    const item = await productModels.findById(id);

    if (!item) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Ensure req.admin is defined correctly
    if (!req.admin || !req.admin._id) {
      return res.status(400).json({ msg: 'Admin not authenticated properly' });
    }

    // Update the product details only if they are provided
    if (name) item.name = name;
    if (type) item.type = type;
    if (weight) item.weight = weight;
    if (price) item.price = price;
    if (stock) item.stock = stock;
    if (description) item.description = description;

    // Handle image upload to Cloudinary if files are provided
    if (req.files && req.files.length > 0) {
      // Upload new images to Cloudinary
      // const imageUrls = [];
      // for (const file of req.files) {
      //   const result = await cloudinary.uploader.upload(file.path, {
      //     folder: 'products', // Folder in Cloudinary
      //   });
      //   imageUrls.push(result.secure_url); // Collect image URLs
      // }

      const imageUrls = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: 'products',
          }).then((result) => result.secure_url)
        )
      );

      // Optionally, delete old images from Cloudinary (if you want to remove them)
      if (item.imageUrls && item.imageUrls.length > 0) {
        for (const oldImage of item.imageUrls) {
          const publicId = oldImage.split('/').pop().split('.')[0]; // Extract public ID
          await cloudinary.uploader.destroy(publicId); // Delete image from Cloudinary
        }
      }

      // Update the product with the new image URLs
      item.imageUrls = imageUrls;
    }

    // Save the updated product in the database
    await item.save();
    res.status(200).json({ msg: 'Product updated successfully', item });
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
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


// User: Get All Approved Products
export const getAllApprovedProducts = async (req, res) => {
  try {
    // Fetch all approved products
    const products = await productModels.find({ status: 'approved' });

    // Check if there are no products
    if (!products.length) {
      return res.status(404).json({ msg: 'No products found' });
    }

    // Return the products
    res.status(200).json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// User: Get Approved Product by ID
export const getApprovedProductById = async (req, res) => {
  const { id } = req.params; // Extract the product ID from the request URL

  try {
    // Fetch the product by its ID and ensure it's approved
    const product = await productModels.findOne({ _id: id, status: 'approved' });

    // Check if the product was not found
    if (!product) {
      return res.status(404).json({ msg: 'Product not found or not approved' });
    }

    // Return the product details
    res.status(200).json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

