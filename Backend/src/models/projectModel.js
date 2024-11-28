//Retrieve Sequelize and DataTypes objects from the Sequelize library
//Sequelize library is a ORM library 4 nodejs to help interact with my postgresql db without writing raw sql queries
const {Sequelize, DataTypes} = require('sequelize')

//Connect to the postgres db
const sequelize = new Sequelize(DATA)