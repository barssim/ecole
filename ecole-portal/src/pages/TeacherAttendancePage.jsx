import React, { useEffect, useMemo, useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import { getTenantId } from '../tenant';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';
import '../cssFiles/TeacherPages.css';

const TeacherAttendancePage = ({ language }) => {
  const content = language === 'fr' ? fr : language === 'en' ? en : ar;
  const today = new Date().toISOString().split('T')[0];
  const historyDays = 7;

  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');

  const token = sessionStorage.getItem('jwt_token');
  const userId = localStorage.getItem('userId');
  const userRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');
  const rolesHeader = userRoles.join(',');
  const configuredBase = resolveApiBaseUrl('http://localhost:8085');
  const browserIsLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const localhostApiTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBase);
  const inferredRemoteBase = `${window.location.protocol}//${window.location.hostname}:8085`;
  const effectiveBase = localhostApiTarget && !browserIsLocal ? inferredRemoteBase : configuredBase;
  const useRelativeApi = process.env.REACT_APP_USE_RELATIVE_API === 'true';

  const apiUrlFor = (path) => (useRelativeApi ? `/api${path}` : `${effectiveBase}/api${path}`);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    'X-Tenant-Id': getTenantId(),
    'X-User-Roles': rolesHeader,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token, rolesHeader]);

  const isHtmlResponse = (response, bodyText = '') => {
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    return contentType.includes('text/html') || bodyText.trim().toLowerCase().startsWith('<!doctype html');
  };

  useEffect(() => {
    if (!userId) {
      setHistoryLoading(false);
      setError(content.teacher_attendance_missingUser || 'Utilisateur introuvable.');
      return;
    }

    fetchAttendanceHistory();
  }, [userId, language]);

  const fetchAttendanceHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await fetch(apiUrlFor(`/presence/professors/${userId}/history?days=${historyDays}&endDate=${today}`), {
        headers,
      });

      if (!response.ok) {
        throw new Error(content.teacher_attendance_loadError || 'Impossible de charger votre présence.');
      }

      if (isHtmlResponse(response)) {
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

  return (
    <div className="teacher-page" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="teacher-header">
        <div>
          <span className="teacher-title-badge">🕒 Présence</span>
          <h2 className="teacher-title">{content.teacher_attendance_title || 'Ma présence'}</h2>
          <p className="teacher-header-meta">{content.teacher_attendance_readonlyIntro || "Consultez votre présence. L'enregistrement est effectué par l'administration."}</p>
        </div>
      </div>

      {error && <div className="teacher-alert teacher-alert-error">{error}</div>}

      <div className="teacher-card">
        <h3>{content.teacher_attendance_historyTitle || `Mes présences (${historyDays} derniers jours)`}</h3>
        {historyLoading ? (
          <p className="teacher-loading">{content.presence_loading || 'Chargement...'}</p>
        ) : attendanceHistory.length === 0 ? (
          <div className="teacher-empty">{content.teacher_attendance_noHistory || `Aucune présence enregistrée durant les ${historyDays} derniers jours.`}</div>
        ) : (
          <div className="teacher-table-wrapper">
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>{content.payment_date || 'Date'}</th>
                  <th>{content.presence_status || 'Statut'}</th>
                  <th>{content.presence_scheduled || 'Heure prévue'}</th>
                  <th>{content.presence_checkin || 'Heure d’arrivée'}</th>
                  <th>{content.presence_notes || 'Notes'}</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((item, index) => (
                  <tr key={item.id || `${item.attendanceDate}-${index}`}>
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
    </div>
  );
};

const td = { padding: '8px 12px' };

export default TeacherAttendancePage;


