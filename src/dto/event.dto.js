import { UserDTO } from './user.dto.js';

const isPopulated = (value) => value && typeof value === 'object' && !Array.isArray(value) && 'email' in value;

export class EventDTO {
  constructor(event = {}, extra = {}) {
    this.id = String(event._id ?? event.id ?? '');
    this.title = event.title;
    this.description = event.description;
    this.category = event.category;
    this.date = event.date;
    this.location = event.location;
    this.capacity = event.capacity;
    this.price = event.price;
    this.status = event.status;
    this.organizer = isPopulated(event.organizer)
      ? UserDTO.from(event.organizer)
      : String(event.organizer ?? '');
    this.createdAt = event.createdAt;

    if (extra.reservedSeats !== undefined) {
      this.reservedSeats = extra.reservedSeats;
      this.availableSeats = Math.max(event.capacity - extra.reservedSeats, 0);
    }
  }

  static from(event, extra) {
    return event ? new EventDTO(event, extra) : null;
  }

  static fromMany(events = []) {
    return events.map((event) => new EventDTO(event));
  }
}

export default EventDTO;
