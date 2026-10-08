import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { config } from './config.js';
import { cookieExtractor } from '../utils/jwt.js';
import { userService } from '../services/user.service.js';
import { UserDTO } from '../dto/user.dto.js';

export const initializePassport = () => {
  /** Estrategia REGISTER */
  passport.use(
    'register',
    new LocalStrategy(
      { usernameField: 'email', passReqToCallback: true, session: false },
      async (req, email, password, done) => {
        try {
          const { first_name, last_name } = req.body;
          const user = await userService.register({ first_name, last_name, email, password });
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  /** Estrategia LOGIN */
  passport.use(
    'login',
    new LocalStrategy({ usernameField: 'email', session: false }, async (email, password, done) => {
      try {
        const user = await userService.validateCredentials(email, password);
        // Se devuelve el documento crudo porque el controller necesita generar el JWT.
        return done(null, user);
      } catch (error) {
        if (error.status === 401 || error.status === 400) {
          return done(null, false, { message: error.message });
        }
        return done(error);
      }
    })
  );

  /** Estrategia CURRENT: lee el JWT de la cookie httpOnly */
  passport.use(
    'current',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          cookieExtractor,
          ExtractJwt.fromAuthHeaderAsBearerToken(),
        ]),
        secretOrKey: config.jwt.secret,
      },
      async (payload, done) => {
        try {
          const user = await userService.getRawById(payload.id);
          if (!user) return done(null, false, { message: 'Token valido pero el usuario ya no existe' });
          return done(null, UserDTO.from(user));
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

export default initializePassport;
