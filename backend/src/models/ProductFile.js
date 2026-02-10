import mongoose from 'mongoose';

const productFileSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  file_name: {
    type: String,
    required: true
  },
  file_path: {
    type: String,
    required: true
  },
  file_size: {
    type: Number,
    required: true
  },
  file_type: {
    type: String
  },
  cloudinary_id: {
    type: String
  },
  is_main: {
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

productFileSchema.index({ product_id: 1 });

export default mongoose.model('ProductFile', productFileSchema);
