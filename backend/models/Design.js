const mongoose = require('mongoose');

const designSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    thumbnail: { type: String, required: true },
    fullImage: { type: String, required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    sizeOptions: [{ type: String, trim: true }],
    price: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes to support search/filter APIs efficiently at scale (5k-10k designs)
designSchema.index({ title: 'text', tags: 'text', description: 'text' });
designSchema.index({ category: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Design', designSchema);
