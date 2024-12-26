exports.up = function(knex) {
    return knex.schema.table('todos', table => {
        table.integer('organization_id').notNullable();
        table.foreign('organization_id').references('organizations.id');
    })
};

exports.down = function(knex) {
    return knex.schema.table('todos', table => {
        table.dropColumn('organization_id');
    })
};
