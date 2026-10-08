import mongoose from 'mongoose';
import { USER_ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: 'user' },
  },
  { timestamps: true, versionKey: false }
);

export const UserModel = mongoose.model('User', userSchema);

export default UserModel;
