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
//   console.log(`Server running on port ${port}`);
// });


import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/ userRoutes.js';
import productRoutes from './routes/productRoutes.js'

dotenv.config();

const port = process.env.PORT || 5000;

const app = express();
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
app. use ('/api/products',productRoutes);

// Define error handlers before application routes
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// export default router;