import mongoose from 'mongoose';

const productPreviewSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  url: {
    type: String,
    required: true
  },
  cloudinary_id: {
    type: String
  },
  is_watermarked: {
    type: Boolean,
    default: false
  },
  sort_order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

productPreviewSchema.index({ product_id: 1 });

export default mongoose.model('ProductPreview', productPreviewSchema);
