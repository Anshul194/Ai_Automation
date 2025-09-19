import express from 'express';
const router = express.Router();
import userRouter from './userRouter.js';
import adminRouter from "./adminRoutes.js";
import categoryRoutes  from './categoryRoutes.js';
import SubcategoryRoutes from './subCategoryRoutes.js';
import roleRoutes from './roleRoutes.js';
import adminLogRouter from './adminLogRoutes.js';
import bannerRoutes from './bannerRoutes.js';
import locationRouter from './locationRouter.js';
import articleRouter from './articleRouter.js';
import shortRouter from './shortRouter.js';




router.get('/', (req, res) => {
  res.send('Hello World!');
});


// admin
router.use('/admin-log', adminLogRouter); // Admin log routes
router.use("/admin", adminRouter);



router.use('/user', userRouter);
//role
router.use('/roles', roleRoutes);
router.use("/category", categoryRoutes);
router.use("/subcategory", SubcategoryRoutes);
router.use('/banners', bannerRoutes);
router.use('/locations', locationRouter);
router.use('/articles', articleRouter);
router.use('/shorts', shortRouter);




export default router;
