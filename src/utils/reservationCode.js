import { randomBytes } from 'crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Genera un codigo legible tipo EVT-7QK2 para identificar la reserva.
 */
export const generateReservationCode = (length = 4) => {
  const bytes = randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `EVT-${code}`;
};

export default generateReservationCode;
