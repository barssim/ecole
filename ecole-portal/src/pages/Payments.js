import React, { useEffect, useState } from 'react';
import axios from 'axios';
import fr from "../locales/fr.json";
import ar from "../locales/ar.json";
import en from "../locales/en.json";
import { getTenantId } from '../tenant';
import { hasAnyRole, normalizeRoles } from '../utils/roles';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';

const Payments = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generatingInvoiceId, setGeneratingInvoiceId] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    className: '',
    amount: '',
    currency: 'MAD',
    method: 'cash',
    paymentDate: new Date().toISOString().slice(0, 10),
    reference: '',
    notes: ''
  });

  const configuredBase = resolveApiBaseUrl('http://localhost:8085');
  const apiRoot = configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`;
  const paymentsApiBase = `${apiRoot}/payments`;
  const invoiceApiUrl = `${apiRoot}/facture/generate`;
  const token = sessionStorage.getItem('jwt_token');

  const buildRoleHeader = () => {
    const rawRoles = normalizeRoles(JSON.parse(localStorage.getItem('user_roles') || '[]'));
    return rawRoles.join(',');
  };

  const canManagePayments = hasAnyRole(
    normalizeRoles(JSON.parse(localStorage.getItem('user_roles') || '[]')),
    ['finance', 'admin', 'manager']
  );

  const getHeaders = () => {
    const roleHeader = buildRoleHeader();
    return {
      'X-Tenant-Id': getTenantId(),
      ...(roleHeader ? { 'X-User-Roles': roleHeader } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      className: '',
      amount: '',
      currency: 'MAD',
      method: 'cash',
      paymentDate: new Date().toISOString().slice(0, 10),
      reference: '',
      notes: ''
    });
    setEditingId(null);
    setFormError('');
  };

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('[Payments] Fetching from:', paymentsApiBase);
      const response = await axios.get(paymentsApiBase, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });
      console.log('[Payments] Success:', response.data);
      setPayments(Array.isArray(response.data) ? response.data : []);
    } catch (fetchError) {
      console.error('[Payments] Fetch error:', fetchError);
      const errorMsg =
        fetchError.response?.data?.message ||
        fetchError.response?.statusText ||
        fetchError.message ||
        'Unable to fetch payments.';
      setError(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFacture = async (payment) => {
    if (!canManagePayments) {
      setError('Only finance, admin, and manager roles can generate factures.');
      return;
    }

    const amountValue = Number(payment.amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError('Cannot generate facture: payment amount is invalid.');
      return;
    }

    const description = payment.reference
      ? `Payment (${payment.method || 'unknown'}) - ${payment.reference}`
      : `Payment (${payment.method || 'unknown'})`;

    const payload = {
      studentName: payment.studentName || 'Unknown student',
      className: payment.className || '-',
      items: [
        {
          description,
          amount: amountValue
        }
      ]
    };

    setGeneratingInvoiceId(payment.id);
    setError('');

    try {
      const response = await axios.post(invoiceApiUrl, payload, {
        headers: getHeaders(),
        responseType: 'blob',
        timeout: 15000
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-payment-${payment.id || 'student'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (invoiceError) {
      setError(invoiceError.response?.data?.message || `Unable to generate facture PDF (HTTP ${invoiceError.response?.status || 'unknown'}).`);
    } finally {
      setGeneratingInvoiceId(null);
    }
  };

  useEffect(() => {
    console.log('[Payments] Component mounted');
      console.log('[Payments] API URL:', paymentsApiBase);
    console.log('[Payments] Environment:', {
      REACT_APP_API_GATEWAY_URL: process.env.REACT_APP_API_GATEWAY_URL,
      NODE_ENV: process.env.NODE_ENV
    });
    fetchPayments();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (payment) => {
    setEditingId(payment.id);
    setFormData({
      studentName: payment.studentName || '',
      className: payment.className || '',
      amount: payment.amount ?? '',
      currency: payment.currency || 'MAD',
      method: payment.method || 'cash',
      paymentDate: payment.paymentDate || new Date().toISOString().slice(0, 10),
      reference: payment.reference || '',
      notes: payment.notes || ''
    });
    setFormError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment?')) {
      return;
    }

    try {
      await axios.delete(`${paymentsApiBase}/${id}`, { headers: getHeaders() });
      if (editingId === id) {
        resetForm();
      }
      await fetchPayments();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Unable to delete payment.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!canManagePayments) {
      setFormError('Only finance, admin, and manager roles can create or update payments.');
      return;
    }

    if (!formData.studentName.trim()) {
      setFormError('Student name is required.');
      return;
    }

    const amountValue = Number(formData.amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setFormError('Amount must be greater than 0.');
      return;
    }

    const payload = {
      ...formData,
      studentName: formData.studentName.trim(),
      className: formData.className.trim(),
      amount: amountValue,
      currency: formData.currency.trim() || 'MAD',
      method: formData.method.trim() || 'cash',
      reference: formData.reference.trim(),
      notes: formData.notes.trim()
    };

    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${paymentsApiBase}/${editingId}`, payload, { headers: getHeaders() });
      } else {
        await axios.post(paymentsApiBase, payload, { headers: getHeaders() });
      }
      resetForm();
      await fetchPayments();
    } catch (submitError) {
      setFormError(submitError.response?.data?.message || `Unable to save payment (HTTP ${submitError.response?.status || 'unknown'}).`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%'
      }}
    >
      <h2 className="text-2xl font-bold text-blue-800 mb-6">
        {content.payments_title || "Liste des paiements"}
      </h2>

      <form onSubmit={handleSubmit} className="overflow-x-auto" style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
        {!canManagePayments && (
          <p style={{ color: '#b45309', marginBottom: '10px' }}>
            Only finance, admin, and manager roles can create or update payments.
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          <input name="studentName" value={formData.studentName} onChange={handleInputChange} placeholder="Student name" />
          <input name="className" value={formData.className} onChange={handleInputChange} placeholder="Class name" />
          <input name="amount" type="number" min="0" step="0.01" value={formData.amount} onChange={handleInputChange} placeholder="Amount" />
          <input name="currency" value={formData.currency} onChange={handleInputChange} placeholder="Currency" />
          <input name="method" value={formData.method} onChange={handleInputChange} placeholder="Method" />
          <input name="paymentDate" type="date" value={formData.paymentDate} onChange={handleInputChange} />
          <input name="reference" value={formData.reference} onChange={handleInputChange} placeholder="Reference" />
          <input name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Notes" />
        </div>
        {formError && <p style={{ color: '#b91c1c', marginTop: '10px' }}>{formError}</p>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button type="submit" disabled={saving || !canManagePayments}>{saving ? 'Saving...' : (editingId ? 'Update payment' : 'Create payment')}</button>
          {editingId && <button type="button" onClick={resetForm}>Cancel edit</button>}
        </div>
      </form>

      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '6px',
          padding: '12px',
          color: '#991b1b'
        }}>
          <strong>Error:</strong> {error}
          <br />
          <small style={{ color: '#7f1d1d' }}>
            API Endpoint: {paymentsApiBase}
            <br />
            Gateway URL: {process.env.REACT_APP_API_GATEWAY_URL || '(not set)'}
            <br />
            <em>Check browser console (F12) for more details.</em>
          </small>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600 text-center mt-4">Loading payments...</p>
      ) : payments.length > 0 ? (
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead style={{ background: "#dbeafe", color: "#1e3a8a" }}>
              <tr>
                <th style={th}>{content.date}</th>
                <th style={th}>{content.student}</th>
                <th style={th}>Class</th>
                <th style={th}>{content.amount}</th>
                <th style={th}>{content.method}</th>
                <th style={th}>Reference</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={payment.id} style={{ background: index % 2 === 0 ? "#f0f9ff" : "#fff" }}>
                  <td style={td}>{payment.paymentDate || '-'}</td>
                  <td style={td}>{payment.studentName}</td>
                  <td style={td}>{payment.className || '-'}</td>
                  <td style={td}>{payment.amount} {payment.currency}</td>
                  <td style={td}>{payment.method}</td>
                  <td style={td}>{payment.reference || '-'}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => handleEdit(payment)} disabled={!canManagePayments}>Edit</button>
                      <button type="button" onClick={() => handleDelete(payment.id)} disabled={!canManagePayments}>Delete</button>
                      <button
                        type="button"
                        onClick={() => handleGenerateFacture(payment)}
                        disabled={generatingInvoiceId === payment.id || !canManagePayments}
                      >
                        {generatingInvoiceId === payment.id ? 'Generating...' : 'Facture'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-center mt-4">
          {content.no_payments || "Aucun paiement enregistré pour le moment."}
        </p>
      )}
    </div>
  );
};

const th = { padding: "8px 12px", textAlign: "left", fontWeight: 600 };
const td = { padding: "8px 12px" };

export default Payments;
