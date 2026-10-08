import { userRepository } from '../repositories/index.js';
import { UserDTO } from '../dto/user.dto.js';
import { CustomError } from '../utils/CustomError.js';
import { createHash, isValidPassword } from '../utils/hash.js';
import { assertRequiredFields, assertValidEmail } from '../utils/validators.js';

const PUBLIC_REGISTER_ROLE = 'user';

export class UserService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Registro publico: el role NUNCA se toma del body.
   */
  async register({ first_name, last_name, email, password }) {
    assertRequiredFields({ first_name, last_name, email, password }, [
      'first_name',
      'last_name',
      'email',
      'password',
    ]);
    assertValidEmail(email);

    if (String(password).length < 6) {
      throw CustomError.badRequest('La password debe tener al menos 6 caracteres');
    }

    const existing = await this.repository.getByEmail(email);
    if (existing) throw CustomError.conflict('Ya existe un usuario registrado con ese email');

    const created = await this.repository.create({
      first_name: String(first_name).trim(),
      last_name: String(last_name).trim(),
      email: String(email).toLowerCase().trim(),
      password: createHash(password),
      role: PUBLIC_REGISTER_ROLE,
    });

    return UserDTO.from(created);
  }

  /**
   * Alta administrativa: permite elegir role. Solo la usa el seed o un admin.
   */
  async createWithRole({ first_name, last_name, email, password, role = 'user' }) {
    assertRequiredFields({ first_name, last_name, email, password }, [
      'first_name',
      'last_name',
      'email',
      'password',
    ]);
    assertValidEmail(email);

    const existing = await this.repository.getByEmail(email);
    if (existing) throw CustomError.conflict('Ya existe un usuario registrado con ese email');

    const created = await this.repository.create({
      first_name,
      last_name,
      email: String(email).toLowerCase().trim(),
      password: createHash(password),
      role,
    });

    return UserDTO.from(created);
  }

  /**
   * Devuelve el documento crudo (incluye hash) para uso interno de Passport.
   */
  async validateCredentials(email, password) {
    if (!email || !password) throw CustomError.badRequest('Email y password son obligatorios');

    const user = await this.repository.getByEmail(email);
    if (!user) throw CustomError.unauthorized('Credenciales invalidas');

    if (!isValidPassword(password, user.password)) {
      throw CustomError.unauthorized('Credenciales invalidas');
    }

    return user;
  }

  async getById(id) {
    const user = await this.repository.getById(id);
    if (!user) throw CustomError.notFound('Usuario no encontrado');
    return UserDTO.from(user);
  }

  async getRawById(id) {
    return this.repository.getById(id);
  }
}

export const userService = new UserService(userRepository);

export default userService;
