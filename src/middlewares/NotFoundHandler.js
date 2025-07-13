import createError from 'http-errors';

export const NotFoundHandler = (req, res, next) => {
  next(createError(404, 'Route not found'));
};
