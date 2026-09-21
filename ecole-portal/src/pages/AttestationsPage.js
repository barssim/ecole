import React, { useCallback, useEffect, useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import { getSchoolId } from '../school';
import { hasAnyRole, normalizeRoles } from '../utils/roles';
import { createApiUrlFor } from '../utils/apiClient';

const ATTESTATION_TYPES = [
  { value: 'enrollment',   labelKey: 'attestation_typeEnrollment' },
  { value: 'attendance',   labelKey: 'attestation_typeAttendance' },
  { value: 'conduct',      labelKey: 'attestation_typeConduct' },
  { value: 'academic',     labelKey: 'attestation_typeAcademic' },
  { value: 'registration', labelKey: 'attestation_typeRegistration' },
];

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
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const userId    = localStorage.getItem('userId');
  const username  = localStorage.getItem('LoggedIn') || '';
  const token     = sessionStorage.getItem('jwt_token');
  const userRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');
  const normalizedRoles = normalizeRoles(userRoles);
  const canManageAttestations = hasAnyRole(normalizedRoles, ['secretary', 'admin', 'manager']);
  const canRequestAttestation = hasAnyRole(normalizedRoles, ['parent']) && !canManageAttestations;

  const apiUrlFor = createApiUrlFor('http://localhost:8085');
  const rolesHeaderValue = normalizedRoles.join(',');
  const parsedUserId = Number.parseInt(String(userId || ''), 10);
  const resolvedUserId = Number.isInteger(parsedUserId) && parsedUserId > 0 ? parsedUserId : null;

  const buildHeaders = useCallback((includeJson = false) => {
    const headers = {
      'X-School-Id': getSchoolId(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(rolesHeaderValue ? { 'X-User-Roles': rolesHeaderValue } : {}),
      ...(resolvedUserId ? { 'X-User-Id': String(resolvedUserId) } : {}),
      ...(username ? { 'X-User-Name': username } : {}),
    };
    if (includeJson) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }, [rolesHeaderValue, token, resolvedUserId, username]);

  const fetchAttestations = useCallback(async () => {
    try {
      const query = !canManageAttestations && resolvedUserId ? `?userId=${encodeURIComponent(resolvedUserId)}` : '';
      const response = await fetch(
        apiUrlFor(`/attestations${query}`),
        {
          headers: buildHeaders(),
        }
      );
      const data = await response.json();
      setAttestations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch attestations:', error);
    }
  }, [apiUrlFor, buildHeaders, canManageAttestations, resolvedUserId]);

  useEffect(() => {
    fetchAttestations();
  }, [fetchAttestations]);

  const handleRequest = async (e) => {
    e.preventDefault();
    setRequesting(true);
    setRequestMessage(null);
    try {
      if (!resolvedUserId) {
        setRequestMessage({
          type: 'error',
          text: content.attestation_requestMissingUser || 'Unable to identify your account. Please log out and log in again.',
        });
        return;
      }

      const response = await fetch(
        apiUrlFor('/attestations/request'),
        {
          method: 'POST',
          headers: buildHeaders(true),
          body: JSON.stringify({
            userId: resolvedUserId,
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
        let backendMessage = '';
        try {
          const payload = await response.json();
          backendMessage = payload?.message || payload?.error || '';
        } catch {
          // ignore JSON parse errors and use fallback
        }
        setRequestMessage({ type: 'error', text: backendMessage || content.attestation_requestError });
      }
    } catch (error) {
      setRequestMessage({ type: 'error', text: error?.message || content.attestation_requestError });
    } finally {
      setRequesting(false);
    }
  };

  const handleView = (id) => {
    fetch(apiUrlFor(`/attestations/${id}/view`), { headers: buildHeaders() })
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

   const handleManagementAction = async (attestationId, endpoint, method = 'PATCH') => {
     setRequestMessage(null);
     try {
       const actionPath = endpoint ? `/${endpoint}` : '';
       const response = await fetch(apiUrlFor(`/attestations/${attestationId}${actionPath}`), {
         method,
         headers: method === 'DELETE' ? buildHeaders() : buildHeaders(true),
       });

       if (!response.ok) {
         throw new Error(`HTTP ${response.status}`);
       }

       if (method === 'DELETE') {
         setAttestations((current) => current.filter((item) => item.id !== attestationId));
       } else {
         const updated = await response.json();
         setAttestations((current) =>
           current.map((item) => (item.id === updated.id ? updated : item))
         );
       }
       setRequestMessage({ type: 'success', text: content.attestation_manageSuccess });
     } catch {
       setRequestMessage({ type: 'error', text: content.attestation_manageError });
     }
   };

   const handleDelete = (attestationId) => {
     handleManagementAction(attestationId, '', 'DELETE');
     setDeleteConfirmId(null);
   };

   const handleDownload = (id) => {
        fetch(apiUrlFor(`/attestations/${id}/download`), { headers: buildHeaders() })
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
    (a.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="attestation-page">
      <div className="attestation-header">
        <h2 className="attestation-title">{content.attestation_title}</h2>
        {canRequestAttestation ? (
          <button
            type="button"
            onClick={() => { setShowRequestForm(true); setRequestMessage(null); }}
            className="attestation-request-btn"
          >
            {content.attestation_requestButton}
          </button>
        ) : (
          <span className="attestation-manage-badge">{content.attestation_manageMode}</span>
        )}
      </div>

      {/* Feedback message */}
      {requestMessage && (
        <div className={`attestation-message ${requestMessage.type === 'success' ? 'success' : 'error'}`}>
          {requestMessage.text}
        </div>
      )}

      {/* Request form modal */}
      {showRequestForm && (
        <div className="attestation-modal-overlay">
          <div className="attestation-modal">
            <h3>{content.attestation_requestTitle}</h3>
            <form onSubmit={handleRequest} className="attestation-form">
              <div>
                <label>
                  {content.attestation_requestType}
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
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
                <label>
                  {content.attestation_requestReason}
                </label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder={content.attestation_requestReasonPlaceholder}
                  rows={3}
                />
              </div>
              <div className="attestation-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="attestation-btn-cancel"
                >
                  {content.attestation_requestCancel}
                </button>
                <button
                  type="submit"
                  disabled={requesting}
                  className="attestation-btn-submit"
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
        className="attestation-search"
      />

      {/* Attestation list */}
      {filtered.length === 0 ? (
        <p className="attestation-empty">{content.attestation_noResults}</p>
      ) : (
        <div className="attestation-table-wrap">
          <table className="attestation-table">
            <thead>
              <tr>
                <th>{content.attestation_title}</th>
                <th>{content.date || 'Date'}</th>
                <th>{content.payment_reference || 'Référence'}</th>
                <th>{content.presence_status || 'Statut'}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((attestation) => (
                <tr key={attestation.id}>
                  <td><strong>{attestation.title}</strong></td>
                  <td>{attestation.date}</td>
                  <td>{attestation.reference ? `#${attestation.reference}` : '-'}</td>
                  <td>
                    {attestation.status && (
                      <span className={`attestation-status-badge attestation-status-${attestation.status}`}>
                        {attestation.status === 'pending'
                          ? content.attestation_statusPending
                          : attestation.status === 'rejected'
                            ? content.attestation_statusRejected
                            : content.attestation_statusApproved}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="attestation-actions">
                      {canManageAttestations && attestation.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleManagementAction(attestation.id, 'approve')}
                            className="activity-icon-btn"
                            style={{ color: '#059669' }}
                            title={content.attestation_approveButton}
                          >
                            ✅
                          </button>
                          <button
                            type="button"
                            onClick={() => handleManagementAction(attestation.id, 'cancel')}
                            className="activity-icon-btn"
                            style={{ color: '#e11d48' }}
                            title={content.attestation_cancelButton}
                          >
                            ✕
                          </button>
                        </>
                      )}
                      {canManageAttestations && (
                        deleteConfirmId === attestation.id ? (
                          <>
                            <button
                              type="button"
                              className="activity-icon-btn activity-icon-confirm"
                              onClick={() => handleDelete(attestation.id)}
                              title={content.exam_confirmDelete || 'Confirmer'}
                            >
                              ✔
                            </button>
                            <button
                              type="button"
                              className="activity-icon-btn activity-icon-cancel"
                              onClick={() => setDeleteConfirmId(null)}
                              title={content.activity_cancel_button || 'Annuler'}
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(attestation.id)}
                            className="activity-icon-btn activity-icon-delete"
                            title={content.attestation_deleteButton}
                          >
                            🗑
                          </button>
                        )
                      )}
                      <button
                        type="button"
                        disabled={attestation.status === 'pending'}
                        onClick={() => handleView(attestation.id)}
                        className="activity-icon-btn"
                        style={{ color: '#1d4ed8', opacity: attestation.status === 'pending' ? 0.4 : 1, cursor: attestation.status === 'pending' ? 'not-allowed' : 'pointer' }}
                        title={content.attestation_viewButton}
                      >
                        👁️
                      </button>
                      <button
                        type="button"
                        disabled={attestation.status === 'pending'}
                        onClick={() => handleDownload(attestation.id)}
                        className="activity-icon-btn"
                        style={{ color: '#16a34a', opacity: attestation.status === 'pending' ? 0.4 : 1, cursor: attestation.status === 'pending' ? 'not-allowed' : 'pointer' }}
                        title={content.attestation_downloadButton}
                      >
                        ⬇️
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

export default AttestationsPage;
