const {Sequelize} = require('sequelize')

//connect to postgresql db
//Connect to the postgres db
const DATABASE_URL = process.env.DATABASE_URL
const sequelize = new Sequelize(DATABASE_URL, {
    dialect:'postgres',
    logging: true,
});//creates a new connection to the postgres db

module.exports = sequelize;