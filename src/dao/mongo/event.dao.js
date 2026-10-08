import { EventModel } from '../../models/event.model.js';

export class EventDao {
  async create(eventData) {
    const created = await EventModel.create(eventData);
    return created.toObject();
  }

  async getById(id) {
    return EventModel.findById(id).populate('organizer', 'first_name last_name email role').lean();
  }

  /**
   * Listado con filtros, paginacion y ordenamiento.
   * Devuelve la estructura { docs, total, page, limit, totalPages }.
   */
  async getPaginated({ filter = {}, page = 1, limit = 10, sort = { date: 1 } }) {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      EventModel.find(filter)
        .populate('organizer', 'first_name last_name email role')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      EventModel.countDocuments(filter),
    ]);

    return {
      docs,
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    };
  }

  async update(id, payload) {
    return EventModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      .populate('organizer', 'first_name last_name email role')
      .lean();
  }

  /**
   * Reserva cupos de forma atomica: el $inc solo se aplica si alcanza la capacidad.
   * Devuelve null si no hay lugar, sin condiciones de carrera entre inscripciones concurrentes.
   */
  async reserveSeats(id, quantity) {
    return EventModel.findOneAndUpdate(
      {
        _id: id,
        $expr: { $lte: [{ $add: [{ $ifNull: ['$reservedSeats', 0] }, quantity] }, '$capacity'] },
      },
      { $inc: { reservedSeats: quantity } },
      { new: true }
    ).lean();
  }

  async releaseSeats(id, quantity) {
    return EventModel.findOneAndUpdate(
      { _id: id, reservedSeats: { $gte: quantity } },
      { $inc: { reservedSeats: -quantity } },
      { new: true }
    ).lean();
  }

  async delete(id) {
    return EventModel.findByIdAndDelete(id).lean();
  }
}

export default EventDao;
