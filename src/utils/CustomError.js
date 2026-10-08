/**
 * Error de dominio con status HTTP.
 * Lo lanzan los services y lo traduce el middleware centralizado de errores.
 */
export class CustomError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'CustomError';
    this.status = status;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new CustomError(message, 400, details);
  }

  static unauthorized(message = 'No autenticado') {
    return new CustomError(message, 401);
  }

  static forbidden(message = 'No tenes permisos para realizar esta accion') {
    return new CustomError(message, 403);
  }

  static notFound(message = 'Recurso no encontrado') {
    return new CustomError(message, 404);
  }

  static conflict(message) {
    return new CustomError(message, 409);
  }

  static internal(message = 'Error interno del servidor') {
    return new CustomError(message, 500);
  }
}

export default CustomError;
