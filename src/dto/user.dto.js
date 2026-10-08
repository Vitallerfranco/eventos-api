/**
 * DTO de usuario: nunca expone password.
 */
export class UserDTO {
  constructor(user = {}) {
    this.id = String(user._id ?? user.id ?? '');
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.full_name = [user.first_name, user.last_name].filter(Boolean).join(' ');
    this.email = user.email;
    this.role = user.role;
    this.createdAt = user.createdAt;
  }

  static from(user) {
    return user ? new UserDTO(user) : null;
  }

  static fromMany(users = []) {
    return users.map((user) => new UserDTO(user));
  }
}

export default UserDTO;
