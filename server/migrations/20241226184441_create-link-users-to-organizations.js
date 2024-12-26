
exports.up = function(knex) {
    return knex.schema.table('users', table => {
        table.integer('organization_id');
        table.foreign('organization_id').references('organizations.id');
    })
};

exports.down = function(knex) {
    return knex.schema.table('users', table => {
        table.dropColumn('organization_id');
    })
};
