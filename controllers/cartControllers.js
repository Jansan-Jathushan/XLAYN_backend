import Cart from '../Models/cartModels.js'; // Assuming the Cart model is in the models folder
import Product from '../Models/productModels.js'; // Assuming Product model is in the models folder
import User from '../Models/userModels.js'; // Assuming User model is in the models folder
import Wholesaler from '../Models/wholesalerModel.js'; // Assuming Wholesaler model is in the models folder
import Supplier from '../Models/supplierModel.js'; // Assuming Supplier model is in the models folder

// Function to find the user (either User or Wholesaler)
const findUser = async (userId) => {
    let user = await User.findById(userId);
    if (!user) {
        user = await Wholesaler.findById(userId);
        if (!user) {
            throw new Error('User or Wholesaler not found');
        }
    }
    return user;
};

// Function to find supplier details from either User or Supplier model
const findSupplier = async (supplierId) => {
    let supplier = await Supplier.findById(supplierId);
    if (supplier) {
        return { supplier, supplierType: 'supplier' };
    }
    supplier = await User.findById(supplierId);
    if (supplier) {
        return { supplier, supplierType: 'user' };
    }
    throw new Error('Supplier not found');
};

// Controller to add an item to the cart
export const addToCart = async (req, res) => {
    const { userId, productId, quantity = 1 } = req.body;

    try {
        // Find the user (either User or Wholesaler)
        const userResult = await findUser(userId);
        const userType = userResult instanceof User ? 'user' : 'wholesaler';

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the requested quantity exceeds available stock
        if (quantity > product.stock) {
            return res.status(400).json({ message: `Only ${product.stock} units of ${product.name} are available.` });
        }

        // Find supplier details for the product
        const { supplier, supplierType } = await findSupplier(product.supplier);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        // Fetch or create the user's cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            // If no cart exists, create a new cart
            cart = new Cart({
                userId,
                items: [],
                userType,
            });
        }

        // Check if the product is already in the cart
        const existingItemIndex = cart.items.findIndex(item => item.productId.equals(productId));

        if (existingItemIndex > -1) {
            // Update quantity if the product is already in the cart
            const existingItem = cart.items[existingItemIndex];
            existingItem.quantity += quantity;
            existingItem.totalItemPrice = existingItem.quantity * existingItem.price;
        } else {
            // Add new item to cart
            cart.items.push({
                productId: product._id,
                productName: product.name,
                supplierId: supplier._id,
                supplierType,
                supplierBusinessName: supplier.businessName || supplier.username,
                quantity,
                price: product.price,
                totalItemPrice: product.price * quantity,
            });
        }

        // Save the updated cart
        await cart.save();

        return res.status(200).json({ message: 'Product successfully added to the cart.', cart });
    } catch (error) {
        console.error('Error adding product to cart:', error.message);
        return res.status(500).json({ message: 'Error adding product to cart', error: error.message });
    }
};


// Get cart by userId
export const getCartById = async (req, res) => {
    const { userId } = req.params;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update cart item quantity by userId and productId
export const updateCartItem = async (req, res) => {
    const { userId, productId, quantity } = req.body;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
        if (itemIndex === -1) return res.status(404).json({ message: 'Product not found in cart' });

        // Update the quantity and total price
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].totalItemPrice = cart.items[itemIndex].price * quantity;

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove an item from cart by userId and productId
export const removeCartItem = async (req, res) => {
    const { userId, productId } = req.body;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(item => !item.productId.equals(productId));
        await cart.save();

        res.status(200).json({ message: 'Item removed', cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Clear the entire cart by userId
export const clearCart = async (req, res) => {
    const { userId } = req.params;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = [];
        await cart.save();

        res.status(200).json({ message: 'Cart cleared', cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
