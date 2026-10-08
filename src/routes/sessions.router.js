import { Router } from 'express';
import { sessionsController } from '../controllers/sessions.controller.js';
import { authenticate, passportCall } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

// Registro publico: la estrategia fuerza role = 'user' (nunca se lee del body)
router.post('/register', passportCall('register', { failWith: 400 }), asyncHandler(sessionsController.register));

router.post('/login', passportCall('login', { failWith: 401 }), asyncHandler(sessionsController.login));

router.get('/current', authenticate, asyncHandler(sessionsController.current));

router.post('/logout', asyncHandler(sessionsController.logout));

export default router;
