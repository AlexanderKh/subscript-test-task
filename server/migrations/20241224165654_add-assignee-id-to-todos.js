
exports.up = function(knex) {
    return knex.schema.table('todos', table => {
        table.integer('assignee_id');
        table.foreign('assignee_id').references('users.id');
    })
};

exports.down = function(knex) {
    return knex.schema.table('todos', table => {
        table.dropColumn('assignee_id');
    })
};
