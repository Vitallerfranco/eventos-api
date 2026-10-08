export class UserRepository {
  constructor(dao) {
    this.dao = dao;
  }

  create(userData) {
    return this.dao.create(userData);
  }

  getById(id) {
    return this.dao.getById(id);
  }

  getByEmail(email) {
    return this.dao.getByEmail(email);
  }

  getAll(filter) {
    return this.dao.getAll(filter);
  }

  update(id, payload) {
    return this.dao.update(id, payload);
  }

  delete(id) {
    return this.dao.delete(id);
  }
}

export default UserRepository;
