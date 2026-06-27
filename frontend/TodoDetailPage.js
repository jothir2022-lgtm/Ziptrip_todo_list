import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchTodo, updateTodo, toggleTodo, deleteTodo } from '../api';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast ${type}`}>{msg}</div>;
}

function formatDate(d, time = false) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    ...(time ? { hour: '2-digit', minute: '2-digit' } : {})
  });
}

function isOverdue(dueDate, completed) {
  return dueDate && !completed && new Date(dueDate) < new Date(new Date().toDateString());
}

export default function TodoDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');

  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editDue, setEditDue] = useState('');
  const [editTagInput, setEditTagInput] = useState('');
  const [editTags, setEditTags] = useState([]);

  // Notes & subtasks
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState('');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const load = useCallback(async () => {
    if (!id) { setError('No todo ID provided'); setLoading(false); return; }
    const res = await fetchTodo(id);
    if (res.success) {
      setTodo(res.data);
      setNotes(res.data.notes || '');
    } else {
      setError('Task not found');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const startEdit = () => {
    setEditTitle(todo.title);
    setEditDesc(todo.description || '');
    setEditPriority(todo.priority);
    setEditDue(todo.dueDate ? todo.dueDate.split('T')[0] : '');
    setEditTags(todo.tags || []);
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!editTitle.trim()) return;
    setSaving(true);
    const res = await updateTodo(id, {
      title: editTitle,
      description: editDesc,
      priority: editPriority,
      dueDate: editDue || null,
      tags: editTags
    });
    if (res.success) {
      setTodo(res.data);
      setEditing(false);
      showToast('Task updated!');
    }
    setSaving(false);
  };

  const handleToggle = async () => {
    const res = await toggleTodo(id);
    if (res.success) { setTodo(res.data); showToast(res.data.completed ? 'Marked complete!' : 'Marked active'); }
  };

  const handleDelete = async () => {
    await deleteTodo(id);
    navigate('/');
  };

  const saveNotes = async () => {
    const res = await updateTodo(id, { notes });
    if (res.success) { setTodo(res.data); setNotesSaved(true); setTimeout(() => setNotesSaved(false), 2000); }
  };

  const addSubtask = async () => {
    if (!subtaskInput.trim()) return;
    const newSubtasks = [...(todo.subtasks || []), { id: Date.now().toString(), text: subtaskInput.trim(), done: false }];
    const res = await updateTodo(id, { subtasks: newSubtasks });
    if (res.success) { setTodo(res.data); setSubtaskInput(''); }
  };

  const toggleSubtask = async (sid) => {
    const newSubtasks = todo.subtasks.map(s => s.id === sid ? { ...s, done: !s.done } : s);
    const res = await updateTodo(id, { subtasks: newSubtasks });
    if (res.success) setTodo(res.data);
  };

  const deleteSubtask = async (sid) => {
    const newSubtasks = todo.subtasks.filter(s => s.id !== sid);
    const res = await updateTodo(id, { subtasks: newSubtasks });
    if (res.success) setTodo(res.data);
  };

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && editTagInput.trim()) {
      e.preventDefault();
      const t = editTagInput.trim().replace(',', '');
      if (t && !editTags.includes(t)) setEditTags([...editTags, t]);
      setEditTagInput('');
    }
  };

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <span style={{ color: 'var(--text-dim)' }}>Loading task…</span>
    </div>
  );

  if (error || !todo) return (
    <div className="page">
      <div className="container" style={{ paddingTop: 60, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
        <h2 style={{ marginBottom: 8 }}>Task not found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{error || 'The task you are looking for does not exist.'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Tasks</button>
      </div>
    </div>
  );

  const overdue = isOverdue(todo.dueDate, todo.completed);
  const subtaskDone = (todo.subtasks || []).filter(s => s.done).length;
  const subtaskTotal = (todo.subtasks || []).length;

  return (
    <div className="page">
      <div className="header">
        <div className="container">
          <div className="header-inner">
            <div className="logo">Task<span>ly</span></div>
            <div style={{ display: 'flex', gap: 8 }}>
              {!editing && <button className="btn btn-ghost btn-sm" onClick={startEdit}>Edit</button>}
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}>← Back to all tasks</button>

        <div className="detail-card">
          <div className="detail-header">
            <div className={`detail-check ${todo.completed ? 'checked' : ''}`} onClick={handleToggle}>
              {todo.completed ? '✓' : ''}
            </div>
            <div className="detail-title-wrap">
              {editing ? (
                <>
                  <input className="form-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 10 }} />
                  <textarea className="form-input" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description…" />
                  <div className="form-row">
                    <div className="form-col">
                      <select className="form-input" value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                        <option value="high">🔴 High</option>
                        <option value="medium">🟠 Medium</option>
                        <option value="low">🟢 Low</option>
                      </select>
                    </div>
                    <div className="form-col">
                      <input className="form-input" type="date" value={editDue} onChange={e => setEditDue(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    {editTags.map(t => (
                      <span key={t} className="tag-chip">{t} <button onClick={() => setEditTags(editTags.filter(x => x !== t))}>×</button></span>
                    ))}
                  </div>
                  <input className="form-input" placeholder="Add tags (Enter or comma)" value={editTagInput}
                    onChange={e => setEditTagInput(e.target.value)} onKeyDown={addTag} style={{ marginBottom: 14 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
                  </div>
                </>
              ) : (
                <>
                  <div className={`detail-title ${todo.completed ? 'completed' : ''}`}>{todo.title}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className={`priority-badge ${todo.priority}`}>{todo.priority} priority</span>
                    {todo.completed && <span style={{ fontSize: 12, color: 'var(--success)', background: 'rgba(74,222,128,0.1)', padding: '2px 10px', borderRadius: 20 }}>✓ Completed</span>}
                    {overdue && <span style={{ fontSize: 12, color: 'var(--danger)', background: 'rgba(248,113,113,0.1)', padding: '2px 10px', borderRadius: 20 }}>⚠ Overdue</span>}
                  </div>
                </>
              )}
            </div>
          </div>

          {!editing && (
            <>
              <div className="meta-grid">
                <div className="meta-item">
                  <div className="meta-label">Created</div>
                  <div className="meta-value">{formatDate(todo.createdAt, true)}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">Last updated</div>
                  <div className="meta-value">{formatDate(todo.updatedAt, true)}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">Due date</div>
                  <div className="meta-value" style={{ color: overdue ? 'var(--danger)' : undefined }}>
                    {todo.dueDate ? formatDate(todo.dueDate) : '—'}
                  </div>
                </div>
                {todo.completedAt && (
                  <div className="meta-item">
                    <div className="meta-label">Completed at</div>
                    <div className="meta-value">{formatDate(todo.completedAt, true)}</div>
                  </div>
                )}
                {subtaskTotal > 0 && (
                  <div className="meta-item">
                    <div className="meta-label">Subtasks</div>
                    <div className="meta-value">{subtaskDone}/{subtaskTotal} done</div>
                  </div>
                )}
              </div>

              {todo.description && (
                <>
                  <div className="section-title">Description</div>
                  <div className="detail-description">{todo.description}</div>
                </>
              )}

              {todo.tags?.length > 0 && (
                <>
                  <div className="section-title">Tags</div>
                  <div className="tags-row" style={{ marginBottom: 24 }}>
                    {todo.tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
                  </div>
                </>
              )}

              <hr className="divider" />

              <div className="section-title" style={{ marginBottom: 14 }}>Subtasks</div>
              {subtaskTotal > 0 && (
                <ul className="subtasks-list">
                  {todo.subtasks.map(s => (
                    <li key={s.id} className="subtask-item">
                      <div className={`subtask-check ${s.done ? 'done' : ''}`} onClick={() => toggleSubtask(s.id)}>
                        {s.done ? '✓' : ''}
                      </div>
                      <span className={`subtask-text ${s.done ? 'done' : ''}`}>{s.text}</span>
                      <button className="subtask-del" onClick={() => deleteSubtask(s.id)}>×</button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="add-subtask">
                <input placeholder="Add a subtask…" value={subtaskInput} onChange={e => setSubtaskInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSubtask()} />
                <button className="btn btn-ghost btn-sm" onClick={addSubtask}>Add</button>
              </div>

              <hr className="divider" />

              <div className="section-title">Notes</div>
              <textarea className="notes-area" placeholder="Add personal notes, links, or context…"
                value={notes} onChange={e => setNotes(e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={saveNotes}>
                  {notesSaved ? '✓ Saved' : 'Save notes'}
                </button>
              </div>

              <hr className="divider" />

              <div className="action-row">
                <button className={`btn ${todo.completed ? 'btn-ghost' : 'btn-primary'}`} onClick={handleToggle}>
                  {todo.completed ? 'Mark as Active' : '✓ Mark Complete'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
