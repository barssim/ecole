import React, { useEffect, useMemo, useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import { getTenantId } from '../tenant';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';
import { normalizeRoles } from '../utils/roles';
import '../cssFiles/Inscription.css';

/**
 * Teacher Notes/Grades page: teachers can enter and review student grades per class.
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

  // Single entry form (one row)
  const [entry, setEntry] = useState({ studentName: '', subject: '', grade: '' });
  const [savedEntries, setSavedEntries] = useState([]);
  const [className, setClassName] = useState('');
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassStudents, setSelectedClassStudents] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Inline edit state
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

  const extractStudentName = (student) => {
    if (typeof student === 'string') return student;
    if (!student || typeof student !== 'object') return '';
    return student.name || student.username || `${student.firstname || ''} ${student.surname || ''}`.trim();
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
    const selectedClass = classes.find((cls) => String(cls.id) === String(selectedClassId));
    if (!selectedClass) {
      setClassName('');
      setSelectedClassStudents([]);
      return;
    }

    setClassName(selectedClass.name || '');
    const fallbackStudents = Array.isArray(selectedClass.students)
      ? selectedClass.students.map(extractStudentName).filter(Boolean)
      : [];
    setSelectedClassStudents(fallbackStudents);

    const fetchClassStudents = async () => {
      try {
        const response = await fetch(apiUrlFor(`/classes/${selectedClass.id}/students`), { headers: buildHeaders() });
        if (!response.ok) return;
        const data = await response.json();
        const students = Array.isArray(data)
          ? data.map(extractStudentName).filter(Boolean)
          : [];
        if (students.length > 0) {
          setSelectedClassStudents(students);
        }
      } catch {
        // Keep fallback list from /classes when the dedicated endpoint is unavailable.
      }
    };

    fetchClassStudents();
    // Reset form and editing when class changes
    setEntry({ studentName: '', subject: '', grade: '' });
    setEditingIndex(null);
  }, [selectedClassId, classes]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(apiUrlFor('/exams'), { headers: buildHeaders() });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const subjects = Array.isArray(data)
          ? data
              .map((exam) => String(exam?.subject || '').trim())
              .filter(Boolean)
          : [];
        const uniqueSubjects = Array.from(new Set(subjects)).sort((a, b) => a.localeCompare(b));
        setSubjectOptions(uniqueSubjects);
      } catch {
        setSubjectOptions([]);
      }
    };

    fetchSubjects();
  }, []);

  const allSubjectOptions = useMemo(() => {
    const savedSubjects = savedEntries
      .map((e) => String(e?.subject || '').trim())
      .filter(Boolean);
    return Array.from(new Set([...subjectOptions, ...savedSubjects])).sort((a, b) => a.localeCompare(b));
  }, [subjectOptions, savedEntries]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!selectedClassId) {
      setError(content.notes_selectClassHint || 'Select one of your classes first.');
      return;
    }

    if (!entry.studentName.trim() || !entry.subject.trim() || !String(entry.grade).trim()) {
      setError(content.notes_validationError || 'Veuillez remplir nom, matière et note.');
      return;
    }

    const newEntry = {
      className: className.trim() || '—',
      studentName: entry.studentName.trim(),
      subject: entry.subject.trim(),
      grade: entry.grade,
      date: new Date().toLocaleDateString(
        language === 'ar' ? 'ar-EG' : language === 'en' ? 'en-GB' : 'fr-FR'
      ),
    };

    setSavedEntries((prev) => [newEntry, ...prev]);
    setEntry({ studentName: '', subject: '', grade: '' });
    setMessage(content.notes_saveSuccess || 'Note enregistrée avec succès.');
  };

  // Delete a saved entry
  const handleDelete = (index) => {
    setSavedEntries((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  // Start editing
  const handleEditStart = (index) => {
    setEditingIndex(index);
    setEditValues({ subject: savedEntries[index].subject, grade: savedEntries[index].grade });
  };

  // Save edit
  const handleEditSave = (index) => {
    if (!editValues.subject.trim() || !String(editValues.grade).trim()) return;
    setSavedEntries((prev) =>
      prev.map((e, i) =>
        i === index ? { ...e, subject: editValues.subject.trim(), grade: editValues.grade } : e
      )
    );
    setEditingIndex(null);
    setMessage(content.notes_saveSuccess || 'Note mise à jour avec succès.');
  };

  const handleEditCancel = () => setEditingIndex(null);

  return (
    <div
      style={{ maxWidth: 800, margin: '0 auto', width: '100%', display: 'grid', gap: 16 }}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <h2>{content.grades_title || 'Saisie des notes'}</h2>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      {/* New grade form – form-group style matching InscriptionForm */}
      <form
        onSubmit={handleSubmit}
        className="signup-form"
        style={{ maxWidth: '100%', width: '100%' }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 15 }}>{content.notes_newGrade || 'Nouvelle note'}</h3>

        {/* Class selector */}
        <div className="form-group">
          <label>{content.notes_class || 'Classe'}</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            disabled={classesLoading}
            required
          >
            <option value="">{content.notes_classPlaceholder || 'Sélectionnez une classe'}</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          <small style={{ color: '#555', display: 'block', marginTop: 4 }}>
            {selectedClassStudents.length > 0
              ? `${selectedClassStudents.length} ${content.students || 'students'} ${content.notes_loaded || 'loaded for this class.'}`
              : (selectedClassId ? (content.notes_noClassStudents || 'No students found for this class.') : (content.notes_selectClassHint || 'Select a class to display students.'))}
          </small>
        </div>

        {/* Student dropdown */}
        <div className="form-group">
          <label>{content.notes_studentName || 'Élève'}</label>
          <select
            value={entry.studentName}
            onChange={(e) => setEntry({ ...entry, studentName: e.target.value })}
            disabled={!selectedClassId}
            required
          >
            <option value="">{content.notes_studentPlaceholder || 'Sélectionnez un élève'}</option>
            {selectedClassStudents.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div className="form-group">
          <label>{content.notes_subject || 'Matière'}</label>
          {allSubjectOptions.length > 0 ? (
            <select
              value={entry.subject}
              onChange={(e) => setEntry({ ...entry, subject: e.target.value })}
              disabled={!selectedClassId}
            >
              <option value="">{content.notes_subject || 'Matière'}</option>
              {allSubjectOptions.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder={content.notes_subject || 'Matière'}
              value={entry.subject}
              disabled={!selectedClassId}
              onChange={(e) => setEntry({ ...entry, subject: e.target.value })}
            />
          )}
        </div>

        {/* Grade */}
        <div className="form-group">
          <label>{content.notes_grade || 'Note'}</label>
          <input
            type="number"
            placeholder={content.notes_grade || 'Note'}
            value={entry.grade}
            min={0}
            max={20}
            step={0.5}
            disabled={!selectedClassId}
            onChange={(e) => setEntry({ ...entry, grade: e.target.value })}
          />
        </div>

        <button type="submit" className="buttonStyle" disabled={!selectedClassId} style={{ width: '100%' }}>
          {content.notes_save || 'Enregistrer la note'}
        </button>
      </form>

      {/* Saved grades table with edit / delete */}
      {savedEntries.length > 0 && (
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
                  <th style={th}>{content.notes_actions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {savedEntries.map((e, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#f0f9ff' : '#fff' }}>
                    <td style={td}>{e.date}</td>
                    <td style={td}>{e.className}</td>
                    <td style={td}>{e.studentName}</td>

                    {/* Subject cell – editable */}
                    <td style={td}>
                      {editingIndex === i ? (
                        allSubjectOptions.length > 0 ? (
                          <select
                            value={editValues.subject}
                            onChange={(ev) => setEditValues({ ...editValues, subject: ev.target.value })}
                            className="form-select"
                          >
                            <option value="">{content.notes_subjectPlaceholder || 'Matière'}</option>
                            {allSubjectOptions.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={editValues.subject}
                            onChange={(ev) => setEditValues({ ...editValues, subject: ev.target.value })}
                          />
                        )
                      ) : e.subject}
                    </td>

                    {/* Grade cell – editable */}
                    <td style={td}>
                      {editingIndex === i ? (
                        <input
                          type="number"
                          value={editValues.grade}
                          min={0}
                          max={20}
                          step={0.5}
                          style={{ width: 70 }}
                          onChange={(ev) => setEditValues({ ...editValues, grade: ev.target.value })}
                        />
                      ) : (
                        <strong>{e.grade} / 20</strong>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      {editingIndex === i ? (
                        <>
                          <button
                            type="button"
                            className="buttonStyle"
                            style={{ marginInlineEnd: 6, padding: '4px 10px', fontSize: 13 }}
                            onClick={() => handleEditSave(i)}
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
                            onClick={handleEditCancel}
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, marginInlineEnd: 8 }}
                            title={content.notes_edit || 'Modifier'}
                            onClick={() => handleEditStart(i)}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
                            title={content.notes_removeRow || 'Supprimer'}
                            onClick={() => handleDelete(i)}
                          >
                            🗑️
                          </button>
                        </>
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
