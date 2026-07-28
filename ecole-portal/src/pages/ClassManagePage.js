import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";
import { getTenantId } from '../tenant';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';
import { normalizeRoles, hasAnyRole } from '../utils/roles';

const ClassManagePage = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const { id } = useParams();
  const navigate = useNavigate();

  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [addingStudent, setAddingStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [savingStudent, setSavingStudent] = useState(false);
  const [removingStudent, setRemovingStudent] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [addingTeacher, setAddingTeacher] = useState(false);
  const [selectedTeacherName, setSelectedTeacherName] = useState('');
  const [savingTeacher, setSavingTeacher] = useState(false);
  const [removingTeacher, setRemovingTeacher] = useState(null);

  const [deletingClass, setDeletingClass] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const userRoles = normalizeRoles(JSON.parse(localStorage.getItem('user_roles') || '[]'));
  const canManageClasses = hasAnyRole(userRoles, ['admin', 'manager', 'secretary']);

  const configuredBase = resolveApiBaseUrl('http://localhost:8085');
  const browserIsLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const localhostApiTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBase);
  const inferredRemoteBase = `${window.location.protocol}//${window.location.hostname}:8085`;
  const effectiveBase = localhostApiTarget && !browserIsLocal ? inferredRemoteBase : configuredBase;
  const useRelativeApi = process.env.REACT_APP_USE_RELATIVE_API === 'true';

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

  useEffect(() => {
    const fetchClass = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiUrlFor('/classes'), { headers: buildHeaders() });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const all = await response.json();
        const found = all.find((c) => String(c.id) === String(id));
        setCls(found || null);
      } catch (error) {
        console.error('Failed to fetch class:', error);
        setCls(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchTeachers = async () => {
      setTeachersLoading(true);
      try {
        const response = await fetch(apiUrlFor('/users/teachers'), { headers: buildHeaders() });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setTeachers(Array.isArray(data) ? data : []);
      } catch {
        setTeachers([]);
      } finally {
        setTeachersLoading(false);
      }
    };

    fetchClass();
    if (canManageClasses) fetchTeachers();
  }, [id]);

  const clearMessages = () => {
    setSubmitError('');
    setSubmitSuccess('');
  };

  // ── Rename class ──────────────────────────────────────────────
  const handleStartEditName = () => {
    setEditName(cls.name);
    setEditingName(true);
    clearMessages();
  };

  const handleCancelEditName = () => {
    setEditingName(false);
    setEditName('');
  };

  const handleSaveName = async () => {
    const trimmed = editName.trim();
    if (!trimmed) { setSubmitError(content.classes_createValidation); return; }
    if (trimmed === cls.name) { setEditingName(false); return; }
    setSavingName(true);
    clearMessages();
    try {
      const response = await fetch(apiUrlFor(`/classes/${cls.id}`), {
        method: 'PUT',
        headers: buildHeaders(true),
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) {
        let message = content.classes_editError;
        try { const p = await response.json(); message = p.message || message; } catch { if (response.status === 409) message = content.classes_createDuplicate; }
        throw new Error(message);
      }
      const updated = await response.json();
      setCls(updated);
      setEditingName(false);
      setSubmitSuccess(content.classes_editSuccess);
    } catch (error) {
      setSubmitError(error.message || content.classes_editError);
    } finally {
      setSavingName(false);
    }
  };

  // ── Delete class ──────────────────────────────────────────────
  const handleDeleteClass = async () => {
    if (!window.confirm(`${content.classes_removeConfirm} "${cls.name}"?`)) return;
    setDeletingClass(true);
    clearMessages();
    try {
      const response = await fetch(apiUrlFor(`/classes/${cls.id}`), { method: 'DELETE', headers: buildHeaders() });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      navigate('/administration/classes');
    } catch {
      setSubmitError(content.classes_removeError);
      setDeletingClass(false);
    }
  };

  // ── Add student ───────────────────────────────────────────────
  const handleSaveStudent = async () => {
    const trimmed = newStudentName.trim();
    if (!trimmed) { setSubmitError(content.classes_studentValidation); return; }
    setSavingStudent(true);
    clearMessages();
    try {
      const response = await fetch(apiUrlFor(`/classes/${cls.id}/students`), {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) {
        let message = content.classes_studentError;
        try { const p = await response.json(); message = p.message || message; } catch { if (response.status === 409) message = content.classes_studentDuplicate; }
        throw new Error(message);
      }
      const updated = await response.json();
      setCls(updated);
      setNewStudentName('');
      setAddingStudent(false);
      setSubmitSuccess(content.classes_studentSuccess);
    } catch (error) {
      setSubmitError(error.message || content.classes_studentError);
    } finally {
      setSavingStudent(false);
    }
  };

  const handleRemoveStudent = async (studentName) => {
    setRemovingStudent(studentName);
    clearMessages();
    try {
      const response = await fetch(apiUrlFor(`/classes/${cls.id}/students/${encodeURIComponent(studentName)}`), { method: 'DELETE', headers: buildHeaders() });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const updated = await response.json();
      setCls(updated);
    } catch {
      setSubmitError(content.classes_studentRemoveError);
    } finally {
      setRemovingStudent(null);
    }
  };

  // ── Assign teacher ────────────────────────────────────────────
  const handleSaveTeacher = async () => {
    const trimmed = selectedTeacherName.trim();
    if (!trimmed) { setSubmitError(content.classes_teacherSelectValidation || 'Please select a teacher.'); return; }
    setSavingTeacher(true);
    clearMessages();
    try {
      const response = await fetch(apiUrlFor(`/classes/${cls.id}/teachers`), {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) {
        let message = content.classes_teacherAssignError || 'Unable to assign teacher.';
        try { const p = await response.json(); message = p.message || message; } catch { if (response.status === 409) message = content.classes_teacherAlreadyAssigned || 'Teacher already assigned.'; }
        throw new Error(message);
      }
      const updated = await response.json();
      setCls(updated);
      setSelectedTeacherName('');
      setAddingTeacher(false);
      setSubmitSuccess(content.classes_teacherAssignSuccess || 'Teacher assigned successfully.');
    } catch (error) {
      setSubmitError(error.message || content.classes_teacherAssignError);
    } finally {
      setSavingTeacher(false);
    }
  };

  const handleRemoveTeacher = async (teacherName) => {
    setRemovingTeacher(teacherName);
    clearMessages();
    try {
      const response = await fetch(apiUrlFor(`/classes/${cls.id}/teachers/${encodeURIComponent(teacherName)}`), { method: 'DELETE', headers: buildHeaders() });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const updated = await response.json();
      setCls(updated);
      setSubmitSuccess(content.classes_teacherRemoveSuccess || 'Teacher removed.');
    } catch {
      setSubmitError(content.classes_teacherRemoveError || 'Unable to remove teacher.');
    } finally {
      setRemovingTeacher(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────
  if (loading) {
    return <div className="p-6 max-w-4xl mx-auto"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!cls) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <p className="text-red-600">Class not found.</p>
        <Link to="/administration/classes" className="text-indigo-600 hover:underline text-sm">
          ← {content.classes_backToList || 'Back to class list'}
        </Link>
      </div>
    );
  }

  if (!canManageClasses) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <p className="text-red-600">{content.classes_readOnlyHint || 'You do not have permission to manage classes.'}</p>
        <Link to="/administration/classes" className="text-indigo-600 hover:underline text-sm">
          ← {content.classes_backToList || 'Back to class list'}
        </Link>
      </div>
    );
  }

  const unassignedTeachers = teachers.filter(
    (t) => !(cls.teachers || []).some((a) => a.toLowerCase() === String(t.name || '').toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/administration/classes" className="text-indigo-600 hover:underline text-sm">
          ← {content.classes_backToList || 'Back to class list'}
        </Link>
        <button
          onClick={handleDeleteClass}
          disabled={deletingClass}
          className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 disabled:opacity-50"
        >
          {deletingClass ? '...' : (content.classes_removeClass || 'Delete class')}
        </button>
      </div>

      {/* Class name */}
      <div className="bg-white rounded shadow p-4 border border-gray-200 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          {editingName ? (
            <>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') handleCancelEditName(); }}
                className="border rounded px-3 py-2 text-sm flex-1"
                autoFocus
                disabled={savingName}
              />
              <button onClick={handleSaveName} disabled={savingName} className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 disabled:opacity-50">
                {savingName ? '...' : (content.classes_editSave || 'Save')}
              </button>
              <button onClick={handleCancelEditName} disabled={savingName} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200">
                {content.classes_editCancel || 'Cancel'}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">🏫 {cls.name}</h2>
              <button onClick={handleStartEditName} className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200">
                {content.classes_editClass || 'Rename'}
              </button>
            </>
          )}
        </div>
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        {submitSuccess && <p className="text-sm text-green-600">{submitSuccess}</p>}
      </div>

      {/* Students */}
      <div className="bg-white rounded shadow p-4 border border-gray-200 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-semibold text-gray-700">👥 {content.students || 'Students'} ({cls.students.length})</h3>
          {!addingStudent && (
            <button
              onClick={() => { setAddingStudent(true); setNewStudentName(''); clearMessages(); }}
              className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded hover:bg-indigo-200"
            >
              {content.classes_addStudent || '+ Add Student'}
            </button>
          )}
        </div>

        {addingStudent && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveStudent(); if (e.key === 'Escape') setAddingStudent(false); }}
              placeholder={content.classes_studentPlaceholder || 'Student name'}
              className="border rounded px-3 py-1 text-sm flex-1"
              autoFocus
              disabled={savingStudent}
            />
            <button onClick={handleSaveStudent} disabled={savingStudent} className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 disabled:opacity-50">
              {savingStudent ? '...' : (content.classes_studentSave || 'Add')}
            </button>
            <button onClick={() => setAddingStudent(false)} disabled={savingStudent} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200">
              {content.classes_editCancel || 'Cancel'}
            </button>
          </div>
        )}

        {cls.students.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {cls.students.map((student, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span>{student}</span>
                <button
                  onClick={() => handleRemoveStudent(student)}
                  disabled={removingStudent === student}
                  className="text-red-400 hover:text-red-600 text-xs disabled:opacity-50"
                  title={content.classes_removeStudentTooltip || 'Remove student'}
                >
                  {removingStudent === student ? '...' : '✕'}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic text-gray-400 text-sm">{content.classes_noStudents || 'No students in this class.'}</p>
        )}
      </div>

      {/* Teachers */}
      <div className="bg-white rounded shadow p-4 border border-gray-200 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-semibold text-gray-700">🎓 {content.classes_teachers || 'Teachers'} ({(cls.teachers || []).length})</h3>
          {!addingTeacher && unassignedTeachers.length > 0 && !teachersLoading && (
            <button
              onClick={() => { setAddingTeacher(true); setSelectedTeacherName(''); clearMessages(); }}
              className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded hover:bg-indigo-200"
            >
              {content.classes_assignTeacher || '+ Assign Teacher'}
            </button>
          )}
        </div>

        {addingTeacher && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedTeacherName}
              onChange={(e) => setSelectedTeacherName(e.target.value)}
              className="border rounded px-3 py-1 text-sm flex-1"
              disabled={savingTeacher}
            >
              <option value="">{content.classes_selectTeacherPlaceholder || 'Select teacher...'}</option>
              {unassignedTeachers.map((t) => (
                <option key={t.id || t.name} value={t.name}>{t.name}</option>
              ))}
            </select>
            <button onClick={handleSaveTeacher} disabled={savingTeacher || !selectedTeacherName} className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 disabled:opacity-50">
              {savingTeacher ? '...' : (content.classes_teacherSave || 'Assign')}
            </button>
            <button onClick={() => setAddingTeacher(false)} disabled={savingTeacher} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200">
              {content.classes_editCancel || 'Cancel'}
            </button>
          </div>
        )}

        {(cls.teachers || []).length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {(cls.teachers || []).map((teacher, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span>{teacher}</span>
                <button
                  onClick={() => handleRemoveTeacher(teacher)}
                  disabled={removingTeacher === teacher}
                  className="text-red-400 hover:text-red-600 text-xs disabled:opacity-50"
                  title={content.classes_removeTeacherTooltip || 'Remove teacher'}
                >
                  {removingTeacher === teacher ? '...' : '✕'}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic text-gray-400 text-sm">{content.classes_noTeachers || 'No teacher assigned.'}</p>
        )}
      </div>
    </div>
  );
};

export default ClassManagePage;

