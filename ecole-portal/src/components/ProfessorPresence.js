import React, { useEffect, useState } from "react";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";
import { getSchoolId } from "../school";
import { createApiUrlFor, readJsonResponse } from "../utils/apiClient";
import { getLocalizedUserName, localizeStoredUserName } from "../utils/localizedUserName";

const ProfessorPresence = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const today = new Date().toISOString().split("T")[0];

  const [presenceList, setPresenceList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [form, setForm] = useState({
    teacherName: '',
    attendanceDate: today,
    scheduledTime: '08:00',
    status: 'present',
    notes: '',
  });

  const apiUrlFor = createApiUrlFor('http://localhost:8085');
  const token = sessionStorage.getItem('jwt_token');
  const userRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');
  const rolesHeader = userRoles.join(',');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchTeachers = async () => {
      setTeachersLoading(true);
      try {
        const response = await fetch(apiUrlFor('/users/teachers'), {
          headers: {
            'X-School-Id': getSchoolId(),
            'X-User-Roles': rolesHeader,
          },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setTeachers(Array.isArray(data) ? data : []);
      } catch {
        setTeachers([]);
      } finally {
        setTeachersLoading(false);
      }
    };
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchPresence = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(apiUrlFor(`/presence/professors?date=${selectedDate}`), {
          headers: {
            'Content-Type': 'application/json',
              'X-School-Id': getSchoolId(),
            'X-User-Roles': rolesHeader,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await readJsonResponse(response, content.presence_error || 'Failed to fetch attendance');
        setPresenceList(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        setError(fetchError.message || content.presence_error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresence();
  }, [selectedDate, token, rolesHeader, content.presence_error, refreshKey]);

  const handleAddAttendance = async (event) => {
    event.preventDefault();
    setSaveError('');
    setSaveSuccess('');

    if (!form.teacherName) {
      setSaveError(content.presence_teacherRequired || 'Veuillez sélectionner un enseignant.');
      return;
    }

    const selectedTeacher = teachers.find((t) => t.name === form.teacherName);

    try {
      setSaving(true);
      const response = await fetch(apiUrlFor('/presence/professors'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-School-Id': getSchoolId(),
          'X-User-Roles': rolesHeader,
        },
        body: JSON.stringify({
          teacherId: selectedTeacher?.id ? Number(selectedTeacher.id) : undefined,
          teacherName: form.teacherName,
          attendanceDate: form.attendanceDate,
          scheduledTime: form.scheduledTime,
          status: form.status,
          notes: form.notes,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      setForm({ teacherName: '', attendanceDate: selectedDate, scheduledTime: '08:00', status: 'present', notes: '' });
      setShowAddForm(false);
      setSaveSuccess(content.presence_addSuccess || 'Présence enregistrée avec succès.');
      setRefreshKey((k) => k + 1);
    } catch {
      setSaveError(content.presence_addError || "Impossible d'enregistrer la présence.");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = presenceList.filter((item) => item.status === 'present').length;
  const lateCount = presenceList.filter((item) => item.status === 'late').length;
  const absentCount = presenceList.filter((item) => item.status === 'absent').length;

  return (
    	<div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px",
                                        maxWidth: "800px",
                                        margin: "0 auto",
                                        width: "100%"
                                      }}
                                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                                    >
      <h2 className="text-2xl font-bold mb-4 text-blue-800">
        {content.presence_title} – {selectedDate}
      </h2>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <button
          type="button"
          onClick={() => { setShowAddForm((prev) => !prev); setSaveError(''); setSaveSuccess(''); }}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {showAddForm ? (content.presence_cancel || 'Annuler') : `+ ${content.presence_addAttendance || 'Ajouter une présence'}`}
        </button>
      </div>

      {saveError && <div style={{ color: '#dc2626', background: '#fde8e8', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 12px' }}>{saveError}</div>}
      {saveSuccess && <div style={{ color: '#065f46', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, padding: '8px 12px' }}>{saveSuccess}</div>}

      {showAddForm && (
        <form
          onSubmit={handleAddAttendance}
          style={{ display: 'grid', gap: 12, background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}
        >
          <div>
            <label>{content.presence_name || 'Enseignant'}</label>
            <select
              value={form.teacherName}
              onChange={(e) => setForm((prev) => ({ ...prev, teacherName: e.target.value }))}
              style={{ width: '100%' }}
              disabled={teachersLoading}
              required
            >
              <option value="">{teachersLoading ? '…' : (content.classes_selectTeacherPlaceholder || 'Sélectionner un enseignant')}</option>
              {teachers.map((t) => (
                <option key={t.id || t.name} value={t.name}>{getLocalizedUserName(t, language)}</option>
              ))}
            </select>
          </div>

          <div>
            <label>{content.payment_date || 'Date'}</label>
            <input
              type="date"
              value={form.attendanceDate}
              onChange={(e) => setForm((prev) => ({ ...prev, attendanceDate: e.target.value }))}
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label>{content.presence_scheduled || 'Heure prévue'}</label>
            <input
              type="time"
              value={form.scheduledTime}
              onChange={(e) => setForm((prev) => ({ ...prev, scheduledTime: e.target.value }))}
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label>{content.presence_status || 'Statut'}</label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              style={{ width: '100%' }}
            >
              <option value="present">{content.presence_status_present || 'Présent'}</option>
              <option value="late">{content.presence_status_late || 'En retard'}</option>
              <option value="absent">{content.presence_status_absent || 'Absent'}</option>
            </select>
          </div>

          <div>
            <label>{content.presence_notes || 'Notes'}</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {saving ? (content.loading || 'Enregistrement...') : (content.presence_save || 'Enregistrer')}
          </button>
        </form>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{content.payment_date || 'Date'}</span>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#ecfdf5', padding: 14, borderRadius: 10 }}>
          <strong>{content.presence_status_present}</strong>
          <div>{presentCount}</div>
        </div>
        <div style={{ background: '#fef9c3', padding: 14, borderRadius: 10 }}>
          <strong>{content.presence_status_late}</strong>
          <div>{lateCount}</div>
        </div>
        <div style={{ background: '#fee2e2', padding: 14, borderRadius: 10 }}>
          <strong>{content.presence_status_absent}</strong>
          <div>{absentCount}</div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">{content.presence_loading}</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : presenceList.length === 0 ? (
        <p className="text-gray-500">{content.presence_empty}</p>
      ) : (
       <div className="presence-table-wrapper">
       <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
         <thead style={{ background: 'rgb(219, 234, 254)', color: '#1e3a8a' }}>
           <tr>
             <th style={th}>{content.presence_name}</th>
             <th style={th}>{content.payment_date || 'Date'}</th>
             <th style={th}>{content.presence_scheduled}</th>
             <th style={th}>{content.presence_checkin}</th>
             <th style={th}>{content.presence_status}</th>
             <th style={th}>{content.presence_notes || 'Notes'}</th>
           </tr>
         </thead>
         <tbody>
           {presenceList.map((prof, index) => (
             <tr
               key={index}
                style={{ background: index % 2 === 0 ? '#f0f9ff' : '#fff' }}
             >
                <td style={td}>{localizeStoredUserName(prof.teacherName, teachers, language)}</td>
                <td style={td}>{prof.attendanceDate}</td>
                <td style={td}>{prof.scheduledTime}</td>
                <td style={td}>
                 {prof.checkInTime ? prof.checkInTime : (
                   <span className="text-gray-400" title="Non renseigné">–</span>
                 )}
               </td>
                <td style={td}>
                 <span className="inline-flex items-center gap-1 font-semibold">
                    {prof.status === "present" && (
                     <>
                       <span className="w-2 h-2 bg-green-500 rounded-full" />
                       <span className="text-green-600">{content.presence_status_present}</span>
                     </>
                   )}
                    {prof.status === "late" && (
                     <>
                       <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                       <span className="text-yellow-600">{content.presence_status_late}</span>
                     </>
                   )}
                    {prof.status === "absent" && (
                     <>
                       <span className="w-2 h-2 bg-red-500 rounded-full" />
                       <span className="text-red-600">{content.presence_status_absent}</span>
                     </>
                   )}
                 </span>
               </td>
                <td style={td}>{prof.notes || '—'}</td>
             </tr>
           ))}
         </tbody>
       </table>
       </div>

      )}
    </div>
  );
};

const th = { padding: '8px 12px', textAlign: 'left', fontWeight: 600 };
const td = { padding: '8px 12px' };

export default ProfessorPresence;
