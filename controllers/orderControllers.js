import Order from '../Models/orderModels.js'; // Order model
import Cart from '../Models/cartModels.js'; // Cart model
import Product from '../Models/productModels.js';
import Supplier from '../Models/supplierModel.js';
import Wholesaler from '../Models/wholesalerModel.js';
import User from '../Models/userModels.js';
import nodemailer from 'nodemailer'; // For sending email
import dotenv from 'dotenv';

dotenv.config();



// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use a service like Gmail
    auth: {
        user: process.env.GMAIL_USER, // Your email
        pass: process.env.GMAIL_PASS // Your email password (ensure you use an app-specific password if you have 2FA)
    }
});

// Create Order (Checkout)
export const createOrder = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        }

        const { userName, userEmail, userPhoneNumber, shippingAddress, totalAmount } = req.body;

        // Find the user's cart
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate total amount from the cart
        // const totalAmount = cart.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

        // Create a payment intent with Stripe
        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: totalAmount * 100, // Amount in cents
        //     currency: 'usd',
        //     payment_method: ["card"],
        //     confirm: true,
        //     automatic_payment_methods: {
        //         enabled: true,
        //         allow_redirects: 'never',
        //     },
        // });

        // Identify the user type (user or wholesaler)
        const userType = req.user.role === 'wholesaler' ? 'wholesaler' : 'user';

        // Populate items for the order with supplier and user type details
        const orderItems = await Promise.all(cart.items.map(async item => {
            // Find the supplier based on supplier type (user or supplier)
            let supplier;
            let supplierType;

            if (item.supplierType === 'supplier') {
                supplier = await Supplier.findById(item.supplierId);
                supplierType = 'supplier';
            } else if (item.supplierType === 'user') {
                supplier = await User.findById(item.supplierId);
                supplierType = 'user';
            }

            if (!supplier) {
                throw new Error(`Supplier with ID ${item.supplierId} not found`);
            }

            return {
                productId: item.productId,
                productName: item.productName,
                supplierId: supplier._id,
                supplierType,
                supplierBusinessName: supplier.businessName || supplier.username,
                quantity: item.quantity,
                price: item.price
            };
        }));

        // Create and save the new order
        const newOrder = new Order({
            userId: req.user._id,
            userType,
            userName,
            userEmail,
            userPhoneNumber,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentStatus: 'pending', // Set payment status to completed
        });

        await newOrder.save();
        console.log('order created')

        // Clear the user's cart after placing the order
        cart.items = [];
        await cart.save();

        // Send confirmation email to the user
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: userEmail,
            subject: 'Order Confirmation',
            html: `<h3>Thank you for your order, ${userName}!</h3>
                   <p>Your order has been placed successfully. Here are the details:</p>
                   <p><strong>Order ID:</strong> ${newOrder._id}</p>
                   <p><strong>Total Amount:</strong> $${totalAmount}</p>
                   <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
                   <p>We will notify you once your order is shipped.</p>`
        };

        // // Send the email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Order placed successfully, confirmation email sent.', order: newOrder });
    } catch (error) {
        console.error('Checkout failed:', error);
        return res.status(500).json({ message: 'Checkout failed', error: error.message });
    }
};

// Get all orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        const populatedOrders = await Promise.all(orders.map(async order => {
            const user = order.userType === 'wholesaler'
                ? await Wholesaler.findById(order.userId).select('userName email')
                : await User.findById(order.userId).select('userName email');

            const populatedItems = await Promise.all(order.items.map(async item => {
                const supplier = item.supplierType === 'supplier'
                    ? await Supplier.findById(item.supplierId).select('businessName')
                    : await User.findById(item.supplierId).select('userName');

                return {
                    ...item.toObject(),
                    supplierBusinessName: supplier ? (supplier.businessName || supplier.userName) : 'Unknown'
                };
            }));

            return {
                ...order.toObject(),
                user, // Populated user details
                items: populatedItems // Populated items with supplier info
            };
        }));

        return res.status(200).json(populatedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ message: 'Error fetching orders' });
    }
};

// Get orders by user ID
export const getOrdersByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const orders = await Order.find({ userId })
            .populate('items.productId', 'productName')
            .populate('items.supplierId', 'supplierBusinessName');

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }

        return res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders by user ID:', error);
        return res.status(500).json({ message: 'Error fetching orders by user ID' });
    }
};

