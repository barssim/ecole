import React, { useEffect, useMemo, useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import { getTenantId } from '../tenant';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';
import { normalizeRoles } from '../utils/roles';
import '../cssFiles/Inscription.css';

const STORAGE_KEY = 'teacher_notes_entries';

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

  const [savedEntries, setSavedEntries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassStudents, setSelectedClassStudents] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedSavedEntryId, setSelectedSavedEntryId] = useState('');
  const [managedEntry, setManagedEntry] = useState({ subject: '', grade: '' });

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
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setSavedEntries(Array.isArray(stored) ? stored : []);
    } catch {
      setSavedEntries([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedEntries));
  }, [savedEntries]);

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
      setSelectedClassStudents([]);
      return;
    }

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
    // Reset selected note when class changes
    setSelectedSavedEntryId('');
    setManagedEntry({ subject: '', grade: '' });
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

  const savedEntriesForSelectedClass = useMemo(() => {
    if (!selectedClassId) return savedEntries;
    return savedEntries.filter((savedEntry) => String(savedEntry.classId) === String(selectedClassId));
  }, [savedEntries, selectedClassId]);

  const selectedSavedEntry = useMemo(
    () => savedEntries.find((savedEntry) => String(savedEntry.id) === String(selectedSavedEntryId)) || null,
    [savedEntries, selectedSavedEntryId]
  );

  useEffect(() => {
    if (!selectedSavedEntry) {
      setManagedEntry({ subject: '', grade: '' });
      return;
    }

    setManagedEntry({
      subject: selectedSavedEntry.subject || '',
      grade: selectedSavedEntry.grade || '',
    });
  }, [selectedSavedEntry]);

  useEffect(() => {
    if (!selectedSavedEntryId) return;

    const stillVisible = savedEntriesForSelectedClass.some(
      (savedEntry) => String(savedEntry.id) === String(selectedSavedEntryId)
    );

    if (!stillVisible) {
      setSelectedSavedEntryId('');
      setManagedEntry({ subject: '', grade: '' });
    }
  }, [savedEntriesForSelectedClass, selectedSavedEntryId]);

  const buildSavedEntryLabel = (savedEntry) => {
    const parts = [
      savedEntry.studentName,
      savedEntry.subject,
      `${savedEntry.grade} / 20`,
      savedEntry.date,
    ].filter(Boolean);

    return parts.join(' — ');
  };

  const handleUpdateSelectedEntry = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!selectedSavedEntry) {
      setError(content.notes_selectSavedHint || 'Select a registered note first.');
      return;
    }

    if (!managedEntry.subject.trim() || !String(managedEntry.grade).trim()) {
      setError(content.notes_validationError || 'Veuillez remplir nom, matière et note.');
      return;
    }

    setSavedEntries((prev) =>
      prev.map((savedEntry) =>
        String(savedEntry.id) === String(selectedSavedEntryId)
          ? { ...savedEntry, subject: managedEntry.subject.trim(), grade: managedEntry.grade }
          : savedEntry
      )
    );

    setMessage(content.notes_updateSuccess || 'Note mise à jour avec succès.');
  };

  const handleDeleteSelectedEntry = () => {
    if (!selectedSavedEntry) {
      setError(content.notes_selectSavedHint || 'Select a registered note first.');
      return;
    }

    setSavedEntries((prev) =>
      prev.filter((savedEntry) => String(savedEntry.id) !== String(selectedSavedEntryId))
    );
    setSelectedSavedEntryId('');
    setManagedEntry({ subject: '', grade: '' });
    setError('');
    setMessage(content.notes_deleteSuccess || 'Note supprimée avec succès.');
  };

  return (
    <div
      style={{ maxWidth: 800, margin: '0 auto', width: '100%', display: 'grid', gap: 16 }}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <h2>{content.grades_title || 'Saisie des notes'}</h2>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <form className="signup-form" style={{ maxWidth: '100%', width: '100%' }}>
        <h3 style={{ marginTop: 0, marginBottom: 15 }}>
          {content.notes_manageTitle || 'Manage registered note'}
        </h3>

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
              : (selectedClassId
                ? (content.notes_noClassStudents || 'No students found for this class.')
                : (content.notes_selectClassHint || 'Select a class to display students.'))}
          </small>
        </div>
      </form>

      <form
        onSubmit={handleUpdateSelectedEntry}
        className="signup-form"
        style={{ maxWidth: '100%', width: '100%' }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 15 }}>
          {content.notes_manageTitle || 'Manage registered note'}
        </h3>

        <div className="form-group">
          <label>{content.notes_savedTitle || 'Registered notes'}</label>
          <select
            value={selectedSavedEntryId}
            onChange={(e) => setSelectedSavedEntryId(e.target.value)}
            disabled={savedEntriesForSelectedClass.length === 0}
          >
            <option value="">
              {content.notes_selectSavedEntry || 'Select a registered note'}
            </option>
            {savedEntriesForSelectedClass.map((savedEntry) => (
              <option key={savedEntry.id} value={savedEntry.id}>
                {buildSavedEntryLabel(savedEntry)}
              </option>
            ))}
          </select>
          <small style={{ color: '#555', display: 'block', marginTop: 4 }}>
            {savedEntriesForSelectedClass.length > 0
              ? `${savedEntriesForSelectedClass.length} ${content.notes_savedTitle || 'registered notes'}`
              : (content.notes_noRegisteredNotes || 'No registered notes for the selected class.')}
          </small>
        </div>

        <div className="form-group">
          <label>{content.notes_studentName || 'Élève'}</label>
          <input value={selectedSavedEntry?.studentName || ''} disabled />
        </div>

        <div className="form-group">
          <label>{content.notes_class || 'Classe'}</label>
          <input value={selectedSavedEntry?.className || ''} disabled />
        </div>

        <div className="form-group">
          <label>Matiere</label>
          {allSubjectOptions.length > 0 ? (
            <select
              value={managedEntry.subject}
              onChange={(e) => setManagedEntry((prev) => ({ ...prev, subject: e.target.value }))}
              disabled={!selectedSavedEntry}
            >
              <option value="">Matiere</option>
              {allSubjectOptions.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Matiere"
              value={managedEntry.subject}
              disabled={!selectedSavedEntry}
              onChange={(e) => setManagedEntry((prev) => ({ ...prev, subject: e.target.value }))}
            />
          )}
        </div>

        <div className="form-group">
          <label>{content.notes_grade || 'Note'}</label>
          <input
            type="number"
            min={0}
            max={20}
            step={0.5}
            placeholder={content.notes_grade || 'Note'}
            value={managedEntry.grade}
            disabled={!selectedSavedEntry}
            onChange={(e) => setManagedEntry((prev) => ({ ...prev, grade: e.target.value }))}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="submit" className="signup-button" disabled={!selectedSavedEntry} style={{ flex: '1 1 220px' }}>
            {content.notes_update || 'Update note'}
          </button>
          <button
            type="button"
            className="signup-button"
            disabled={!selectedSavedEntry}
            onClick={handleDeleteSelectedEntry}
            style={{ flex: '1 1 220px', background: '#dc2626' }}
          >
            {content.notes_delete || 'Delete note'}
          </button>
        </div>
      </form>

      {/* Saved grades table with edit / delete */}
      {(selectedClassId ? savedEntriesForSelectedClass : savedEntries).length > 0 && (
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
                {(selectedClassId ? savedEntriesForSelectedClass : savedEntries).map((savedEntry, i) => (
                  <tr
                    key={savedEntry.id || i}
                    style={{
                      background: String(savedEntry.id) === String(selectedSavedEntryId)
                        ? '#bfdbfe'
                        : i % 2 === 0
                          ? '#f0f9ff'
                          : '#fff',
                    }}
                  >
                    <td style={td}>{savedEntry.date}</td>
                    <td style={td}>{savedEntry.className}</td>
                    <td style={td}>{savedEntry.studentName}</td>
                    <td style={td}>{savedEntry.subject}</td>
                    <td style={td}><strong>{savedEntry.grade} / 20</strong></td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        className="signup-button"
                        style={{ padding: '6px 12px', width: 'auto' }}
                        onClick={() => setSelectedSavedEntryId(savedEntry.id)}
                      >
                        {content.notes_selectSavedEntry || 'Select'}
                      </button>
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
