import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import apiRouter from './routes/index.js';
import { initializePassport } from './config/passport.config.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  initializePassport();
  app.use(passport.initialize());

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
