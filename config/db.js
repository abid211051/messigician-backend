import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.SUPABASE_PG_DB_URI,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err) => {
  console.log(err.stack);
});

export default pool;
