// Update with your config settings.
const pg = require('pg');
if (process.env.NODE_ENV == 'production') {
  pg.defaults.ssl = true;
}

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: '127.0.0.1',
      port: 5432,
      user: 'username',
      password: 'password',
      database: 'manfred_dev_db',
    },
    debug: true,
    pool: { min: 2, max: 10 },
    migrations: { tableName: 'knex_migrations' },
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: { tableName: 'knex_migrations' },
  }

};
