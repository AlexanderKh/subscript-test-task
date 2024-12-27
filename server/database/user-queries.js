const knex = require("./connection.js");


async function findByUsername({ username }) {
    const results = await knex('users').where({ username: username });
    return results.length > 0 ? results[0] : null;
}

async function findBySessionToken({ sessionToken }) {
    const results = await knex('users').where({ session_token: sessionToken });
    console.log(results);
    return results.length > 0 ? results[0] : null;
}

async function createUser({ username, password_hash, organization_id }) {
    const results = await knex('users').insert({ username, password_hash, organization_id }).returning('*');
    return results.length > 0 ? results[0] : null;
}

async function saveSessionToken({ userId, sessionToken }) {
    await knex('users').where({ id: userId }).update(
        { session_token: sessionToken }
    );
}


module.exports = {
    findByUsername,
    createUser,
    saveSessionToken,
    findBySessionToken,
}