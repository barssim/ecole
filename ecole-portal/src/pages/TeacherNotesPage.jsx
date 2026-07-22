import React, { useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

/**
 * Teacher Notes/Grades page: teachers can enter and review student grades per class.
 */
const TeacherNotesPage = ({ language }) => {
  const content = language === 'fr' ? fr : language === 'en' ? en : ar;

  const [entries, setEntries] = useState([{ studentName: '', subject: '', grade: '' }]);
  const [savedEntries, setSavedEntries] = useState([]);
  const [className, setClassName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
        <div>
          <label>{content.notes_class || 'Classe'}</label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder={content.notes_classPlaceholder || 'Ex. 3e A'}
            style={{ width: '100%' }}
          />
        </div>

        <h3 style={{ margin: 0 }}>{content.notes_students || 'Élèves'}</h3>

        {entries.map((entry, index) => (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 1fr auto', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              placeholder={content.notes_studentName || 'Nom de l\'élève'}
              value={entry.studentName}
              onChange={(e) => handleEntryChange(index, 'studentName', e.target.value)}
            />
            <input
              type="text"
              placeholder={content.notes_subject || 'Matière'}
              value={entry.subject}
              onChange={(e) => handleEntryChange(index, 'subject', e.target.value)}
            />
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

