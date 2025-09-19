
import express from 'express';
import { createRole, getRoles, getRoleById, updateRole, deleteRole } from '../controllers/roleController.js';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import passport from 'passport';
import { isAdmin } from '../middlewares/roleMiddleware.js';
import checkPermission from '../middlewares/checkPermission.js';

const router = express.Router();


router.post('/',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    checkPermission('Role', 'create'),
    createRole);

router.get('/',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    checkPermission('Role', 'read'),
    getRoles);

router.get('/:id',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    checkPermission('Role', 'read'),
    getRoleById);

router.put('/:id',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    checkPermission('Role', 'update'),
    updateRole);

router.delete('/:id',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    checkPermission('Role', 'delete'),
    deleteRole);

export default router;
