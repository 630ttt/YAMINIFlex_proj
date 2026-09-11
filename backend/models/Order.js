const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    design: { type: mongoose.Schema.Types.ObjectId, ref: 'Design', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    size: { type: String, trim: true, default: '' },
    quantity: { type: Number, default: 1, min: 1 },
    customizationNotes: { type: String, trim: true, default: '' },
    customerFileUploads: { type: [String], default: [] },
    finalDesignFile: { type: String, default: '' },
    finalDesignApproved: { type: Boolean, default: false },
    finalDesignApprovedAt: { type: Date },
    customerFeedback: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'awaiting-approval', 'approved', 'ready', 'delivered', 'cancelled'],
      default: 'pending',
    },
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
