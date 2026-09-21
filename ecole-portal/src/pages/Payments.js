import React, { useEffect, useState } from 'react';
import axios from 'axios';
import fr from "../locales/fr.json";
import ar from "../locales/ar.json";
import en from "../locales/en.json";
import { getTenantId } from '../tenant';
import { hasAnyRole, normalizeRoles } from '../utils/roles';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';
import { getFallbackCustomization } from '../ecoleLoader';
import '../cssFiles/Finance.css';

const Payments = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const serviceOptions = [
    { value: 'tuition', label: content.payment_service_tuition || 'Tuition' },
    { value: 'transport', label: content.payment_service_transport || 'Transport' },
    { value: 'cafeteria', label: content.payment_service_cafeteria || 'Cafeteria' },
    { value: 'books', label: content.payment_service_books || 'Books' },
    { value: 'uniform', label: content.payment_service_uniform || 'Uniform' },
    { value: 'registration', label: content.payment_service_registration || 'Registration' },
    { value: 'activities', label: content.payment_service_activities || 'Activities' },
    { value: 'examFees', label: content.payment_service_examFees || 'Exam Fees' },
    { value: 'other', label: content.payment_service_other || 'Other' },
  ];
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [generatingInvoiceId, setGeneratingInvoiceId] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    className: '',
    service: '',
    amount: '',
    currency: 'MAD',
    method: 'cash',
    paymentDate: new Date().toISOString().slice(0, 10),
    reference: '',
    notes: ''
  });

  const readStoredRoles = () => {
    const raw = localStorage.getItem('user_roles');
    if (!raw) {
      return [];
    }

    try {
      return normalizeRoles(JSON.parse(raw));
    } catch {
      return normalizeRoles(String(raw).split(','));
    }
  };

  const extractApiError = (apiError, fallback) => {
    const data = apiError?.response?.data;
    if (typeof data === 'string' && data.trim()) {
      return data;
    }
    if (data?.message) {
      return data.message;
    }
    if (data?.error) {
      return data.error;
    }
    if (apiError?.response?.statusText) {
      return apiError.response.statusText;
    }
    if (apiError?.message) {
      return apiError.message;
    }
    return fallback;
  };

  const extractServiceFromNotes = (notes) => {
    const match = String(notes || '').match(/^Service:\s*(.+?)(?:\n|$)/i);
    return match ? match[1].trim() : '';
  };

  const configuredBase = resolveApiBaseUrl('http://localhost:8085');
  const browserIsLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const localhostApiTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBase);
  const inferredRemoteBase = `${window.location.protocol}//${window.location.hostname}:8085`;
  const effectiveBase = localhostApiTarget && !browserIsLocal ? inferredRemoteBase : configuredBase;
  const apiRoot = effectiveBase.endsWith('/api') ? effectiveBase : `${effectiveBase}/api`;
  const useRelativeApi = process.env.REACT_APP_USE_RELATIVE_API === 'true';
  const paymentsApiBase = useRelativeApi ? '/api/payments' : `${apiRoot}/payments`;
  const invoiceApiUrl = useRelativeApi ? '/api/facture/generate' : `${apiRoot}/facture/generate`;
  const studentsApiUrl = useRelativeApi ? '/api/users/students' : `${apiRoot}/users/students`;
  const classesApiUrl = useRelativeApi ? '/api/classes' : `${apiRoot}/classes`;
  const token = sessionStorage.getItem('jwt_token');
  const tenantCustomization = getFallbackCustomization();
  const schoolLogoPath = tenantCustomization?.logo || '';
  const schoolLogoUrl = schoolLogoPath ? `${window.location.origin}${schoolLogoPath}` : '';
  const schoolDisplayName = tenantCustomization?.name?.[language] || tenantCustomization?.name?.fr || '';
  const schoolAddress = tenantCustomization?.adresse?.[language] || tenantCustomization?.adresse?.fr || '';
  const schoolPhone = tenantCustomization?.phone || '';
  const schoolEmail = tenantCustomization?.mail || '';

  const getLogoDataUrl = async () => {
    if (!schoolLogoUrl) {
      return '';
    }
    try {
      const response = await fetch(schoolLogoUrl);
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

  const buildRoleHeader = () => {
    const rawRoles = readStoredRoles();
    return rawRoles
      .map((role) => role.replace(/^role_/, ''))
      .join(',');
  };

  const canManagePayments = hasAnyRole(readStoredRoles(), ['finance', 'admin', 'manager']);

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
      studentEmail: '',
      className: '',
      service: '',
      amount: '',
      currency: 'MAD',
      method: 'cash',
      paymentDate: new Date().toISOString().slice(0, 10),
      reference: '',
      notes: ''
    });
    setEditingId(null);
    setFormError('');
    setShowForm(false);
  };

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('[Payments] Fetching from:', paymentsApiBase);
      const headers = {
        ...getHeaders(),
        Accept: 'application/json'
      };
      const response = await axios.get(paymentsApiBase, {
        timeout: 10000,
        headers
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

    const serviceLabel = extractServiceFromNotes(payment.notes);
    const description = serviceLabel
      ? (payment.reference ? `${serviceLabel} - ${payment.reference}` : serviceLabel)
      : (payment.reference
        ? `Payment (${payment.method || 'unknown'}) - ${payment.reference}`
        : `Payment (${payment.method || 'unknown'})`);

    const payload = {
      studentName: payment.studentName || 'Unknown student',
      className: payment.className || '-',
      items: [
        {
          description,
          amount: amountValue
        }
      ],
      logoUrl: await getLogoDataUrl(),
      schoolName: schoolDisplayName,
      phoneNumber: schoolPhone,
      emailAddress: schoolEmail,
      address: schoolAddress,
      paymentMethod: payment.method || ''
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
    fetchStudentOptions();
    fetchClassOptions();
  }, []);

  const fetchStudentOptions = async () => {
    try {
      const response = await axios.get(studentsApiUrl, { headers: getHeaders() });
      const students = Array.isArray(response.data) ? response.data : [];
      const mappedStudents = students
        .map((student) => ({
          name: student?.name || student?.username || '',
          email: student?.email || ''
        }))
        .filter((student) => student.name);

      const uniqueStudents = Array.from(new Map(
        mappedStudents.map((student) => [student.name, student])
      ).values());

      setStudentOptions(uniqueStudents);
    } catch (err) {
      console.error('[Payments] Failed to load students:', err);
      setStudentOptions([]);
    }
  };

  const fetchClassOptions = async () => {
    try {
      const response = await axios.get(classesApiUrl, { headers: getHeaders() });
      const classes = Array.isArray(response.data) ? response.data : [];
      const names = Array.from(new Set(
        classes
          .map((cls) => cls?.name || cls?.className || '')
          .filter(Boolean)
      ));
      setClassOptions(names);
    } catch (err) {
      console.error('[Payments] Failed to load classes:', err);
      setClassOptions([]);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === 'studentName') {
        const selectedStudent = studentOptions.find((student) =>
          student.name === value || student.username === value || student.email === value
        );
        next.studentEmail = selectedStudent?.email || prev.studentEmail || '';
      }

      return next;
    });
  };

  const handleEdit = (payment) => {
    setEditingId(payment.id);
    const notesValue = payment.notes || '';
    const serviceMatch = notesValue.match(/^Service:\s*(.+?)(?:\n|$)/i);
    const parsedService = serviceMatch
      ? (serviceOptions.find((option) => option.value === serviceMatch[1].trim() || option.label === serviceMatch[1].trim())?.value || '')
      : '';
    setFormData({
      studentName: payment.studentName || '',
      studentEmail: payment.studentEmail || '',
      className: payment.className || '',
      service: parsedService,
      amount: payment.amount ?? '',
      currency: payment.currency || 'MAD',
      method: payment.method || 'cash',
      paymentDate: payment.paymentDate || new Date().toISOString().slice(0, 10),
      reference: payment.reference || '',
      notes: serviceMatch ? notesValue.slice(serviceMatch[0].length) : notesValue
    });
    setFormError('');
    setShowForm(true);
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

    if (!formData.service) {
      setFormError('Please select a service.');
      return;
    }

    const amountValue = Number(formData.amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setFormError('Amount must be greater than 0.');
      return;
    }

    const selectedServiceLabel = serviceOptions.find((option) => option.value === formData.service)?.label || formData.service;
    const serviceLine = `Service: ${selectedServiceLabel}`;
    const combinedNotes = [serviceLine, formData.notes.trim()].filter(Boolean).join('\n');

    const payload = {
      ...formData,
      studentName: formData.studentName.trim(),
      studentEmail: (formData.studentEmail || '').trim(),
      className: formData.className.trim(),
      service: formData.service,
      amount: amountValue,
      currency: formData.currency.trim() || 'MAD',
      method: formData.method.trim() || 'cash',
      paymentDate: formData.paymentDate ? formData.paymentDate : null,
      reference: formData.reference.trim() || null,
      notes: combinedNotes || null
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
      const message = extractApiError(
        submitError,
        `Unable to save payment (HTTP ${submitError.response?.status || 'unknown'}).`
      );
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="finance-page">
      <div className="finance-header">
        <div>
          <span className="finance-title-badge">{content.finance_badge || "Finance"}</span>
          <h2 className="finance-title">{content.payments_title || "Liste des paiements"}</h2>
        </div>
        <div className="finance-toolbar">
          <button
            type="button"
            className="finance-btn finance-btn-primary"
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
          >
            {showForm ? (content.payment_cancelButton || 'Cancel') : (content.payment_createButton || 'Create payment')}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="finance-card">
          <h3>{editingId ? (content.payment_updateTitle || "Modifier le paiement") : (content.payment_createTitle || "Enregistrer un paiement")}</h3>
          {!canManagePayments && (
            <div className="finance-alert finance-alert-warning">
              Only finance, admin, and manager roles can create or update payments.
            </div>
          )}
          <form onSubmit={handleSubmit} className="finance-form">
            <div className="finance-form-grid">
              <select name="studentName" value={formData.studentName} onChange={handleInputChange} required>
                <option value=""></option>
                {studentOptions.map((student) => (
                  <option key={`${student.name}-${student.email || 'no-email'}`} value={student.name}>{student.name}</option>
                ))}
              </select>
              <select name="className" value={formData.className} onChange={handleInputChange}>
                <option value=""></option>
                {classOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <select
                name="service"
                required
                value={formData.service}
                onChange={handleInputChange}
              >
                <option value="">{content.payment_service_label || 'Service'}</option>
                {serviceOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <input name="amount" type="number" min="0" step="0.01" value={formData.amount} onChange={handleInputChange} placeholder="Amount" />
              <input name="currency" value={formData.currency} onChange={handleInputChange} placeholder="Currency" />
              <select name="method" value={formData.method} onChange={handleInputChange}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="cheque">Cheque</option>
                <option value="mobile_money">Mobile money</option>
              </select>
              <input name="paymentDate" type="date" value={formData.paymentDate} onChange={handleInputChange} />
              <input name="reference" value={formData.reference} onChange={handleInputChange} placeholder="Reference" />
              <input name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Notes" />
            </div>
            {formError && <div className="finance-alert finance-alert-error">{formError}</div>}
            <div className="finance-form-actions">
              <button type="submit" className="finance-btn finance-btn-primary" disabled={saving || !canManagePayments}>
                {saving
                  ? (content.payment_saving || 'Saving...')
                  : (editingId ? (content.payment_updateSubmit || 'Update payment') : (content.payment_createSubmit || 'Create payment'))}
              </button>
              <button type="button" className="finance-btn finance-btn-outline" onClick={resetForm}>{content.payment_cancelButton || 'Cancel'}</button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="finance-alert finance-alert-error">
          <strong>Error:</strong> {error}
          <span className="finance-alert-detail">
            API Endpoint: {paymentsApiBase}<br />
            Gateway URL: {process.env.REACT_APP_API_GATEWAY_URL || '(not set)'}<br />
            <em>Check browser console (F12) for more details.</em>
          </span>
        </div>
      )}

      {loading ? (
        <p className="finance-loading">Loading payments...</p>
      ) : payments.length > 0 ? (
        <div className="finance-table-wrapper">
          <table className="finance-table">
            <thead>
              <tr>
                <th>{content.date}</th>
                <th>{content.student}</th>
                <th>Class</th>
                <th>{content.payment_service_label || 'Service'}</th>
                <th>{content.amount}</th>
                <th>{content.method}</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.paymentDate || '-'}</td>
                  <td>{payment.studentName}</td>
                  <td>{payment.className || '-'}</td>
                  <td>{extractServiceFromNotes(payment.notes) || '-'}</td>
                  <td className="finance-amount">{payment.amount} {payment.currency}</td>
                  <td>{payment.method}</td>
                  <td>{payment.reference || '-'}</td>
                  <td>
                    <div className="finance-row-actions">
                      <button
                        type="button"
                        className="finance-icon-btn finance-icon-edit"
                        onClick={() => handleEdit(payment)}
                        disabled={!canManagePayments}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="finance-icon-btn finance-icon-delete"
                        onClick={() => handleDelete(payment.id)}
                        disabled={!canManagePayments}
                        title="Delete"
                      >
                        🗑
                      </button>
                      <button
                        type="button"
                        className="finance-btn finance-btn-sm finance-btn-primary"
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
        <p className="finance-empty">
          {content.no_payments || "Aucun paiement enregistré pour le moment."}
        </p>
      )}
    </div>
  );
};

export default Payments;
