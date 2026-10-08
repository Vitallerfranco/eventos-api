export class EventRepository {
  constructor(dao) {
    this.dao = dao;
  }

  create(eventData) {
    return this.dao.create(eventData);
  }

  getById(id) {
    return this.dao.getById(id);
  }

  getPaginated(options) {
    return this.dao.getPaginated(options);
  }

  update(id, payload) {
    return this.dao.update(id, payload);
  }

  reserveSeats(id, quantity) {
    return this.dao.reserveSeats(id, quantity);
  }

  releaseSeats(id, quantity) {
    return this.dao.releaseSeats(id, quantity);
  }

  delete(id) {
    return this.dao.delete(id);
  }
}

export default EventRepository;
