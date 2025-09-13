import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String,  unique: true ,sparse:true},
  phone: { type: String, required: true, unique: true },
  password: { type: String }, // optional or hashed password field
  role: { type: String, default: 'user' },
  blocked: { type: Boolean, default: false }, // <-- new field
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false }, // <-- new field
  balance: { type: Number, default: 0 }, // wallet balance field
});

// userSchema.index({ email: 1 }, { unique: true, sparse: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
