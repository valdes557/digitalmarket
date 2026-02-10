import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String
  },
  image: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  button_text: {
    type: String
  },
  position: {
    type: String,
    enum: ['home_hero', 'home_secondary', 'sidebar', 'footer', 'popup'],
    default: 'home_hero'
  },
  sort_order: {
    type: Number,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

bannerSchema.index({ position: 1 });
bannerSchema.index({ is_active: 1 });

export default mongoose.model('Banner', bannerSchema);
