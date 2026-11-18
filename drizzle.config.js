import 'dotenv/config';

export default {
  schema: './src/models/*.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.MIGRATION_DATABASE_URL,
  },
};
