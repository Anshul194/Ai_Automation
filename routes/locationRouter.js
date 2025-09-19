import express from 'express';
import {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  getActiveLocations,
  updateLocationStatus,
  searchLocations,
} from '../controllers/locationController.js';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import passport from 'passport';
import { isAdmin } from '../middlewares/roleMiddleware.js';
import checkPermission from '../middlewares/checkPermission.js';
import checkOriginForAdmin from '../middlewares/checkOriginForAdmin.js';

const locationRouter = express.Router();

// 🔓 Public routes
locationRouter.get('/active', getActiveLocations);
locationRouter.get('/search', searchLocations);
locationRouter.get(
  '/',
  checkOriginForAdmin,
  getAllLocations
);
locationRouter.get('/:locationId', getLocationById);

// 🔒 Protected routes (Admin only)
locationRouter.post(
  '/',
  accessTokenAutoRefresh,
  isAdmin,
  createLocation
);
locationRouter.put(
  '/:locationId',
  accessTokenAutoRefresh,
  isAdmin,
  updateLocation
);

locationRouter.delete(
  '/:locationId',
  accessTokenAutoRefresh,
  isAdmin,
  deleteLocation
);


locationRouter.patch(
  '/:locationId/status',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  checkPermission('Locations', 'update'),
  updateLocationStatus
);

export default locationRouter;