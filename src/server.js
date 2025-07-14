import express from 'express';
import cors from 'cors';
import contactsRouter from './routers/contacts.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import authRouter from './routers/auth.js';
import cookieParser from 'cookie-parser';

export const setupServer = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('<h1>Contacts main page</h1>');
  });

  app.use('/contacts', contactsRouter);

  app.use(notFoundHandler);

  app.use(errorHandler);

  app.use('/auth', authRouter);

  app.use(cookieParser());

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Server is running on ${port} port`));
};
