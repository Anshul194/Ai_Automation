const setTokensCookies = (res, accessToken, refreshToken, accessTokenExp, refreshTokenExp) => {
  const accessTokenMaxAge = accessTokenExp - Date.now();
  const refreshTokenMaxAge = refreshTokenExp - Date.now();

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: accessTokenMaxAge
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: refreshTokenMaxAge
  });
};

export { setTokensCookies };