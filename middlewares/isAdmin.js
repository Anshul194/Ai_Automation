export const isAdmin = (req, res, next) => {
  console.log('User role:', req.user ? req.user.role : 'No user');
  console.log('User:', req.user);

  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Admin role required',
    data: {},
    err: { message: 'Unauthorized access' },
  });
};