import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGO_URL', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(
    `[config] Faltan variables de entorno obligatorias: ${missing.join(', ')}. Revisa el archivo .env (podes partir de .env.example).`
  );
  process.exit(1);
}

export const config = {
  port: Number(process.env.PORT) || 8080,
  env: process.env.NODE_ENV || 'development',
  mongoUrl: process.env.MONGO_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    cookieName: process.env.JWT_COOKIE_NAME || 'authToken',
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM || 'Plataforma de Eventos <no-reply@eventos.com>',
    enabled: Boolean(process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS),
  },
};

export default config;
