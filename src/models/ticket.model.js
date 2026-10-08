import mongoose from 'mongoose';
import { TICKET_STATUS } from '../utils/constants.js';

const ticketSchema = new mongoose.Schema(
  {
    // Referencias, no objetos embebidos
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    status: { type: String, enum: TICKET_STATUS, default: 'active', index: true },
    reservationCode: { type: String, required: true, unique: true },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, versionKey: false }
);

// Un usuario no puede tener dos inscripciones activas al mismo evento.
ticketSchema.index(
  { user: 1, event: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

export const TicketModel = mongoose.model('Ticket', ticketSchema);

export default TicketModel;
