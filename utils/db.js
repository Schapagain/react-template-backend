require('dotenv').config();
const Sequelize = require('sequelize');

const { PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const options = {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    }
};

module.exports  = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, options);