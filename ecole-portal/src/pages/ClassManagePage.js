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

  // Students
  const [allStudents, setAllStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [savingStudent, setSavingStudent] = useState(false);
  const [removingStudent, setRemovingStudent] = useState(null);

  // Teachers
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

    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        const response = await fetch(apiUrlFor('/users/students'), { headers: buildHeaders() });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setAllStudents(Array.isArray(data) ? data : []);
      } catch {
        setAllStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchClass();
    if (canManageClasses) {
      fetchTeachers();
      fetchStudents();
    }
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

  // ── Add student (select) ──────────────────────────────────────
  const handleSaveStudent = async () => {
    const trimmed = selectedStudentName.trim();
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
      setSelectedStudentName('');
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

  // Timetable
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleDay, setScheduleDay] = useState('Monday');
  const [scheduleSlotsText, setScheduleSlotsText] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [removingScheduleEntry, setRemovingScheduleEntry] = useState(null);
  const [scheduleError, setScheduleError] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState('');

  const clearScheduleMessages = () => {
    setScheduleError('');
    setScheduleSuccess('');
  };

  const normalizeText = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const dayOptions = [
    { value: 'Monday', label: content.schedule_monday || 'Monday' },
    { value: 'Tuesday', label: content.schedule_tuesday || 'Tuesday' },
    { value: 'Wednesday', label: content.schedule_wednesday || 'Wednesday' },
    { value: 'Thursday', label: content.schedule_thursday || 'Thursday' },
    { value: 'Friday', label: content.schedule_friday || 'Friday' },
    { value: 'Saturday', label: content.schedule_saturday || 'Saturday' },
    { value: 'Sunday', label: content.schedule_sunday || 'Sunday' },
  ];

  const loadClassSchedule = async (classId = cls?.id) => {
    if (!classId) return;
    setScheduleLoading(true);
    try {
      const response = await fetch(apiUrlFor(`/classes/${classId}/schedule`), { headers: buildHeaders() });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setSchedule(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch class schedule:', error);
      setSchedule([]);
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleSaveScheduleDay = async () => {
    const slots = scheduleSlotsText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!scheduleDay.trim()) {
      setScheduleError(content.classes_scheduleDayValidation || 'Please select a day.');
      return;
    }
    if (slots.length === 0) {
      setScheduleError(content.classes_scheduleSlotsValidation || 'Add at least one slot.');
      return;
    }

    setSavingSchedule(true);
    clearScheduleMessages();
    try {
      const response = await fetch(apiUrlFor(`/classes/${cls.id}/schedule`), {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({ day: scheduleDay, slots }),
      });
      if (!response.ok) {
        let message = content.classes_scheduleError || 'Unable to save schedule.';
        try { const p = await response.json(); message = p.message || message; } catch {}
        throw new Error(message);
      }
      await loadClassSchedule(cls.id);
      setScheduleDay('Monday');
      setScheduleSlotsText('');
      setScheduleSuccess(content.classes_scheduleSuccess || 'Schedule saved successfully.');
    } catch (error) {
      setScheduleError(error.message || content.classes_scheduleError || 'Unable to save schedule.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleRemoveScheduleEntry = async (entryId) => {
    if (!window.confirm(content.classes_scheduleDeleteConfirm || 'Delete this timetable entry?')) return;
    setRemovingScheduleEntry(entryId);
    clearScheduleMessages();
    try {
      const response = await fetch(apiUrlFor(`/classes/${cls.id}/schedule/${entryId}`), {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      if (!response.ok && response.status !== 204) throw new Error(`HTTP ${response.status}`);
      await loadClassSchedule(cls.id);
      setScheduleSuccess(content.classes_scheduleDeleteSuccess || 'Schedule entry removed.');
    } catch (error) {
      setScheduleError(error.message || content.classes_scheduleDeleteError || 'Unable to remove schedule entry.');
    } finally {
      setRemovingScheduleEntry(null);
    }
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

    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        const response = await fetch(apiUrlFor('/users/students'), { headers: buildHeaders() });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setAllStudents(Array.isArray(data) ? data : []);
      } catch {
        setAllStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchClass();
    if (canManageClasses) {
      fetchTeachers();
      fetchStudents();
    }
  }, [id]);

  useEffect(() => {
    if (cls?.id && canManageClasses) {
      loadClassSchedule(cls.id);
    } else {
      setSchedule([]);
    }
  }, [cls?.id, canManageClasses]);

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
    (t) => !(cls.teachers || []).some((a) => normalizeText(a) === normalizeText(t.name || ''))
  );

  const unassignedStudents = allStudents.filter(
    (s) => !(cls.students || []).some((added) => normalizeText(added) === normalizeText(s.name || ''))
  );

  const getTranslatedDay = (dayKey) => content[`schedule_${String(dayKey || '').toLowerCase()}`] || dayKey;

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
          <h3 className="font-semibold text-gray-700">
            👥 {content.students || 'Students'} ({cls.students.length})
          </h3>
          {!addingStudent && !studentsLoading && unassignedStudents.length > 0 && (
            <button
              onClick={() => { setAddingStudent(true); setSelectedStudentName(''); clearMessages(); }}
              className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded hover:bg-indigo-200"
            >
              {content.classes_addStudent || '+ Add Student'}
            </button>
          )}
        </div>

        {addingStudent && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedStudentName}
              onChange={(e) => setSelectedStudentName(e.target.value)}
              className="border rounded px-3 py-1 text-sm flex-1"
              disabled={savingStudent || studentsLoading}
              autoFocus
            >
              <option value="">{content.classes_selectStudentPlaceholder || 'Select student...'}</option>
              {unassignedStudents.map((s) => (
                <option key={s.id || s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
            <button
              onClick={handleSaveStudent}
              disabled={savingStudent || !selectedStudentName}
              className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 disabled:opacity-50"
            >
              {savingStudent ? '...' : (content.classes_studentSave || 'Add')}
            </button>
            <button
              onClick={() => { setAddingStudent(false); setSelectedStudentName(''); }}
              disabled={savingStudent}
              className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200"
            >
              {content.classes_editCancel || 'Cancel'}
            </button>
          </div>
        )}

        {cls.students.length > 0 ? (
          <ul className="divide-y divide-gray-100 mt-2">
            {cls.students.map((student, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                    {i + 1}
                  </span>
                  {student}
                </span>
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
          <h3 className="font-semibold text-gray-700">
            🎓 {content.classes_teachers || 'Teachers'} ({(cls.teachers || []).length})
          </h3>
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
            <button
              onClick={handleSaveTeacher}
              disabled={savingTeacher || !selectedTeacherName}
              className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 disabled:opacity-50"
            >
              {savingTeacher ? '...' : (content.classes_teacherSave || 'Assign')}
            </button>
            <button
              onClick={() => { setAddingTeacher(false); setSelectedTeacherName(''); }}
              disabled={savingTeacher}
              className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200"
            >
              {content.classes_editCancel || 'Cancel'}
            </button>
          </div>
        )}

        {(cls.teachers || []).length > 0 ? (
          <ul className="divide-y divide-gray-100 mt-2">
            {(cls.teachers || []).map((teacher, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    {i + 1}
                  </span>
                  {teacher}
                </span>
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

      {/* Timetable */}
      <div className="bg-white rounded shadow p-4 border border-gray-200 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-semibold text-gray-700">
            📆 {content.classes_scheduleTitle || 'Class timetable'}
          </h3>
          <p className="text-xs text-gray-500">
            {content.classes_scheduleHint || 'Create one day at a time; each line becomes one slot.'}
          </p>
        </div>

        {scheduleError && <p className="text-sm text-red-600">{scheduleError}</p>}
        {scheduleSuccess && <p className="text-sm text-green-600">{scheduleSuccess}</p>}

        <div className="grid gap-3 md:grid-cols-3 items-start">
          <label className="text-sm md:col-span-1">
            <span className="block mb-1 font-medium text-gray-600">{content.classes_scheduleDayLabel || 'Day'}</span>
            <select
              value={scheduleDay}
              onChange={(e) => setScheduleDay(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              disabled={savingSchedule}
            >
              {dayOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="text-sm md:col-span-2">
            <span className="block mb-1 font-medium text-gray-600">{content.classes_scheduleSlotsLabel || 'Time slots'}</span>
            <textarea
              value={scheduleSlotsText}
              onChange={(e) => setScheduleSlotsText(e.target.value)}
              rows={4}
              className="border rounded px-3 py-2 w-full"
              placeholder={content.classes_scheduleSlotsPlaceholder || 'Math - 08:00\nPhysics - 10:00'}
              disabled={savingSchedule}
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveScheduleDay}
            disabled={savingSchedule}
            className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 disabled:opacity-50"
          >
            {savingSchedule ? '...' : (content.classes_scheduleSave || 'Save timetable')}
          </button>
        </div>

        {scheduleLoading ? (
          <p className="italic text-gray-500 text-sm">{content.loading || 'Loading...'}</p>
        ) : schedule.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {schedule.map((dayPlan, index) => {
              const entries = Array.isArray(dayPlan.entries) && dayPlan.entries.length > 0
                ? dayPlan.entries
                : (dayPlan.slots || []).map((slot, slotIndex) => ({
                    id: `${dayPlan.day}-${slotIndex}`,
                    slotOrder: slotIndex + 1,
                    slotText: slot,
                    readOnly: true,
                  }));

              return (
                <div key={`${dayPlan.day}-${index}`} className="rounded border border-gray-200 bg-gray-50 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-gray-700">{getTranslatedDay(dayPlan.day)}</h4>
                    <span className="text-xs text-gray-500">{entries.length} slot{entries.length > 1 ? 's' : ''}</span>
                  </div>
                  <ul className="space-y-2">
                    {entries.map((entry) => (
                      <li key={entry.id || `${dayPlan.day}-${entry.slotOrder}`} className="flex items-center justify-between gap-2 text-sm bg-white rounded px-3 py-2 border border-gray-100">
                        <span>{entry.slotOrder}. {entry.slotText}</span>
                        {!entry.readOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemoveScheduleEntry(entry.id)}
                            disabled={removingScheduleEntry === entry.id}
                            className="text-red-500 hover:text-red-700 text-xs disabled:opacity-50"
                            title={content.classes_scheduleDeleteTooltip || 'Remove slot'}
                          >
                            {removingScheduleEntry === entry.id ? '...' : '✕'}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="italic text-gray-400 text-sm">{content.classes_scheduleNoData || 'No timetable defined for this class yet.'}</p>
        )}
      </div>
    </div>
  );
};

export default ClassManagePage;

