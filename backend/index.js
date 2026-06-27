const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, '../data/todos.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Middleware
app.use(cors());
app.use(express.json());

// Helpers
const readTodos = () => {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
};

const writeTodos = (todos) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
};

// GET /api/todos - List all todos (with optional filters)
app.get('/api/todos', (req, res) => {
  const { status, priority, tag, search, sortBy, order } = req.query;
  let todos = readTodos();

  if (status && status !== 'all') {
    if (status === 'completed') todos = todos.filter(t => t.completed);
    if (status === 'active') todos = todos.filter(t => !t.completed);
  }

  if (priority) {
    todos = todos.filter(t => t.priority === priority);
  }

  if (tag) {
    todos = todos.filter(t => t.tags && t.tags.includes(tag));
  }

  if (search) {
    const q = search.toLowerCase();
    todos = todos.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  }

  // Sorting
  const sortField = sortBy || 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;
  todos.sort((a, b) => {
    if (a[sortField] < b[sortField]) return -1 * sortOrder;
    if (a[sortField] > b[sortField]) return 1 * sortOrder;
    return 0;
  });

  res.json({ success: true, data: todos, count: todos.length });
});

// GET /api/todos/:id - Get single todo
app.get('/api/todos/:id', (req, res) => {
  const todos = readTodos();
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) return res.status(404).json({ success: false, error: 'Todo not found' });
  res.json({ success: true, data: todo });
});

// POST /api/todos - Create todo
app.post('/api/todos', (req, res) => {
  const { title, description, priority, dueDate, tags } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, error: 'Title is required' });
  }

  const todo = {
    id: uuidv4(),
    title: title.trim(),
    description: description ? description.trim() : '',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    tags: tags || [],
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: '',
    subtasks: []
  };

  const todos = readTodos();
  todos.unshift(todo);
  writeTodos(todos);
  res.status(201).json({ success: true, data: todo });
});

// PUT /api/todos/:id - Update todo
app.put('/api/todos/:id', (req, res) => {
  const todos = readTodos();
  const idx = todos.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Todo not found' });

  const { title, description, priority, dueDate, tags, completed, notes, subtasks } = req.body;

  const updated = { ...todos[idx] };
  if (title !== undefined) updated.title = title.trim();
  if (description !== undefined) updated.description = description.trim();
  if (priority !== undefined) updated.priority = priority;
  if (dueDate !== undefined) updated.dueDate = dueDate;
  if (tags !== undefined) updated.tags = tags;
  if (notes !== undefined) updated.notes = notes;
  if (subtasks !== undefined) updated.subtasks = subtasks;
  if (completed !== undefined) {
    updated.completed = completed;
    updated.completedAt = completed ? new Date().toISOString() : null;
  }
  updated.updatedAt = new Date().toISOString();

  todos[idx] = updated;
  writeTodos(todos);
  res.json({ success: true, data: updated });
});

// PATCH /api/todos/:id/toggle - Toggle completion
app.patch('/api/todos/:id/toggle', (req, res) => {
  const todos = readTodos();
  const idx = todos.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Todo not found' });

  todos[idx].completed = !todos[idx].completed;
  todos[idx].completedAt = todos[idx].completed ? new Date().toISOString() : null;
  todos[idx].updatedAt = new Date().toISOString();

  writeTodos(todos);
  res.json({ success: true, data: todos[idx] });
});

// DELETE /api/todos/:id - Delete todo
app.delete('/api/todos/:id', (req, res) => {
  const todos = readTodos();
  const idx = todos.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Todo not found' });

  const [deleted] = todos.splice(idx, 1);
  writeTodos(todos);
  res.json({ success: true, data: deleted });
});

// DELETE /api/todos - Bulk delete completed
app.delete('/api/todos', (req, res) => {
  let todos = readTodos();
  const before = todos.length;
  todos = todos.filter(t => !t.completed);
  writeTodos(todos);
  res.json({ success: true, deleted: before - todos.length });
});

// GET /api/stats - Stats
app.get('/api/stats', (req, res) => {
  const todos = readTodos();
  res.json({
    success: true,
    data: {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      active: todos.filter(t => !t.completed).length,
      highPriority: todos.filter(t => t.priority === 'high' && !t.completed).length,
      overdue: todos.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length
    }
  });
});

app.listen(PORT, () => console.log(`Todo API running on http://localhost:${PORT}`));
