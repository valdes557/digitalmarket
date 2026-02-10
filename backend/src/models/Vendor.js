import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  store_name: {
    type: String,
    required: true,
    trim: true
  },
  store_slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  store_description: {
    type: String
  },
  store_logo: {
    type: String
  },
  store_banner: {
    type: String
  },
  business_name: {
    type: String
  },
  business_address: {
    type: String
  },
  tax_id: {
    type: String
  },
  phone: {
    type: String
  },
  website: {
    type: String
  },
  social_facebook: {
    type: String
  },
  social_twitter: {
    type: String
  },
  social_instagram: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  rejection_reason: {
    type: String
  },
  approved_at: {
    type: Date
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  total_sales: {
    type: Number,
    default: 0
  },
  total_products: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  rating_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

vendorSchema.index({ status: 1 });

export default mongoose.model('Vendor', vendorSchema);
