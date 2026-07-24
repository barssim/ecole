import React, { useState } from 'react';
import axios from 'axios';
import { getTenantId } from '../tenant';
import { hasAnyRole, normalizeRoles } from '../utils/roles';

const PostInvoice = () => {
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('');
  const [items, setItems] = useState([{ description: '', amount: '' }]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [factures, setFactures] = useState([]);
  const [loadingFactures, setLoadingFactures] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = (process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8085').replace(/\/$/, '');
  const token = sessionStorage.getItem('jwt_token');
  const userRoles = normalizeRoles(JSON.parse(localStorage.getItem('user_roles') || '[]'));
  const roleHeader = userRoles.join(',');
  const canManageFactures = hasAnyRole(userRoles, ['finance', 'admin', 'manager']);

  const buildHeaders = (includeJson = false) => {
    const headers = {
      'X-Tenant-Id': getTenantId(),
      ...(roleHeader ? { 'X-User-Roles': roleHeader } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    if (includeJson) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  };

  React.useEffect(() => {
    fetchFactures();
  }, []);

  const fetchFactures = async () => {
    try {
      setLoadingFactures(true);
      setError(null);

      const response = await fetch(`${baseUrl}/api/factures`, {
        headers: buildHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des factures');
      }

      const data = await response.json();
      setFactures(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoadingFactures(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', amount: '' }]);
  };

  const generateInvoice = async () => {
    if (!canManageFactures) {
      setError('Only finance, admin, and manager roles can generate factures.');
      return;
    }

    try {
      setError(null);
      const response = await axios.post(
        `${baseUrl}/api/facture/generate`,
        {
          studentName,
          className,
          items: items.map(item => ({
            description: item.description,
            amount: parseFloat(item.amount)
          }))
        },
        {
          headers: buildHeaders(true),
          responseType: 'blob'
        } // important for PDF
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      await fetchFactures();
    } catch (err) {
      setError(err.response?.data?.message || `Erreur lors de la génération de la facture (HTTP ${err.response?.status || 'unknown'})`);
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h2>Générer une Facture Scolaire</h2>
      {!canManageFactures && <p style={{ color: '#b45309' }}>Only finance, admin, and manager roles can generate factures.</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      <input
        type="text"
        placeholder="Nom de l'élève"
        value={studentName}
        onChange={e => setStudentName(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />
      <input
        type="text"
        placeholder="Classe"
        value={className}
        onChange={e => setClassName(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <h4>Services</h4>
      {items.map((item, index) => (
        <div key={index} style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Description"
            value={item.description}
            onChange={e => handleItemChange(index, 'description', e.target.value)}
            style={{ marginRight: 10 }}
          />
          <input
            type="number"
            placeholder="Montant"
            value={item.amount}
            onChange={e => handleItemChange(index, 'amount', e.target.value)}
          />
        </div>
      ))}

      <button onClick={addItem} style={{ marginBottom: 20 }}>
        + Ajouter un service
      </button>
      <br />
      <button onClick={generateInvoice} disabled={!canManageFactures}>Générer la facture PDF</button>

      {pdfUrl && (
        <div style={{ marginTop: 20 }}>
          <h4>Facture générée :</h4>
          <iframe src={pdfUrl} width="100%" height="500px" title="Invoice PDF" />
          <br />
          <a href={pdfUrl} download="facture.pdf">📥 Télécharger</a>
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <h3>Toutes les factures enregistrées</h3>
        {loadingFactures && <p>Chargement...</p>}
        {!loadingFactures && factures.length === 0 && <p>Aucune facture enregistrée.</p>}
        {!loadingFactures && factures.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead style={{ background: '#dbeafe', color: '#1e3a8a' }}>
                <tr>
                  <th style={th}>Facture</th>
                  <th style={th}>Élève</th>
                  <th style={th}>Classe</th>
                  <th style={th}>Date</th>
                  <th style={th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {factures.map((facture, index) => (
                  <tr key={facture.id} style={{ background: index % 2 === 0 ? '#f0f9ff' : '#fff' }}>
                    <td style={td}><strong>{facture.invoiceNumber}</strong></td>
                    <td style={td}>{facture.studentName}</td>
                    <td style={td}>{facture.className}</td>
                    <td style={td}>{formatDate(facture.generatedDate)}</td>
                    <td style={td}>{Number(facture.totalAmount || 0).toFixed(2)} {facture.currency || 'MAD'}</td>
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

const th = { padding: '8px 12px', textAlign: 'left', fontWeight: 600 };
const td = { padding: '8px 12px' };

export default PostInvoice;
