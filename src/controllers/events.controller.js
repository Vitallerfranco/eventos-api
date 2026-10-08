import { eventService } from '../services/event.service.js';

export class EventsController {
  /** POST /api/events */
  create = async (req, res) => {
    const event = await eventService.create(req.body, req.user);
    res.status(201).json({ status: 'success', payload: event });
  };

  /** GET /api/events */
  list = async (req, res) => {
    const result = await eventService.list(req.query);
    res.status(200).json({ status: 'success', ...result });
  };

  /** GET /api/events/:eid */
  getById = async (req, res) => {
    const event = await eventService.getById(req.params.eid);
    res.status(200).json({ status: 'success', payload: event });
  };

  /** PUT /api/events/:eid */
  update = async (req, res) => {
    const event = await eventService.update(req.params.eid, req.body, req.user);
    res.status(200).json({ status: 'success', payload: event });
  };

  /** PATCH /api/events/:eid/status */
  updateStatus = async (req, res) => {
    const event = await eventService.updateStatus(req.params.eid, req.body.status, req.user);
    res.status(200).json({ status: 'success', payload: event });
  };

  /** DELETE /api/events/:eid */
  remove = async (req, res) => {
    const result = await eventService.delete(req.params.eid, req.user);
    res.status(200).json({ status: 'success', message: 'Evento eliminado', payload: result });
  };
}

export const eventsController = new EventsController();

export default eventsController;
