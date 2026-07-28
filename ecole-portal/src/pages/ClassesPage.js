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
            {visibleClasses.map((cls, index) => (
              <tr key={cls.id} style={{ background: index % 2 === 0 ? '#f0f9ff' : '#fff' }}>
                <td style={td}><strong>{cls.name}</strong></td>
                <td style={td}>{cls.students.length}</td>
                <td style={td}>{(cls.teachers || []).length}</td>
                {canManageClasses && (
                  <td style={td}>
                    <Link
                      to={`/administration/classes/${cls.id}`}
                      className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded hover:bg-indigo-200 inline-block"
                    >
                      {content.classes_manageClassButton || 'Manage'}
                    </Link>
                  </td>
                )}
              </tr>
            ))}
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
