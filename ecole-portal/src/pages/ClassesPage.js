import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";
import { getTenantId } from '../tenant';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';
import { normalizeRoles, hasAnyRole } from '../utils/roles';

const ClassesPage = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const [classes, setClasses] = useState([]);
  const [newClassName, setNewClassName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Inline add-student state
  const [addingStudentToClassId, setAddingStudentToClassId] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [savingStudent, setSavingStudent] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [inlineSuccess, setInlineSuccess] = useState('');

  // Get user roles and name for teacher block filtering
  const userRoles = normalizeRoles(JSON.parse(localStorage.getItem('user_roles') || '[]'));
  const currentUserName = localStorage.getItem('userName') || '';
  const isTeacherOnly = userRoles.length > 0 && userRoles.every(role => role === 'teacher' || role === 'role_teacher');
  const canManageClasses = hasAnyRole(userRoles, ['admin', 'manager', 'secretary']);

  const configuredBase = resolveApiBaseUrl('http://localhost:8085');
  const browserIsLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const localhostApiTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBase);
  const inferredRemoteBase = `${window.location.protocol}//${window.location.hostname}:8085`;
  const effectiveBase = localhostApiTarget && !browserIsLocal ? inferredRemoteBase : configuredBase;
  const useRelativeApi = process.env.REACT_APP_USE_RELATIVE_API === 'true';

  const apiUrlFor = (path) => {
    if (useRelativeApi) {
      return `/api${path}`;
    }
    return `${effectiveBase}/api${path}`;
  };

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

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(apiUrlFor('/classes'), { headers: buildHeaders() });
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
  }, []);

  // Fetch all registered students once for the inline add-student dropdown
  useEffect(() => {
    if (!canManageClasses) return;
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
    fetchStudents();
  }, [canManageClasses]);

  const openAddStudent = (classId) => {
    setAddingStudentToClassId(classId);
    setSelectedStudentName('');
    setInlineError('');
    setInlineSuccess('');
  };

  const cancelAddStudent = () => {
    setAddingStudentToClassId(null);
    setSelectedStudentName('');
    setInlineError('');
    setInlineSuccess('');
  };

  const handleAddStudentToClass = async (cls) => {
    const trimmed = selectedStudentName.trim();
    if (!trimmed) { setInlineError(content.classes_studentValidation || 'Please select a student.'); return; }
    setSavingStudent(true);
    setInlineError('');
    setInlineSuccess('');
    try {
      const response = await fetch(apiUrlFor(`/classes/${cls.id}/students`), {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) {
        let message = content.classes_studentError || 'Unable to add student.';
        try { const p = await response.json(); message = p.message || message; }
        catch { if (response.status === 409) message = content.classes_studentDuplicate || 'Student already in class.'; }
        throw new Error(message);
      }
      const updated = await response.json();
      setClasses((prev) => prev.map((c) => c.id === cls.id ? updated : c));
      setInlineSuccess(content.classes_studentSuccess || 'Student added successfully.');
      setSelectedStudentName('');
      setTimeout(() => {
        cancelAddStudent();
      }, 1500);
    } catch (error) {
      setInlineError(error.message || content.classes_studentError || 'Unable to add student.');
    } finally {
      setSavingStudent(false);
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
      const response = await fetch(apiUrlFor('/classes'), {
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
      setClasses((current) => [...current, createdClass].sort((a, b) => a.name.localeCompare(b.name)));
      setNewClassName('');
      setSubmitSuccess(content.classes_createSuccess);
    } catch (error) {
      setSubmitError(error.message || content.classes_createError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleClasses = isTeacherOnly
    ? classes.filter((cls) => (cls.teachers || []).some(t => t.toLowerCase() === currentUserName.toLowerCase()))
    : classes;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">🏫 {content.classes_title}</h2>

      {isTeacherOnly && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="text-sm text-blue-700">
            👨‍🏫 {content.classes_teacherViewLabel || 'Showing only your assigned classes'}
          </p>
        </div>
      )}

      {canManageClasses && (
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
                onChange={(e) => setNewClassName(e.target.value)}
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
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ background: '#dbeafe', color: '#1e3a8a' }}>
            <tr>
              <th style={th}>{content.classes_title}</th>
              <th style={th}>{content.students}</th>
              <th style={th}>{content.classes_teachers || 'Teachers'}</th>
              {canManageClasses && <th style={th}>{content.classes_selectAction || 'Actions'}</th>}
            </tr>
          </thead>
          <tbody>
            {visibleClasses.map((cls, index) => {
              const unassigned = allStudents.filter(
                (s) => !(cls.students || []).some(
                  (added) => added.toLowerCase() === String(s.name || '').toLowerCase()
                )
              );
              const isAddingHere = addingStudentToClassId === cls.id;
              return (
                <React.Fragment key={cls.id}>
                  <tr style={{ background: index % 2 === 0 ? '#f0f9ff' : '#fff' }}>
                    <td style={td}><strong>{cls.name}</strong></td>
                    <td style={td}>{(cls.students || []).length}</td>
                    <td style={td}>{(cls.teachers || []).length}</td>
                    {canManageClasses && (
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => isAddingHere ? cancelAddStudent() : openAddStudent(cls.id)}
                          style={{
                            marginRight: 6, padding: '4px 10px', borderRadius: 4, fontSize: 12,
                            background: isAddingHere ? '#fee2e2' : '#e0f2fe',
                            color: isAddingHere ? '#b91c1c' : '#0369a1',
                            border: 'none', cursor: 'pointer', fontWeight: 600,
                          }}
                        >
                          {isAddingHere ? '✕ Annuler' : '+ Ajouter un élève'}
                        </button>
                        <Link
                          to={`/administration/classes/${cls.id}`}
                          style={{
                            padding: '4px 10px', borderRadius: 4, fontSize: 12,
                            background: '#e0e7ff', color: '#3730a3',
                            textDecoration: 'none', fontWeight: 600,
                          }}
                        >
                          {content.classes_manageClassButton || 'Gérer'}
                        </Link>
                      </td>
                    )}
                  </tr>

                  {/* ── Inline add-student panel ── */}
                  {isAddingHere && (
                    <tr>
                      <td colSpan={canManageClasses ? 4 : 3} style={{ padding: '0 12px 12px' }}>
                        <div style={{
                          background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8,
                          padding: '14px 16px', display: 'grid', gap: 10,
                        }}>
                          <strong style={{ fontSize: 13 }}>
                            👥 {content.classes_addStudent || 'Ajouter un élève'} — <em>{cls.name}</em>
                          </strong>

                          {inlineError && (
                            <p style={{ color: '#b91c1c', margin: 0, fontSize: 13 }}>{inlineError}</p>
                          )}
                          {inlineSuccess && (
                            <p style={{ color: '#15803d', margin: 0, fontSize: 13 }}>{inlineSuccess}</p>
                          )}

                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <select
                              value={selectedStudentName}
                              onChange={(e) => setSelectedStudentName(e.target.value)}
                              disabled={savingStudent || studentsLoading}
                              className="form-select"
                              style={{ flex: 1, minWidth: 200, padding: '6px 10px', borderRadius: 4, border: '1px solid #ccc' }}
                              autoFocus
                            >
                              <option value="">
                                {studentsLoading
                                  ? (content.loading || 'Chargement...')
                                  : unassigned.length === 0
                                    ? (content.classes_noUnassignedStudents || 'Tous les élèves sont déjà dans cette classe.')
                                    : (content.classes_selectStudentPlaceholder || 'Sélectionner un élève...')}
                              </option>
                              {unassigned.map((s) => (
                                <option key={s.id || s.name} value={s.name}>{s.name}</option>
                              ))}
                            </select>

                            <button
                              onClick={() => handleAddStudentToClass(cls)}
                              disabled={savingStudent || !selectedStudentName || studentsLoading}
                              className="buttonStyle"
                              style={{ padding: '6px 16px', fontSize: 13 }}
                            >
                              {savingStudent ? '...' : (content.classes_studentSave || 'Ajouter')}
                            </button>
                          </div>

                          {/* Current students in this class */}
                          {(cls.students || []).length > 0 && (
                            <div style={{ marginTop: 4 }}>
                              <small style={{ color: '#555', fontWeight: 600 }}>
                                {content.students || 'Élèves actuels'} ({cls.students.length}) :
                              </small>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                {cls.students.map((s) => (
                                  <span key={s} style={{
                                    background: '#d1fae5', borderRadius: 999,
                                    padding: '2px 10px', fontSize: 12, color: '#065f46',
                                  }}>
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {visibleClasses.length === 0 && (
              <tr>
                <td style={td} colSpan={canManageClasses ? 4 : 3}>
                  <span className="italic text-gray-500">{content.classes_noClasses || 'No classes found.'}</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const th = { padding: '8px 12px', textAlign: 'left', fontWeight: 600 };
const td = { padding: '8px 12px' };

export default ClassesPage;
