import express from "express";
import { getAdminLogs } from "../controllers/AdminLogincontroller.js";
import { isAdmin } from "../middlewares/roleMiddleware.js"; // Add a middleware to verify admin token
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import passport from "passport";

const router = express.Router();

router.get("/logs",accessTokenAutoRefresh, passport.authenticate('jwt', { session: false }), isAdmin, getAdminLogs);

export default router;