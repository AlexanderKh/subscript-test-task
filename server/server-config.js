require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

const app = express();

app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

module.exports = app;
