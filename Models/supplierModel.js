import mongoose from 'mongoose'
const SupplierSchema = new mongoose.Schema({
  username: { type: String, required: true },
  businessName: { type: String, required: true },
  address: { type: String, required: true },
  businessProof: { type: String, required: true }, // URL or path to the uploaded file
  storeImage: { type: String, required: true }, // URL or path to the uploaded file
  bankAccountInfo: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    default: 'supplier',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

const Supplier = mongoose.model('Supplier', SupplierSchema);

export default Supplier;