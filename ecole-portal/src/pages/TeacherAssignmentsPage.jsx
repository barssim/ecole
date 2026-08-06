import React, { useEffect, useMemo, useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import { getTenantId } from '../tenant';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';
import { normalizeRoles } from '../utils/roles';
import '../cssFiles/Inscription.css';

const TeacherAssignmentsPage = ({ language }) => {
  const content = language === 'fr' ? fr : language === 'en' ? en : ar;
  const userRoles = normalizeRoles(JSON.parse(localStorage.getItem('user_roles') || '[]'));
  const currentUserName = (localStorage.getItem('LoggedIn') || '').trim().toLowerCase();
  const currentUserId = localStorage.getItem('userId') || '';
  const isTeacherOnly = userRoles.length > 0 && userRoles.every((role) => role === 'teacher' || role === 'role_teacher');

  const configuredBase = resolveApiBaseUrl('http://localhost:8085');
  const browserIsLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const localhostApiTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBase);
  const inferredRemoteBase = `${window.location.protocol}//${window.location.hostname}:8085`;
  const effectiveBase = localhostApiTarget && !browserIsLocal ? inferredRemoteBase : configuredBase;
  const useRelativeApi = process.env.REACT_APP_USE_RELATIVE_API === 'true';

  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '' });
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editValues, setEditValues] = useState({ title: '', description: '', dueDate: '', attachmentName: '', attachmentUrl: '' });
  const [newAttachmentFile, setNewAttachmentFile] = useState(null);
  const [editAttachmentFile, setEditAttachmentFile] = useState(null);
  const [removeExistingAttachment, setRemoveExistingAttachment] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [createFileInputKey, setCreateFileInputKey] = useState(0);
  const [editFileInputKey, setEditFileInputKey] = useState(0);

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

  const resolveAttachmentUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return useRelativeApi ? url : `${effectiveBase}${url}`;
  };

  const uploadAttachment = async (file) => {
    if (!file) {
      return { attachmentName: null, attachmentUrl: null };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);

    const response = await fetch(apiUrlFor('/upload'), {
      method: 'POST',
      headers: buildHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(content.assignment_uploadError || 'Could not upload assignment file.');
    }

    const data = await response.json();
    return {
      attachmentName: data?.filename || file.name,
      attachmentUrl: data?.url || null,
    };
  };

  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        const query = currentUserName ? `?teacherName=${encodeURIComponent(currentUserName)}` : '';
        const response = await fetch(apiUrlFor(`/teacher/classes${query}`), { headers: buildHeaders() });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const assignedClasses = Array.isArray(data) ? data : [];
        setClasses(assignedClasses);
      } catch {
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, [currentUserName, isTeacherOnly]);

  const fetchAssignments = async () => {
    if (!currentUserId) {
      setAssignments([]);
      return;
    }
    try {
      const query = new URLSearchParams({ teacherId: currentUserId });
      if (selectedClassId) query.set('classId', selectedClassId);
      const response = await fetch(apiUrlFor(`/teacher/assignments?${query.toString()}`), {
        headers: buildHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch {
      setAssignments([]);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [currentUserId, selectedClassId]);

  const selectedAssignment = useMemo(
    () => assignments.find((assignment) => String(assignment.id) === String(editingId)) || null,
    [assignments, editingId]
  );

  useEffect(() => {
    if (!selectedAssignment) {
      setEditValues({ title: '', description: '', dueDate: '', attachmentName: '', attachmentUrl: '' });
      setEditAttachmentFile(null);
      setRemoveExistingAttachment(false);
      setEditFileInputKey((value) => value + 1);
      return;
    }
    setEditValues({
      title: selectedAssignment.title || '',
      description: selectedAssignment.description || '',
      dueDate: selectedAssignment.dueDate || '',
      attachmentName: selectedAssignment.attachmentName || '',
      attachmentUrl: selectedAssignment.attachmentUrl || '',
    });
    setEditAttachmentFile(null);
    setRemoveExistingAttachment(false);
    setEditFileInputKey((value) => value + 1);
  }, [selectedAssignment]);

  const handleCreateAssignment = async (event) => {
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

    try {
      setCreateSubmitting(true);
      const className = classes.find((cls) => String(cls.id) === String(selectedClassId))?.name || '';
      const uploadedAttachment = await uploadAttachment(newAttachmentFile);
      const payload = {
        teacherId: currentUserId,
        classId: String(selectedClassId),
        className,
        title: newAssignment.title.trim(),
        description: newAssignment.description.trim(),
        attachmentName: uploadedAttachment.attachmentName,
        attachmentUrl: uploadedAttachment.attachmentUrl,
        dueDate: newAssignment.dueDate,
        createdBy: currentUserName || currentUserId || 'teacher',
      };

      const response = await fetch(apiUrlFor('/teacher/assignments'), {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await fetchAssignments();
      setNewAssignment({ title: '', description: '', dueDate: '' });
      setNewAttachmentFile(null);
      setCreateFileInputKey((value) => value + 1);
      setMessage(content.assignment_createSuccess || 'Assignment created successfully.');
    } catch (err) {
      setError(err.message || content.assignment_createError || 'Could not create assignment.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleUpdateAssignment = async (event) => {
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

    try {
      setUpdateSubmitting(true);
      let attachmentName = editValues.attachmentName || null;
      let attachmentUrl = editValues.attachmentUrl || null;

      if (editAttachmentFile) {
        const uploadedAttachment = await uploadAttachment(editAttachmentFile);
        attachmentName = uploadedAttachment.attachmentName;
        attachmentUrl = uploadedAttachment.attachmentUrl;
      } else if (removeExistingAttachment) {
        attachmentName = null;
        attachmentUrl = null;
      }

      const payload = {
        teacherId: currentUserId,
        classId: String(selectedAssignment.classId || selectedClassId),
        className: selectedAssignment.className || '',
        title: editValues.title.trim(),
        description: editValues.description.trim(),
        attachmentName,
        attachmentUrl,
        dueDate: editValues.dueDate,
        createdBy: selectedAssignment.createdBy || currentUserName || 'teacher',
      };

      const response = await fetch(apiUrlFor(`/teacher/assignments/${selectedAssignment.id}`), {
        method: 'PUT',
        headers: buildHeaders(true),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await fetchAssignments();
      setEditAttachmentFile(null);
      setRemoveExistingAttachment(false);
      setEditFileInputKey((value) => value + 1);
      setMessage(content.assignment_updateSuccess || 'Assignment updated successfully.');
    } catch (err) {
      setError(err.message || content.assignment_updateError || 'Could not update assignment.');
    } finally {
      setUpdateSubmitting(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) {
      setError(content.assignment_selectAssignmentHint || 'Select an assignment first.');
      return;
    }

    try {
      const response = await fetch(apiUrlFor(`/teacher/assignments/${selectedAssignment.id}`), {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await fetchAssignments();
      setEditingId('');
      setEditValues({ title: '', description: '', dueDate: '', attachmentName: '', attachmentUrl: '' });
      setEditAttachmentFile(null);
      setRemoveExistingAttachment(false);
      setEditFileInputKey((value) => value + 1);
      setMessage(content.assignment_deleteSuccess || 'Assignment deleted successfully.');
      setError('');
    } catch {
      setError(content.assignment_deleteError || 'Could not delete assignment.');
    }
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

        <div className="form-group">
          <label>{content.assignment_attachment || 'Devoir file'}</label>
          <input
            key={createFileInputKey}
            type="file"
            disabled={!selectedClassId || createSubmitting}
            onChange={(e) => setNewAttachmentFile(e.target.files?.[0] || null)}
          />
          <small style={{ color: '#555', display: 'block', marginTop: 4 }}>
            {newAttachmentFile?.name || (content.assignment_attachmentOptional || 'Optional: add a PDF, image, or document.')}
          </small>
        </div>

        <button type="submit" className="signup-button" disabled={!selectedClassId || createSubmitting}>
          {createSubmitting ? (content.loading || 'Loading...') : (content.assignment_create || 'Create Assignment')}
        </button>
      </form>

      {assignments.length > 0 && (
        <form onSubmit={handleUpdateAssignment} className="signup-form" style={{ maxWidth: '100%', width: '100%' }}>
          <h3 style={{ marginTop: 0, marginBottom: 15 }}>{content.assignment_manage || 'Manage Assignment'}</h3>

          <div className="form-group">
            <label>{content.assignment_select || 'Select Assignment'}</label>
            <select value={editingId} onChange={(e) => setEditingId(e.target.value)}>
              <option value="">{content.assignment_selectPlaceholder || 'Select an assignment'}</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title} — {formatDate(assignment.dueDate)}
                </option>
              ))}
            </select>
            <small style={{ color: '#555', display: 'block', marginTop: 4 }}>
              {assignments.length} {content.assignment_count || 'assignments'}
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

              <div className="form-group">
                <label>{content.assignment_attachment || 'Devoir file'}</label>
                {editValues.attachmentUrl && !removeExistingAttachment && !editAttachmentFile && (
                  <small style={{ color: '#555', display: 'block', marginBottom: 8 }}>
                    <a href={resolveAttachmentUrl(editValues.attachmentUrl)} target="_blank" rel="noreferrer">
                      {editValues.attachmentName || content.assignment_attachmentDownload || 'Download current file'}
                    </a>
                  </small>
                )}
                <input
                  key={editFileInputKey}
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setEditAttachmentFile(file);
                    if (file) {
                      setRemoveExistingAttachment(false);
                    }
                  }}
                  disabled={updateSubmitting}
                />
                <small style={{ color: '#555', display: 'block', marginTop: 4 }}>
                  {editAttachmentFile?.name || (content.assignment_attachmentReplaceHint || 'Select a file to replace the current attachment.')}
                </small>
                {(editValues.attachmentUrl || editAttachmentFile) && (
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                    <input
                      type="checkbox"
                      checked={removeExistingAttachment}
                      disabled={!!editAttachmentFile || updateSubmitting}
                      onChange={(e) => setRemoveExistingAttachment(e.target.checked)}
                    />
                    <span>{content.assignment_attachmentRemove || 'Remove current attachment'}</span>
                  </label>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button type="submit" className="signup-button" style={{ flex: '1 1 180px' }} disabled={updateSubmitting}>
                  {updateSubmitting ? (content.loading || 'Loading...') : (content.assignment_update || 'Update')}
                </button>
                <button
                  type="button"
                  className="signup-button"
                  onClick={handleDeleteAssignment}
                  style={{ flex: '1 1 180px', background: '#dc2626' }}
                  disabled={updateSubmitting}
                >
                  {content.assignment_delete || 'Delete'}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {assignments.length > 0 ? (
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
                  <th style={th}>{content.assignment_attachment || 'Attachment'}</th>
                  <th style={th}>{content.notes_actions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, i) => (
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
                    <td style={td}><strong>{assignment.title}</strong></td>
                    <td style={td}>
                      <span style={{ fontSize: '0.9em', color: '#666' }}>
                        {assignment.description
                          ? assignment.description.substring(0, 50) + (assignment.description.length > 50 ? '...' : '')
                          : '—'}
                      </span>
                    </td>
                    <td style={td}>
                      <span style={{ color: isOverdue(assignment.dueDate) ? '#dc2626' : '#000' }}>
                        {formatDate(assignment.dueDate)}
                      </span>
                    </td>
                    <td style={td}>{assignment.className || '—'}</td>
                    <td style={td}>
                      {assignment.attachmentUrl ? (
                        <a href={resolveAttachmentUrl(assignment.attachmentUrl)} target="_blank" rel="noreferrer">
                          {assignment.attachmentName || (content.assignment_attachmentDownload || 'Download')}
                        </a>
                      ) : '—'}
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        className="signup-button"
                        style={{ padding: '6px 12px', width: 'auto', fontSize: '0.9em' }}
                        onClick={() => setEditingId(String(assignment.id))}
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
      ) : (
        selectedClassId && (
          <div style={{ padding: '20px', background: '#f0f9ff', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
            {content.assignment_noAssignments || 'No assignments yet. Create one above!'}
          </div>
        )
      )}
    </div>
  );
};

const th = { padding: '8px 12px', textAlign: 'left', fontWeight: 600 };
const td = { padding: '8px 12px' };

export default TeacherAssignmentsPage;

