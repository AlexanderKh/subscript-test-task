const knex = require("./connection.js");


async function findByUsername(username) {
    const results = await knex('users').where({ username: username });
    return results[0];
}

async function createUser({ username, password_hash }) {
    const results = await knex('users').insert({ username, password_hash }).returning('*');
    return results[0];
}


module.exports = {
    findByUsername,
    createUser,
}