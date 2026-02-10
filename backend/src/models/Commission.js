import mongoose from 'mongoose';

const commissionSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  order_item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem',
    required: true
  },
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  total_amount: {
    type: Number,
    required: true
  },
  commission_rate: {
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
  status: {
    type: String,
    enum: ['pending', 'available', 'withdrawn', 'cancelled'],
    default: 'pending'
  },
  available_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

commissionSchema.index({ vendor_id: 1 });
commissionSchema.index({ status: 1 });

export default mongoose.model('Commission', commissionSchema);
