import bcrypt from 'bcryptjs';
import { User, Product, Wishlist, Cart, Order, OrderItem } from '../models/index.js';

// Get profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('email first_name last_name phone avatar role email_verified created_at');

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ ...user.toObject(), id: user._id });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { first_name, last_name, phone },
      { new: true }
    ).select('email first_name last_name phone avatar role');

    res.json({
      message: 'Profil mis à jour',
      user: { ...user.toObject(), id: user._id }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Mots de passe requis' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    const user = await User.findById(req.user.id).select('password');

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
  }
};

// Update avatar
export const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    await User.findByIdAndUpdate(req.user.id, { avatar });

    res.json({ message: 'Avatar mis à jour', avatar });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

// Get wishlist
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user_id: req.user.id })
      .populate({
        path: 'product_id',
        match: { status: 'published' },
        select: 'name slug price sale_price thumbnail rating',
        populate: { path: 'vendor_id', select: 'store_name' }
      })
      .sort({ created_at: -1 })
      .lean();

    const result = wishlist
      .filter(w => w.product_id)
      .map(w => ({
        ...w,
        id: w._id,
        name: w.product_id.name,
        slug: w.product_id.slug,
        price: w.product_id.price,
        sale_price: w.product_id.sale_price,
        thumbnail: w.product_id.thumbnail,
        rating: w.product_id.rating,
        store_name: w.product_id.vendor_id?.store_name
      }));

    res.json(result);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findOne({ _id: productId, status: 'published' });
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ user_id: req.user.id, product_id: productId });
    if (existing) {
      return res.status(400).json({ error: 'Produit déjà dans la liste de souhaits' });
    }

    await Wishlist.create({ user_id: req.user.id, product_id: productId });

    res.status(201).json({ message: 'Ajouté à la liste de souhaits' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    await Wishlist.findOneAndDelete({ user_id: req.user.id, product_id: productId });

    res.json({ message: 'Retiré de la liste de souhaits' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get cart
export const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.find({ user_id: req.user.id })
      .populate({
        path: 'product_id',
        select: 'name slug price sale_price thumbnail status',
        populate: { path: 'vendor_id', select: 'store_name' }
      })
      .sort({ created_at: -1 })
      .lean();

    const items = cartItems.map(c => ({
      ...c,
      id: c._id,
      name: c.product_id?.name,
      slug: c.product_id?.slug,
      price: c.product_id?.price,
      sale_price: c.product_id?.sale_price,
      thumbnail: c.product_id?.thumbnail,
      status: c.product_id?.status,
      store_name: c.product_id?.vendor_id?.store_name
    }));

    // Filter out unavailable products
    const availableItems = items.filter(item => item.status === 'published');
    const unavailableItems = items.filter(item => item.status !== 'published');

    // Calculate total
    const total = availableItems.reduce((sum, item) => {
      return sum + (item.sale_price || item.price || 0);
    }, 0);

    res.json({
      items: availableItems,
      unavailable: unavailableItems,
      total
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Add to cart
export const addToCart = async (req, res) => {
  try {
    const { product_id } = req.body;

    // Check if product exists and is available
    const product = await Product.findOne({ _id: product_id, status: 'published' });
    if (!product) {
      return res.status(404).json({ error: 'Produit non disponible' });
    }

    // Check if already in cart
    const existing = await Cart.findOne({ user_id: req.user.id, product_id });
    if (existing) {
      return res.status(400).json({ error: 'Produit déjà dans le panier' });
    }

    // Check if already purchased
    const purchasedOrder = await Order.findOne({ user_id: req.user.id, payment_status: 'completed' });
    if (purchasedOrder) {
      const purchasedItem = await OrderItem.findOne({ order_id: purchasedOrder._id, product_id });
      if (purchasedItem) {
        return res.status(400).json({ error: 'Vous avez déjà acheté ce produit' });
      }
    }

    await Cart.create({ user_id: req.user.id, product_id });

    res.status(201).json({ message: 'Ajouté au panier' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Remove from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    await Cart.findOneAndDelete({ user_id: req.user.id, product_id: productId });

    res.json({ message: 'Retiré du panier' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({ user_id: req.user.id });

    res.json({ message: 'Panier vidé' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
