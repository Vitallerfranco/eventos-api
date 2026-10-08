import { createApp } from './app.js';
import { config } from './config/config.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';

const bootstrap = async () => {
  await connectDB();

  const app = createApp();

  app.listen(config.port, () => {
    logger.info(`Servidor escuchando en http://localhost:${config.port}/api (env: ${config.env})`);
  });
};

bootstrap().catch((error) => {
  logger.error(`No se pudo iniciar el servidor: ${error.message}`);
  process.exit(1);
});
