import express from 'express';
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  getAllUsersProfile,
  updateUserProfile,
} from '../controllers/userController.js';
import { checkRole,protect} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect,logoutUser);
router.put('/updateProfile', protect, updateUserProfile);
router.get('/profile', protect,getUserProfile);
router.get('/allProfile', protect,checkRole(['admin']), getAllUsersProfile);


export default router;


