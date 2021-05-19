const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const username = request.header('username');
  const usernameAlreadyExists = users.find(x => x.username === username);

  if (usernameAlreadyExists === undefined) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    });
  }

  request.user = usernameAlreadyExists;
  next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const usernameAlreadyExists = users.find(x => x.username === username);

  if (usernameAlreadyExists !== undefined) {
    return response.status(400).json({
      error: 'Mensagem do erro'
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {  
  const user = request.user;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;
  
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline), 
	  created_at: new Date()
  }
  
  user.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;
  const todo = user.todos.find(x => x.id === request.params.id);

  if (todo === undefined) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    });
  }

  todo.title = title
  todo.deadline = deadline

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const todo = user.todos.find(x => x.id === request.params.id);

  if (todo === undefined) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const todo = user.todos.find(x => x.id === request.params.id);

  if (todo === undefined) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    });
  }

  user.todos = user.todos.filter(x => x.id !== request.params.id)
  return response.status(204).json();
});

module.exports = app;