import React, { useEffect, useState } from 'react';
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";
import { getTenantId } from '../tenant';

const ClassesPage = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const [classes, setClasses] = useState([]);
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [addingStudentToClassId, setAddingStudentToClassId] = useState(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [savingStudentId, setSavingStudentId] = useState(null);
  const [removingStudent, setRemovingStudent] = useState(null); // { classId, name }
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const baseUrl = (process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8085').replace(/\/$/, '');

  const buildHeaders = (includeJson = false) => {
    const token = sessionStorage.getItem('jwt_token');
    const headers = {
      'X-Tenant-Id': getTenantId(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    if (includeJson) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  };

  const toggleExpand = (id) => {
    setExpandedClassId(expandedClassId === id ? null : id);
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const url = `${baseUrl}/api/classes`;

        const response = await fetch(url, { headers: buildHeaders() });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        setClasses([]);
      }
    };

    fetchClasses();
  }, [baseUrl]);

  const handleAddStudentClick = (cls) => {
    setAddingStudentToClassId(cls.id);
    setNewStudentName('');
    setExpandedClassId(cls.id);
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleCancelAddStudent = () => {
    setAddingStudentToClassId(null);
    setNewStudentName('');
  };

  const handleSaveStudent = async (cls) => {
    const trimmed = newStudentName.trim();
    if (!trimmed) {
      setSubmitError(content.classes_studentValidation);
      return;
    }
    setSavingStudentId(cls.id);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const response = await fetch(`${baseUrl}/api/classes/${cls.id}/students`, {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) {
        let message = content.classes_studentError;
        try {
          const payload = await response.json();
          message = payload.message || message;
        } catch {
          if (response.status === 409) message = content.classes_studentDuplicate;
        }
        throw new Error(message);
      }
      const updated = await response.json();
      setClasses((current) => current.map((c) => (c.id === updated.id ? updated : c)));
      setNewStudentName('');
      setAddingStudentToClassId(null);
      setSubmitSuccess(content.classes_studentSuccess);
    } catch (error) {
      setSubmitError(error.message || content.classes_studentError);
    } finally {
      setSavingStudentId(null);
    }
  };

  const handleRemoveStudent = async (cls, studentName) => {
    setRemovingStudent({ classId: cls.id, name: studentName });
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const response = await fetch(
        `${baseUrl}/api/classes/${cls.id}/students/${encodeURIComponent(studentName)}`,
        { method: 'DELETE', headers: buildHeaders() }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const updated = await response.json();
      setClasses((current) => current.map((c) => (c.id === updated.id ? updated : c)));
    } catch {
      setSubmitError(content.classes_studentRemoveError);
    } finally {
      setRemovingStudent(null);
    }
  };

  const handleEditClass = (cls) => {
    setEditingId(cls.id);
    setEditName(cls.name);
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async (cls) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setSubmitError(content.classes_createValidation);
      return;
    }
    if (trimmed === cls.name) {
      setEditingId(null);
      return;
    }

    setSavingId(cls.id);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const response = await fetch(`${baseUrl}/api/classes/${cls.id}`, {
        method: 'PUT',
        headers: buildHeaders(true),
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) {
        let message = content.classes_editError;
        try {
          const payload = await response.json();
          message = payload.message || message;
        } catch {
          if (response.status === 409) message = content.classes_createDuplicate;
        }
        throw new Error(message);
      }
      const updated = await response.json();
      setClasses((current) =>
        current
          .map((c) => (c.id === updated.id ? updated : c))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
      setSubmitSuccess(content.classes_editSuccess);
    } catch (error) {
      setSubmitError(error.message || content.classes_editError);
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteClass = async (cls) => {
    if (!window.confirm(`${content.classes_removeConfirm} "${cls.name}"?`)) return;

    setDeletingId(cls.id);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const response = await fetch(`${baseUrl}/api/classes/${cls.id}`, {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      setClasses((current) => current.filter((c) => c.id !== cls.id));
      if (expandedClassId === cls.id) setExpandedClassId(null);
      setSubmitSuccess(`"${cls.name}" ${content.classes_removeSuccess}`);
    } catch (error) {
      setSubmitError(content.classes_removeError);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateClass = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    const className = newClassName.trim();
    if (!className) {
      setSubmitError(content.classes_createValidation);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${baseUrl}/api/classes`, {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({
          name: className,
          students: [],
        }),
      });

      if (!response.ok) {
        let message = content.classes_createError;
        try {
          const errorPayload = await response.json();
          message = errorPayload.message || errorPayload.error || message;
        } catch {
          if (response.status === 409) {
            message = content.classes_createDuplicate;
          }
        }
        throw new Error(message);
      }

      const createdClass = await response.json();
      setClasses((currentClasses) => [...currentClasses, createdClass].sort((a, b) => a.name.localeCompare(b.name)));
      setExpandedClassId(createdClass.id);
      setNewClassName('');
      setSubmitSuccess(content.classes_createSuccess);
    } catch (error) {
      setSubmitError(error.message || content.classes_createError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">🏫 {content.classes_title}</h2>

      <form onSubmit={handleCreateClass} className="bg-white rounded shadow p-4 space-y-3 border border-gray-200">
        <div>
          <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
            {content.classes_createLabel}
          </label>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              id="className"
              type="text"
              value={newClassName}
              onChange={(event) => setNewClassName(event.target.value)}
              placeholder={content.classes_createPlaceholder}
              className="flex-1 border rounded px-3 py-2"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? content.classes_createSubmitting : content.classes_createButton}
            </button>
          </div>
        </div>

        {submitError && (
          <p className="text-sm text-red-600">{submitError}</p>
        )}

        {submitSuccess && (
          <p className="text-sm text-green-600">{submitSuccess}</p>
        )}
      </form>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ background: '#dbeafe', color: '#1e3a8a' }}>
            <tr>
              <th style={th}>{content.classes_title}</th>
              <th style={th}>{content.students}</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls, index) => (
              <React.Fragment key={cls.id}>
                <tr style={{ background: index % 2 === 0 ? '#f0f9ff' : '#fff' }}>
                  <td style={td}>
                    {editingId === cls.id ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(cls);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="border rounded px-2 py-1 text-sm"
                          autoFocus
                          disabled={savingId === cls.id}
                        />
                        <button onClick={() => handleSaveEdit(cls)} disabled={savingId === cls.id}>
                          {savingId === cls.id ? '...' : content.classes_editSave}
                        </button>
                        <button onClick={handleCancelEdit} disabled={savingId === cls.id}>
                          {content.classes_editCancel}
                        </button>
                      </div>
                    ) : (
                      <strong>{cls.name}</strong>
                    )}
                  </td>
                  <td style={td}>{cls.students.length}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button onClick={() => toggleExpand(cls.id)}>
                        {expandedClassId === cls.id ? content.classes_hideStudents : content.classes_showStudents}
                      </button>
                      <button onClick={() => handleAddStudentClick(cls)} disabled={addingStudentToClassId === cls.id || editingId === cls.id}>
                        {content.classes_addStudent}
                      </button>
                      <button onClick={() => handleEditClass(cls)} disabled={editingId !== null || deletingId === cls.id}>
                        {content.classes_editClass}
                      </button>
                      <button onClick={() => handleDeleteClass(cls)} disabled={deletingId === cls.id || editingId === cls.id}>
                        {deletingId === cls.id ? '...' : content.classes_removeClass}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedClassId === cls.id && (
                  <tr style={{ background: '#fff' }}>
                    <td style={td} colSpan={3}>
                      <ul className="ml-4 list-disc list-inside text-sm space-y-1">
                        {cls.students.length > 0 ? (
                          cls.students.map((student, studentIndex) => (
                            <li key={studentIndex} className="flex items-center justify-between pr-2">
                              <span>{student}</span>
                              <button
                                onClick={() => handleRemoveStudent(cls, student)}
                                disabled={
                                  removingStudent?.classId === cls.id &&
                                  removingStudent?.name === student
                                }
                                className="ml-2 text-red-400 hover:text-red-600 text-xs disabled:opacity-50"
                                title={content.classes_removeStudentTooltip}
                              >
                                {removingStudent?.classId === cls.id && removingStudent?.name === student ? '...' : '✕'}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="italic text-gray-500">{content.classes_noStudents}</li>
                        )}
                      </ul>

                      {addingStudentToClassId === cls.id && (
                        <div className="mt-2 flex items-center gap-2 ml-4">
                          <input
                            type="text"
                            value={newStudentName}
                            onChange={(e) => setNewStudentName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveStudent(cls);
                              if (e.key === 'Escape') handleCancelAddStudent();
                            }}
                            placeholder={content.classes_studentPlaceholder}
                            className="border rounded px-2 py-1 text-sm flex-1"
                            autoFocus
                            disabled={savingStudentId === cls.id}
                          />
                          <button onClick={() => handleSaveStudent(cls)} disabled={savingStudentId === cls.id}>
                            {savingStudentId === cls.id ? '...' : content.classes_studentSave}
                          </button>
                          <button onClick={handleCancelAddStudent} disabled={savingStudentId === cls.id}>
                            {content.classes_editCancel}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const th = { padding: '8px 12px', textAlign: 'left', fontWeight: 600 };
const td = { padding: '8px 12px' };

export default ClassesPage;
