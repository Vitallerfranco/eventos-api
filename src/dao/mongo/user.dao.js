import { UserModel } from '../../models/user.model.js';

/**
 * Unica capa que conoce a Mongoose para la coleccion de usuarios.
 */
export class UserDao {
  async create(userData) {
    const created = await UserModel.create(userData);
    return created.toObject();
  }

  async getById(id) {
    return UserModel.findById(id).lean();
  }

  async getByEmail(email) {
    return UserModel.findOne({ email: String(email).toLowerCase().trim() }).lean();
  }

  async getAll(filter = {}) {
    return UserModel.find(filter).lean();
  }

  async update(id, payload) {
    return UserModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
  }

  async delete(id) {
    return UserModel.findByIdAndDelete(id).lean();
  }
}

export default UserDao;
