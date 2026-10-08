import passport from 'passport';
import { CustomError } from '../utils/CustomError.js';

/** Traduce los mensajes internos de Passport a mensajes de la API. */
const MESSAGES = {
  'No auth token': 'No autenticado: falta el token de sesion',
  'Missing credentials': 'Email y password son obligatorios',
  'jwt expired': 'La sesion expiro, volve a iniciar sesion',
  'invalid signature': 'Token invalido',
};

/**
 * Ejecuta una estrategia de Passport y delega los errores al middleware centralizado.
 */
export const passportCall = (strategy, { failWith = 401 } = {}) => (req, res, next) => {
  passport.authenticate(strategy, { session: false }, (error, user, info) => {
    if (error) return next(error);
    if (!user) {
      const raw = info?.message || info?.toString() || 'No autenticado';
      return next(new CustomError(MESSAGES[raw] ?? raw, failWith));
    }
    req.user = user;
    return next();
  })(req, res, next);
};

/** Middleware de autenticacion: 401 si no hay JWT valido. */
export const authenticate = passportCall('current', { failWith: 401 });

/** Middleware de autorizacion por rol: 403 si el rol no esta habilitado. */
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(CustomError.unauthorized('Debes iniciar sesion para continuar'));
  if (!roles.includes(req.user.role)) {
    return next(
      CustomError.forbidden(`Acceso restringido. Roles permitidos: ${roles.join(', ')}`)
    );
  }
  return next();
};

export default { authenticate, authorize, passportCall };
