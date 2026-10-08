/**
 * Seed de datos de prueba: crea 3 usuarios (user, organizer, admin) y 3 eventos.
 * Uso: npm run seed
 */
import { connectDB, disconnectDB } from '../config/db.js';
import { userService } from '../services/user.service.js';
import { eventService } from '../services/event.service.js';
import { userRepository } from '../repositories/index.js';
import { logger } from '../utils/logger.js';

const TEST_USERS = [
  { first_name: 'Ana', last_name: 'Perez', email: 'user@test.com', password: 'user1234', role: 'user' },
  {
    first_name: 'Bruno',
    last_name: 'Gomez',
    email: 'organizer@test.com',
    password: 'organizer1234',
    role: 'organizer',
  },
  { first_name: 'Carla', last_name: 'Diaz', email: 'admin@test.com', password: 'admin1234', role: 'admin' },
];

const inDays = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const TEST_EVENTS = [
  {
    title: 'Congreso Tech 2026',
    description: 'Charlas de arquitectura backend, cloud y buenas practicas.',
    category: 'tecnologia',
    date: inDays(30),
    location: 'Buenos Aires',
    capacity: 50,
    price: 15000,
    status: 'published',
  },
  {
    title: 'Workshop Node.js Avanzado',
    description: 'Taller practico de Express, Mongoose y testing.',
    category: 'tecnologia',
    date: inDays(15),
    location: 'Moron',
    capacity: 2,
    price: 8000,
    status: 'published',
  },
  {
    title: 'Meetup Diseño de APIs',
    description: 'Encuentro para discutir diseño de APIs REST y versionado.',
    category: 'comunidad',
    date: inDays(45),
    location: 'La Plata',
    capacity: 20,
    price: 0,
    status: 'draft',
  },
];

const run = async () => {
  await connectDB();

  const created = [];
  for (const data of TEST_USERS) {
    const existing = await userRepository.getByEmail(data.email);
    if (existing) {
      logger.info(`Usuario ya existente, se omite: ${data.email}`);
      created.push({ id: String(existing._id), email: existing.email, role: existing.role });
      continue;
    }
    const user = await userService.createWithRole(data);
    logger.info(`Usuario creado: ${user.email} (${user.role})`);
    created.push(user);
  }

  const organizer = created.find((u) => u.role === 'organizer');

  for (const data of TEST_EVENTS) {
    const event = await eventService.create(data, { id: organizer.id, role: 'organizer' });
    logger.info(`Evento creado: ${event.title} (${event.status}) - cupo ${event.capacity}`);
  }

  logger.info('Seed finalizado. Credenciales de prueba:');
  TEST_USERS.forEach((u) => logger.info(`   ${u.role.padEnd(9)} -> ${u.email} / ${u.password}`));

  await disconnectDB();
  process.exit(0);
};

run().catch(async (error) => {
  logger.error(`Fallo el seed: ${error.message}`);
  await disconnectDB();
  process.exit(1);
});
