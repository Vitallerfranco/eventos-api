/**
 * Envuelve controllers async para que cualquier rechazo llegue
 * al middleware centralizado de errores sin try/catch repetido.
 */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
