
// import mongoose from 'mongoose'

// const ProductSchema = new mongoose.Schema({
//   name: { 
//     type: String, 
//     required: true // Product Name
//   },
//   type: { 
//     type: String,  
//     required: true // Fish Type
//   },
//   weight: { 
//     type: String,  
//     required: true // Weight/Size
//   },
//   price: { 
//     type: Number,  
//     required: true // Price
//   },
//   stock: { 
//     type: Number,  
//     required: true // Stock Availability
//   },
//   description: { 
//     type: String, 
//     required: true // Product Description
//   },
//   imageUrls: [{ 
//     type: String, 
//     required: true // Product Image
//   }],
//   supplier: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Supplier', 
//     required: true // Supplier Information
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected'],
//     default: 'pending',
//   },
//   date: { 
//     type: Date, 
//     default: Date.now // Date of entry
//   },

// }, { timestamps: true });


// // Pre-save middleware to automatically set the supplier field
// ProductSchema.pre('save', function (next) {
//   if (!this.supplier) {
//     // Assuming 'this.SupplierId' contains the current supplier's ID
//     this.supplier = this.SupplierId; 
//   }
//   next();
// });

// const Product = mongoose.model('Products', ProductSchema)
// export default Product;


import mongoose from 'mongoose';

// Define the Product Schema
const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true // Product Name
  },
  type: { 
    type: String,  
    required: true // Fish Type
  },
  weight: { 
    type: String,  
    required: true // Weight/Size
  },
  price: { 
    type: Number,  
    required: true // Price
  },
  stock: { 
    type: Number,  
    required: true // Stock Availability
  },
  description: { 
    type: String, 
    required: true // Product Description
  },
  imageUrls: [{ 
    type: String, 
    required: true // Product Image
  }],
  supplier: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supplier', 
    required: true // Supplier Information
  },
  businessName: { 
    type: String, 
    required: true // Supplier's Business Name
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  date: { 
    type: Date, 
    default: Date.now // Date of entry
  },

}, { timestamps: true });


// Pre-save middleware to automatically set the supplier field
ProductSchema.pre('save', function (next) {
  if (!this.supplier) {
    this.supplier = this.SupplierId; // Assign logged-in supplier's ID
  }
  next();
});

// Create and export Product model
const Product = mongoose.model('Products', ProductSchema);
export default Product;
