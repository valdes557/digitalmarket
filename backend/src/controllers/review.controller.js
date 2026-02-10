import { Review, Product, Vendor, Order, OrderItem } from '../models/index.js';

// Get product reviews
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const total = await Review.countDocuments({ product_id: productId, is_visible: true });

    const reviews = await Review.find({ product_id: productId, is_visible: true })
      .populate('user_id', 'first_name last_name avatar')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const transformedReviews = reviews.map(r => ({
      ...r,
      id: r._id,
      first_name: r.user_id?.first_name,
      last_name: r.user_id?.last_name,
      avatar: r.user_id?.avatar
    }));

    // Get rating distribution
    const distribution = await Review.aggregate([
      { $match: { product_id: productId, is_visible: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $project: { rating: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      reviews: transformedReviews,
      distribution,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Create review
export const createReview = async (req, res) => {
  try {
    const { product_id, order_id, rating, title, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Note invalide (1-5 étoiles)' });
    }

    // Verify purchase
    const order = await Order.findOne({ _id: order_id, user_id: req.user.id, payment_status: 'completed' });
    if (!order) {
      return res.status(400).json({ error: 'Vous devez acheter ce produit pour laisser un avis' });
    }

    const orderItem = await OrderItem.findOne({ order_id: order._id, product_id });
    if (!orderItem) {
      return res.status(400).json({ error: 'Vous devez acheter ce produit pour laisser un avis' });
    }

    // Check if already reviewed
    const existing = await Review.findOne({ product_id, user_id: req.user.id, order_id });
    if (existing) {
      return res.status(400).json({ error: 'Vous avez déjà laissé un avis pour cet achat' });
    }

    // Create review
    const review = await Review.create({
      product_id,
      user_id: req.user.id,
      order_id,
      rating,
      title,
      comment
    });

    // Update product rating
    const avgResult = await Review.aggregate([
      { $match: { product_id, is_visible: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const avgRating = avgResult[0]?.avg || 0;
    const ratingCount = avgResult[0]?.count || 0;

    await Product.findByIdAndUpdate(product_id, { rating: avgRating, rating_count: ratingCount });

    // Update vendor rating
    const product = await Product.findById(product_id);
    if (product) {
      const vendorProducts = await Product.find({ vendor_id: product.vendor_id }).select('_id');
      const productIds = vendorProducts.map(p => p._id);

      const vendorAvgResult = await Review.aggregate([
        { $match: { product_id: { $in: productIds }, is_visible: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);

      await Vendor.findByIdAndUpdate(product.vendor_id, {
        rating: vendorAvgResult[0]?.avg || 0,
        rating_count: vendorAvgResult[0]?.count || 0
      });
    }

    res.status(201).json({
      message: 'Avis publié avec succès',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'avis' });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Avis non trouvé' });
    }

    if (review.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const updated = await Review.findByIdAndUpdate(id, {
      rating: rating || review.rating,
      title: title || review.title,
      comment: comment || review.comment
    }, { new: true });

    // Update product rating
    const avgResult = await Review.aggregate([
      { $match: { product_id: review.product_id, is_visible: true } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);

    await Product.findByIdAndUpdate(review.product_id, { rating: avgResult[0]?.avg || 0 });

    res.json({
      message: 'Avis mis à jour',
      review: updated
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Avis non trouvé' });
    }

    if (review.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const productId = review.product_id;

    await Review.findByIdAndDelete(id);

    // Update product rating
    const avgResult = await Review.aggregate([
      { $match: { product_id: productId, is_visible: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    await Product.findByIdAndUpdate(productId, {
      rating: avgResult[0]?.avg || 0,
      rating_count: avgResult[0]?.count || 0
    });

    res.json({ message: 'Avis supprimé' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};

// Vendor reply
export const vendorReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const review = await Review.findById(id).populate('product_id', 'vendor_id');

    if (!review) {
      return res.status(404).json({ error: 'Avis non trouvé' });
    }

    if (review.product_id?.vendor_id?.toString() !== req.vendor?._id?.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const updated = await Review.findByIdAndUpdate(id, {
      vendor_reply: reply,
      vendor_reply_at: new Date()
    }, { new: true });

    res.json({
      message: 'Réponse ajoutée',
      review: updated
    });
  } catch (error) {
    console.error('Vendor reply error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
