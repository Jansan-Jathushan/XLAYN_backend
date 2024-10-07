
import jwt from "jsonwebtoken";
import User from "../Models/userModels.js";
import Supplier from "../Models/supplierModel.js";
import Wholesaler from "../Models/wholesalerModel.js";



const protect =async(req,res,next)=>{

    let token;
    token=req.cookies.jwt;
    
    if(token){
        try{
            const decoded =jwt.verify(token,process.env.JWT_SECRET);
            //console.log(decoded);

            req.user=await User.findById(decoded.userId).select("-password");
            req.user=await Supplier.findById(decoded.userId).select("-password");
            req.user=await Wholesaler.findById(decoded.userId).select("-password");
           if(req.user){
            // console.log(req.user);
          next();
          }else {
            res.status(401).json({msg:"invalid user"});
          }
            

        }catch(error){
            res.status(401).json("error when finding user");
           
        }
    }else{
      res.status(401).json({message:"Not authorized, invalid token"});
    }
};





const checkRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role; // Assuming user role is stored in req.user
    if (roles.includes(userRole)) {
      next(); // Proceed to the next middleware or route handler
    } else {
      return res.status(403).json({ message: "Access denied: You do not have the correct role" });
    }
  };
};


export const authenticateUser = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the decoded token is for a supplier
    if (decoded.role === 'supplier') {
      req.user = await Supplier.findById(decoded.id).select('-password');
    } else {
      req.user = await User.findById(decoded.id).select('-password');
    }

    if (!req.user) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    console.log('Authenticated User:', req.user); // Debugging line
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};



export const protectAdmin = (req, res, next) => {
  // Get token from cookies or Authorization header
  const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user is an admin
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Not authorized, admin only' });
    }

    // Attach admin info to request (you can also pass more details if needed)
    req.admin = decoded;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }

    console.error('Error verifying token', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};



export { protect,checkRole};