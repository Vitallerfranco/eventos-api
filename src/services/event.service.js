import { eventRepository } from '../repositories/index.js';
import { EventDTO } from '../dto/event.dto.js';
import { CustomError } from '../utils/CustomError.js';
import { EVENT_STATUS } from '../utils/constants.js';
import { assertObjectId, assertRequiredFields, parseDate, parsePositiveInt } from '../utils/validators.js';

const SORT_FIELDS = ['date', 'price', 'title', 'createdAt'];

export class EventService {
  constructor(repository) {
    this.repository = repository;
  }

  #assertOwnershipOrAdmin(event, user) {
    const organizerId = String(event.organizer?._id ?? event.organizer);
    if (user.role !== 'admin' && organizerId !== String(user.id)) {
      throw CustomError.forbidden('Solo el organizador dueño del evento o un admin pueden modificarlo');
    }
  }

  #validateEventPayload({ date, capacity, price }, { partial = false } = {}) {
    if (date !== undefined) {
      const parsed = parseDate(date, 'fecha del evento');
      if (parsed.getTime() <= Date.now()) {
        throw CustomError.badRequest('La fecha del evento no puede estar en el pasado');
      }
    } else if (!partial) {
      throw CustomError.badRequest('La fecha del evento es obligatoria');
    }

    if (capacity !== undefined) {
      const parsed = Number(capacity);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw CustomError.badRequest('La capacidad debe ser un numero entero mayor a 0');
      }
    }

    if (price !== undefined) {
      const parsed = Number(price);
      if (Number.isNaN(parsed) || parsed < 0) {
        throw CustomError.badRequest('El precio debe ser mayor o igual a 0');
      }
    }
  }

  async create(payload, currentUser) {
    assertRequiredFields(payload, ['title', 'description', 'category', 'date', 'location', 'capacity']);
    this.#validateEventPayload(payload);

    if (payload.status && !EVENT_STATUS.includes(payload.status)) {
      throw CustomError.badRequest(`El status debe ser uno de: ${EVENT_STATUS.join(', ')}`);
    }

    const created = await this.repository.create({
      title: String(payload.title).trim(),
      description: String(payload.description).trim(),
      category: String(payload.category).trim().toLowerCase(),
      date: new Date(payload.date),
      location: String(payload.location).trim(),
      capacity: Number(payload.capacity),
      price: payload.price !== undefined ? Number(payload.price) : 0,
      status: payload.status ?? 'draft',
      organizer: currentUser.id,
    });

    return EventDTO.from(created);
  }

  /**
   * Listado con filtros, orden y paginacion.
   */
  async list(query = {}) {
    const page = parsePositiveInt(query.page, 1);
    const limit = Math.min(parsePositiveInt(query.limit, 10), 100);

    const filter = {};
    if (query.status) {
      if (!EVENT_STATUS.includes(query.status)) {
        throw CustomError.badRequest(`El filtro status debe ser uno de: ${EVENT_STATUS.join(', ')}`);
      }
      filter.status = query.status;
    }
    if (query.category) filter.category = String(query.category).toLowerCase();
    if (query.location) filter.location = { $regex: String(query.location), $options: 'i' };
    if (query.organizer) filter.organizer = assertObjectId(query.organizer, 'organizer');

    if (query.dateFrom || query.dateTo) {
      filter.date = {};
      if (query.dateFrom) filter.date.$gte = parseDate(query.dateFrom, 'fecha dateFrom');
      if (query.dateTo) filter.date.$lte = parseDate(query.dateTo, 'fecha dateTo');
    }

    const sortField = SORT_FIELDS.includes(query.sortBy) ? query.sortBy : 'date';
    const sortOrder = String(query.order).toLowerCase() === 'desc' ? -1 : 1;

    const result = await this.repository.getPaginated({
      filter,
      page,
      limit,
      sort: { [sortField]: sortOrder },
    });

    return {
      data: EventDTO.fromMany(result.docs),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
  }

  async getById(id) {
    assertObjectId(id, 'id del evento');
    const event = await this.repository.getById(id);
    if (!event) throw CustomError.notFound('Evento no encontrado');

    return EventDTO.from(event, { reservedSeats: event.reservedSeats ?? 0 });
  }

  async getRawById(id) {
    assertObjectId(id, 'id del evento');
    const event = await this.repository.getById(id);
    if (!event) throw CustomError.notFound('Evento no encontrado');
    return event;
  }

  async update(id, payload, currentUser) {
    const event = await this.getRawById(id);
    this.#assertOwnershipOrAdmin(event, currentUser);

    if (event.status === 'cancelled') {
      throw CustomError.conflict('No se puede modificar un evento cancelado');
    }

    this.#validateEventPayload(payload, { partial: true });

    if (payload.capacity !== undefined) {
      const reserved = event.reservedSeats ?? 0;
      if (Number(payload.capacity) < reserved) {
        throw CustomError.conflict(
          `No se puede reducir la capacidad por debajo de los ${reserved} cupos ya reservados`
        );
      }
    }

    const allowed = ['title', 'description', 'category', 'date', 'location', 'capacity', 'price'];
    const updatePayload = {};
    allowed.forEach((field) => {
      if (payload[field] !== undefined) updatePayload[field] = payload[field];
    });

    if (Object.keys(updatePayload).length === 0) {
      throw CustomError.badRequest('No se enviaron campos validos para actualizar');
    }

    if (updatePayload.category) updatePayload.category = String(updatePayload.category).toLowerCase();
    if (updatePayload.date) updatePayload.date = new Date(updatePayload.date);

    const updated = await this.repository.update(id, updatePayload);
    return EventDTO.from(updated);
  }

  async updateStatus(id, status, currentUser) {
    if (!status) throw CustomError.badRequest('El campo status es obligatorio');
    if (!EVENT_STATUS.includes(status)) {
      throw CustomError.badRequest(`El status debe ser uno de: ${EVENT_STATUS.join(', ')}`);
    }

    const event = await this.getRawById(id);
    this.#assertOwnershipOrAdmin(event, currentUser);

    if (event.status === 'cancelled') {
      throw CustomError.conflict('El evento ya esta cancelado y no admite cambios de estado');
    }
    if (event.status === status) {
      throw CustomError.conflict(`El evento ya se encuentra en estado ${status}`);
    }

    const updated = await this.repository.update(id, { status });
    return EventDTO.from(updated);
  }

  async delete(id, currentUser) {
    const event = await this.getRawById(id);
    this.#assertOwnershipOrAdmin(event, currentUser);
    await this.repository.delete(id);
    return { id: String(event._id) };
  }
}

export const eventService = new EventService(eventRepository);

export default eventService;
