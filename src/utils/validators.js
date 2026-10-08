import mongoose from 'mongoose';
import { CustomError } from './CustomError.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const assertObjectId = (id, label = 'id') => {
  if (!isValidObjectId(id)) throw CustomError.badRequest(`El ${label} enviado no es valido`);
  return id;
};

export const assertRequiredFields = (payload = {}, fields = []) => {
  const missing = fields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === '';
  });
  if (missing.length > 0) {
    throw CustomError.badRequest(`Faltan campos obligatorios: ${missing.join(', ')}`, { missing });
  }
};

export const assertValidEmail = (email) => {
  if (!EMAIL_REGEX.test(String(email).trim())) throw CustomError.badRequest('El email no tiene un formato valido');
};

export const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
};

export const parseDate = (value, label = 'fecha') => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw CustomError.badRequest(`La ${label} enviada no es valida`);
  return date;
};
