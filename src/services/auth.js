import bcrypt from 'bcrypt';
import User from '../db/models/User.js';
import Session from '../db/models/Session.js';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return null;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const userData = user.toObject();
  delete userData.password;
  return userData;
};

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export const refreshSession = async (refreshToken) => {
  const session = await Session.findOne({ refreshToken });
  if (!session) throw createHttpError(401, 'Refresh token invalid');

  if (session.refreshTokenValidUntil < new Date()) {
    await Session.deleteOne({ _id: session._id });
    throw createHttpError(401, 'Refresh token expired');
  }

  await Session.deleteOne({ _id: session._id });

  const user = await User.findById(session.userId);
  if (!user) throw createHttpError(401, 'User not found');

  const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshTokenNew = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: '7d',
  });

  const now = new Date();
  const accessTokenValidUntil = new Date(now.getTime() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    now.getTime() + 7 * 24 * 60 * 60 * 1000,
  );

  const newSession = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken: refreshTokenNew,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return {
    accessToken,
    refreshToken: refreshTokenNew,
    sessionId: newSession._id.toString(),
  };
};

export const logoutSession = async ({ sessionId, refreshToken }) => {
  const session = await Session.findOne({ _id: sessionId, refreshToken });
  if (!session)
    throw createHttpError(401, 'Session not found or token invalid');
  await Session.deleteOne({ _id: sessionId });
  return true;
};
