import User from "../../models/user.js";
import UserRefreshToken from "../../models/UserRefreshToken.js";

import { generateTokens } from "./generateTokens.js";
import { verifyRefreshToken } from "./verifyToken.js";

const refreshAccessToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken || req.headers["x-refresh-token"];
    
    if (!oldRefreshToken) {
      throw new Error("Refresh token is missing");
    }

    // Verify Refresh Token is valid or not
    const { tokenDetails, error } = await verifyRefreshToken(oldRefreshToken);

    if (error) {
      throw new Error("Invalid refresh token");
    }

    // Find User based on Refresh Token detail id
    const user = await User.findById(tokenDetails._id);

    if (!user) {
      throw new Error("User not found");
    }

    const userRefreshToken = await UserRefreshToken.findOne({ userId: tokenDetails._id });

    if (oldRefreshToken !== userRefreshToken.token || userRefreshToken.blacklisted) {
      throw new Error("Unauthorized access");
    }

    // Generate new access and refresh tokens
    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await generateTokens(user);
    
    return {
      newAccessToken: accessToken,
      newRefreshToken: refreshToken,
      newAccessTokenExp: accessTokenExp,
      newRefreshTokenExp: refreshTokenExp,
    };
  } catch (error) {
    console.error("Error in refreshAccessToken:", error.message);
    throw error;
  }
};

export { refreshAccessToken };
