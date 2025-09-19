import AdminLog from "../models/adminLog.js";

export const logAdminActivity = async ({ adminId, action, ip, userAgent }) => {
  try {
    await AdminLog.create({
      adminId,
      action,
      ip,
      userAgent,
    });
  } catch (error) {
    console.error("❌ Failed to log admin activity:", error);
  }
};