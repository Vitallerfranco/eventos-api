import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const createHash = (plainPassword) => bcrypt.hashSync(plainPassword, bcrypt.genSaltSync(SALT_ROUNDS));

export const isValidPassword = (plainPassword, hashedPassword) =>
  bcrypt.compareSync(plainPassword, hashedPassword);
