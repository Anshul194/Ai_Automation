import jwt from "jsonwebtoken";
import UserRefreshToken from "../../models/UserRefreshToken.js";
import { ServerConfig } from "../../config/server.config.js";


// Verify Access Token
const verifyToken = (token) => {
  try {
    const privateKey = process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
    return jwt.verify(token, privateKey);
  } catch (error) {
    throw new Error("Invalid access token");
  }
};

const verifyResetToken = (token) => {
  try {
    const privateKey = ServerConfig.JWT_EMAIL_RESET_SECRET;
    return jwt.verify(token, privateKey);
  } catch (error) {
    throw { error: true, message: "Invalid reset token" };
  }
};

// Verify Refresh Token
const verifyRefreshToken = async (refreshToken) => {
  try {
    const privateKey = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;

    // Find the refresh token document
    const userRefreshToken = await UserRefreshToken.findOne({ token: refreshToken });

    // If refresh token not found, reject with an error
    if (!userRefreshToken) {
      throw { error: true, message: "Invalid refresh token" };
    }

    // Check if token is blacklisted
    if (userRefreshToken.blacklisted) {
      throw { error: true, message: "Refresh token is blacklisted" };
    }

    // Verify the refresh token
    const tokenDetails = jwt.verify(refreshToken, privateKey);

    // If verification successful, resolve with token details
    return {
      tokenDetails,
      error: false,
      message: "Valid refresh token",
    };
  } catch (error) {
    // If any error occurs during verification or token not found, reject with an error
    throw { error: true, message: error.message || "Invalid refresh token" };
  }
};

export { verifyRefreshToken, verifyResetToken , verifyToken };
