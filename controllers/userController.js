// import asyncHandler from 'express-async-handler';
// import User from '../Models/userModels.js';
// import generateToken from '../utils/generateToken.js';

// // @desc    Auth user & get token
// // @route   POST /api/users/auth
// // @access  Public
// const authUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });

//   if (user && (await user.matchPassword(password))) {
//     generateToken(res, user._id);

//     res.json({
//       _id: user._id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       username: user.username,
//       email: user.email,
//       role: user.role,
//     });
//   } else {
//     res.status(401);
//     throw new Error('Invalid email or password');
//   }
// });

// // @desc    Register a new user
// // @route   POST /api/users
// // @access  Public
// const registerUser = asyncHandler(async (req, res) => {
//   const { fristname, lastname, username, email, password, role } = req.body;

//   const userExists = await User.findOne({ email });

//   if (userExists) {
//     res.status(400);
//     throw new Error('User already exists');
//   }

//   const user = await User.create({
//     fristname,
//     lastname,
//     username,
//     email,
//     password,
//     role: role || 'individual',
//   });

//   if (user) {
//     generateToken(res, user._id);

//     res.status(201).json({
//       _id: user._id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       username: user.username,
//       email: user.email,
//       role: user.role,
//     });
//   } else {
//     res.status(400);
//     throw new Error('Invalid user data');
//   }
// });

// // @desc    Logout user / clear cookie
// // @route   POST /api/users/logout
// // @access  Public
// const logoutUser = (req, res) => {
//   res.cookie('jwt', '', {
//     httpOnly: true,
//     expires: new Date(0),
//   });
//   res.status(200).json({ message: 'Logged out successfully' });
// };

// // @desc    Get user profile
// // @route   GET /api/users/profile
// // @access  Private
// const getUserProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);

//   if (user) {
//     res.json({
//       _id: user._id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       username: user.username,
//       email: user.email,
//       role: user.role,
//     });
//   } else {
//     res.status(404);
//     throw new Error('User not found');
//   }
// });

// // @desc    Update user profile
// // @route   PUT /api/users/profile
// // @access  Private
// const updateUserProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);

//   if (user) {
//     user.name = req.body.name || user.name;
//     user.email = req.body.email || user.email;

//     if (req.body.password) {
//       user.password = req.body.password;
//     }

//     const updatedUser = await user.save();

//     res.json({
//       _id: updatedUser._id,
//       fristname: updatedUser.fristname,
//       lastname: updatedUser.lastname,
//       lastname: updatedUser.lastname,
//       email: updatedUser.email,
//       role: updatedUser.role,
//     });
//   } else {
//     res.status(404);
//     throw new Error('User not found');
//   }
// });

// export {
//   authUser,
//   registerUser,
//   logoutUser,
//   getUserProfile,
//   updateUserProfile,
// };





import asyncHandler from 'express-async-handler';
import User from '../Models/userModels.js';
import Supplier from '../Models/supplierModel.js';
import Wholesaler from '../Models/wholesalerModel.js';
import generateToken from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public

// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   // Validate email and password and find the user (pseudo-code)
//   const user = await User.findOne({ email });

//   if (user && (await user.matchPassword(password))) {
//     // Generate token and return it in the response body
//     const token = generateToken(user._id);

//     res.status(200).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       token,  // Returning token in the response body
//     });
//   } else {
//     res.status(401).json({ message: 'Invalid email or password' });
//   }
// };

const loginUser = async (req, res) => {
  const { email, password } = req.body;
 

  // Validate email and password presence
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Check if the user is a regular user
    const user = await User.findOne({ email });

    if (user) {
      // Match the password for regular user
      if (await user.matchPassword(password)) {
        const token = generateToken(user._id);
        return res.status(200).json({
          message: 'Login successful',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
          },
        });
      }
    }

    // Check if the user is a supplier
    const supplier = await Supplier.findOne({ email });

    if (supplier) {
      // Ensure supplier is approved
      if (supplier.status !== 'approved') {
        return res.status(403).json({ message: 'Supplier not approved' });
      }
      
      // Match the password for supplier
      const isMatch = await bcrypt.compare(password, supplier.password);
      if (isMatch) {
        const token = jwt.sign({ id: supplier._id, role: 'supplier' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({
          message: 'Supplier login successful',
          token,
          supplier: {
            id: supplier._id,
            username: supplier.username,
            email: supplier.email,
            role: supplier.role,
            status: supplier.status,
          },
        });
      }
    }

    // Check if the user is a wholesaler
    const wholesaler = await Wholesaler.findOne({ email });

    if (wholesaler) {
      // Ensure wholesaler is approved
      if (wholesaler.status !== 'approved') {
        return res.status(403).json({ message: 'Wholesaler not approved' });
      }

      // Match the password for wholesaler
      const isMatch = await bcrypt.compare(password, wholesaler.password);
      if (isMatch) {
        const token = jwt.sign({ id: wholesaler._id, role: 'wholesaler' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({
          message: 'Wholesaler login successful',
          token,
          wholesaler: {
            id: wholesaler._id,
            email: wholesaler.email,
            role: wholesaler.role,
            status: wholesaler.status,
          },
        });
      }
    }

    // If no match is found
    return res.status(401).json({ message: 'Invalid email or password' });
    
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: 'Server error' });
  }
};



// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create a new user with default role, e.g., "user"
  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password,
    role: 'user',  // Default role, if applicable
  });

  if (user) {
    // Generate a token for the user
    const token = generateToken(user._id);

    // Send a successful response with user details, role, and token
    res.status(201).json({
      _id: user._id,
      role: user.role,
      token: token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  // Here you could add any logic to invalidate the token if needed.
  res.status(200).json({ message: 'Logged out successfully' });
};



// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;  // Get user ID from URL parameter

  // Find the user by ID
  const user = await User.findById(id);

  if (user) {
    // Send user details in response if user found
    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});




const getAllUsersProfile = asyncHandler(async(req,res) =>{

  try { 
  
    const users = await User.find();
    // console.log(users);
    
    if(users){
      res.status(200).json(users);

    } else {   
       res.status(404).json({message: 'Users not found'});
  }
    
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});


// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      email: updatedUser.email,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  loginUser,
  registerUser,
  logoutUser,
  getUserById,
  getAllUsersProfile,
  updateUserProfile,
};
