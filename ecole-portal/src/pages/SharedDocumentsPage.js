import React, { useEffect, useState } from 'react';
import { getTenantId } from '../tenant';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';

const SharedDocumentsPage = () => {
  const configuredBase = resolveApiBaseUrl('http://localhost:8085');
  const useRelativeApi = process.env.REACT_APP_USE_RELATIVE_API === 'true';
  const baseUrl = useRelativeApi ? '' : configuredBase.replace(/\/$/, '');

  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('PDF');
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const headers = (json = false) => {
    const token = sessionStorage.getItem('jwt_token');
    return {
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      'X-Tenant-Id': getTenantId(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/teacher/shared-documents`, { headers: headers() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch {
      setDocuments([]);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!title.trim() || !link.trim()) {
      setError('Titre et lien sont obligatoires.');
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/api/teacher/shared-documents`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({
          title: title.trim(),
          type,
          link: link.trim(),
          uploadedBy: localStorage.getItem('userName') || 'teacher',
        }),
      });
      if (!res.ok) throw new Error();
      setTitle('');
      setType('PDF');
      setLink('');
      setMessage('Document ajouté.');
      await fetchDocuments();
    } catch {
      setError('Impossible d\'ajouter le document.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/api/teacher/shared-documents/${id}`, {
        method: 'DELETE',
        headers: headers(),
      });
      if (!res.ok) throw new Error();
      await fetchDocuments();
    } catch {
      setError('Suppression impossible.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">📁 Documents partagés</h2>

      {error && <div style={{ color: '#b91c1c' }}>{error}</div>}
      {message && <div style={{ color: '#15803d' }}>{message}</div>}

      <form onSubmit={handleAdd} className="bg-gray-50 p-4 rounded shadow-sm space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" className="w-full p-2 border rounded" />
        <div className="flex gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 border rounded">
            <option>PDF</option>
            <option>DOCX</option>
            <option>PPTX</option>
          </select>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Lien (https://...)" className="flex-1 p-2 border rounded" />
        </div>
        <button className="bg-blue-600 text-white px-3 py-1 rounded">Ajouter</button>
      </form>

      <ul className="space-y-4">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between bg-gray-100 p-4 rounded shadow-sm">
            <div>
              <p className="font-medium">{doc.title}</p>
              <p className="text-sm text-gray-500">📄 {doc.type}</p>
            </div>
            <div className="flex gap-2">
              <a href={doc.link} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm" target="_blank" rel="noreferrer">
                ⬇ Télécharger
              </a>
              <button onClick={() => handleDelete(doc.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SharedDocumentsPage;
