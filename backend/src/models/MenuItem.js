const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      // e.g. "Sandwiches", "Flatbread Pizza", "Quick Bites & Café Snacks",
      // "Chat Counter", "Maggie", "Pasta", "Mocktails & Coolers",
      // "Waffles", "Hot Beverages", "Cold Beverages", "Add-ons"
    },
    variants: [
      {
        label: { type: String, trim: true }, // e.g. "Plain", "Toast", "Grill", "120ml"
        price: { type: Number, min: 0 },
      },
    ],
    imageUrl: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
