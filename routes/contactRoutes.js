import express from 'express';
import {
  createContactForm,
  getAllContactForms,
  getContactFormById,
} from '../controllers/contactControllers.js'; // Adjust the path as necessary

const router = express.Router();

// Route to handle posting a new contact form submission
router.post('/contact-us', createContactForm);

// Route to get all contact form submissions (for admin)
router.get('/contact-us', getAllContactForms);

// Route to get a specific contact form by ID (for admin)
router.get('/contact-us/:id', getContactFormById);

export default router;
