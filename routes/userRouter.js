import express from 'express'; 
import { requestOtp, verifyOtp, completeRegistration, Logout, getAllUsers, getUserById, blockUser, unblockUser, createUserByAdmin, updateUserWallet, getWalletBalance,exportCustomers} from '../controllers/userController.js';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import passport from 'passport';
import { isAdmin } from '../middlewares/roleMiddleware.js';
import dotenv from 'dotenv';
import checkPermission from '../middlewares/checkPermission.js';
dotenv.config();


const userRouter = express.Router();

userRouter.post("/auth/request-otp", requestOtp);
userRouter.post("/auth/verify-otp", verifyOtp);
userRouter.get("/check-force-update", 
  (req, res) => {
    console.log("Checking force update...", process.env.APP_VERSION);
    console.log("Force update status:", process.env.FORCE_UPDATE);
    console.log("Force android update status:", process.env.ANDROID_FORCE_UPDATE);
    console.log("Android Verzion :", process.env.ANDROID_APP_VERSION);
    res.json({
      APP_VERSION: process.env.APP_VERSION,
      FORCE_UPDATE: true,
        ANDROID_APP_VERSION: process.env.ANDROID_APP_VERSION,
      ANDROID_FORCE_UPDATE: true,
    });
  },
);




  



userRouter.post("/auth/complete-registration", completeRegistration);

userRouter.post("/admin/create-user",
  accessTokenAutoRefresh,
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  checkPermission('User', 'create'),
  createUserByAdmin
);
userRouter.get('/export-customers',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  exportCustomers
);

userRouter.get('/get-all',
    accessTokenAutoRefresh,isAdmin,  checkPermission('User', 'read'),

     getAllUsers);
userRouter.get('/:userId', 
    accessTokenAutoRefresh,passport.authenticate('jwt', { session: false }),isAdmin,
    getUserById);
userRouter.patch('/:userId/block', accessTokenAutoRefresh, passport.authenticate('jwt', { session: false }), isAdmin,
checkPermission('User', 'update'),
blockUser);
userRouter.patch('/:userId/unblock', accessTokenAutoRefresh, passport.authenticate('jwt', { session: false }), isAdmin,
  checkPermission('User', 'update'),
 unblockUser);

userRouter.patch('/:userId/wallet',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  checkPermission('User', 'update'),
  updateUserWallet
);

//getwalletBalance

userRouter.get('/get-wallet-balance',
  accessTokenAutoRefresh,
  getWalletBalance
);



 
userRouter.post('/logout', Logout);

export default userRouter;
