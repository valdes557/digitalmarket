import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

wishlistSchema.index({ user_id: 1 });
wishlistSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

export default mongoose.model('Wishlist', wishlistSchema);
