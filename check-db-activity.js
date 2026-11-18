import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});

try {
  await client.connect();

  const result = await client.query(`
    SELECT
      pid,
      usename,
      application_name,
      state,
      wait_event_type,
      wait_event,
      LEFT(query, 120) AS query
    FROM pg_stat_activity
    WHERE usename = current_user
    ORDER BY backend_start DESC;
  `);

  console.table(result.rows);
} catch (error) {
  console.error(error.message);
} finally {
  await client.end().catch(() => {});
}
