const _ = require('lodash');
const todos = require('../database/todo-queries.js');
const express = require('express')
const {findBySessionToken} = require("../database/user-queries");
const router = express.Router()

const authenticateUser = async function (req, res, next) {
    const sessionToken = req.cookies['sessionToken']
    const user = await findBySessionToken({sessionToken})

    req.user = user

    next()
}

function createToDo(req, data) {
  const protocol = req.protocol, 
    host = req.get('host'), 
    id = data.id;

  return {
    title: data.title,
    order: data.order,
    completed: data.completed || false,
    url: `${protocol}://${host}/${id}`
  };
}

async function getAllTodos(req, res) {
  const user = req.user
  const allEntries = await todos.all();
  return res.send(allEntries.map( _.curry(createToDo)(req) ));
}

async function getTodo(req, res) {
  const todo = await todos.get(req.params.id);
  return res.send(todo);
}

async function postTodo(req, res) {
  const created = await todos.create(req.body.title, req.body.order);
  return res.send(createToDo(req, created));
}

async function patchTodo(req, res) {
  const patched = await todos.update(req.params.id, req.body);
  return res.send(createToDo(req, patched));
}

async function deleteAllTodos(req, res) {
  const deletedEntries = await todos.clear();
  return res.send(deletedEntries.map( _.curry(createToDo)(req) ));
}

async function deleteTodo(req, res) {
  const deleted = await todos.delete(req.params.id);
  return res.send(createToDo(req, deleted));
}

function addErrorReporting(func, message) {
    return async function(req, res) {
        try {
            return await func(req, res);
        } catch(err) {
            console.log(`${message} caused by: ${err}`);

            // Not always 500, but for simplicity's sake.
            res.status(500).send(`Opps! ${message}.`);
        } 
    }
}

const routes = {
    getAllTodos: { method: getAllTodos, errorMessage: "Could not fetch all todos" },
    getTodo: { method: getTodo, errorMessage: "Could not fetch todo" },
    postTodo: { method: postTodo, errorMessage: "Could not post todo" },
    patchTodo: { method: patchTodo, errorMessage: "Could not patch todo" },
    deleteAllTodos: { method: deleteAllTodos, errorMessage: "Could not delete all todos" },
    deleteTodo: { method: deleteTodo, errorMessage: "Could not delete todo" }
}

for (let route in routes) {
    routes[route] = addErrorReporting(routes[route].method, routes[route].errorMessage);
}

router.use(authenticateUser)
router.get('/', routes.getAllTodos);
router.get('/:id', routes.getTodo);

router.post('/', routes.postTodo);
router.patch('/:id', routes.patchTodo);

router.delete('/', routes.deleteAllTodos);
router.delete('/:id', routes.deleteTodo);


module.exports = router;
