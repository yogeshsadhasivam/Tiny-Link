const Sequelize = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required in .env");
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

module.exports = sequelize;
