import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    module: { type: String, required: true }, // e.g. 'Customer'
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false }
});

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    permissions: [permissionSchema],
    createdAt: { type: Date, default: Date.now }
});

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);
export default Role;