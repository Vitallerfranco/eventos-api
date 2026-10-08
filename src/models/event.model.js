import mongoose from 'mongoose';
import { EVENT_STATUS } from '../utils/constants.js';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    date: { type: Date, required: true, index: true },
    location: { type: String, required: true, trim: true, index: true },
    capacity: { type: Number, required: true, min: 1 },
    // Cupos ocupados por tickets activos/usados. Se modifica solo con $inc atomico (ver EventDao).
    reservedSeats: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 0, default: 0 },
    status: { type: String, enum: EVENT_STATUS, default: 'draft', index: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

export const EventModel = mongoose.model('Event', eventSchema);

export default EventModel;
