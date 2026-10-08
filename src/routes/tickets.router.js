import { Router } from 'express';
import { ticketsController } from '../controllers/tickets.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

/** Rutas montadas en /api/tickets */
const router = Router();

router.get('/my-tickets', authenticate, asyncHandler(ticketsController.myTickets));

router.patch('/:tid/cancel', authenticate, asyncHandler(ticketsController.cancel));

/** Rutas anidadas montadas en /api/events/:eid/tickets */
export const eventTicketsRouter = Router({ mergeParams: true });

eventTicketsRouter.post('/', authenticate, asyncHandler(ticketsController.create));

// La verificacion fina (organizador dueño o admin) se hace en el service
eventTicketsRouter.get('/', authenticate, asyncHandler(ticketsController.byEvent));

export default router;
