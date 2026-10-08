import { TicketModel } from '../../models/ticket.model.js';

const EVENT_POPULATE = { path: 'event', select: 'title date location status price' };
const USER_POPULATE = { path: 'user', select: 'first_name last_name email' };

export class TicketDao {
  async create(ticketData) {
    const created = await TicketModel.create(ticketData);
    return created.toObject();
  }

  async getById(id) {
    return TicketModel.findById(id).lean();
  }

  async getByIdPopulated(id) {
    return TicketModel.findById(id).populate(EVENT_POPULATE).populate(USER_POPULATE).lean();
  }

  async getByUser(userId, filter = {}) {
    return TicketModel.find({ user: userId, ...filter })
      .populate(EVENT_POPULATE)
      .sort({ createdAt: -1 })
      .lean();
  }

  async getByEvent(eventId, filter = {}) {
    return TicketModel.find({ event: eventId, ...filter })
      .populate(USER_POPULATE)
      .sort({ createdAt: -1 })
      .lean();
  }

  async findActiveByUserAndEvent(userId, eventId) {
    return TicketModel.findOne({ user: userId, event: eventId, status: 'active' }).lean();
  }

  /**
   * Cancela solo si sigue activo: dos cancelaciones concurrentes no pueden liberar el cupo dos veces.
   */
  async cancelIfActive(id) {
    return TicketModel.findOneAndUpdate(
      { _id: id, status: 'active' },
      { status: 'cancelled', cancelledAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate(EVENT_POPULATE)
      .lean();
  }

  async update(id, payload) {
    return TicketModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      .populate(EVENT_POPULATE)
      .lean();
  }
}

export default TicketDao;
