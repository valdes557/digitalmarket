import mongoose from 'mongoose';

const sellerRequestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store_name: {
    type: String,
    required: true,
    trim: true
  },
  store_description: {
    type: String
  },
  business_name: {
    type: String
  },
  business_address: {
    type: String
  },
  phone: {
    type: String
  },
  motivation: {
    type: String
  },
  portfolio_url: {
    type: String
  },
  id_document: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  admin_notes: {
    type: String
  },
  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewed_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

sellerRequestSchema.index({ status: 1 });
sellerRequestSchema.index({ user_id: 1 });

export default mongoose.model('SellerRequest', sellerRequestSchema);
