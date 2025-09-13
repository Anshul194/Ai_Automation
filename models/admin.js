import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
   name: {
    type: String,
    trim: true,
  },
   type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // Reference to Category model
    required: false, // Optional
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  isSuper_Admin : { type: Boolean, default: false }, 
  // role: {
  //   type: String,
  //   enum: ["admin", "superadmin", "editor", "viewer"], // Example roles
  //   default: "admin",
  // },
  
}, {
  timestamps: true, 
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export default Admin;
