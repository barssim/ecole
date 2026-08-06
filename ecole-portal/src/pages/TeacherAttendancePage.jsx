import React, { useEffect, useMemo, useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import { getTenantId } from '../tenant';

const TeacherAttendancePage = ({ language }) => {
  const content = language === 'fr' ? fr : language === 'en' ? en : ar;
  const today = new Date().toISOString().split('T')[0];
  const historyDays = 7;

  const [form, setForm] = useState({
    attendanceDate: today,
    scheduledTime: '08:00',
    status: 'present',
    notes: '',
  });
  const [existingAttendance, setExistingAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = sessionStorage.getItem('jwt_token');
  const userId = localStorage.getItem('userId');
  const teacherName = localStorage.getItem('LoggedIn') || 'Teacher';
  const userRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');
  const rolesHeader = userRoles.join(',');
  const baseUrl = (process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8085').replace(/\/$/, '');

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    'X-Tenant-Id': getTenantId(),
    'X-User-Roles': rolesHeader,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token, rolesHeader]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setHistoryLoading(false);
      setError(content.teacher_attendance_missingUser || 'Utilisateur introuvable.');
      return;
    }

    fetchMyAttendance(today);
    fetchAttendanceHistory();
  }, [userId, language]);

  const fetchMyAttendance = async (date) => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await fetch(`${baseUrl}/api/presence/professors/${userId}?date=${date}`, {
        headers,
      });

      if (response.status === 404) {
        setExistingAttendance(null);
        return;
      }

      if (!response.ok) {
        throw new Error(content.teacher_attendance_loadError || 'Impossible de charger votre présence.');
      }

      const data = await response.json();
      setExistingAttendance(data);
      setForm((current) => ({
        ...current,
        scheduledTime: data.scheduledTime || current.scheduledTime,
        status: data.status || current.status,
        notes: data.notes || '',
      }));
    } catch (err) {
      setError(err.message || content.teacher_attendance_loadError || 'Impossible de charger votre présence.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await fetch(`${baseUrl}/api/presence/professors/${userId}/history?days=${historyDays}&endDate=${today}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(content.teacher_attendance_loadError || 'Impossible de charger votre présence.');
      }

      const data = await response.json();
      setAttendanceHistory(Array.isArray(data) ? data : []);
    } catch {
      setAttendanceHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const response = await fetch(`${baseUrl}/api/presence/professors`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          teacherId: Number(userId),
          teacherName,
          attendanceDate: today,
          scheduledTime: form.scheduledTime,
          status: form.status,
          notes: form.notes,
        }),
      });

      if (!response.ok) {
        const backendMessage = await response.text();
        throw new Error(backendMessage || content.teacher_attendance_saveError || 'Impossible d\'enregistrer la présence.');
      }

      const data = await response.json();
      setExistingAttendance(data);
      await fetchMyAttendance(today);
      await fetchAttendanceHistory();
      setMessage(content.teacher_attendance_saveSuccess || 'Présence enregistrée avec succès.');
    } catch (err) {
      setError(err.message || content.teacher_attendance_saveError || 'Impossible d\'enregistrer la présence.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', width: '100%', display: 'grid', gap: 16 }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <h2>{content.teacher_attendance_title || 'Ma présence'}</h2>
      <p>{content.teacher_attendance_intro || 'Renseignez votre présence pour la journée.'}</p>

      {error && <div style={{ color: '#b91c1c' }}>{error}</div>}
      {message && <div style={{ color: '#15803d' }}>{message}</div>}

      <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginTop: 0 }}>{content.teacher_attendance_historyTitle || `Mes présences (${historyDays} derniers jours)`}</h3>
        {historyLoading ? (
          <p>{content.presence_loading || 'Chargement...'}</p>
        ) : attendanceHistory.length === 0 ? (
          <p>{content.teacher_attendance_noHistory || `Aucune présence enregistrée durant les ${historyDays} derniers jours.`}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#dbeafe' }}>
                  <th style={th}>{content.payment_date || 'Date'}</th>
                  <th style={th}>{content.presence_status || 'Statut'}</th>
                  <th style={th}>{content.presence_scheduled || 'Heure prévue'}</th>
                  <th style={th}>{content.presence_checkin || 'Heure d’arrivée'}</th>
                  <th style={th}>{content.presence_notes || 'Notes'}</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((item, index) => (
                  <tr key={item.id || `${item.attendanceDate}-${index}`} style={{ background: index % 2 === 0 ? '#f8fafc' : '#fff' }}>
                    <td style={td}>{item.attendanceDate || '-'}</td>
                    <td style={td}>{content[`presence_status_${item.status}`] || item.status || '-'}</td>
                    <td style={td}>{item.scheduledTime || '-'}</td>
                    <td style={td}>{item.checkInTime || '-'}</td>
                    <td style={td}>{item.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <div>
          <label>{content.payment_date || 'Date'}</label>
          <input
            type="date"
            value={today}
            style={{ width: '100%' }}
            disabled
            readOnly
          />
        </div>

        <div>
          <label>{content.presence_scheduled || 'Heure prévue'}</label>
          <input
            type="time"
            value={form.scheduledTime}
            onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
            style={{ width: '100%' }}
            required
          />
        </div>

        <div>
          <label>{content.presence_status || 'Statut'}</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
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
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={4}
            style={{ width: '100%' }}
            placeholder={content.teacher_attendance_notesPlaceholder || 'Ajoutez un commentaire si nécessaire'}
          />
        </div>

        <button className="buttonStyle" type="submit" disabled={saving || loading}>
          {saving ? (content.loading || 'Chargement...') : (content.teacher_attendance_submit || 'Enregistrer ma présence')}
        </button>
      </form>

      {loading ? (
        <p>{content.presence_loading || 'Chargement...'}</p>
      ) : existingAttendance ? (
        <div style={{ background: '#eff6ff', padding: 16, borderRadius: 12 }}>
          <h3>{content.teacher_attendance_todayStatus || 'Statut enregistré'}</h3>
          <p><strong>{content.presence_status || 'Statut'}:</strong> {content[`presence_status_${existingAttendance.status}`] || existingAttendance.status}</p>
          <p><strong>{content.presence_checkin || 'Heure d’arrivée'}:</strong> {existingAttendance.checkInTime || '-'}</p>
          <p><strong>{content.presence_notes || 'Notes'}:</strong> {existingAttendance.notes || '-'}</p>
        </div>
      ) : (
        <p>{content.teacher_attendance_noEntry || 'Aucune présence enregistrée pour cette date.'}</p>
      )}

    </div>
  );
};

const th = { padding: '8px 12px', textAlign: 'left', fontWeight: 600 };
const td = { padding: '8px 12px' };

export default TeacherAttendancePage;


