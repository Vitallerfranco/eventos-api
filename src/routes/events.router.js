import { Router } from 'express';
import { eventsController } from '../controllers/events.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { eventTicketsRouter } from './tickets.router.js';

const router = Router();

// Publico
router.get('/', asyncHandler(eventsController.list));
router.get('/:eid', asyncHandler(eventsController.getById));

// Solo organizer o admin
router.post('/', authenticate, authorize('organizer', 'admin'), asyncHandler(eventsController.create));
router.put('/:eid', authenticate, authorize('organizer', 'admin'), asyncHandler(eventsController.update));
router.patch(
  '/:eid/status',
  authenticate,
  authorize('organizer', 'admin'),
  asyncHandler(eventsController.updateStatus)
);
router.delete('/:eid', authenticate, authorize('admin'), asyncHandler(eventsController.remove));

// Inscripciones del evento: POST /api/events/:eid/tickets y GET /api/events/:eid/tickets
router.use('/:eid/tickets', eventTicketsRouter);

export default router;
