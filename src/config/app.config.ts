import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT || '3000', 10),
  prefix: process.env.APP_PREFIX || 'api',
  environment: process.env.NODE_ENV || 'development',
}));
