export const getClientIp = (req) => {
  let ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip;
  if (ip?.includes(',')) ip = ip.split(',')[0].trim();
  if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1';
  if (ip?.startsWith('::ffff:')) ip = ip.substring(7);
  return ip || 'unknown';
};
