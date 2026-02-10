import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  setting_key: {
    type: String,
    required: true,
    unique: true
  },
  setting_value: {
    type: String
  },
  setting_type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'json'],
    default: 'string'
  },
  description: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model('Setting', settingSchema);
