const knex = require("./connection.js");


async function findByOrganizationName({ name }) {
    const results = await knex('organizations').where({ name });
    return results.length > 0 ? results[0] : null;
}
async function findByOrganizationById({ id }) {
    const results = await knex('organizations').where({ id });
    return results.length > 0 ? results[0] : null;
}

module.exports = {
    findByOrganizationName,
    findByOrganizationById,
}