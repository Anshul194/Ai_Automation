import AdminLog from "../models/adminLog.js";

export const getAdminLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find({ adminId: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Admin logs fetched successfully.",
      data: logs
    });
  } catch (err) {
    console.error("Error fetching admin logs:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
};
