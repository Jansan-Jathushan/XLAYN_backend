// import path from 'path';
// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import mongoose from 'mongoose';
// dotenv.config();
// import connectDB from './config/db.js';
// import cookieParser from 'cookie-parser';
// import { notFound, errorHandler } from './middleware/errorMiddleware.js';
// import userRoutes from './routes/ userRoutes.js';

// const port = process.env.PORT || 5000;

// connectDB();

// const app = express();
// app.use(express.json());
// app.use(cookieParser());
// app.use(cors());

// // Connect to MongoDB (Replace with your own MongoDB URI)
// mongoose.connect('mongodb+srv://jansanjathushan:jansanjathushan2002@xlayn.whkgh.mongodb.net/?retryWrites=true&w=majority&appName=XLAYN', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => console.log('Connected to MongoDB'))
// .catch(err => console.error('Could not connect to MongoDB:', err));


// app.use('/api/users', userRoutes);

// app.use(notFound);
// app.use(errorHandler);

// app.listen(port, () => {
//   console.log('Server running on port ${port}');
// });


import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/ userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import registerRequestRoutes from './routes/registerRequestRoutes.js'
import adminRoutes from './routes/adminRoutes.js';
import contactRoutes from './routes/contactRoutes.js'
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import Order from './Models/orderModels.js'; // Order model

import Stripe from 'stripe';


dotenv.config();

const port = process.env.PORT || 5000;
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();

const endpointSecret = process.env.END_POINT_SECRET
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/pay/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];
 
  
  
  let event;
  let data;
  let eventType;
  try {
   
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
   
    
  } catch (err) {
    response.status(400).send('Webhook Error: ${err.message}');
    console.log(err);
    return;
  }
  
      data = event.data.object;
      eventType = event.type;



      if (eventType === "checkout.session.completed") {
    
        stripe.customers
          .retrieve(data.customer)
          .then(async (customer) => {
            try {
            
              const orderId =customer.metadata.orderID
              
              console.log(orderId)
              const order = await Order.findOne( { _id:orderId } );
          
              if (order) {
                order. paymentStatus = 'completed';
                // order.paidAt = Date.now()
                const updatedOrder = await order.save(); // Corrected here
                return updatedOrder;
              } else {
                throw new Error('Order not found');
              }
            } catch (error) {
              console.error('Error updating order:', error.message); // Improved error logging
              throw error; // Rethrow the error for handling in the caller function
            }
          })
          .catch((err) => console.log(err.message));
        }
      // Return a 200 response to acknowledge receipt of the event
      response.send().end();
    });

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000', 'https://example.com'], // specify allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'] // specify allowed headers
}));




// Move connectDB to a separate function to handle errors properly
async function connectToDB() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1); // exit the process if connection fails
  }
}

connectToDB();

app.use('/api/users', userRoutes);
app.use ('/api/product',productRoutes);
app.use ('/api/register-request', registerRequestRoutes);
app.use ('/api/admin',adminRoutes);
app.use('/api/contact', contactRoutes); 
app.use('/api/add-tocart', cartRoutes); 
app.use('/api/order-pay', orderRoutes);
app.use('/api/payments', paymentRoutes);


app.get('/', (req, res) => {
  try {
      res.json("XLAYN")
  } catch (error) {
      res.json(error)
  }
})

// Define error handlers before application routes
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// export default router;