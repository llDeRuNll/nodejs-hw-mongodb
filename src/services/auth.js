import bcrypt from 'bcrypt';
import User from '../db/models/User.js';
import Session from '../db/models/Session.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import createHttpError from 'http-errors';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
  JWT_SECRET,
  APP_DOMAIN,
} = process.env;

const JWT_SECRET_USED = JWT_SECRET || 'secretkey';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

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

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(401, 'Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw createHttpError(401, 'Invalid credentials');

  await Session.deleteMany({ userId: user._id });

  const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: '30d',
  });

  const now = new Date();
  const accessTokenValidUntil = new Date(now.getTime() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000,
  );

  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return { accessToken, refreshToken, sessionId: session._id.toString() };
};

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

  const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET_USED, {
    expiresIn: '15m',
  });
  const refreshTokenNew = jwt.sign({ userId: user._id }, JWT_SECRET_USED, {
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

export const sendResetEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(404, 'User not found!');

  const token = jwt.sign({ email }, JWT_SECRET_USED, { expiresIn: '5m' });
  const resetLink = `${APP_DOMAIN.replace(
    /\/$/,
    '',
  )}/reset-password?token=${token}`;

  const mailOptions = {
    from: SMTP_FROM,
    to: email,
    subject: 'Reset your password',
    html: `
      <p>Hello,</p>
      <p>To reset your password, click the link below:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link is valid for 5 minutes.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};
