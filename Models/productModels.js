import { Schema, model } from 'mongoose';

const itemSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String,  required: true },
  items: [{ type: String,  }],
  order: { type: Map, of: Number, default: {} },
  date: { type: Date, default: Date.now },
});

export default model('itemModels', itemSchema);