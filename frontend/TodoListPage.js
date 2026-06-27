import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTodos, createTodo, toggleTodo, deleteTodo, clearCompleted, fetchStats } from '../api';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast ${type}`}>{msg}</div>;
}

function AddTodoForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().replace(',', '');
      if (t && !tags.includes(t)) setTags([...tags, t]);
      setTagInput('');
    }
  };

  const submit = async () => {
    if (!title.trim()) return;
    await onAdd({ title, description, priority, dueDate: dueDate || null, tags });
    setTitle(''); setDescription(''); setPriority('medium'); setDueDate(''); setTags([]);
    setOpen(false);
  };

  if (!open) return (
    <button className="btn btn-primary" style={{ marginBottom: 24, width: '100%', justifyContent: 'center', padding: '12px' }}
      onClick={() => setOpen(true)}>
      + Add New Task
    </button>
  );

  return (
    <div className="add-form-wrap">
      <div className="add-form-title">New Task</div>
      <input className="form-input" placeholder="Task title *" value={title} onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()} autoFocus />
      <textarea className="form-input" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
      <div className="form-row">
        <div className="form-col">
          <select className="form-input" value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="high">🔴 High Priority</option>
            <option value="medium">🟠 Medium Priority</option>
            <option value="low">🟢 Low Priority</option>
          </select>
        </div>
        <div className="form-col">
          <input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]} />
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
          {tags.map(t => (
            <span key={t} className="tag-chip">{t} <button onClick={() => setTags(tags.filter(x => x !== t))}>×</button></span>
          ))}
        </div>
        <input className="form-input" placeholder="Add tags (press Enter or comma)" value={tagInput}
          onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} style={{ marginBottom: 0 }} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={submit}>Add Task</button>
      </div>
    </div>
  );
}

function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Confirm Action</h2>
        <p>{msg}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger btn-sm" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function isOverdue(dueDate) {
  return dueDate && new Date(dueDate) < new Date(new Date().toDateString());
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TodoListPage() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTodos = useCallback(async () => {
    const params = { status: statusFilter };
    if (priorityFilter) params.priority = priorityFilter;
    if (search) params.search = search;
    params.sortBy = sortBy;
    const res = await fetchTodos(params);
    if (res.success) setTodos(res.data);
  }, [statusFilter, priorityFilter, search, sortBy]);

  const loadStats = useCallback(async () => {
    const res = await fetchStats();
    if (res.success) setStats(res.data);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadTodos(), loadStats()]).finally(() => setLoading(false));
  }, [loadTodos, loadStats]);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const handleAdd = async (data) => {
    const res = await createTodo(data);
    if (res.success) {
      showToast('Task added!');
      loadTodos(); loadStats();
    }
  };

  const handleToggle = async (e, id) => {
    e.stopPropagation();
    await toggleTodo(id);
    loadTodos(); loadStats();
  };

  const handleDelete = async (id) => {
    const res = await deleteTodo(id);
    if (res.success) {
      showToast('Task deleted', 'error');
      setConfirmDelete(null);
      loadTodos(); loadStats();
    }
  };

  const handleClearCompleted = async () => {
    const res = await clearCompleted();
    if (res.success) {
      showToast(`Cleared ${res.deleted} completed task(s)`);
      loadTodos(); loadStats();
    }
  };

  return (
    <div className="page">
      <div className="header">
        <div className="container">
          <div className="header-inner">
            <div className="logo">Task<span>ly</span></div>
            {stats?.completed > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={handleClearCompleted}>Clear completed</button>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {stats && (
          <div className="stats-row">
            <div className="stat-card accent">
              <div className="num">{stats.total}</div>
              <div className="label">Total</div>
            </div>
            <div className="stat-card">
              <div className="num">{stats.active}</div>
              <div className="label">Active</div>
            </div>
            <div className="stat-card success">
              <div className="num">{stats.completed}</div>
              <div className="label">Done</div>
            </div>
            <div className="stat-card warning">
              <div className="num">{stats.highPriority}</div>
              <div className="label">Urgent</div>
            </div>
            <div className="stat-card danger">
              <div className="num">{stats.overdue}</div>
              <div className="label">Overdue</div>
            </div>
          </div>
        )}

        <AddTodoForm onAdd={handleAdd} />

        <div className="filters-bar">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="createdAt">Newest first</option>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>

        <div className="filter-tabs" style={{ marginBottom: 20 }}>
          {['all', 'active', 'completed'].map(s => (
            <button key={s} className={`tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)' }}>Loading…</div>
        ) : todos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No tasks found</h3>
            <p>Add a new task or adjust your filters</p>
          </div>
        ) : (
          <div className="todo-list">
            {todos.map(todo => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}
                onClick={() => navigate(`/todo?id=${todo.id}`)}>
                <div className={`todo-check ${todo.completed ? 'checked' : ''}`}
                  onClick={(e) => handleToggle(e, todo.id)} />
                <div className="todo-body">
                  <div className="todo-title">{todo.title}</div>
                  {todo.description && <div className="todo-desc">{todo.description}</div>}
                  <div className="todo-meta">
                    <span className={`priority-badge ${todo.priority}`}>{todo.priority}</span>
                    {todo.dueDate && (
                      <span className={`due-badge ${isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : ''}`}>
                        📅 {formatDate(todo.dueDate)}
                        {isOverdue(todo.dueDate) && !todo.completed && ' · overdue'}
                      </span>
                    )}
                    {todo.tags?.map(t => <span key={t} className="tag-chip" style={{ fontSize: 11 }}>{t}</span>)}
                    {todo.subtasks?.length > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        ☑ {todo.subtasks.filter(s => s.done).length}/{todo.subtasks.length}
                      </span>
                    )}
                  </div>
                </div>
                <div className="todo-actions" onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => navigate(`/todo?id=${todo.id}`)}>✏️</button>
                  <button className="btn btn-danger btn-icon btn-sm"
                    onClick={() => setConfirmDelete(todo.id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal msg="Delete this task? This cannot be undone."
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)} />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
