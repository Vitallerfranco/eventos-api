export class TicketRepository {
  constructor(dao) {
    this.dao = dao;
  }

  create(ticketData) {
    return this.dao.create(ticketData);
  }

  getById(id) {
    return this.dao.getById(id);
  }

  getByIdPopulated(id) {
    return this.dao.getByIdPopulated(id);
  }

  getByUser(userId, filter) {
    return this.dao.getByUser(userId, filter);
  }

  getByEvent(eventId, filter) {
    return this.dao.getByEvent(eventId, filter);
  }

  findActiveByUserAndEvent(userId, eventId) {
    return this.dao.findActiveByUserAndEvent(userId, eventId);
  }

  cancelIfActive(id) {
    return this.dao.cancelIfActive(id);
  }

  update(id, payload) {
    return this.dao.update(id, payload);
  }
}

export default TicketRepository;
