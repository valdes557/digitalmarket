import mongoose from 'mongoose';

const downloadLogSchema = new mongoose.Schema({
  order_item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  ip_address: {
    type: String
  },
  user_agent: {
    type: String
  },
  downloaded_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

downloadLogSchema.index({ order_item_id: 1 });
downloadLogSchema.index({ user_id: 1 });

export default mongoose.model('DownloadLog', downloadLogSchema);
