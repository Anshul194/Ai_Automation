import accessTokenAutoRefresh from './accessTokenAutoRefresh.js';
import passport from 'passport';
import { isAdmin } from './roleMiddleware.js';

const checkOriginForAdmin = (req, res, next) => {
  const origin = req.get('origin') || req.get('referer') || '';
  console.log('Origin:', origin);
  if (origin.startsWith('https://kesariya-sooty.vercel.app') || origin.startsWith('http://localhost:5173')) {
    console.log('Accessing from allowed host, requiring token and admin role');
    return accessTokenAutoRefresh(req, res, () => {
      passport.authenticate('jwt', { session: false })(req, res, () => {
        isAdmin(req, res, next);
      });
    });
  }
  console.log('Accessing from other host, allowing public access');
  next();
};

export default checkOriginForAdmin;
