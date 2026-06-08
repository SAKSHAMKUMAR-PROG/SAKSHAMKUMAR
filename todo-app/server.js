const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'todos.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

function readTodos() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  try {
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeTodos(todos) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

app.get('/api/todos', (req, res) => {
  const todos = readTodos();
  res.json(todos);
});

app.get('/api/todos/:id', (req, res) => {
  const todos = readTodos();
  const t = todos.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Todo not found' });
  res.json(t);
});

app.post('/api/todos', (req, res) => {
  const { title, completed } = req.body;
  if (!title || typeof title !== 'string') return res.status(400).json({ error: 'Title is required' });
  const todos = readTodos();
  const todo = { id: uuidv4(), title: title.trim(), completed: !!completed, createdAt: new Date().toISOString() };
  todos.push(todo);
  writeTodos(todos);
  res.status(201).json(todo);
});

app.put('/api/todos/:id', (req, res) => {
  const { title, completed } = req.body;
  const todos = readTodos();
  const idx = todos.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Todo not found' });
  if (title && typeof title === 'string') todos[idx].title = title.trim();
  if (typeof completed === 'boolean') todos[idx].completed = completed;
  todos[idx].updatedAt = new Date().toISOString();
  writeTodos(todos);
  res.json(todos[idx]);
});

app.delete('/api/todos/:id', (req, res) => {
  let todos = readTodos();
  const idx = todos.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Todo not found' });
  const [removed] = todos.splice(idx, 1);
  writeTodos(todos);
  res.json(removed);
});

app.listen(PORT, () => console.log(`Todo API listening on port ${PORT}`));
