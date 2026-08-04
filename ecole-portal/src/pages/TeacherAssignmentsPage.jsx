import React, { useEffect, useMemo, useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import { getTenantId } from '../tenant';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';
import { normalizeRoles } from '../utils/roles';
import '../cssFiles/Inscription.css';

const STORAGE_KEY = 'teacher_assignments';

/**
 * Teacher Assignments page: teachers can create and manage assignments with titles and due dates.
 */
const TeacherAssignmentsPage = ({ language }) => {
  const content = language === 'fr' ? fr : language === 'en' ? en : ar;
  const userRoles = normalizeRoles(JSON.parse(localStorage.getItem('user_roles') || '[]'));
  const currentUserName = (localStorage.getItem('userName') || '').trim().toLowerCase();
  const currentUserId = localStorage.getItem('userId') || '';
  const isTeacherOnly = userRoles.length > 0 && userRoles.every((role) => role === 'teacher' || role === 'role_teacher');

  const configuredBase = resolveApiBaseUrl('http://localhost:8085');
  const browserIsLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const localhostApiTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBase);
  const inferredRemoteBase = `${window.location.protocol}//${window.location.hostname}:8085`;
  const effectiveBase = localhostApiTarget && !browserIsLocal ? inferredRemoteBase : configuredBase;
  const useRelativeApi = process.env.REACT_APP_USE_RELATIVE_API === 'true';

  // Form state for new assignment
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '' });
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ title: '', description: '', dueDate: '' });

  const apiUrlFor = (path) => {
    if (useRelativeApi) return `/api${path}`;
    return `${effectiveBase}/api${path}`;
  };

  const buildHeaders = (includeJson = false) => {
    const token = sessionStorage.getItem('jwt_token');
    const headers = {
      'X-Tenant-Id': getTenantId(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    if (includeJson) headers['Content-Type'] = 'application/json';
    return headers;
  };

  // Load assignments from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setAssignments(Array.isArray(stored) ? stored : []);
    } catch {
      setAssignments([]);
    }
  }, []);

  // Save assignments to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  }, [assignments]);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        const response = await fetch(apiUrlFor('/classes'), { headers: buildHeaders() });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const allClasses = Array.isArray(data) ? data : [];
        const visibleClasses = isTeacherOnly
          ? allClasses.filter((cls) => (cls.teachers || []).some((t) => String(t || '').toLowerCase() === currentUserName))
          : allClasses;
        setClasses(visibleClasses);
      } catch {
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, [currentUserName, isTeacherOnly]);

  const assignmentsForSelectedClass = useMemo(() => {
    if (!selectedClassId) return assignments;
    return assignments.filter((assignment) => String(assignment.classId) === String(selectedClassId));
  }, [assignments, selectedClassId]);

  const selectedAssignment = useMemo(
    () => assignments.find((assignment) => String(assignment.id) === String(editingId)) || null,
    [assignments, editingId]
  );

  // Load values when editing
  useEffect(() => {
    if (!selectedAssignment) {
      setEditValues({ title: '', description: '', dueDate: '' });
      return;
    }

    setEditValues({
      title: selectedAssignment.title || '',
      description: selectedAssignment.description || '',
      dueDate: selectedAssignment.dueDate || '',
    });
  }, [selectedAssignment]);

  // Auto-clear selection when filtered list changes
  useEffect(() => {
    if (!editingId) return;

    const stillVisible = assignmentsForSelectedClass.some(
      (assignment) => String(assignment.id) === String(editingId)
    );

    if (!stillVisible) {
      setEditingId(null);
      setEditValues({ title: '', description: '', dueDate: '' });
    }
  }, [assignmentsForSelectedClass, editingId]);

  const handleCreateAssignment = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!selectedClassId) {
      setError(content.assignment_selectClassHint || 'Select a class first.');
      return;
    }

    if (!newAssignment.title.trim()) {
      setError(content.assignment_titleRequired || 'Title is required.');
      return;
    }

    if (!newAssignment.dueDate) {
      setError(content.assignment_dueDateRequired || 'Due date is required.');
      return;
    }

    const assignment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      classId: selectedClassId,
      className: classes.find((cls) => String(cls.id) === String(selectedClassId))?.name || '',
      title: newAssignment.title.trim(),
      description: newAssignment.description.trim() || '',
      dueDate: newAssignment.dueDate,
      createdBy: currentUserName || currentUserId || 'Unknown',
      createdAt: new Date().toLocaleDateString(
        language === 'ar' ? 'ar-EG' : language === 'en' ? 'en-GB' : 'fr-FR'
      ),
    };

    setAssignments((prev) => [assignment, ...prev]);
    setNewAssignment({ title: '', description: '', dueDate: '' });
    setMessage(content.assignment_createSuccess || 'Assignment created successfully.');
  };

  const handleUpdateAssignment = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!selectedAssignment) {
      setError(content.assignment_selectAssignmentHint || 'Select an assignment first.');
      return;
    }

    if (!editValues.title.trim()) {
      setError(content.assignment_titleRequired || 'Title is required.');
      return;
    }

    if (!editValues.dueDate) {
      setError(content.assignment_dueDateRequired || 'Due date is required.');
      return;
    }

    setAssignments((prev) =>
      prev.map((assignment) =>
        String(assignment.id) === String(editingId)
          ? {
              ...assignment,
              title: editValues.title.trim(),
              description: editValues.description.trim(),
              dueDate: editValues.dueDate,
            }
          : assignment
      )
    );

    setMessage(content.assignment_updateSuccess || 'Assignment updated successfully.');
  };

  const handleDeleteAssignment = () => {
    if (!selectedAssignment) {
      setError(content.assignment_selectAssignmentHint || 'Select an assignment first.');
      return;
    }

    setAssignments((prev) =>
      prev.filter((assignment) => String(assignment.id) !== String(editingId))
    );
    setEditingId(null);
    setEditValues({ title: '', description: '', dueDate: '' });
    setError('');
    setMessage(content.assignment_deleteSuccess || 'Assignment deleted successfully.');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'en' ? 'en-GB' : 'fr-FR');
    } catch {
      return dateStr;
    }
  };

  const isOverdue = (dueDate) => {
    try {
      return new Date(dueDate) < new Date();
    } catch {
      return false;
    }
  };

  return (
    <div
      style={{ maxWidth: 900, margin: '0 auto', width: '100%', display: 'grid', gap: 20 }}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <h2>{content.assignment_title || 'Assignments'}</h2>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      {/* Create new assignment form */}
      <form onSubmit={handleCreateAssignment} className="signup-form" style={{ maxWidth: '100%', width: '100%' }}>
        <h3 style={{ marginTop: 0, marginBottom: 15 }}>{content.assignment_new || 'New Assignment'}</h3>

        <div className="form-group">
          <label>{content.notes_class || 'Class'}</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            disabled={classesLoading}
            required
          >
            <option value="">{content.notes_classPlaceholder || 'Select a class'}</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>{content.assignment_title || 'Title'}</label>
          <input
            type="text"
            placeholder={content.assignment_titlePlaceholder || 'Assignment title'}
            value={newAssignment.title}
            disabled={!selectedClassId}
            onChange={(e) => setNewAssignment((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label>{content.assignment_description || 'Description'}</label>
          <textarea
            placeholder={content.assignment_descriptionPlaceholder || 'Assignment description (optional)'}
            value={newAssignment.description}
            disabled={!selectedClassId}
            onChange={(e) => setNewAssignment((prev) => ({ ...prev, description: e.target.value }))}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
          />
        </div>

        <div className="form-group">
          <label>{content.assignment_dueDate || 'Due Date'}</label>
          <input
            type="date"
            value={newAssignment.dueDate}
            disabled={!selectedClassId}
            onChange={(e) => setNewAssignment((prev) => ({ ...prev, dueDate: e.target.value }))}
            required
          />
        </div>

        <button type="submit" className="signup-button" disabled={!selectedClassId}>
          {content.assignment_create || 'Create Assignment'}
        </button>
      </form>

      {/* Edit/Delete assignment form */}
      {assignmentsForSelectedClass.length > 0 && (
        <form onSubmit={handleUpdateAssignment} className="signup-form" style={{ maxWidth: '100%', width: '100%' }}>
          <h3 style={{ marginTop: 0, marginBottom: 15 }}>{content.assignment_manage || 'Manage Assignment'}</h3>

          <div className="form-group">
            <label>{content.assignment_select || 'Select Assignment'}</label>
            <select
              value={editingId}
              onChange={(e) => setEditingId(e.target.value)}
              disabled={assignmentsForSelectedClass.length === 0}
            >
              <option value="">{content.assignment_selectPlaceholder || 'Select an assignment'}</option>
              {assignmentsForSelectedClass.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title} — {formatDate(assignment.dueDate)}
                </option>
              ))}
            </select>
            <small style={{ color: '#555', display: 'block', marginTop: 4 }}>
              {assignmentsForSelectedClass.length} {content.assignment_count || 'assignments'}
            </small>
          </div>

          {selectedAssignment && (
            <>
              <div className="form-group">
                <label>{content.assignment_title || 'Title'}</label>
                <input
                  type="text"
                  value={editValues.title}
                  onChange={(e) => setEditValues((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>{content.assignment_description || 'Description'}</label>
                <textarea
                  value={editValues.description}
                  onChange={(e) => setEditValues((prev) => ({ ...prev, description: e.target.value }))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
                />
              </div>

              <div className="form-group">
                <label>{content.assignment_dueDate || 'Due Date'}</label>
                <input
                  type="date"
                  value={editValues.dueDate}
                  onChange={(e) => setEditValues((prev) => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button type="submit" className="signup-button" style={{ flex: '1 1 180px' }}>
                  {content.assignment_update || 'Update'}
                </button>
                <button
                  type="button"
                  className="signup-button"
                  onClick={handleDeleteAssignment}
                  style={{ flex: '1 1 180px', background: '#dc2626' }}
                >
                  {content.assignment_delete || 'Delete'}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {/* Assignments table */}
      {(selectedClassId ? assignmentsForSelectedClass : assignments).length > 0 && (
        <div>
          <h3>{content.assignment_list || 'Assignments'}</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#dbeafe' }}>
                  <th style={th}>{content.assignment_title || 'Title'}</th>
                  <th style={th}>{content.assignment_description || 'Description'}</th>
                  <th style={th}>{content.assignment_dueDate || 'Due Date'}</th>
                  <th style={th}>{content.notes_class || 'Class'}</th>
                  <th style={th}>{content.notes_actions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {(selectedClassId ? assignmentsForSelectedClass : assignments).map((assignment, i) => (
                  <tr
                    key={assignment.id || i}
                    style={{
                      background:
                        String(assignment.id) === String(editingId)
                          ? '#bfdbfe'
                          : isOverdue(assignment.dueDate)
                          ? '#fee2e2'
                          : i % 2 === 0
                          ? '#f0f9ff'
                          : '#fff',
                    }}
                  >
                    <td style={td}>
                      <strong>{assignment.title}</strong>
                    </td>
                    <td style={td}>
                      <span style={{ fontSize: '0.9em', color: '#666' }}>
                        {assignment.description ? assignment.description.substring(0, 50) + (assignment.description.length > 50 ? '...' : '') : '—'}
                      </span>
                    </td>
                    <td style={td}>
                      <span style={{ color: isOverdue(assignment.dueDate) ? '#dc2626' : '#000' }}>
                        {formatDate(assignment.dueDate)}
                        {isOverdue(assignment.dueDate) && (
                          <span style={{ marginLeft: 8, fontSize: '0.85em', color: '#dc2626' }}>
                            ({content.assignment_overdue || 'Overdue'})
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={td}>{assignment.className}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        className="signup-button"
                        style={{ padding: '6px 12px', width: 'auto', fontSize: '0.9em' }}
                        onClick={() => setEditingId(assignment.id)}
                      >
                        {content.notes_edit || 'Edit'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(selectedClassId ? assignmentsForSelectedClass : assignments).length === 0 && selectedClassId && (
        <div style={{ padding: '20px', background: '#f0f9ff', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
          {content.assignment_noAssignments || 'No assignments yet. Create one above!'}
        </div>
      )}
    </div>
  );
};

const th = { padding: '8px 12px', textAlign: 'left', fontWeight: 600 };
const td = { padding: '8px 12px' };

export default TeacherAssignmentsPage;

