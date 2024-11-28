//Retrieve Sequelize and DataTypes objects from the Sequelize library
//Sequelize library is a ORM library 4 nodejs to help interact with my postgresql db without writing raw sql queries
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize"); //import sequelize instance

//Creating our user model
//sequelize.define(ModelName,object that contaisn compulsory definitions, object with optional definitions )
//sequelize.define(modelName, attributes, options);

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamp: true, //Adds the createdAt and updatedAt by default
  }
);

module.exports = User;
