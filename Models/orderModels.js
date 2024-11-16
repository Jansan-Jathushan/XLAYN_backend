import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userType: {
        type: String,
        enum: ['user', 'wholesaler'],
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userPhoneNumber: {
        type: String,
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Products',
                required: true
            },
            productName: String,
            supplierId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            supplierType: {
                type: String,
                enum: ['supplier', 'user'],
                required: true
            },
            supplierBusinessName: String, // Automatically filled with the supplier's business name
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    shippingAddress: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Order = mongoose.model('Order', OrderSchema);
export default Order;
