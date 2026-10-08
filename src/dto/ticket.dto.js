import { UserDTO } from './user.dto.js';

const isPopulatedEvent = (value) => value && typeof value === 'object' && 'title' in value;
const isPopulatedUser = (value) => value && typeof value === 'object' && 'email' in value;

export class TicketDTO {
  constructor(ticket = {}) {
    this.id = String(ticket._id ?? ticket.id ?? '');
    this.reservationCode = ticket.reservationCode;
    this.quantity = ticket.quantity;
    this.status = ticket.status;
    this.createdAt = ticket.createdAt;
    this.cancelledAt = ticket.cancelledAt ?? null;

    this.event = isPopulatedEvent(ticket.event)
      ? {
          id: String(ticket.event._id ?? ticket.event.id ?? ''),
          title: ticket.event.title,
          date: ticket.event.date,
          location: ticket.event.location,
          status: ticket.event.status,
          price: ticket.event.price,
        }
      : String(ticket.event ?? '');

    this.user = isPopulatedUser(ticket.user) ? UserDTO.from(ticket.user) : String(ticket.user ?? '');
  }

  static from(ticket) {
    return ticket ? new TicketDTO(ticket) : null;
  }

  static fromMany(tickets = []) {
    return tickets.map((ticket) => new TicketDTO(ticket));
  }
}

export default TicketDTO;
