const knex = require("./connection.js");


async function findByTodoId({ todo_id }) {
    return await knex('comments').where({ todo_id });
}

async function createComment({ content, todo_id, author_id }) {
    const results = await knex('comments')
      .insert({ content, todo_id, author_id, created_at: new Date() } )
      .returning('*');
    return results.length > 0 ? results[0] : null;
}

module.exports = {
    findByTodoId,
    createComment
}