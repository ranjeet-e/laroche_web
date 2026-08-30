const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['student', 'kitchen'],
      default: 'student',
    },
  },
  { timestamps: true }
);

// Enforce uniqueness ONLY when the field exists and is a valid string
// This permanently prevents duplicate key collisions when users register with phone (no email) or email (no phone)
userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $type: 'string' } },
  }
);

userSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: { phone: { $type: 'string' } },
  }
);

module.exports = mongoose.model('User', userSchema);
