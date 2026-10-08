import { userDao, eventDao, ticketDao } from '../dao/index.js';
import { UserRepository } from './user.repository.js';
import { EventRepository } from './event.repository.js';
import { TicketRepository } from './ticket.repository.js';

export const userRepository = new UserRepository(userDao);
export const eventRepository = new EventRepository(eventDao);
export const ticketRepository = new TicketRepository(ticketDao);

export default { userRepository, eventRepository, ticketRepository };
