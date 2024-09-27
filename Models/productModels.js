// import { Schema, model } from 'mongoose';

// const itemSchema = new Schema({
//   name: { type: String, required: true },
//   type: { type: String,  required: true },
//   items: [{ type: String,  }],
//   imageUrls: [{ type:String }],
//   order: { type: Map, of: Number, default: {} },
//   date: { type: Date, default: Date.now },
// });

// export default model('itemModels', itemSchema);


import { Schema, model } from 'mongoose';

const itemSchema = new Schema({
  name: { 
    type: String, 
    required: true // Product Name
  },
  type: { 
    type: String,  
    required: true // Fish Type
  },
  weight: { 
    type: String,  
    required: true // Weight/Size
  },
  price: { 
    type: Number,  
    required: true // Price
  },
  stock: { 
    type: Number,  
    required: true // Stock Availability
  },
  description: { 
    type: String, 
    required: true // Product Description
  },
  imageUrls: [{ 
    type: String, 
    required: true // Product Image
  }],
  supplier: { 
    type: Schema.Types.ObjectId, 
    ref: 'Supplier', 
    required: true // Supplier Information
  },
  date: { 
    type: Date, 
    default: Date.now // Date of entry
  },
});

export default model('itemModels', itemSchema);
