import express from 'express';
import {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getPublishedArticles,
  updateArticleStatus,
  searchArticles,
} from '../controllers/articleController.js';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import passport from 'passport';
import { isAdmin } from '../middlewares/roleMiddleware.js';
import checkPermission from '../middlewares/checkPermission.js';
import checkOriginForAdmin from '../middlewares/checkOriginForAdmin.js';
import { upload } from '../middlewares/upload-middleware.js';

const articleRouter = express.Router();

// 🔓 Public routes
articleRouter.get('/published', getPublishedArticles);
articleRouter.get('/search', searchArticles);
articleRouter.get(
  '/',
  getAllArticles
);
articleRouter.get('/:articleId', getArticleById);

// 🔒 Protected routes (Admin only)
articleRouter.post(
  '/',
  accessTokenAutoRefresh,
  isAdmin,
  upload.single('featuredImage'),
  createArticle
);

articleRouter.put(
  '/:articleId',
  accessTokenAutoRefresh,
  isAdmin,
  upload.single('featuredImage'),
  updateArticle
);

articleRouter.delete(
  '/:articleId',
  accessTokenAutoRefresh,
  isAdmin,
  deleteArticle
);

articleRouter.patch(
  '/:articleId/status',
  accessTokenAutoRefresh,
  isAdmin,
  updateArticleStatus
);

export default articleRouter;