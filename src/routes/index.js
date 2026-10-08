import { Router } from 'express';
import sessionsRouter from './sessions.router.js';
import eventsRouter from './events.router.js';
import ticketsRouter from './tickets.router.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API de eventos operativa', uptime: process.uptime() });
});

router.use('/sessions', sessionsRouter);
router.use('/events', eventsRouter);
router.use('/tickets', ticketsRouter);

export default router;
