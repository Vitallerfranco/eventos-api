import { ticketRepository, eventRepository, userRepository } from '../repositories/index.js';
import { TicketDTO } from '../dto/ticket.dto.js';
import { CustomError } from '../utils/CustomError.js';
import { assertObjectId } from '../utils/validators.js';
import { generateReservationCode } from '../utils/reservationCode.js';
import { mailService } from './mail.service.js';

export class TicketService {
  constructor(repository, eventsRepository, usersRepository, mailer) {
    this.repository = repository;
    this.eventRepository = eventsRepository;
    this.userRepository = usersRepository;
    this.mailService = mailer;
  }

  async #getEventOrFail(eventId) {
    assertObjectId(eventId, 'id del evento');
    const event = await this.eventRepository.getById(eventId);
    if (!event) throw CustomError.notFound('Evento no encontrado');
    return event;
  }

  /**
   * Inscripcion: valida evento publicado, duplicados y cupo disponible.
   */
  async createTicket({ eventId, currentUser, quantity = 1 }) {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      throw CustomError.badRequest('La cantidad debe ser un numero entero mayor a 0');
    }

    const event = await this.#getEventOrFail(eventId);

    if (event.status !== 'published') {
      throw CustomError.conflict('Solo es posible inscribirse a eventos publicados');
    }
    if (new Date(event.date).getTime() <= Date.now()) {
      throw CustomError.conflict('El evento ya ocurrio, no admite nuevas inscripciones');
    }

    const duplicated = await this.repository.findActiveByUserAndEvent(currentUser.id, event._id);
    if (duplicated) throw CustomError.conflict('Ya tenes una inscripcion activa a este evento');

    // Reserva atomica del cupo antes de crear el ticket: evita sobreventa con inscripciones concurrentes.
    const reservedEvent = await this.eventRepository.reserveSeats(event._id, qty);
    if (!reservedEvent) {
      const current = await this.eventRepository.getById(event._id);
      const available = Math.max((current?.capacity ?? 0) - (current?.reservedSeats ?? 0), 0);
      throw CustomError.conflict(
        available <= 0
          ? 'El evento no tiene cupos disponibles'
          : `Cupo insuficiente: quedan ${available} lugares disponibles`
      );
    }

    let ticket;
    try {
      ticket = await this.repository.create({
        user: currentUser.id,
        event: event._id,
        quantity: qty,
        status: 'active',
        reservationCode: generateReservationCode(),
      });
    } catch (error) {
      // Si el ticket no se crea, se devuelve el cupo reservado.
      await this.eventRepository.releaseSeats(event._id, qty);
      // Indice unico parcial (user + event + status active)
      if (error?.code === 11000) {
        throw CustomError.conflict('Ya tenes una inscripcion activa a este evento');
      }
      throw error;
    }

    const user = await this.userRepository.getById(currentUser.id);
    await this.mailService.sendTicketConfirmation({ user, event, ticket });

    return TicketDTO.from(ticket);
  }

  async getMyTickets(currentUser, { status } = {}) {
    const filter = status ? { status } : {};
    const tickets = await this.repository.getByUser(currentUser.id, filter);
    return TicketDTO.fromMany(tickets);
  }

  /**
   * Listado por evento: solo el organizador dueño o un admin.
   */
  async getByEvent(eventId, currentUser) {
    const event = await this.#getEventOrFail(eventId);
    const organizerId = String(event.organizer?._id ?? event.organizer);

    if (currentUser.role !== 'admin' && organizerId !== String(currentUser.id)) {
      throw CustomError.forbidden('Solo el organizador dueño del evento o un admin pueden ver las inscripciones');
    }

    const tickets = await this.repository.getByEvent(event._id);
    const reserved = event.reservedSeats ?? 0;

    return {
      tickets: TicketDTO.fromMany(tickets),
      summary: {
        capacity: event.capacity,
        reservedSeats: reserved,
        availableSeats: Math.max(event.capacity - reserved, 0),
      },
    };
  }

  /**
   * Cancelacion logica: cambia status, nunca borra el documento.
   */
  async cancelTicket(ticketId, currentUser) {
    assertObjectId(ticketId, 'id del ticket');

    const ticket = await this.repository.getById(ticketId);
    if (!ticket) throw CustomError.notFound('Ticket no encontrado');

    const ownerId = String(ticket.user);
    if (currentUser.role !== 'admin' && ownerId !== String(currentUser.id)) {
      throw CustomError.forbidden('Solo el dueño del ticket o un admin pueden cancelarlo');
    }

    if (ticket.status === 'cancelled') {
      throw CustomError.conflict('El ticket ya se encuentra cancelado');
    }
    if (ticket.status === 'used') {
      throw CustomError.conflict('El ticket ya fue utilizado y no puede cancelarse');
    }

    // Solo una cancelacion concurrente gana; las demas ven que ya no esta activo.
    const updated = await this.repository.cancelIfActive(ticketId);
    if (!updated) throw CustomError.conflict('El ticket ya se encuentra cancelado');
    await this.eventRepository.releaseSeats(ticket.event, ticket.quantity);

    const [user, event] = await Promise.all([
      this.userRepository.getById(ownerId),
      this.eventRepository.getById(ticket.event),
    ]);
    if (user && event) await this.mailService.sendTicketCancellation({ user, event, ticket: updated });

    return TicketDTO.from(updated);
  }
}

export const ticketService = new TicketService(
  ticketRepository,
  eventRepository,
  userRepository,
  mailService
);

export default ticketService;
