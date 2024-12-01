import mongoose from 'mongoose';

// Define the CartItem schema (each product added to the cart)
const CartItemSchema = new mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Products', // Referencing Product model
        required: true 
    },
    productName: {
        type: String,
        required: true // Product Name
    },

    productImage: [{ 
        type: String, 
        required: true // Product Image
      }],

    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
        // Do not add a ref here; we will determine which model to reference in the controller
    },
    supplierType: {
        type: String,
        enum: ['user', 'supplier'], // Based on supplier being from User or Supplier models
        required: true
    },
    supplierBusinessName: {
        type: String,
        required: true // Supplier's business name
    },
    quantity: { 
        type: Number, 
        required: true, 
        min: 1, 
        default: 1 
    },
    price: { 
        type: Number, 
        required: true 
    },
    totalItemPrice: {
        type: Number,
        required: true
    }
});

// Define the Cart schema
const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
        // No ref here; will determine if it's User or Wholesaler in the controller
    },
    userType: {
        type: String,
        enum: ['user', 'wholesaler'], // Based on your user roles
        required: true
    },
    items: [CartItemSchema], // Array of Cart Items
    totalCartPrice: {
        type: Number,
        required: true,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to calculate totalCartPrice before saving
CartSchema.pre('save', function (next) {
    this.totalCartPrice = this.items.reduce((total, item) => {
        return total + (item.totalItemPrice);
    }, 0);
    next();
});

// Create and export Cart model
const Cart = mongoose.model('Cart', CartSchema);
export default Cart;
