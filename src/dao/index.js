/**
 * Factory de persistencia. Hoy exporta la implementacion de MongoDB;
 * cambiar de motor solo implica tocar este archivo.
 */
import { UserDao } from './mongo/user.dao.js';
import { EventDao } from './mongo/event.dao.js';
import { TicketDao } from './mongo/ticket.dao.js';

export const userDao = new UserDao();
export const eventDao = new EventDao();
export const ticketDao = new TicketDao();

export default { userDao, eventDao, ticketDao };
