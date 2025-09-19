import express from "express";
import { AdminSignup, AdminLogin, AdminSignupWithRole, getAllAdmins, getAdminById, deleteAdminById, updateAdminById } from "../controllers/adminController.js";
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import passport from 'passport';
import { isAdmin } from '../middlewares/roleMiddleware.js';
import checkPermission from '../middlewares/checkPermission.js';

const adminRouter = express.Router();

adminRouter.post("/signup", AdminSignup);
adminRouter.post("/login", AdminLogin);
adminRouter.post("/signup-versioned", AdminSignupWithRole);
adminRouter.put("/update/:id", updateAdminById);

adminRouter.get("/all", accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  getAllAdmins);
adminRouter.get("/:id", accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  checkPermission('Admin', 'read'),
  getAdminById);

adminRouter.delete("/:id",
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  deleteAdminById
);

export default adminRouter;