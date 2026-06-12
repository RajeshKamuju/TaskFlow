import React, { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Dashboard page represents the core secure authenticated task lists workspace.
 */
export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorError, setErrorError] = useState('');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Trigger Modal creation / editing forms states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' or 'EDIT'
  const [editingTaskId, setEditingTaskId] = useState(null);
  
  // Modal Task Input Form
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    dueDate: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch tasks on component mounting
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setErrorError('');
    try {
      const response = await api.get('/tasks');
      setTasks(response.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setErrorError('Could not retrieve task lists from secure database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Setup form fields on keypress
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTaskForm((prev) => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateTaskForm = () => {
    const errors = {};
    if (!taskForm.title.trim()) {
      errors.title = 'Task title is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreateModal = () => {
    setModalMode('CREATE');
    setTaskForm({
      title: '',
      description: '',
      status: 'PENDING',
      dueDate: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setModalMode('EDIT');
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'PENDING',
      dueDate: task.dueDate || ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!validateTaskForm()) return;

    setSubmitLoading(true);
    try {
      if (modalMode === 'CREATE') {
        const response = await api.post('/tasks', taskForm);
        setTasks((prev) => [response.data, ...prev]);
      } else {
        const response = await api.put(`/tasks/${editingTaskId}`, taskForm);
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTaskId ? response.data : t))
        );
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving task:', err);
      alert('Failed to save task details. Refresh and try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to remove selected task.');
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const updatedPayload = {
        ...task,
        status: nextStatus
      };
      const response = await api.put(`/tasks/${task.id}`, updatedPayload);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? response.data : t))
      );
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  // TASK COUNTER METRICS
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    pending: tasks.filter((t) => t.status === 'PENDING').length
  };

  // CLIENT SEARCH AND STATUS FILTERING
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container py-4 fade-in-element">
      
      {/* 1. SECURE STATS BARS */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card text-center h-100 shadow-sm border-0 rounded-3">
            <div className="card-body py-3">
              <h6 className="text-muted fw-semibold">Total Tasks</h6>
              <h2 className="fw-bold mb-0 text-dark" id="stat-total">{stats.total}</h2>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card text-center h-100 shadow-sm border-0 rounded-3">
            <div className="card-body py-3">
              <h6 className="text-warning fw-semibold">Pending</h6>
              <h2 className="fw-bold mb-0 text-warning" id="stat-pending">{stats.pending}</h2>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card text-center h-100 shadow-sm border-0 rounded-3">
            <div className="card-body py-3">
              <h6 className="text-primary fw-semibold">In Progress</h6>
              <h2 className="fw-bold mb-0 text-primary" id="stat-inprogress">{stats.inProgress}</h2>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card text-center h-100 shadow-sm border-0 rounded-3">
            <div className="card-body py-3">
              <h6 className="text-success fw-semibold">Completed</h6>
              <h2 className="fw-bold mb-0 text-success" id="stat-completed">{stats.completed}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DONT BE AFRAID OF EMPTY STATES: CONTROLS & ADD BUTTON */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="row g-3 justify-content-between align-items-center">
            
            {/* Search inputs */}
            <div className="col-12 col-md-6 col-lg-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">🔎</span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search task title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="task-search-input"
                />
              </div>
            </div>

            {/* Status filtering */}
            <div className="col-12 col-md-4 col-lg-3">
              <div className="d-flex align-items-center">
                <label className="me-2 text-secondary text-sm fw-medium mb-0">Status:</label>
                <select
                  className="form-select text-sm fw-semibold"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  id="task-filter-select"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            {/* Add task button */}
            <div className="col-12 col-md-2 text-md-end">
              <button
                onClick={openCreateModal}
                className="btn btn-primary d-flex align-items-center justify-content-center w-full"
                id="add-task-btn"
              >
                + New Task
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 3. TASK BOARD LISTING PANEL */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading data...</span>
          </div>
          <p className="text-muted mt-2">Loading tasks. Please wait...</p>
        </div>
      ) : errorError ? (
        <div className="alert alert-danger p-4 text-center rounded-3 shadow-none">
          {errorError}
          <div className="mt-2">
            <button onClick={fetchTasks} className="btn btn-sm btn-outline-danger">Try Again</button>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border-0 shadow-sm">
          <div className="text-muted fs-1 mb-2">📋</div>
          <h5 className="fw-semibold text-dark">No tasks found</h5>
          <p className="text-muted mb-0">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try modifying your search query or status filter selection.'
              : 'Add your very first task above to start tracking!'}
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredTasks.map((task) => (
            <div key={task.id} className="col-12" id={`task-card-${task.id}`}>
              <div className="card shadow-sm border-0 rounded-3 task-list-item">
                <div className="card-body p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between">
                  
                  {/* Left segment containing title / checkboxes */}
                  <div className="d-flex align-items-start mb-3 mb-md-0">
                    <input
                      type="checkbox"
                      checked={task.status === 'COMPLETED'}
                      onChange={() => handleToggleStatus(task)}
                      className="form-check-input mt-1.5 me-3 flex-shrink-0"
                      style={{ transform: 'scale(1.25)' }}
                      id={`task-check-${task.id}`}
                    />
                    <div>
                      <h5 className={`fw-semibold mb-1 ${task.status === 'COMPLETED' ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                        {task.title}
                      </h5>
                      {task.description && (
                        <p className="text-muted mb-2 text-sm text-wrap-break text-truncate" style={{ maxWidth: '600px' }}>
                          {task.description}
                        </p>
                      )}
                      
                      {/* Timeline descriptors */}
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        {task.dueDate && (
                          <span className="badge bg-light text-secondary border px-2 py-1">
                            📅 Due: {task.dueDate}
                          </span>
                        )}
                        <span className={`badge ${
                          task.status === 'COMPLETED' ? 'bg-success-subtle text-success' :
                          task.status === 'IN_PROGRESS' ? 'bg-primary-subtle text-primary' :
                          'bg-warning-subtle text-warning'
                        } px-2.5 py-1`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions column segment */}
                  <div className="d-flex gap-2 justify-content-end align-items-center">
                    <button
                      onClick={() => openEditModal(task)}
                      className="btn btn-outline-secondary btn-sm"
                      id={`edit-btn-${task.id}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="btn btn-outline-danger btn-sm"
                      id={`delete-btn-${task.id}`}
                    >
                      Delete
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. SEPARATE BOOTSTRAP EDITABLE FORM MODAL */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title fw-bold">
                  {modalMode === 'CREATE' ? 'Add New Task' : 'Edit Task details'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSaveTask}>
                <div className="modal-body p-4">
                  
                  {/* Task title input */}
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-semibold">Task Title *</label>
                    <input
                      type="text"
                      name="title"
                      className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                      placeholder="e.g. Code auth implementation"
                      value={taskForm.title}
                      onChange={handleFormChange}
                      id="modal-title-input"
                    />
                    {formErrors.title && <div className="invalid-feedback">{formErrors.title}</div>}
                  </div>

                  {/* Task description */}
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-semibold">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="3"
                      placeholder="Review API controllers security logs"
                      value={taskForm.description}
                      onChange={handleFormChange}
                    ></textarea>
                  </div>

                  {/* Task details status selection */}
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-semibold">Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={taskForm.status}
                      onChange={handleFormChange}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  {/* Task dueDate */}
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-semibold">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      className="form-control"
                      value={taskForm.dueDate}
                      onChange={handleFormChange}
                    />
                  </div>

                </div>
                <div className="modal-footer px-4 py-3 bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="btn btn-primary px-4 fw-bold"
                    id="modal-submit-btn"
                  >
                    {submitLoading ? 'Saving...' : 'Save Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
