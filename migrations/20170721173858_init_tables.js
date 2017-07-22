
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('events', (t) => {
      t.increments('id').unsigned().primary;
      t.uuid('uid').notNull();
      t.string('name').notNull();
      t.string('location').notNull();
      t.dateTime('start_time').notNull();
      t.dateTime('end_time').notNull();
      t.dateTime('created_at').notNull().defaultTo(knex.fn.now());
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schma.dropTable('events');
};
