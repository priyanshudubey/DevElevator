const { Sequelize } = require("sequelize");
require("dotenv").config(); // Load env vars

const sequelize = new Sequelize(
  process.env.MYSQL_DB_NAME,
  process.env.MYSQL_DB_USER,
  process.env.MYSQL_DB_PASSWORD,
  {
    host: process.env.MYSQL_DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

module.exports = sequelize;
