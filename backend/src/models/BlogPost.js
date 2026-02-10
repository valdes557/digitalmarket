import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogCategory'
  },
  title: {
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
  excerpt: {
    type: String
  },
  content: {
    type: String
  },
  featured_image: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  view_count: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String
  }],
  meta_title: {
    type: String
  },
  meta_description: {
    type: String
  },
  published_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

blogPostSchema.index({ status: 1 });
blogPostSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

export default mongoose.model('BlogPost', blogPostSchema);
