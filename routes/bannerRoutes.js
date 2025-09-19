import express from 'express';
import bannerController from '../controllers/bannerController.js';
import { upload } from '../middlewares/upload-middleware.js';

const router = express.Router();

router.post(
  '/',
  upload.single('image'), // Use upload middleware for single image
  bannerController.create
);
router.get('/', bannerController.getAll);
router.get('/:id', bannerController.getById);
router.put(
  '/:id',
  upload.single('image'), // Use upload middleware for single image
  bannerController.update
);
router.delete('/:id', bannerController.delete);

export default router;
