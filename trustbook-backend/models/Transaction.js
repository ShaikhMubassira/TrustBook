const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true, min: 0.01 },
  type: { type: String, enum: ['DR', 'CR'], required: true },
  narration: { type: String, required: true, trim: true, maxlength: 200 },
  runningBalance: { type: Number, default: 0 }
}, {
  timestamps: true
});

TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, type: 1 });
TransactionSchema.index({ account: 1, date: -1 });
TransactionSchema.index({ account: 1, date: 1, createdAt: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);