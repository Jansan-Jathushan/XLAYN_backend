
import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const makePayment = async (req, res) => {
  console.log('payment')
  try {
    const {  total, orderId } = req.body;

    // console.log("user data",user);
    console.log("order data",orderId);
    
    const customer = await stripe.customers.create(
      {
      metadata: {
        orderID: String(orderId),
      },
    }
  );
    // console.log("Stripe customer response:", customer);
    
    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: 'XLAYN',
            images: ["https://res.cloudinary.com/ddctt6pye/image/upload/v1730032160/t5czmyugygshax503iz7.jpg"],
          },
          unit_amount: total * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer: customer.id,
      success_url: `http://localhost:3000/`,
      cancel_url: `http://localhost:3000/cartpage`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error during payment:', error);
    res.status(500).json({ error: 'An error occurred during payment processing.' });
  }
};


export default router;