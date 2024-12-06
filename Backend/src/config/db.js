// Load environment variables from .env file
require("dotenv").config();
/* console.log("Environmental Variables Loaded: ", process.env)
console.log("Database URL: ", process.env.DATABASE_URL) */

// Import Pool class from pg package
const { Pool } = require("pg"); // to manage a pool of db connections



// Create a new Pool instance and pass in object with db connection settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL})

// Check for a successful connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Connected to the database');
  }
});

module.exports = pool;
