//import Pool class from pg package
const {Pool} = require("pg");

// Reads through .env file and loads enviromental variable from .env file to process.env object
require("dotenv").config()

//Create new Pool instance and pass in object with db connection setiings
const pool = new Pool({
    connectionString:process.env.DATABASE_URL
})

module.exports=pool