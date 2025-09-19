import jwt from "jsonwebtoken";

const isTokenExpired = (token) => {
  if (!token) {
    return true; // No token at all → treat as expired
  }
  try {
    const decodedToken = jwt.decode(token);
    console.log("🔍 Decoded Token:", decodedToken);

    // If no exp field, treat as never expired
    if (!decodedToken || decodedToken.exp === undefined) {
      return false; // Never expires
    }

    const currentTime = Date.now() / 1000; // in seconds
    console.log("⏰ Current Time:", currentTime);
    console.log("⏰ Token Expiration Time:", decodedToken.exp);

    return decodedToken.exp < currentTime; // true = expired, false = valid
  } catch (error) {
    console.error("❌ Error decoding token:", error.message);
    return true;
  }
};

export { isTokenExpired };
