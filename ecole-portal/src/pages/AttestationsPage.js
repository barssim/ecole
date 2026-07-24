import React, { useEffect, useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import { getTenantId } from '../tenant';

const ATTESTATION_TYPES = [
  { value: 'enrollment',   labelKey: 'attestation_typeEnrollment' },
  { value: 'attendance',   labelKey: 'attestation_typeAttendance' },
  { value: 'conduct',      labelKey: 'attestation_typeConduct' },
  { value: 'academic',     labelKey: 'attestation_typeAcademic' },
  { value: 'registration', labelKey: 'attestation_typeRegistration' },
];

const STATUS_COLORS = {
  approved: 'bg-green-100 text-green-700',
  pending:  'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

const AttestationsPage = ({ language }) => {
  const content =
    language === 'fr' ? fr :
    language === 'en' ? en :
    ar;

  const [attestations, setAttestations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestType, setRequestType] = useState('enrollment');
  const [requestReason, setRequestReason] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState(null); // { type: 'success'|'error', text }

  const userId    = localStorage.getItem('userId');
  const username  = localStorage.getItem('LoggedIn') || '';
  const token     = sessionStorage.getItem('jwt_token');
  const userRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');
  const normalizedRoles = userRoles.map((role) => String(role).toLowerCase());
  const canManageAttestations = normalizedRoles.includes('admin') || normalizedRoles.includes('manager');
  const canRequestAttestation = !canManageAttestations;

  const baseUrl = (process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8085').replace(/\/$/, '');
  const rolesHeaderValue = normalizedRoles.join(',');

  const buildHeaders = (includeJson = false) => {
    const headers = {
      'X-Tenant-Id': getTenantId(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(rolesHeaderValue ? { 'X-User-Roles': rolesHeaderValue } : {}),
    };
    if (includeJson) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  };

  const fetchAttestations = async () => {
    try {
      const query = !canManageAttestations && userId ? `?userId=${encodeURIComponent(userId)}` : '';
      const response = await fetch(
        `${baseUrl}/api/attestations${query}`,
        {
          headers: buildHeaders(),
        }
      );
      const data = await response.json();
      setAttestations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch attestations:', error);
    }
  };

  useEffect(() => { fetchAttestations(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRequest = async (e) => {
    e.preventDefault();
    setRequesting(true);
    setRequestMessage(null);
    try {
      const response = await fetch(
        `${baseUrl}/api/attestations/request`,
        {
          method: 'POST',
          headers: buildHeaders(true),
          body: JSON.stringify({
            userId: userId ? parseInt(userId) : null,
            studentName: username,
            type: requestType,
            reason: requestReason,
          }),
        }
      );

      if (response.status === 201) {
        setRequestMessage({ type: 'success', text: content.attestation_requestSuccess });
        setShowRequestForm(false);
        setRequestReason('');
        setRequestType('enrollment');
        await fetchAttestations();  // refresh list
      } else if (response.status === 403) {
        setRequestMessage({ type: 'error', text: content.attestation_requestForbidden });
      } else if (response.status === 409) {
        setRequestMessage({ type: 'error', text: content.attestation_requestDuplicate });
      } else {
        setRequestMessage({ type: 'error', text: content.attestation_requestError });
      }
    } catch {
      setRequestMessage({ type: 'error', text: content.attestation_requestError });
    } finally {
      setRequesting(false);
    }
  };

  const handleView = (id) => {
    fetch(`${baseUrl}/api/attestations/${id}/view`, { headers: buildHeaders() })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      })
      .catch((error) => {
        console.error('Failed to open attestation view:', error);
      });
  };

   const handleStatusUpdate = async (attestationId, status) => {
     setRequestMessage(null);
     try {
       const response = await fetch(`${baseUrl}/api/attestations/${attestationId}/status`, {
         method: 'PATCH',
          headers: buildHeaders(true),
         body: JSON.stringify({ status }),
       });

       if (!response.ok) {
         throw new Error(`HTTP ${response.status}`);
       }

       const updated = await response.json();
       setAttestations((current) =>
         current.map((item) => (item.id === updated.id ? updated : item))
       );
       setRequestMessage({ type: 'success', text: content.attestation_manageSuccess });
     } catch {
       setRequestMessage({ type: 'error', text: content.attestation_manageError });
     }
   };

   const handleDownload = (id) => {
        fetch(`${baseUrl}/api/attestations/${id}/download`, { headers: buildHeaders() })
          .then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.blob();
          })
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `attestation-${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
          })
          .catch((error) => {
            console.error('Failed to download attestation:', error);
          });
   };

  const filtered = attestations.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{content.attestation_title}</h2>
        {canRequestAttestation ? (
          <button
            type="button"
            onClick={() => { setShowRequestForm(true); setRequestMessage(null); }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            {content.attestation_requestButton}
          </button>
        ) : (
          <span className="text-sm text-gray-600 italic">{content.attestation_manageMode}</span>
        )}
      </div>

      {/* Feedback message */}
      {requestMessage && (
        <div className={`p-3 rounded text-sm font-medium ${
          requestMessage.type === 'success'
            ? 'bg-green-100 text-green-800 border border-green-300'
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {requestMessage.text}
        </div>
      )}

      {/* Request form modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold">{content.attestation_requestTitle}</h3>
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {content.attestation_requestType}
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                >
                  {ATTESTATION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {content[t.labelKey] || t.value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {content.attestation_requestReason}
                </label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder={content.attestation_requestReasonPlaceholder}
                  rows={3}
                  className="w-full border rounded px-3 py-2 text-sm resize-none"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 rounded border text-sm hover:bg-gray-100"
                >
                  {content.attestation_requestCancel}
                </button>
                <button
                  type="submit"
                  disabled={requesting}
                  className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {requesting ? '...' : content.attestation_requestSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder={content.attestation_searchPlaceholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded shadow-sm"
      />

      {/* Attestation list */}
      {filtered.length === 0 ? (
        <p className="italic text-gray-500">{content.attestation_noResults}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: '#dbeafe', color: '#1e3a8a' }}>
              <tr>
                <th style={th}>{content.attestation_title}</th>
                <th style={th}>{content.date || 'Date'}</th>
                <th style={th}>{content.payment_reference || 'Référence'}</th>
                <th style={th}>{content.presence_status || 'Statut'}</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((attestation, index) => (
                <tr key={attestation.id} style={{ background: index % 2 === 0 ? '#f0f9ff' : '#fff' }}>
                  <td style={td}><strong>{attestation.title}</strong></td>
                  <td style={td}>{attestation.date}</td>
                  <td style={td}>{attestation.reference ? `#${attestation.reference}` : '-'}</td>
                  <td style={td}>
                    {attestation.status && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        STATUS_COLORS[attestation.status] || 'bg-gray-200 text-gray-600'
                      }`}>
                        {attestation.status === 'pending'
                          ? content.attestation_statusPending
                          : attestation.status === 'rejected'
                            ? content.attestation_statusRejected
                            : content.attestation_statusApproved}
                      </span>
                    )}
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {canManageAttestations && attestation.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(attestation.id, 'approved')}
                            className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 text-sm"
                          >
                            {content.attestation_approveButton}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(attestation.id, 'rejected')}
                            className="bg-rose-600 text-white px-3 py-1 rounded hover:bg-rose-700 text-sm"
                          >
                            {content.attestation_rejectButton}
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        disabled={attestation.status === 'pending'}
                        onClick={() => handleView(attestation.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {content.attestation_viewButton}
                      </button>
                      <button
                        type="button"
                        disabled={attestation.status === 'pending'}
                        onClick={() => handleDownload(attestation.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {content.attestation_downloadButton}
                      </button>
                    </div>
                  </td>
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

export default AttestationsPage;
