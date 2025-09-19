import { Token } from "../utils/index.js";

const accessTokenAutoRefresh = async (req, res, next) => {
  try {
    console.log("🔐 accessTokenAutoRefresh middleware START");

    // Read tokens from cookies or headers
    const accessToken = req.cookies.accessToken || req.headers["x-access-token"] || req.headers.authorization?.replace('Bearer ', '');
    const refreshToken = req.cookies.refreshToken || req.headers["x-refresh-token"];

    console.log("🔍 Access Token:", accessToken ? "Present" : "Missing");
    console.log("🔍 Refresh Token:", refreshToken ? "Present" : "Missing");

    // STEP 1: Check access token validity
    if (accessToken) {
      console.log("📝 Checking access token...");
      try {
        // Check if token is expired first
        console.log("⏰ Checking if token is expired...");
        const isExpired = Token.isTokenExpired(accessToken);
        console.log("⏰ Token expired?", isExpired);

        if (!isExpired) {
          console.log("🔑 Verifying token...");
          const decoded = Token.verifyToken(accessToken);
          console.log("✅ Token verified successfully:", { userId: decoded._id, roles: decoded.roles });

          req.user = decoded;
          req.accessToken = accessToken;
          req.headers["authorization"] = `Bearer ${accessToken}`;

          console.log("✅ User attached to request");
          console.log("🚀 Proceeding to next middleware...");
          return next();
        } else {
          console.log("⏰ Token is expired");
        }
      } catch (tokenVerifyError) {
        console.log("❌ Error verifying access token:", tokenVerifyError.message);
        console.log("❌ Manual token verification failed: Invalid access token");
        console.log("❌ Error details:", tokenVerifyError);
        // Continue to refresh logic
      }
    }

    console.log("🔄 Moving to refresh token logic...");

    // STEP 2: Access token is missing or expired, try using refresh token
    if (!refreshToken) {
      console.log("❌ Refresh token is missing");
      return res.status(401).json({
        error: "Unauthorized",
        message: "Access and refresh tokens are missing or invalid",
      });
    }

    // Check if refresh token is valid
    try {
      // Log the actual refresh token value for debugging
      console.log("🔍 Refresh Token Value:", refreshToken);

      // Validate refresh token using Token utility
      const result = await Token.verifyRefreshToken(refreshToken);
      const { tokenDetails, error, message } = result || {};
      console.log("🔍 User Refresh Token:", tokenDetails);

      if (error || !tokenDetails) {
        console.log("❌ Refresh token is invalid or expired:", message);
        return res.status(401).json({
          error: "Unauthorized",
          message: "Refresh token is invalid or expired",
        });
      }

      console.log("🔄 Refreshing tokens...");

      // Refresh tokens
      const tokenResult = await Token.refreshAccessToken(req, res);
      console.log("🔄 Token refresh result:", tokenResult ? "Success" : "Failed");

      // Check if refresh was successful
      if (!tokenResult || !tokenResult.newAccessToken) {
        console.log("❌ Failed to refresh tokens - no result");
        return res.status(401).json({
          error: "Unauthorized",
          message: "Failed to refresh tokens",
        });
      }

      const { newAccessToken, newRefreshToken, newAccessTokenExp, newRefreshTokenExp } = tokenResult;
      console.log("✅ New tokens generated successfully");

      // Set HTTP-only cookies
      console.log("🍪 Setting new cookies...");
      Token.setTokensCookies(res, newAccessToken, newRefreshToken, newAccessTokenExp, newRefreshTokenExp);

      // Decode new token and attach user info
      console.log("🔑 Verifying new access token...");
      const decoded = Token.verifyToken(newAccessToken);
      req.user = decoded;
      req.accessToken = newAccessToken;
      req.headers["authorization"] = `Bearer ${newAccessToken}`;

      console.log("✅ Tokens refreshed and user attached:", { userId: decoded._id, roles: decoded.roles });
      console.log("🚀 Proceeding to next middleware...");
      return next();
    } catch (refreshError) {
      console.error("❌ Database refresh token validation failed:", refreshError.message);
      return res.status(401).json({
        error: "Unauthorized",
        message: "Refresh token is invalid or expired",
      });
    }
  } catch (error) {
    console.error("❌ Error in accessTokenAutoRefresh middleware:", error.message);
    console.error("❌ Full error:", error);
    res.status(401).json({
      error: "Unauthorized",
      message: "Failed to validate or refresh tokens",
    });
  }
};

export default accessTokenAutoRefresh;