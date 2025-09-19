import AdminRepository from "../repository/adminRepository.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const adminRepo = new AdminRepository();

class AdminService {
  async getAdminByEmail(email) {
    return await adminRepo.findByEmail(email);
  }

  async login(email, password) {
    const admin = await this.getAdminByEmail(email);
    if (!admin) return null;

    const isMatch = bcrypt.compareSync(password, admin.password);
    if (!isMatch) return null;

    return admin;
  }

  async signup(email, password, role) {
    const existingAdmin = await this.getAdminByEmail(email);
    if (existingAdmin) {
      throw new Error("Admin with this email already exists");
    }

    if (role && !mongoose.Types.ObjectId.isValid(role)) {
      throw new Error("Invalid role ID");
    }

    const newAdmin = await adminRepo.createAdmin({ email, password, role });
    return newAdmin;
  }

  async signupWithRole(email, password, role, name, type, isSuper_Admin) {
    const existingAdmin = await this.getAdminByEmail(email);
    if (existingAdmin) {
      throw new Error("Admin with this email already exists");
    }

    if (!mongoose.Types.ObjectId.isValid(role)) {
      throw new Error("Invalid role ID");
    }

    if (type && !mongoose.Types.ObjectId.isValid(type)) {
      throw new Error("Invalid type ID");
    }

    const newAdmin = await adminRepo.createAdmin({ email, password, role, name, type, isSuper_Admin });
    return newAdmin;
  }

  async getAllAdmins(params) {
    try {
      return await adminRepo.findAllAdmins(params);
    } catch (err) {
      console.error("❌ Error in AdminService.getAllAdmins:", err);
      throw new Error("Failed to retrieve admins from repository");
    }
  }

  async getAdminById(id) {
    try {
      return await adminRepo.findAdminById(id);
    } catch (err) {
      console.error("❌ Error in AdminService.getAdminById:", err);
      throw new Error("Failed to retrieve admin by ID");
    }
  }

  async deleteAdminById(id) {
    try {
      return await adminRepo.deleteAdminById(id);
    } catch (err) {
      console.error("❌ Error in AdminService.deleteAdminById:", err);
      throw new Error("Failed to delete admin by ID");
    }
  }

  async updateAdminById(id, updateData) {
    try {
      return await adminRepo.updateAdminById(id, updateData);
    } catch (err) {
      console.error("❌ Error in AdminService.updateAdminById:", err);
      throw new Error("Failed to update admin");
    }
  }
}

export default AdminService;