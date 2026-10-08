import { CustomError } from '../utils/CustomError.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/config.js';

/** 404 para rutas inexistentes. */
export const notFoundHandler = (req, res, next) => {
  next(CustomError.notFound(`La ruta ${req.method} ${req.originalUrl} no existe`));
};

/** Middleware centralizado de errores. */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (error, req, res, next) => {
  let status = error.status || 500;
  let message = error.message || 'Error interno del servidor';

  // Errores de Mongoose traducidos a codigos HTTP
  if (error.name === 'ValidationError') {
    status = 400;
    message = Object.values(error.errors || {})
      .map((e) => e.message)
      .join(' | ') || 'Datos invalidos';
  }
  if (error.name === 'CastError') {
    status = 400;
    message = `El valor enviado para ${error.path} no es valido`;
  }
  if (error.code === 11000) {
    status = 409;
    message = `Ya existe un registro con ese valor unico: ${Object.keys(error.keyValue || {}).join(', ')}`;
  }
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token invalido o expirado';
  }

  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${message}\n${error.stack}`);
  }

  const body = { status: 'error', message };
  if (error.details) body.details = error.details;
  if (config.env === 'development' && status >= 500) body.stack = error.stack;

  return res.status(status).json(body);
};

export default { errorHandler, notFoundHandler };
