import mongoose from 'mongoose';
import { config } from './config.js';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongoUrl);
    logger.info('MongoDB conectado correctamente');
  } catch (error) {
    logger.error(`No se pudo conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};

export default connectDB;
