import React, { useEffect, useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import { getTenantId } from '../tenant';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';
import { normalizeRoles } from '../utils/roles';

/**
 * Teacher Notes/Grades page: teachers can review, update, and delete saved student grades per class.
 */
const TeacherNotesPage = ({ language }) => {
  const content = language === 'fr' ? fr : language === 'en' ? en : ar;
  const userRoles = normalizeRoles(JSON.parse(localStorage.getItem('user_roles') || '[]'));
  const currentUserName = (localStorage.getItem('userName') || '').trim().toLowerCase();
  const isTeacherOnly = userRoles.length > 0 && userRoles.every((role) => role === 'teacher' || role === 'role_teacher');

  const configuredBase = resolveApiBaseUrl('http://localhost:8085');
  const browserIsLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const localhostApiTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBase);
  const inferredRemoteBase = `${window.location.protocol}//${window.location.hostname}:8085`;
  const effectiveBase = localhostApiTarget && !browserIsLocal ? inferredRemoteBase : configuredBase;
  const useRelativeApi = process.env.REACT_APP_USE_RELATIVE_API === 'true';

  const [savedEntries, setSavedEntries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Editing state
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValues, setEditValues] = useState({ subject: '', grade: '' });

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

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(apiUrlFor('/exams'), { headers: buildHeaders() });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const subjects = Array.isArray(data)
          ? data.map((exam) => String(exam?.subject || '').trim()).filter(Boolean)
          : [];
        setSubjectOptions(Array.from(new Set(subjects)).sort((a, b) => a.localeCompare(b)));
      } catch {
        setSubjectOptions([]);
      }
    };

    fetchSubjects();
  }, []);

  const allSubjectOptions = Array.from(
    new Set([
      ...subjectOptions,
      ...savedEntries.map((e) => String(e?.subject || '').trim()).filter(Boolean),
    ])
  ).sort((a, b) => a.localeCompare(b));

  const filteredEntries = selectedClassId
    ? savedEntries.filter((e) => String(e.classId) === String(selectedClassId))
    : savedEntries;

  const startEdit = (index) => {
    const entry = filteredEntries[index];
    setEditingIndex(index);
    setEditValues({ subject: entry.subject, grade: entry.grade });
    setMessage('');
    setError('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValues({ subject: '', grade: '' });
  };

  const saveEdit = () => {
    if (!String(editValues.grade).trim()) {
      setError(content.notes_validationError || 'Veuillez remplir la note.');
      return;
    }
    const targetEntry = filteredEntries[editingIndex];
    setSavedEntries((prev) =>
      prev.map((e) =>
        e === targetEntry ? { ...e, subject: editValues.subject, grade: editValues.grade } : e
      )
    );
    setEditingIndex(null);
    setEditValues({ subject: '', grade: '' });
    setMessage(content.notes_saveSuccess || 'Note mise à jour avec succès.');
    setError('');
  };

  const deleteEntry = (index) => {
    const targetEntry = filteredEntries[index];
    setSavedEntries((prev) => prev.filter((e) => e !== targetEntry));
    if (editingIndex === index) cancelEdit();
    setMessage(content.notes_deleteSuccess || 'Note supprimée.');
    setError('');
  };

  return (
    <div
      style={{ maxWidth: 800, margin: '0 auto', width: '100%', display: 'grid', gap: 16 }}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <h2>{content.grades_title || 'Saisie des notes'}</h2>

      {error && <div style={{ color: '#b91c1c' }}>{error}</div>}
      {message && <div style={{ color: '#15803d' }}>{message}</div>}

      <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <label>{content.notes_class || 'Classe'}</label>
          <select
            value={selectedClassId}
            onChange={(e) => { setSelectedClassId(e.target.value); cancelEdit(); }}
            style={{ width: '100%' }}
            className="form-select"
            disabled={classesLoading}
          >
            <option value="">{content.notes_allClasses || 'Toutes les classes'}</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div style={{ color: '#555', textAlign: 'center', padding: 24 }}>
          {content.notes_noSavedEntries || 'Aucune note enregistrée.'}
        </div>
      ) : (
        <div>
          <h3>{content.notes_savedTitle || 'Notes enregistrées'}</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#dbeafe' }}>
                  <th style={th}>{content.notes_date || 'Date'}</th>
                  <th style={th}>{content.notes_class || 'Classe'}</th>
                  <th style={th}>{content.notes_studentName || 'Élève'}</th>
                  <th style={th}>{content.notes_subject || 'Matière'}</th>
                  <th style={th}>{content.notes_grade || 'Note'}</th>
                  <th style={th}>{content.actions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#f0f9ff' : '#fff' }}>
                    <td style={td}>{entry.date}</td>
                    <td style={td}>{entry.className}</td>
                    <td style={td}>{entry.studentName}</td>
                    <td style={td}>
                      {editingIndex === i ? (
                        allSubjectOptions.length > 0 ? (
                          <select
                            value={editValues.subject}
                            onChange={(e) => setEditValues((v) => ({ ...v, subject: e.target.value }))}
                            className="form-select"
                          >
                            <option value="">{content.notes_subjectPlaceholder || 'Sélectionnez une matière'}</option>
                            {allSubjectOptions.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={editValues.subject}
                            onChange={(e) => setEditValues((v) => ({ ...v, subject: e.target.value }))}
                            style={{ width: '100%' }}
                          />
                        )
                      ) : (
                        entry.subject
                      )}
                    </td>
                    <td style={td}>
                      {editingIndex === i ? (
                        <input
                          type="number"
                          value={editValues.grade}
                          min={0}
                          max={20}
                          step={0.5}
                          onChange={(e) => setEditValues((v) => ({ ...v, grade: e.target.value }))}
                          style={{ width: 70 }}
                        />
                      ) : (
                        <strong>{entry.grade} / 20</strong>
                      )}
                    </td>
                    <td style={td}>
                      {editingIndex === i ? (
                        <span style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            className="buttonStyle"
                            onClick={saveEdit}
                            style={{ padding: '4px 10px', fontSize: 13 }}
                          >
                            {content.save || 'Enregistrer'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            style={{ padding: '4px 10px', fontSize: 13, background: 'none', border: '1px solid #aaa', borderRadius: 6, cursor: 'pointer' }}
                          >
                            {content.cancel || 'Annuler'}
                          </button>
                        </span>
                      ) : (
                        <span style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => startEdit(i)}
                            style={{ color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
                            title={content.notes_edit || 'Modifier'}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteEntry(i)}
                            style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
                            title={content.notes_removeRow || 'Supprimer'}
                          >
                            🗑️
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const th = { padding: '8px 12px', textAlign: 'left', fontWeight: 600 };
const td = { padding: '8px 12px' };

export default TeacherNotesPage;
