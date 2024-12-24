exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.increments('id');
        table.string('username').notNullable().unique();
        table.string('password_hash').notNullable();
        table.string('session_token');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
