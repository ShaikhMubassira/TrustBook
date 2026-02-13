const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  partyName: {
    type: String,
    required: [true, 'Party name is required'],
    trim: true,
    maxlength: [100, 'Party name cannot exceed 100 characters'],
  },
  partyPhone: {
    type: String,
    trim: true,
    default: '',
  },
  partyEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
  },
  // If the party has a TrustBook account, link it here
  partyUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: '',
  },
  // Cached balance for quick display
  balance: {
    type: Number,
    default: 0,
  },
  totalCredits: {
    type: Number,
    default: 0,
  },
  totalDebits: {
    type: Number,
    default: 0,
  },
  transactionCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// One owner can't create duplicate accounts for the same party name
AccountSchema.index({ owner: 1, partyName: 1 }, { unique: true });
AccountSchema.index({ partyUser: 1 });
AccountSchema.index({ partyEmail: 1 });

module.exports = mongoose.model('Account', AccountSchema);
