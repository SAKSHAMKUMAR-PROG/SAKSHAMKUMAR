const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

app.use(cors());
app.use(bodyParser.json());

const DATA_DIR = path.join(__dirname, 'data');
const TODOS_FILE = path.join(DATA_DIR, 'todos.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(TODOS_FILE)) fs.writeFileSync(TODOS_FILE, JSON.stringify([]));
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

function readJson(file) {
  ensureDataFiles();
  const raw = fs.readFileSync(file, 'utf8');
  try {
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeJson(file, data) {
  ensureDataFiles();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Authentication
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = readJson(USERS_FILE);
  if (users.find(u => u.username === username)) return res.status(400).json({ error: 'username taken' });
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = { id: uuidv4(), username, passwordHash, createdAt: new Date().toISOString() };
  users.push(user);
  writeJson(USERS_FILE, users);
  res.status(201).json({ id: user.id, username: user.username });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = readJson(USERS_FILE);
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: 'invalid credentials' });
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

function authenticateToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing authorization' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'malformed authorization' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// Todos API (protected)
app.get('/api/todos', authenticateToken, (req, res) => {
  const todos = readJson(TODOS_FILE).filter(t => t.userId === req.user.id);
  res.json(todos);
});

app.get('/api/todos/:id', authenticateToken, (req, res) => {
  const todos = readJson(TODOS_FILE);
  const t = todos.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!t) return res.status(404).json({ error: 'Todo not found' });
  res.json(t);
});

app.post('/api/todos', authenticateToken, (req, res) => {
  const { title, completed } = req.body;
  if (!title || typeof title !== 'string') return res.status(400).json({ error: 'Title is required' });
  const todos = readJson(TODOS_FILE);
  const todo = { id: uuidv4(), userId: req.user.id, title: title.trim(), completed: !!completed, createdAt: new Date().toISOString() };
  todos.push(todo);
  writeJson(TODOS_FILE, todos);
  res.status(201).json(todo);
});

app.put('/api/todos/:id', authenticateToken, (req, res) => {
  const { title, completed } = req.body;
  const todos = readJson(TODOS_FILE);
  const idx = todos.findIndex(x => x.id === req.params.id && x.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Todo not found' });
  if (title && typeof title === 'string') todos[idx].title = title.trim();
  if (typeof completed === 'boolean') todos[idx].completed = completed;
  todos[idx].updatedAt = new Date().toISOString();
  writeJson(TODOS_FILE, todos);
  res.json(todos[idx]);
});

app.delete('/api/todos/:id', authenticateToken, (req, res) => {
  let todos = readJson(TODOS_FILE);
  const idx = todos.findIndex(x => x.id === req.params.id && x.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Todo not found' });
  const [removed] = todos.splice(idx, 1);
  writeJson(TODOS_FILE, todos);
  res.json(removed);
});

app.listen(PORT, () => console.log(`Todo API listening on port ${PORT}`));
