const app = require('./server-config.js');
const todoRouter = require('./routes/todo-routes');

const port = process.env.PORT || 5000;

app.use('/todos', todoRouter)

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`Listening on port ${port}`));
}

module.exports = app;