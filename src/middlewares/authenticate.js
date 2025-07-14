import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import User from '../db/models/User.js';
import Session from '../db/models/Session.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) {
    return next(createHttpError(401, 'No access token'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const session = await Session.findOne({ accessToken: token });
    if (!session) {
      throw createHttpError(401, 'Session not found or token invalid');
    }
    if (session.accessTokenValidUntil < new Date()) {
      throw createHttpError(401, 'Access token expired');
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw createHttpError(401, 'User not found');
    }
    req.user = user;
    req.session = session;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(createHttpError(401, 'Access token expired'));
    }
    next(createHttpError(401, 'Invalid access token'));
  }
};
