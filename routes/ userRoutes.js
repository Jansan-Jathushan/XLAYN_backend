import express from 'express';
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserById,
  getAllUsersProfile,
  updateUserProfile,
} from '../controllers/userController.js';
import { protectAdmin} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout',logoutUser);
router.put('/updateProfile', protectAdmin, updateUserProfile);
router.get('/profile/:id', getUserById);
router.get('/allProfile', getAllUsersProfile);


export default router;


