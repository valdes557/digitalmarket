import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String
  },
  comment: {
    type: String
  },
  is_verified: {
    type: Boolean,
    default: true
  },
  is_visible: {
    type: Boolean,
    default: true
  },
  helpful_count: {
    type: Number,
    default: 0
  },
  vendor_reply: {
    type: String
  },
  vendor_reply_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

reviewSchema.index({ product_id: 1 });
reviewSchema.index({ user_id: 1 });
reviewSchema.index({ product_id: 1, user_id: 1, order_id: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
