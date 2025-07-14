import { logoutSession } from '../services/auth.js';
import createHttpError from 'http-errors';
import { refreshSession } from '../services/auth.js';

export const refresh = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw createHttpError(401, 'No refresh token');
  }

  const { accessToken, refreshToken: newRefreshToken } = await refreshSession(
    refreshToken,
  );

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken },
  });
};

export const logout = async (req, res, next) => {
  const sessionId = req.cookies?.sessionId;
  const refreshToken = req.cookies?.refreshToken;

  if (!sessionId || !refreshToken) {
    throw createHttpError(400, 'No session id or refresh token');
  }

  await logoutSession({ sessionId, refreshToken });

  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');

  res.status(204).send();
};
