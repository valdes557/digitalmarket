import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String
  },
  thumbnail: {
    type: String
  },
  preview_url: {
    type: String
  },
  category: {
    type: String
  },
  type: {
    type: String,
    enum: ['canva', 'photoshop', 'illustrator', 'powerpoint', 'excel', 'notion', 'figma', 'other'],
    default: 'other'
  },
  price: {
    type: Number,
    required: true
  },
  sale_price: {
    type: Number
  },
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  file_url: {
    type: String
  },
  cloudinary_id: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'archived'],
    default: 'pending'
  },
  sales_count: {
    type: Number,
    default: 0
  },
  is_featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

templateSchema.index({ status: 1 });

export default mongoose.model('Template', templateSchema);
