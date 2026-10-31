import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

const envFile =
  process.env['NODE_ENV'] === 'production' ? '.env.prod' : '.env.prod';

dotenv.config({ path: envFile, override: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL']!,
  },
});
