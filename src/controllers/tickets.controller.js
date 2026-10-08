import { ticketService } from '../services/ticket.service.js';

export class TicketsController {
  /** POST /api/events/:eid/tickets */
  create = async (req, res) => {
    const ticket = await ticketService.createTicket({
      eventId: req.params.eid,
      currentUser: req.user,
      quantity: req.body?.quantity ?? 1,
    });
    res.status(201).json({ status: 'success', payload: ticket });
  };

  /** GET /api/tickets/my-tickets */
  myTickets = async (req, res) => {
    const tickets = await ticketService.getMyTickets(req.user, { status: req.query.status });
    res.status(200).json({ status: 'success', payload: tickets });
  };

  /** GET /api/events/:eid/tickets */
  byEvent = async (req, res) => {
    const { tickets, summary } = await ticketService.getByEvent(req.params.eid, req.user);
    res.status(200).json({ status: 'success', payload: tickets, summary });
  };

  /** PATCH /api/tickets/:tid/cancel */
  cancel = async (req, res) => {
    const ticket = await ticketService.cancelTicket(req.params.tid, req.user);
    res.status(200).json({ status: 'success', message: 'Inscripcion cancelada', payload: ticket });
  };
}

export const ticketsController = new TicketsController();

export default ticketsController;
