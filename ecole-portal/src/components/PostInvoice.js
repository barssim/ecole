import React, { useState } from 'react';
import axios from 'axios';
import { getTenantId } from '../tenant';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';
import { hasAnyRole, normalizeRoles } from '../utils/roles';
import { getFallbackCustomization } from '../ecoleLoader';
import '../cssFiles/Finance.css';

const PostInvoice = ({ language }) => {
  const tenantCustomization = getFallbackCustomization();
  const tenantLogoPath = tenantCustomization?.logo || '';
  const tenantLogoUrl = tenantLogoPath ? `${window.location.origin}${tenantLogoPath}` : '';
  const tenantSchoolName = tenantCustomization?.name?.[language] || tenantCustomization?.name?.fr || 'École Solide';
  const tenantAddress = tenantCustomization?.adresse?.[language] || tenantCustomization?.adresse?.fr || '';
  const tenantPhone = tenantCustomization?.phone || '';
  const tenantEmail = tenantCustomization?.mail || '';

  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('');
  const [items, setItems] = useState([{ description: '', amount: '' }]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [factures, setFactures] = useState([]);
  const [loadingFactures, setLoadingFactures] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [logoUrl, setLogoUrl] = useState(tenantLogoUrl);
  const [schoolName, setSchoolName] = useState(tenantSchoolName);
  const [phoneNumber, setPhoneNumber] = useState(tenantPhone);
  const [emailAddress, setEmailAddress] = useState(tenantEmail);
  const [address, setAddress] = useState(tenantAddress);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const baseUrl = resolveApiBaseUrl('http://localhost:8085');
  const useRelativeApi = process.env.REACT_APP_USE_RELATIVE_API === 'true';
  const token = sessionStorage.getItem('jwt_token');
  const userRoles = normalizeRoles(JSON.parse(localStorage.getItem('user_roles') || '[]'));
  const roleHeader = userRoles.join(',');
  const canManageFactures = hasAnyRole(userRoles, ['finance', 'admin', 'manager']);

  const getLogoDataUrl = async (url) => {
    if (!url) {
      return '';
    }
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return '';
      }
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
    } catch {
      return '';
    }
  };

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

      const url = useRelativeApi ? '/api/factures' : `${baseUrl}/api/factures`;
      const response = await fetch(url, {
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
      const generateUrl = useRelativeApi ? '/api/facture/generate' : `${baseUrl}/api/facture/generate`;
      const resolvedLogo = logoUrl.startsWith('data:') ? logoUrl : await getLogoDataUrl(logoUrl);
      const response = await axios.post(
         generateUrl,
         {
           studentName,
           className,
           items: items.map(item => ({
             description: item.description,
             amount: parseFloat(item.amount)
           })),
           logoUrl: resolvedLogo,
           schoolName,
           phoneNumber,
           emailAddress,
           address,
           paymentMethod
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
    <div className="finance-page">
      <div className="finance-header">
        <div>
          <span className="finance-title-badge">Finance</span>
          <h2 className="finance-title">Factures</h2>
        </div>
        <div className="finance-toolbar">
          <button
            type="button"
            className="finance-btn finance-btn-primary"
            onClick={() => setShowForm((prev) => !prev)}
          >
            {showForm ? 'Annuler' : 'Générer une facture'}
          </button>
        </div>
      </div>

      {!canManageFactures && showForm && (
        <div className="finance-alert finance-alert-warning">
          Only finance, admin, and manager roles can generate factures.
        </div>
      )}
      {error && <div className="finance-alert finance-alert-error">{error}</div>}

      {showForm && (
        <>
          <div className="finance-card">
            <h3>Informations de l'élève</h3>
            <div className="finance-form finance-form-grid">
              <input
                type="text"
                placeholder="Nom de l'élève"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Classe"
                value={className}
                onChange={e => setClassName(e.target.value)}
              />
            </div>
          </div>

          <div className="finance-card">
            <h3>📋 Coordonnées de l'école</h3>
            <div className="finance-form finance-form-grid">
              <input
                type="text"
                placeholder="Nom de l'école"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
              />
              <input
                type="url"
                placeholder="URL du logo (https://...)"
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
              />
              <input
                type="text"
                placeholder="Téléphone"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={emailAddress}
                onChange={e => setEmailAddress(e.target.value)}
              />
              <input
                type="text"
                placeholder="Adresse"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="cash">Espèces</option>
                <option value="card">Carte</option>
                <option value="bank_transfer">Virement bancaire</option>
                <option value="cheque">Chèque</option>
                <option value="mobile_money">Mobile money</option>
              </select>
            </div>
          </div>

          <div className="finance-card">
            <h3>Services</h3>
            {items.map((item, index) => (
              <div key={index} className="finance-item-row">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={e => handleItemChange(index, 'description', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Montant"
                  value={item.amount}
                  onChange={e => handleItemChange(index, 'amount', e.target.value)}
                />
              </div>
            ))}

            <div className="finance-form-actions">
              <button type="button" className="finance-btn finance-btn-outline" onClick={addItem}>
                + Ajouter un service
              </button>
              <button type="button" className="finance-btn finance-btn-primary" onClick={generateInvoice} disabled={!canManageFactures}>
                Générer la facture PDF
              </button>
            </div>

            {pdfUrl && (
              <div className="finance-pdf-preview">
                <h4>Facture générée :</h4>
                <iframe src={pdfUrl} width="100%" height="500px" title="Invoice PDF" />
                <br />
                <a className="finance-download-link" href={pdfUrl} download="facture.pdf">📥 Télécharger</a>
              </div>
            )}
          </div>
        </>
      )}

      <div className="finance-section">
        <h3 className="finance-section-title">Toutes les factures enregistrées</h3>
        {loadingFactures && <p className="finance-loading">Chargement...</p>}
        {!loadingFactures && factures.length === 0 && <p className="finance-empty">Aucune facture enregistrée.</p>}
        {!loadingFactures && factures.length > 0 && (
          <div className="finance-table-wrapper">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Facture</th>
                  <th>Élève</th>
                  <th>Classe</th>
                  <th>Date</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {factures.map((facture) => (
                  <tr key={facture.id}>
                    <td><strong>{facture.invoiceNumber}</strong></td>
                    <td>{facture.studentName}</td>
                    <td>{facture.className}</td>
                    <td>{formatDate(facture.generatedDate)}</td>
                    <td className="finance-amount">{Number(facture.totalAmount || 0).toFixed(2)} {facture.currency || 'MAD'}</td>
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

export default PostInvoice;
