// Update with your config settings.

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      host: '192.168.99.100',
      port: 5432,
      user: 'username',
      password: 'password',
      database: 'alfred_dev_db',
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      host: '192.168.99.100',
      port: 5432,
      user: 'username',
      password: 'password',
      database: 'alfred_dev_db',
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
