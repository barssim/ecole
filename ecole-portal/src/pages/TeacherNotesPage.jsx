import React, { useEffect, useMemo, useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import { getTenantId } from '../tenant';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';
import { normalizeRoles } from '../utils/roles';
import '../cssFiles/Inscription.css';

const TeacherNotesPage = ({ language }) => {
  const content = language === 'fr' ? fr : language === 'en' ? en : ar;
  const userRoles = normalizeRoles(JSON.parse(localStorage.getItem('user_roles') || '[]'));
  const currentUserName = (localStorage.getItem('LoggedIn') || '').trim().toLowerCase();
  const currentUserId = localStorage.getItem('userId') || '';
  const isTeacherOnly = userRoles.length > 0 && userRoles.every((r) => r === 'teacher' || r === 'role_teacher');

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
  const [newEntry, setNewEntry] = useState({ studentName: '', subject: '', grade: '' });
  const [selectedSavedEntryId, setSelectedSavedEntryId] = useState('');
  const [managedEntry, setManagedEntry] = useState({ subject: '', grade: '' });

  const apiUrlFor = (path) => (useRelativeApi ? `/api${path}` : `${effectiveBase}/api${path}`);

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

  const selectedClass = classes.find((cls) => String(cls.id) === String(selectedClassId));

  const refreshNotes = async () => {
    if (!currentUserId) {
      setSavedEntries([]);
      return;
    }
    try {
      const query = new URLSearchParams({ teacherId: currentUserId });
      if (selectedClassId) query.set('classId', selectedClassId);
      const response = await fetch(apiUrlFor(`/teacher/notes?${query.toString()}`), {
        headers: buildHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setSavedEntries(Array.isArray(data) ? data : []);
    } catch {
      setSavedEntries([]);
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      if (!currentUserName) {
        setClasses([]);
        setSelectedClassId('');
        setClassesLoading(false);
        return;
      }
      try {
        const query = `?teacherName=${encodeURIComponent(currentUserName)}`;
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

  useEffect(() => {
    refreshNotes();
  }, [currentUserId, selectedClassId]);

  useEffect(() => {
    const cls = classes.find((c) => String(c.id) === String(selectedClassId));
    if (!cls) {
      setSelectedClassStudents([]);
      setNewEntry((prev) => ({ ...prev, studentName: '' }));
      return;
    }

    const fallbackStudents = Array.isArray(cls.students)
      ? cls.students.map(extractStudentName).filter(Boolean)
      : [];
    setSelectedClassStudents(fallbackStudents);

    const fetchClassStudents = async () => {
      try {
        const query = currentUserName ? `?teacherName=${encodeURIComponent(currentUserName)}` : '';
        const response = await fetch(apiUrlFor(`/teacher/classes/${cls.id}/students${query}`), { headers: buildHeaders() });
        if (!response.ok) return;
        const data = await response.json();
        const students = Array.isArray(data) ? data.map(extractStudentName).filter(Boolean) : [];
        if (students.length > 0) {
          setSelectedClassStudents(students);
        }
      } catch {
        // keep fallback
      }
    };

    fetchClassStudents();
    setNewEntry((prev) => ({ ...prev, studentName: '' }));
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
          ? data.map((exam) => String(exam?.subject || '').trim()).filter(Boolean)
          : [];
        setSubjectOptions(Array.from(new Set(subjects)).sort((a, b) => a.localeCompare(b)));
      } catch {
        setSubjectOptions([]);
      }
    };

    fetchSubjects();
  }, []);

  const allSubjectOptions = useMemo(() => {
    const savedSubjects = savedEntries.map((e) => String(e?.subject || '').trim()).filter(Boolean);
    return Array.from(new Set([...subjectOptions, ...savedSubjects])).sort((a, b) => a.localeCompare(b));
  }, [savedEntries, subjectOptions]);

  const selectedSavedEntry = useMemo(
    () => savedEntries.find((entry) => String(entry.id) === String(selectedSavedEntryId)) || null,
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

  const clearFeedback = () => {
    setError('');
    setMessage('');
  };

  const handleAddEntry = async (event) => {
    event.preventDefault();
    clearFeedback();

    if (!selectedClassId || !newEntry.studentName || !newEntry.subject.trim() || !String(newEntry.grade).trim()) {
      setError(content.notes_validationError || 'Veuillez sélectionner une classe, un élève, une matière et une note.');
      return;
    }

    const gradeNum = parseFloat(newEntry.grade);
    if (Number.isNaN(gradeNum) || gradeNum < 0 || gradeNum > 20) {
      setError('La note doit être entre 0 et 20.');
      return;
    }

    try {
      const payload = {
        teacherId: currentUserId,
        teacherName: currentUserName,
        classId: String(selectedClassId),
        className: selectedClass?.name || '',
        studentName: newEntry.studentName,
        subject: newEntry.subject.trim(),
        grade: String(newEntry.grade),
        date: new Date().toISOString().split('T')[0],
      };

      const response = await fetch(apiUrlFor('/teacher/notes'), {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await refreshNotes();
      setNewEntry({ studentName: '', subject: '', grade: '' });
      setMessage(content.notes_saveSuccess || 'Note enregistrée avec succès.');
    } catch {
      setError(content.notes_saveError || 'Impossible d\'enregistrer la note.');
    }
  };

  const handleUpdateEntry = async (event) => {
    event.preventDefault();
    clearFeedback();

    if (!selectedSavedEntry) {
      setError(content.notes_selectSavedHint || 'Sélectionnez une note.');
      return;
    }
    if (!managedEntry.subject.trim() || !String(managedEntry.grade).trim()) {
      setError(content.notes_validationError || 'Matière et note obligatoires.');
      return;
    }

    try {
      const payload = {
        teacherId: currentUserId,
        teacherName: currentUserName,
        classId: String(selectedSavedEntry.classId || selectedClassId),
        className: selectedSavedEntry.className || selectedClass?.name || '',
        studentName: selectedSavedEntry.studentName,
        subject: managedEntry.subject.trim(),
        grade: String(managedEntry.grade),
        date: selectedSavedEntry.date,
      };

      const response = await fetch(apiUrlFor(`/teacher/notes/${selectedSavedEntry.id}`), {
        method: 'PUT',
        headers: buildHeaders(true),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await refreshNotes();
      setMessage(content.notes_updateSuccess || 'Note mise à jour avec succès.');
    } catch {
      setError(content.notes_updateError || 'Impossible de mettre à jour la note.');
    }
  };

  const handleDeleteEntry = async () => {
    clearFeedback();
    if (!selectedSavedEntry) {
      setError(content.notes_selectSavedHint || 'Sélectionnez une note.');
      return;
    }

    try {
      const response = await fetch(apiUrlFor(`/teacher/notes/${selectedSavedEntry.id}`), {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      setSelectedSavedEntryId('');
      setManagedEntry({ subject: '', grade: '' });
      await refreshNotes();
      setMessage(content.notes_deleteSuccess || 'Note supprimée avec succès.');
    } catch {
      setError(content.notes_deleteError || 'Impossible de supprimer la note.');
    }
  };

  const selectForEdit = (id) => {
    setSelectedSavedEntryId(String(id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const entryLabel = (entry) => [entry.studentName, entry.subject, `${entry.grade}/20`, entry.date].filter(Boolean).join(' — ');

  const SubjectSelect = ({ value, onChange, disabled, required }) => (
    allSubjectOptions.length > 0
      ? (
        <select value={value} onChange={onChange} disabled={disabled} required={required}>
          <option value="">{'— ' + (content.notes_subjectPlaceholder || 'Sélectionnez une matière') + ' —'}</option>
          {allSubjectOptions.map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      )
      : (
        <input
          type="text"
          placeholder={content.notes_subject || 'Matière'}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
        />
      )
  );

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', width: '100%', display: 'grid', gap: 20 }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <h2>{content.grades_title || 'Saisie des notes'}</h2>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <form onSubmit={handleAddEntry} className="signup-form" style={{ maxWidth: '100%', width: '100%' }}>
        <h3 style={{ marginTop: 0, marginBottom: 15 }}>{content.notes_addTitle || 'Ajouter une note'}</h3>

        <div className="form-group">
          <label>{content.notes_class || 'Classe'}</label>
          <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} disabled={classesLoading} required>
            <option value="">{classesLoading ? '…' : (content.notes_classPlaceholder || 'Sélectionnez une classe')}</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          {selectedClassId && (
            <small style={{ color: '#555', display: 'block', marginTop: 4 }}>
              {selectedClassStudents.length > 0
                ? `${selectedClassStudents.length} ${content.notes_students || 'élève(s)'} chargé(s).`
                : (content.notes_noClassStudents || 'Aucun élève trouvé pour cette classe.')}
            </small>
          )}
        </div>

        <div className="form-group">
          <label>{content.notes_studentName || 'Élève'}</label>
          <select
            value={newEntry.studentName}
            onChange={(e) => setNewEntry((p) => ({ ...p, studentName: e.target.value }))}
            required
            disabled={!selectedClassId || selectedClassStudents.length === 0}
          >
            <option value="">
              {'— ' + (selectedClassStudents.length > 0
                ? (content.notes_studentSelect || 'Sélectionnez un élève')
                : (content.notes_noClassStudents || 'Aucun élève trouvé pour cette classe.')) + ' —'}
            </option>
            {selectedClassStudents.map((student) => (
              <option key={student} value={student}>{student}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>{content.notes_subject || 'Matière'}</label>
          <SubjectSelect value={newEntry.subject} onChange={(e) => setNewEntry((p) => ({ ...p, subject: e.target.value }))} disabled={!selectedClassId} required />
        </div>

        <div className="form-group">
          <label>{content.notes_grade || 'Note'} <small style={{ color: '#888', fontWeight: 400 }}>(0 – 20)</small></label>
          <input type="number" min={0} max={20} step={0.5} placeholder="0 – 20" value={newEntry.grade}
            onChange={(e) => setNewEntry((p) => ({ ...p, grade: e.target.value }))} required disabled={!selectedClassId} />
        </div>

        <button
          type="submit"
          className="signup-button"
          disabled={!selectedClassId || selectedClassStudents.length === 0}
        >
          {content.notes_save || 'Enregistrer la note'}
        </button>
      </form>

      {savedEntries.length > 0 && (
        <form onSubmit={handleUpdateEntry} className="signup-form" style={{ maxWidth: '100%', width: '100%' }}>
          <h3 style={{ marginTop: 0, marginBottom: 15 }}>{content.notes_manageTitle || 'Modifier / Supprimer une note'}</h3>

          <div className="form-group">
            <label>{content.notes_savedTitle || 'Notes enregistrées'}</label>
            <select value={selectedSavedEntryId} onChange={(e) => setSelectedSavedEntryId(e.target.value)}>
              <option value="">{'— ' + (content.notes_selectSavedEntry || 'Sélectionnez une note à modifier') + ' —'}</option>
              {savedEntries.map((entry) => (
                <option key={entry.id} value={entry.id}>{entryLabel(entry)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{content.notes_studentName || 'Élève'}</label>
            <input value={selectedSavedEntry?.studentName || ''} disabled readOnly />
          </div>

          <div className="form-group">
            <label>{content.notes_class || 'Classe'}</label>
            <input value={selectedSavedEntry?.className || ''} disabled readOnly />
          </div>

          <div className="form-group">
            <label>{content.notes_subject || 'Matière'}</label>
            <SubjectSelect value={managedEntry.subject} onChange={(e) => setManagedEntry((p) => ({ ...p, subject: e.target.value }))} disabled={!selectedSavedEntry} required={false} />
          </div>

          <div className="form-group">
            <label>{content.notes_grade || 'Note'} <small style={{ color: '#888', fontWeight: 400 }}>(0 – 20)</small></label>
            <input type="number" min={0} max={20} step={0.5} placeholder="0 – 20" value={managedEntry.grade}
              disabled={!selectedSavedEntry} onChange={(e) => setManagedEntry((p) => ({ ...p, grade: e.target.value }))} />
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="submit" className="signup-button" disabled={!selectedSavedEntry} style={{ flex: '1 1 200px' }}>
              {content.notes_update || 'Mettre à jour'}
            </button>
            <button type="button" className="signup-button" disabled={!selectedSavedEntry} onClick={handleDeleteEntry}
              style={{ flex: '1 1 200px', background: '#dc2626' }}>
              {content.notes_delete || 'Supprimer'}
            </button>
          </div>
        </form>
      )}

      {savedEntries.length > 0 && (
        <div>
          <h3>{content.notes_savedTitle || 'Notes enregistrées'}{selectedClass ? ` — ${selectedClass.name}` : ''}</h3>
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
                {savedEntries.map((entry, i) => (
                  <tr key={entry.id || i} style={{ background: String(entry.id) === String(selectedSavedEntryId) ? '#bfdbfe' : i % 2 === 0 ? '#f0f9ff' : '#fff' }}>
                    <td style={td}>{entry.date}</td>
                    <td style={td}>{entry.className}</td>
                    <td style={td}>{entry.studentName}</td>
                    <td style={td}>{entry.subject}</td>
                    <td style={td}><strong>{entry.grade} / 20</strong></td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <button type="button" className="signup-button" style={{ padding: '6px 14px', width: 'auto' }} onClick={() => selectForEdit(entry.id)}>
                        {content.notes_edit || 'Modifier'}
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
