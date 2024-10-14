// controllers/contactController.js

import ContactForm from '../Models/contactModels.js'; // Adjust the path as necessary

// Create a new contact form submission
export const createContactForm = async (req, res) => {
    try {
      // Validate incoming data
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required fields.' });
      }
  
      // Create a new contact form entry
      const newContact = new ContactForm(req.body);
  
      // Save the new contact form entry
      await newContact.save();
  
      // Send success response
      res.status(201).json({ message: 'Contact form submitted successfully!' });
    } catch (error) {
      // Handle validation errors and other errors
      res.status(400).json({
        message: 'Error submitting contact form',
        error: error.message || error, // Use error.message for more informative responses
      });
    }
  };

// Get all contact form submissions
export const getAllContactForms = async (req, res) => {
  try {
    const contacts = await ContactForm.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact forms', error });
  }
};

// Get a specific contact form by ID
export const getContactFormById = async (req, res) => {
  try {
    const contact = await ContactForm.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact form not found' });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact form', error });
  }
};
