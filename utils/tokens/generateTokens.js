import jwt from "jsonwebtoken";
import UserRefreshToken from "../../models/UserRefreshToken.js";
import { ServerConfig } from "../../config/server.config.js";

const generateTokens = async (user) => {
  try {
    const payload = { _id: user._id, roles: user.role };

    const accessTokenTTL = 1000 * 60 * 60 * 24 * 5; // 5 days in ms
    const refreshTokenTTL = 1000 * 60 * 60 * 24 * 30; // 30 days in ms

    const accessTokenExp = Date.now() + accessTokenTTL;
    const refreshTokenExp = Date.now() + refreshTokenTTL;

    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET_KEY, { expiresIn: '5d' });
    // const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET_KEY, { expiresIn: '30d' });

    await UserRefreshToken.findOneAndDelete({ userId: user._id });
    await new UserRefreshToken({ userId: user._id, token: refreshToken }).save();

    return Promise.resolve({ accessToken, refreshToken, accessTokenExp, refreshTokenExp });
  } catch (error) {
    return Promise.reject(error);
  }
};

// Generate Token for Reset Password
const generateTokenForResetPassword = async (user) => {
  try {
    const payload = { _id: user._id, roles: user.roles };
    const secret = ServerConfig.JWT_EMAIL_RESET_SECRET;
    const token = jwt.sign({ userID: user._id }, secret, { expiresIn: "15m" });
    return token;
  } catch (error) {
    return Promise.reject(error);
  }
};


export { generateTokens, generateTokenForResetPassword };
