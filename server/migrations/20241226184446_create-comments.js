
exports.up = function(knex) {
    return knex.schema.createTable('comments', function(table) {
        table.increments('id');
        table.text('content').notNullable();
        table.dateTime('created_at').notNullable();
        table.integer('todo_id').notNullable();
        table.foreign('todo_id').references('todos.id');
        table.integer('author_id').notNullable();
        table.foreign('author_id').references('users.id');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('comments');
};
