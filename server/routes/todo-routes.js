const _ = require('lodash');
const todos = require('../database/todo-queries.js');
const comments = require('../database/comment-queries');
const express = require('express')
const {findByOrganizationById} = require("../database/organization-queries");
const {findBySessionToken} = require("../database/user-queries");
const router = express.Router()

const authenticateUser = async function (req, res, next) {
  const sessionToken = req.cookies['sessionToken']
  if (!sessionToken) {
    res.status(403).send('not authenticated')
    return;
  }

  const user = await findBySessionToken({sessionToken})

  if (!user) {
    res.status(403).send('not authenticated')
    return;
  }

  const organization = await findByOrganizationById({id: user.organization_id})

  req.user = user
  req.organization = organization

  next()
}

function presentTodoForResponse(data) {
  return {
    id: data.id,
    organization_id: data.organization_id,
    assignee_id: data.assignee_id,
    title: data.title,
    order: data.order,
    completed: data.completed || false,
  };
}

function presentCommentForResponse(data) {
  return {
    id: data.id,
    content: data.content,
    created_at: data.created_at,
    todo_id: data.todo_id,
    author_id: data.author_id,
  };
}

async function getVisibleTodos(req, res) {
  const allEntries = await todos.findByOrganizationId({organization_id: req.organization.id});
  return res.send(allEntries.map(presentTodoForResponse));
}

async function getTodo(req, res) {
  const todo = await todos.get({
    id: req.params.todoId,
  });

  if (todo.organization_id !== req.organization.id) {
    return res.status(403).send('No Access');
  }

  const responseData = presentTodoForResponse(todo);
  const commentsResults = await comments.findByTodoId({todo_id: todo.id})
  responseData.commnets = commentsResults.map(presentCommentForResponse)

  return res.send(responseData);
}

async function postTodo(req, res) {
  const created = await todos.create({
    title: req.body.title,
    order: req.body.order,
    organization_id: req.organization.id,
  });
  return res.send(presentTodoForResponse(created));
}

async function postComment(req, res) {
  const todo = await todos.get({
    id: req.params.todoId,
  });

  if (todo.organization_id !== req.organization.id) {
    return res.status(403).send('No Access');
  }

  const comment = await comments.createComment({
    content: req.body.content,
    todo_id: todo.id,
    author_id: req.user.id,
  });

  return res.status(200).send(presentCommentForResponse(comment));
}

// async function patchTodo(req, res) {
//   const patched = await todos.update(req.params.id, req.body);
//   return res.send(presentTodoForResponse(req, patched));
// }
//
// async function deleteAllTodos(req, res) {
//   const deletedEntries = await todos.clear();
//   return res.send(deletedEntries.map( _.curry(presentTodoForResponse)(req) ));
// }
//
// async function deleteTodo(req, res) {
//   const deleted = await todos.delete(req.params.id);
//   return res.send(presentTodoForResponse(req, deleted));
// }

function addErrorReporting(func, message) {
  return async function (req, res) {
    try {
      return await func(req, res);
    } catch (err) {
      console.log(`${message} caused by: ${err}`);

      // Not always 500, but for simplicity's sake.
      res.status(500).send(`Opps! ${message}.`);
    }
  }
}

const routes = {
  getVisibleTodos: {method: getVisibleTodos, errorMessage: "Could not fetch all todos"},
  getTodo: {method: getTodo, errorMessage: "Could not fetch todo"},
  postTodo: {method: postTodo, errorMessage: "Could not post todo"},
  postComment: {method: postComment, errorMessage: "Could not post comment"},
  // patchTodo: { method: patchTodo, errorMessage: "Could not patch todo" },
  // deleteAllTodos: { method: deleteAllTodos, errorMessage: "Could not delete all todos" },
  // deleteTodo: { method: deleteTodo, errorMessage: "Could not delete todo" }
}

for (let route in routes) {
  routes[route] = addErrorReporting(routes[route].method, routes[route].errorMessage);
}

router.use(authenticateUser)
router.get('/', routes.getVisibleTodos);
router.get('/:todoId', routes.getTodo);

router.post('/:todoId/comments', routes.postComment);

router.post('/', routes.postTodo);

// router.patch('/:id', routes.patchTodo);
// router.delete('/', routes.deleteAllTodos);
// router.delete('/:id', routes.deleteTodo);


module.exports = router;
