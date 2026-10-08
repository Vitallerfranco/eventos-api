/**
 * Constantes de dominio compartidas.
 * Viven fuera de /models para que services y DTOs no necesiten importar Mongoose.
 */
export const USER_ROLES = ['user', 'organizer', 'admin'];

export const EVENT_STATUS = ['draft', 'published', 'cancelled', 'finished'];

export const TICKET_STATUS = ['active', 'cancelled', 'used'];
