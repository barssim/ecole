import React, { useEffect, useState } from 'react';
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

const ClassesPage = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const [classes, setClasses] = useState([]);
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const baseUrl = (process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8085').replace(/\/$/, '');

  const toggleExpand = (id) => {
    setExpandedClassId(expandedClassId === id ? null : id);
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const url = `${baseUrl}/api/classes`;

        const response = await fetch(url);
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
  }, [baseUrl]);

  const handleEditClass = (cls) => {
    setEditingId(cls.id);
    setEditName(cls.name);
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async (cls) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setSubmitError(content.classes_createValidation);
      return;
    }
    if (trimmed === cls.name) {
      setEditingId(null);
      return;
    }

    setSavingId(cls.id);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const response = await fetch(`${baseUrl}/api/classes/${cls.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) {
        let message = content.classes_editError;
        try {
          const payload = await response.json();
          message = payload.message || message;
        } catch {
          if (response.status === 409) message = content.classes_createDuplicate;
        }
        throw new Error(message);
      }
      const updated = await response.json();
      setClasses((current) =>
        current
          .map((c) => (c.id === updated.id ? updated : c))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
      setSubmitSuccess(content.classes_editSuccess);
    } catch (error) {
      setSubmitError(error.message || content.classes_editError);
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteClass = async (cls) => {
    if (!window.confirm(`${content.classes_removeConfirm} "${cls.name}"?`)) return;

    setDeletingId(cls.id);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const response = await fetch(`${baseUrl}/api/classes/${cls.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      setClasses((current) => current.filter((c) => c.id !== cls.id));
      if (expandedClassId === cls.id) setExpandedClassId(null);
      setSubmitSuccess(`"${cls.name}" ${content.classes_removeSuccess}`);
    } catch (error) {
      setSubmitError(content.classes_removeError);
    } finally {
      setDeletingId(null);
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
      const response = await fetch(`${baseUrl}/api/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      setClasses((currentClasses) => [...currentClasses, createdClass].sort((a, b) => a.name.localeCompare(b.name)));
      setExpandedClassId(createdClass.id);
      setNewClassName('');
      setSubmitSuccess(content.classes_createSuccess);
    } catch (error) {
      setSubmitError(error.message || content.classes_createError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">🏫 {content.classes_title}</h2>

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
              onChange={(event) => setNewClassName(event.target.value)}
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

      {classes.map((cls) => (
        <div key={cls.id} className="bg-gray-100 rounded shadow p-4">
          <div className="flex justify-between items-center">
            {editingId === cls.id ? (
              <div className="flex items-center gap-2 flex-1 mr-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(cls);
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  className="border rounded px-2 py-1 text-sm flex-1"
                  autoFocus
                  disabled={savingId === cls.id}
                />
                <button
                  onClick={() => handleSaveEdit(cls)}
                  disabled={savingId === cls.id}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm disabled:opacity-60"
                >
                  {savingId === cls.id ? '...' : content.classes_editSave}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={savingId === cls.id}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
                >
                  {content.classes_editCancel}
                </button>
              </div>
            ) : (
              <span className="font-semibold text-lg">{cls.name}</span>
            )}
            <div className="space-x-2">
              <button
                onClick={() => toggleExpand(cls.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                {expandedClassId === cls.id
                  ? content.classes_hideStudents
                  : content.classes_showStudents}
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                {content.classes_addStudent}
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm disabled:opacity-60"
                onClick={() => handleEditClass(cls)}
                disabled={editingId !== null || deletingId === cls.id}
              >
                {content.classes_editClass}
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-60"
                onClick={() => handleDeleteClass(cls)}
                disabled={deletingId === cls.id || editingId === cls.id}
              >
                {deletingId === cls.id ? '...' : content.classes_removeClass}
              </button>
            </div>
          </div>

          {expandedClassId === cls.id && (
            <ul className="mt-3 ml-4 list-disc list-inside text-sm space-y-1">
              {cls.students.length > 0 ? (
                cls.students.map((student, index) => (
                  <li key={index}>{student}</li>
                ))
              ) : (
                <li className="italic text-gray-500">
                  {content.classes_noStudents}
                </li>
              )}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default ClassesPage;
