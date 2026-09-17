const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    tag: {
      type: String,
      trim: true,
      default: '🔥 SPECIAL OFFER',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    badgeColor: {
      type: String,
      default: 'bg-terracotta text-white',
    },
    bg: {
      type: String,
      default: 'bg-gradient-to-r from-espresso via-espresso-light to-stone-900',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
