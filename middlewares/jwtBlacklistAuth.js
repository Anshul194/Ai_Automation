import jwt from "jsonwebtoken";
import { isAccessTokenBlacklisted } from "../utils/tokens/generateTokens.js";

const jwtBlacklistAuth = async (req, res, next) => {
  try {
    // Extract token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];

    // Check blacklist (await for Redis-based check)
    const blacklisted = await isAccessTokenBlacklisted(token, req.user);
  if (blacklisted) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("is_auth");
    res.setHeader("X-Session-Expired", "true");
    return res.status(401).json({
      message: "Session expired. Please log in again.",
      isNewDeviceLogin: true,
    });
  }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("is_auth");
    res.setHeader("X-Session-Expired", "true");
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default jwtBlacklistAuth;
