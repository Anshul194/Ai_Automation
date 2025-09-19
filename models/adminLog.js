import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  action: { type: String, required: true },
  description: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

const AdminLog = mongoose.models.AdminLog || mongoose.model("AdminLog", adminLogSchema);
export default AdminLog;