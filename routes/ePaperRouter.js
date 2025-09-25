import express from 'express';
import {
  createEPaper,
  getAllEPapers,
  getEPaperById,
  updateEPaper,
  deleteEPaper,
} from '../controllers/EPaperController.js';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import passport from 'passport';
import { isAdmin } from '../middlewares/roleMiddleware.js';
import { upload } from '../middlewares/upload-middleware.js';

const ePaperRouter = express.Router();

// 🔓 Public routes
ePaperRouter.get('/', getAllEPapers);
ePaperRouter.get('/:id', getEPaperById);

// 🔒 Protected routes (Admin only)
ePaperRouter.post(
  '/',
  accessTokenAutoRefresh,
  isAdmin,
  upload.array('pages', 20), // multiple files allowed
  createEPaper
);

ePaperRouter.put(
  '/:id',
  accessTokenAutoRefresh,
  isAdmin,
  upload.array('pages', 20),
  updateEPaper
);

ePaperRouter.delete(
  '/:id',
  accessTokenAutoRefresh,
  isAdmin,
  deleteEPaper
);

export default ePaperRouter;
