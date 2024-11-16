import mongoose from 'mongoose';

const contactFormSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        // Email format validation regex
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function (v) {
        // Phone number format validation (example: 10 digits)
        return /^\d{10}$/.test(v) || !v; // Optional field
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  subject: {
    type: String,
    required: false,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model
const ContactForm = mongoose.model('ContactForm', contactFormSchema);

// Export the model
export default ContactForm;