require('dotenv').config();

const { PGDATABASE, PGUSER, PGPASSWORD, PGHOST } = process.env;

module.exports = {
    "development": {
      "username": PGUSER,
      "password": PGPASSWORD,
      "database": PGDATABASE,
      "host": PGHOST,
      "dialect": "postgres"
    }
}
