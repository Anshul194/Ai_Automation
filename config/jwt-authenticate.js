import JWT from "passport-jwt";
// import User from "../models/user.js";
import Admin from "../models/admin.js";
import passport from "passport";
import { ServerConfig } from "./server.config.js";

const JwtStrategy = JWT.Strategy;
const ExtractJwt = JWT.ExtractJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ServerConfig.JWT_ACCESS_SECRET,
};

passport.use(
  "jwt", // Explicitly name the strategy
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      // Fixed the syntax error here - removed invalid asterisks
      const user = await Admin.findOne({ _id: jwt_payload._id }).select("-password");
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      console.error("JWT Strategy Error:", error);
      return done(error, false);
    }
  })
);

export default passport;