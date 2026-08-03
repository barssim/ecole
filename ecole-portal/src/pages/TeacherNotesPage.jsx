import React, { useEffect, useMemo, useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import { getTenantId } from '../tenant';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';
import { normalizeRoles } from '../utils/roles';

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

  const [entries, setEntries] = useState([{ studentName: '', subject: '', grade: '' }]);
  const [savedEntries, setSavedEntries] = useState([]);
  const [className, setClassName] = useState('');
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassStudents, setSelectedClassStudents] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  const studentNameSuggestions = useMemo(
    () => selectedClassStudents.filter(Boolean),
    [selectedClassStudents]
  );

  const allSubjectOptions = useMemo(() => {
    const savedSubjects = savedEntries
      .map((entry) => String(entry?.subject || '').trim())
      .filter(Boolean);
    return Array.from(new Set([...subjectOptions, ...savedSubjects])).sort((a, b) => a.localeCompare(b));
  }, [subjectOptions, savedEntries]);

  const handleEntryChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const addEntry = () => {
    setEntries([...entries, { studentName: '', subject: '', grade: '' }]);
  };

  const removeEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const valid = entries.filter(
      (e) => e.studentName.trim() && e.subject.trim() && String(e.grade).trim()
    );

    if (valid.length === 0) {
      setError(content.notes_validationError || 'Veuillez remplir au moins une ligne avec nom, matière et note.');
      return;
    }

    const newEntries = valid.map((e) => ({
      className: className.trim() || '—',
      studentName: e.studentName.trim(),
      subject: e.subject.trim(),
      grade: e.grade,
      date: new Date().toLocaleDateString(
        language === 'ar' ? 'ar-EG' : language === 'en' ? 'en-GB' : 'fr-FR'
      ),
    }));

    setSavedEntries((prev) => [...newEntries, ...prev]);
    setEntries([{ studentName: '', subject: '', grade: '' }]);
    setMessage(content.notes_saveSuccess || 'Notes enregistrées avec succès.');
  };

  return (
    <div
      style={{ maxWidth: 800, margin: '0 auto', width: '100%', display: 'grid', gap: 16 }}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <h2>{content.grades_title || 'Saisie des notes'}</h2>

      {error && <div style={{ color: '#b91c1c' }}>{error}</div>}
      {message && <div style={{ color: '#15803d' }}>{message}</div>}

      <form
        onSubmit={handleSubmit}
        style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'grid', gap: 14 }}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <label>{content.notes_class || 'Classe'}</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            style={{ width: '100%' }}
            className="form-select"
            disabled={classesLoading}
          >
            <option value="">{content.notes_classPlaceholder || 'Sélectionnez une classe'}</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          <small style={{ color: '#555' }}>
            {selectedClassStudents.length > 0
              ? `${selectedClassStudents.length} ${content.students || 'students'} ${content.notes_loaded || 'loaded for this class.'}`
              : (selectedClassId ? (content.notes_noClassStudents || 'No students found for this class.') : (content.notes_selectClassHint || 'Select a class to display students.'))}
          </small>
        </div>

        <h3 style={{ margin: 0 }}>{content.notes_students || 'Élèves'}</h3>

        {entries.map((entry, index) => (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 1fr auto', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              placeholder={content.notes_studentName || 'Nom de l\'élève'}
              value={entry.studentName}
              list="teacher-notes-students"
              onChange={(e) => handleEntryChange(index, 'studentName', e.target.value)}
            />
            {allSubjectOptions.length > 0 ? (
              <select
                value={entry.subject}
                onChange={(e) => handleEntryChange(index, 'subject', e.target.value)}
                className="form-select"
                title={content.notes_subject || 'Matière'}
              >
                <option value="">{content.notes_subjectPlaceholder || 'Sélectionnez une matière'}</option>
                {allSubjectOptions.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder={content.notes_subject || 'Matière'}
                value={entry.subject}
                onChange={(e) => handleEntryChange(index, 'subject', e.target.value)}
              />
            )}
            <input
              type="number"
              placeholder={content.notes_grade || 'Note'}
              value={entry.grade}
              min={0}
              max={20}
              step={0.5}
              onChange={(e) => handleEntryChange(index, 'grade', e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeEntry(index)}
              style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
              title={content.notes_removeRow || 'Supprimer'}
            >
              ✕
            </button>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="buttonStyle" onClick={addEntry}>
            {content.notes_addRow || '+ Ajouter un élève'}
          </button>
          <button type="submit" className="buttonStyle">
            {content.notes_save || 'Enregistrer les notes'}
          </button>
        </div>

        <datalist id="teacher-notes-students">
          {studentNameSuggestions.map((studentName) => (
            <option key={studentName} value={studentName} />
          ))}
        </datalist>
      </form>

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
                </tr>
              </thead>
              <tbody>
                {savedEntries.map((entry, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#f0f9ff' : '#fff' }}>
                    <td style={td}>{entry.date}</td>
                    <td style={td}>{entry.className}</td>
                    <td style={td}>{entry.studentName}</td>
                    <td style={td}>{entry.subject}</td>
                    <td style={td}><strong>{entry.grade} / 20</strong></td>
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

