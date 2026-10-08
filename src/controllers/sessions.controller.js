import { generateToken, cookieOptions } from '../utils/jwt.js';
import { config } from '../config/config.js';
import { UserDTO } from '../dto/user.dto.js';

export class SessionsController {
  /** POST /api/sessions/register (la estrategia 'register' ya creo el usuario) */
  register = async (req, res) => {
    res.status(201).json({ status: 'success', payload: req.user });
  };

  /** POST /api/sessions/login */
  login = async (req, res) => {
    const token = generateToken(req.user);
    res.cookie(config.jwt.cookieName, token, cookieOptions);
    res.status(200).json({ status: 'success', payload: UserDTO.from(req.user) });
  };

  /** GET /api/sessions/current */
  current = async (req, res) => {
    res.status(200).json({ status: 'success', payload: req.user });
  };

  /** POST /api/sessions/logout */
  logout = async (req, res) => {
    res.clearCookie(config.jwt.cookieName, { ...cookieOptions, maxAge: undefined });
    res.status(200).json({ status: 'success', message: 'Sesion cerrada correctamente' });
  };
}

export const sessionsController = new SessionsController();

export default sessionsController;
