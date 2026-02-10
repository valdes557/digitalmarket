import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  product_name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  commission_amount: {
    type: Number,
    required: true
  },
  vendor_amount: {
    type: Number,
    required: true
  },
  download_count: {
    type: Number,
    default: 0
  },
  max_downloads: {
    type: Number,
    default: 5
  },
  download_token: {
    type: String
  },
  download_expires: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

orderItemSchema.index({ order_id: 1 });
orderItemSchema.index({ product_id: 1 });
orderItemSchema.index({ download_token: 1 });

export default mongoose.model('OrderItem', orderItemSchema);
