import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getActiveCategories,
  updateCategoryStatus,
  searchCategories,
} from '../controllers/categoryController.js';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import passport from 'passport';
import { isAdmin } from '../middlewares/roleMiddleware.js';
import checkPermission from '../middlewares/checkPermission.js';
import checkOriginForAdmin from '../middlewares/checkOriginForAdmin.js';

const categoryRouter = express.Router();

// 🔓 Public routes
categoryRouter.get('/active', getActiveCategories);
categoryRouter.get('/search', searchCategories);
categoryRouter.get(
  '/',
  checkOriginForAdmin,
  getAllCategories
);

// Get category by ID
categoryRouter.get('/:categoryId', getCategoryById);

// 🔒 Protected routes (Admin only)

// Create Category
categoryRouter.post(
  '/',
  accessTokenAutoRefresh,
  isAdmin,
  checkPermission('Categories', 'create'),
  createCategory
);

// Update category
categoryRouter.put(
  '/:categoryId',
  accessTokenAutoRefresh,
  isAdmin,
  checkPermission('Categories', 'update'),
  updateCategory
);

// Delete category
categoryRouter.delete(
  '/:categoryId',
  accessTokenAutoRefresh,
  isAdmin,
  checkPermission('Categories', 'delete'),
  deleteCategory
);

// Update category status (active/inactive)
categoryRouter.patch(
  '/:categoryId/status',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  checkPermission('Categories', 'update'),
  updateCategoryStatus
);

export default categoryRouter;