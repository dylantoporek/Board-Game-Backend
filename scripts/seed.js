// Creates the database schema from db/schema.sql. Safe to re-run: every
// statement uses IF NOT EXISTS, so existing tables and data are untouched.
//
// This app has no reference/catalog data to seed (users create their own
// games), so there is nothing to load beyond the schema itself.
//
// Usage: DATABASE_URL=postgres://... node scripts/seed.js

const fs = require("fs");
const path = require("path");
const pool = require("../server/db");

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
  await pool.query(schema);
  console.log("schema: ok");

  await pool.end();
  console.log("Done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
