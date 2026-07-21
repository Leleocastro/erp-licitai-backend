import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!accessSecret) {
    throw new Error('JWT_ACCESS_SECRET environment variable is required');
  }
  if (!refreshSecret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is required');
  }

  return {
    accessSecret,
    refreshSecret,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  };
});
