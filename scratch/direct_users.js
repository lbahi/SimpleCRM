const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://postgres:postgres@localhost:5432/simplecrm"
});

async function main() {
  const res = await pool.query('SELECT id, email, name, role FROM "users"');
  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
}

main().catch(console.error);
