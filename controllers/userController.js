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
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;
  //console.log(req.body);
  

  const userExists = await User.findOne({ email });

  if (userExists) {
    consoleres.status(400).json({message:'User already exists'});
  }
  //console.log(userExists);
  

  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password,
  });
  console.log(User);

  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
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
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async(req,res) =>{

  try { 
    const id = req.user._id;
    // console.log(id);
    const user = await User.findById(id);
    //console.log(user);
    if(user){




      res.status(200).json(user);

    } else {   
       res.status(404).json({message: 'Users not found'});
  }
    
  } catch (error) {
    res.status(500).json({message: error.message});
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
  getUserProfile,
  getAllUsersProfile,
  updateUserProfile,
};
