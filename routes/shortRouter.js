import express from 'express';
import {
  createShort,
  getAllShorts,
  getShortById,
  updateShort,
  deleteShort,
  searchShorts,
} from '../controllers/shortController.js';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import passport from 'passport';
import { isAdmin } from '../middlewares/roleMiddleware.js';
import checkPermission from '../middlewares/checkPermission.js';
import checkOriginForAdmin from '../middlewares/checkOriginForAdmin.js';
import { upload } from '../middlewares/upload-middleware.js';

const shortRouter = express.Router();

// 🔓 Public routes
shortRouter.get('/search', searchShorts);
shortRouter.get(
  '/',

  getAllShorts
);
shortRouter.get('/:shortId', getShortById);

// 🔒 Protected routes (Admin only)
shortRouter.post(
  '/',
  accessTokenAutoRefresh,
  isAdmin,
  upload.fields([{ name: 'videoImage', maxCount: 1 }, { name: 'thumbnailImage', maxCount: 1 }]),
  createShort
);

shortRouter.put(
  '/:shortId',
  accessTokenAutoRefresh,
  isAdmin,
  upload.fields([{ name: 'videoImage', maxCount: 1 }, { name: 'thumbnailImage', maxCount: 1 }]),
  updateShort
);

shortRouter.delete(
  '/:shortId',
  accessTokenAutoRefresh,
  isAdmin,
  deleteShort
);

export default shortRouter;