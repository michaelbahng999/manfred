
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', (t) => {
    t.increments('id').unsigned().primary;
    t.uuid('uid').notNull();
    t.string('username').notNull();
    t.dateTime('created_at').notNull().defaultTo(knex.fn.now());
  })
};

exports.down = function(knex, Promise) {
  return knex.schma.dropTable('users');
};
