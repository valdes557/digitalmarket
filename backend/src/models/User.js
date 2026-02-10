import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  role: {
    type: String,
    enum: ['admin', 'vendor', 'client'],
    default: 'client'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  email_verification_token: {
    type: String
  },
  password_reset_token: {
    type: String
  },
  password_reset_expires: {
    type: Date
  },
  refresh_token: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);
