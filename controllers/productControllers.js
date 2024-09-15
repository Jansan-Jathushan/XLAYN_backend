// controllers/userRoles.js
import productModels from "../Models/productModels.js"
// Function to get all items
export const getProducts = async (req, res) => {
    try {
      const items = await productModels.find();
      res.status(200).json(items);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  
  // Function to get an item by ID
  export const getProductById = async (req, res) => {
    try {
      const item = await productModels.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ msg: 'Product not found' });
      }
      res.status(200).json(item);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  
  // Function to create a new item
  export const createProduct = async (req, res) => {
    const { name, type, items } = req.body;
    try {
      const item = new productModels({ name, type, items });
      await item.save();
      res.status(200).json(item);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  };
  
  // Function to update an item
  
  export const updateProducts = async (req, res) => {
    try {
      let item = await productModels.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ msg: 'Product not found' });
      }
  
      // Update item details
      item = await productModels.findByIdAndUpdate(req.params.id, req.body, { new: true });
  
      res.status(200).json(item);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };


  export const deleteProduct = async (req, res) => {
    try {
      let item = await productModels.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ msg: 'Product not found' });
      }
  
      // delete item details
      item = await productModels.findByIdAndDelete(req.params.id, { new: true });
  
      res.status(200).json({message:"product deleted",item:item});
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };