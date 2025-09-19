
import jwt from 'jsonwebtoken';
import { initRedis } from '../config/redisClient.js';
import Userservices from '../service/userService.js';
import Role from '../models/Role.js';

const userService = new Userservices();

export const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        message: "Access token required",
        success: false,
        err: { message: "No token provided" }
      });
    }

    // Verify token with Redis
    const redis = await initRedis();
    const tokenValid = await redis.get(`admin:accessToken:${token}`);
    
    if (!tokenValid) {
      return res.status(401).json({
        message: "Invalid or expired token",
        success: false,
        err: { message: "Token not found in cache" }
      });
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Get admin data from cache or database
    let adminData = await redis.get(`admin:${decoded.userId}`);
    
    if (adminData) {
      adminData = JSON.parse(adminData);
    } else {
      adminData = await userService.getAdminById(decoded.userId);
      if (!adminData) {
        return res.status(401).json({
          message: "Admin not found",
          success: false,
          err: { message: "Invalid admin ID" }
        });
      }
    }
    console.log("Admin Data:", adminData);
    // Check if admin is active
    if (!adminData.isActive) {
      return res.status(403).json({
        message: "Admin account is deactivated",
        success: false,
        err: { message: "Account not active" }
      });
    }


    // Dynamic role check using Role model
    let hasAdminRole = false;
    if (adminData.role) {
      // If adminData.role is an object or id, fetch role document
      let roleDoc = null;
      if (typeof adminData.role === 'object' && adminData.role.name) {
        roleDoc = adminData.role;
      } else {
        roleDoc = await Role.findById(adminData.role);
      }
      if (roleDoc && roleDoc.name) {
        hasAdminRole = true;
      }
    }
    if (!hasAdminRole) {
      return res.status(403).json({
        message: "Admin privileges required",
        success: false,
        err: { message: "Insufficient privileges" }
      });
    }

    // Add admin info to request
    req.user = adminData;
    req.admin = adminData;
    req.userId = decoded.userId;
    next();

  } catch (error) {
    console.error("❌ Admin middleware error:", error);
    return res.status(401).json({
      message: "Invalid token",
      success: false,
      err: { message: error.message }
    });
  }
};
