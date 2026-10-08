import { config } from '../config/config.js';

const stamp = () => new Date().toISOString();

export const logger = {
  info: (message) => {
    if (config.env !== 'test') process.stdout.write(`[INFO] ${stamp()} ${message}\n`);
  },
  warn: (message) => {
    if (config.env !== 'test') process.stdout.write(`[WARN] ${stamp()} ${message}\n`);
  },
  error: (message) => {
    process.stderr.write(`[ERROR] ${stamp()} ${message}\n`);
  },
};

export default logger;
