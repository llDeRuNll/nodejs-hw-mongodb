import {
  loginUser,
  logoutSession,
  registerUser,
  resetPassword,
  sendResetEmail,
} from '../services/auth.js';
import createHttpError from 'http-errors';
import { refreshSession } from '../services/auth.js';
import jwt from 'jsonwebtoken';
import Session from '../db/models/Session.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await registerUser({ name, email, password });
  if (!user) {
    throw createHttpError(409, 'Email in use');
  }

  const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: '7d',
  });

  const now = new Date();
  const accessTokenValidUntil = new Date(now.getTime() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    now.getTime() + 7 * 24 * 60 * 60 * 1000,
  );

  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie('sessionId', session._id.toString(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};
export const login = async (req, res) => {
  const { email, password } = req.body;

  const { accessToken, refreshToken, sessionId } = await loginUser({
    email,
    password,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.cookie('sessionId', sessionId.toString(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken },
  });
};

export const refresh = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw createHttpError(401, 'No refresh token');
  }

  const {
    accessToken,
    refreshToken: newRefreshToken,
    sessionId,
  } = await refreshSession(refreshToken);

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie('sessionId', sessionId, {
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
export const sendResetEmailController = async (req, res, next) => {
  const { email } = req.body;
  await sendResetEmail(email);
  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};
export const resetPwd = async (req, res) => {
  const { token, password } = req.body;
  await resetPassword(token, password);
  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};
