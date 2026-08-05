import React, { useEffect, useState } from 'react';
import { getTenantId } from '../tenant';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';

const ParentMeetingPage = () => {
  const configuredBase = resolveApiBaseUrl('http://localhost:8085');
  const useRelativeApi = process.env.REACT_APP_USE_RELATIVE_API === 'true';
  const baseUrl = useRelativeApi ? '' : configuredBase.replace(/\/$/, '');

  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  const headers = (json = false) => {
    const token = sessionStorage.getItem('jwt_token');
    return {
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      'X-Tenant-Id': getTenantId(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchMeetings = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/teacher/parent-meetings`, { headers: headers() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMeetings(Array.isArray(data) ? data : []);
    } catch {
      setMeetings([]);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !date || !location.trim()) {
      setError('Titre, date et lieu sont obligatoires.');
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/api/teacher/parent-meetings`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({
          title: title.trim(),
          date,
          location: location.trim(),
          details: details.trim(),
          createdBy: localStorage.getItem('userName') || 'teacher',
        }),
      });
      if (!res.ok) throw new Error();
      setTitle('');
      setDate('');
      setLocation('');
      setDetails('');
      await fetchMeetings();
    } catch {
      setError('Impossible d\'ajouter la réunion.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/api/teacher/parent-meetings/${id}`, {
        method: 'DELETE',
        headers: headers(),
      });
      if (!res.ok) throw new Error();
      await fetchMeetings();
    } catch {
      setError('Suppression impossible.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">👨‍👩‍👧 Réunions avec les parents</h2>
      {error && <div style={{ color: '#b91c1c' }}>{error}</div>}

      <form onSubmit={handleAdd} className="bg-gray-50 p-4 rounded shadow-sm space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" className="w-full p-2 border rounded" />
        <div className="flex gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 border rounded" />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lieu" className="flex-1 p-2 border rounded" />
        </div>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Détails" className="w-full p-2 border rounded" rows={3} />
        <button className="bg-blue-600 text-white px-3 py-1 rounded">Ajouter</button>
      </form>

      <ul className="space-y-4">
        {meetings.map((meeting) => (
          <li key={meeting.id} className="bg-gray-100 p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-medium">{meeting.title}</p>
              <p className="text-sm text-gray-600">📅 {meeting.meetingDate || meeting.date}</p>
              <p className="text-sm text-gray-600">📍 {meeting.location}</p>
              {meeting.details && <p className="text-sm text-gray-600">📝 {meeting.details}</p>}
            </div>
            <button onClick={() => handleDelete(meeting.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm">
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ParentMeetingPage;
