import React, { useEffect, useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import '../cssFiles/PaymentsPage.css';
import { getTenantId } from '../tenant';
import { hasAnyRole, normalizeRoles } from '../utils/roles';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';

const PaymentsPage = ({ language }) => {
  const content = language === 'fr' ? fr : language === 'en' ? en : ar;
  const [paymentNotice, setPaymentNotice] = useState(null);
  const [allNotices, setAllNotices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noticeForm, setNoticeForm] = useState({
    studentName: '',
    className: '',
    totalAmount: '',
    currency: 'MAD',
    dueDate: '',
    description: '',
  });
  const [savingNotice, setSavingNotice] = useState(false);
  const [updatingNoticeId, setUpdatingNoticeId] = useState(null);

  const baseUrl = resolveApiBaseUrl('http://localhost:8085');
  const token = sessionStorage.getItem('jwt_token');
  const studentName = localStorage.getItem('userName') || 'Default Student';
  const userRoles = normalizeRoles(JSON.parse(localStorage.getItem('user_roles') || '[]'));
  const canManagePaymentNotices = hasAnyRole(userRoles, ['finance', 'admin', 'manager']);

  const buildHeaders = (includeJson = false) => {
    const headers = {
      'X-Tenant-Id': getTenantId(),
      ...(userRoles.length > 0 ? { 'X-User-Roles': userRoles.join(',') } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    if (includeJson) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  };

  useEffect(() => {
    fetchData();
  }, [studentName]);

  useEffect(() => {
    setNoticeForm((current) => ({ ...current, studentName }));
  }, [studentName]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current payment notice
      const noticeResponse = await fetch(`${baseUrl}/api/paymentNotice?studentName=${encodeURIComponent(studentName)}`, {
        headers: buildHeaders(true),
      });

      if (noticeResponse.ok) {
        const notice = await noticeResponse.json();
        setPaymentNotice(notice);
      }

      // Fetch all payment notices for this student
      const allNoticesResponse = await fetch(`${baseUrl}/api/paymentNotices?studentName=${encodeURIComponent(studentName)}`, {
        headers: buildHeaders(true),
      });

      if (allNoticesResponse.ok) {
        const noticesData = await allNoticesResponse.json();
        setAllNotices(Array.isArray(noticesData) ? noticesData : []);
      }

      // Fetch payment history
      const paymentsResponse = await fetch(`${baseUrl}/api/payments?studentName=${encodeURIComponent(studentName)}`, {
        headers: buildHeaders(true),
      });

      if (!paymentsResponse.ok) {
        throw new Error(`Request failed with ${paymentsResponse.status} /api/payments`);
      }

      const paymentsData = await paymentsResponse.json();
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données');
      console.error('Error fetching payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!paymentNotice) return;

    try {
      // Generate mock invoice items based on payment notice
      const items = [
        { description: 'Frais de scolarité', amount: paymentNotice.totalAmount * 0.7 },
        { description: 'Matériel et fournitures', amount: paymentNotice.totalAmount * 0.2 },
        { description: 'Activités extrascolaires', amount: paymentNotice.totalAmount * 0.1 },
      ];

      const response = await fetch(`${baseUrl}/api/facture/generate`, {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({
          studentName: paymentNotice.studentName,
          className: paymentNotice.className,
          items: items,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la facture');
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Facture_${paymentNotice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      setError('Erreur lors du téléchargement de la facture: ' + err.message);
      console.error('Error downloading invoice:', err);
    }
  };

  const handleNoticeInputChange = (event) => {
    const { name, value } = event.target;
    setNoticeForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateNotice = async (event) => {
    event.preventDefault();
    setError(null);

    if (!canManagePaymentNotices) {
      setError('Only finance, admin, and manager roles can create payment notices.');
      return;
    }

    const amountValue = Number(noticeForm.totalAmount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError('Total amount must be greater than 0.');
      return;
    }

    if (!noticeForm.studentName.trim()) {
      setError('Student name is required.');
      return;
    }

    try {
      setSavingNotice(true);
      const response = await fetch(`${baseUrl}/api/paymentNotices`, {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({
          studentName: noticeForm.studentName.trim(),
          className: noticeForm.className.trim() || '-',
          totalAmount: amountValue,
          currency: noticeForm.currency.trim() || 'MAD',
          dueDate: noticeForm.dueDate || null,
          description: noticeForm.description.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status} /api/paymentNotices`);
      }

      setNoticeForm((current) => ({
        ...current,
        className: '',
        totalAmount: '',
        dueDate: '',
        description: '',
      }));
      await fetchData();
    } catch (createError) {
      setError(createError.message || 'Unable to create payment notice.');
    } finally {
      setSavingNotice(false);
    }
  };

  const handleUpdateNoticeStatus = async (noticeId, status) => {
    if (!canManagePaymentNotices) {
      setError('Only finance, admin, and manager roles can update payment notices.');
      return;
    }

    try {
      setUpdatingNoticeId(noticeId);
      const response = await fetch(`${baseUrl}/api/paymentNotices/${noticeId}/status`, {
        method: 'PATCH',
        headers: buildHeaders(true),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status} /api/paymentNotices/${noticeId}/status`);
      }

      await fetchData();
    } catch (updateError) {
      setError(updateError.message || 'Unable to update payment notice status.');
    } finally {
      setUpdatingNoticeId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'en' ? 'en-GB' : 'fr-FR');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'badge-paid';
      case 'pending':
        return 'badge-pending';
      case 'overdue':
        return 'badge-overdue';
      case 'unpaid':
        return 'badge-unpaid';
      default:
        return 'badge-default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid':
        return content?.payment_statusPaid || 'Payée';
      case 'pending':
        return content?.payment_statusPending || 'En attente';
      case 'overdue':
        return content?.payment_statusOverdue || 'Échue';
      case 'unpaid':
        return content?.payment_statusUnpaid || 'Non payée';
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="payments-container"><p>{content?.loading || 'Chargement...'}</p></div>;
  }

  return (
    <div className="payments-container">
      <h1>{content?.payments_title || 'Factures et Paiements'}</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {canManagePaymentNotices && (
        <section className="invoice-section">
          <h2>{content?.payment_noticeCreateTitle || 'Créer une facture'}</h2>
          <form onSubmit={handleCreateNotice} style={{ display: 'grid', gap: 10, maxWidth: 680 }}>
            <input
              name="studentName"
              value={noticeForm.studentName}
              onChange={handleNoticeInputChange}
              placeholder={content?.payment_studentName || 'Élève'}
              required
            />
            <input
              name="className"
              value={noticeForm.className}
              onChange={handleNoticeInputChange}
              placeholder={content?.payment_class || 'Classe'}
            />
            <input
              name="totalAmount"
              type="number"
              min="0"
              step="0.01"
              value={noticeForm.totalAmount}
              onChange={handleNoticeInputChange}
              placeholder={content?.payment_amount || 'Montant'}
              required
            />
            <input
              name="currency"
              value={noticeForm.currency}
              onChange={handleNoticeInputChange}
              placeholder="Currency"
            />
            <input
              name="dueDate"
              type="date"
              value={noticeForm.dueDate}
              onChange={handleNoticeInputChange}
            />
            <input
              name="description"
              value={noticeForm.description}
              onChange={handleNoticeInputChange}
              placeholder={content?.payment_description || 'Description'}
            />
            <button type="submit" disabled={savingNotice} className="btn-download">
              {savingNotice ? (content?.loading || 'Loading...') : (content?.payment_noticeCreateButton || 'Créer la facture')}
            </button>
          </form>
        </section>
      )}

      {/* Current Invoice Section */}
      <section className="invoice-section">
        <h2>{content?.payment_currentInvoice || 'Facture Actuelle'}</h2>
        {paymentNotice ? (
          <div className="invoice-card">
            <div className="invoice-header">
              <div className="invoice-number">
                <strong>{paymentNotice.invoiceNumber}</strong>
              </div>
              <div className={`status-badge ${getStatusBadgeClass(paymentNotice.status)}`}>
                {getStatusLabel(paymentNotice.status)}
              </div>
            </div>

            <div className="invoice-details">
              <div className="detail-row">
                <label>{content?.payment_studentName || 'Élève'}:</label>
                <span>{paymentNotice.studentName}</span>
              </div>
              <div className="detail-row">
                <label>{content?.payment_class || 'Classe'}:</label>
                <span>{paymentNotice.className}</span>
              </div>
              <div className="detail-row">
                <label>{content?.payment_invoiceDate || 'Date de facture'}:</label>
                <span>{formatDate(paymentNotice.invoiceDate)}</span>
              </div>
              <div className="detail-row">
                <label>{content?.payment_dueDate || 'Échéance'}:</label>
                <span>{formatDate(paymentNotice.dueDate)}</span>
              </div>
              {paymentNotice.paidDate && (
                <div className="detail-row">
                  <label>{content?.payment_paidDate || 'Date de paiement'}:</label>
                  <span>{formatDate(paymentNotice.paidDate)}</span>
                </div>
              )}
            </div>

            <div className="invoice-amount">
              <strong>{paymentNotice.totalAmount.toFixed(2)} {paymentNotice.currency}</strong>
            </div>

            <div className="invoice-actions">
              <button className="btn-download" onClick={handleDownloadInvoice}>
                {content?.payment_downloadInvoice || 'Télécharger Facture'}
              </button>
            </div>
          </div>
        ) : (
          <p className="no-data">{content?.payment_noInvoice || 'Aucune facture en attente'}</p>
        )}
      </section>

      {/* All Generated Invoices Section */}
      <section className="all-invoices-section">
        <h2>{content?.payment_allInvoices || 'Toutes les Factures Générées'}</h2>
        {allNotices && allNotices.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead style={{ background: '#dbeafe', color: '#1e3a8a' }}>
                <tr>
                  <th style={th}>{content?.payment_reference || 'Facture'}</th>
                  <th style={th}>{content?.payment_studentName || 'Élève'}</th>
                  <th style={th}>{content?.payment_class || 'Classe'}</th>
                  <th style={th}>{content?.payment_invoiceDate || 'Date de facture'}</th>
                  <th style={th}>{content?.payment_dueDate || 'Échéance'}</th>
                  <th style={th}>{content?.payment_status || 'Statut'}</th>
                  <th style={th}>{content?.payment_amount || 'Montant'}</th>
                  {canManagePaymentNotices && <th style={th}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {allNotices.map((notice, index) => (
                  <tr key={notice.id} style={{ background: index % 2 === 0 ? '#f0f9ff' : '#fff' }}>
                    <td style={td}><strong>{notice.invoiceNumber}</strong></td>
                    <td style={td}>{notice.studentName}</td>
                    <td style={td}>{notice.className}</td>
                    <td style={td}>{formatDate(notice.invoiceDate)}</td>
                    <td style={td}>{formatDate(notice.dueDate)}</td>
                    <td style={td}>{getStatusLabel(notice.status)}</td>
                    <td style={td}>{notice.totalAmount.toFixed(2)} {notice.currency}</td>
                    {canManagePaymentNotices && (
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {['pending', 'paid', 'unpaid', 'overdue'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleUpdateNoticeStatus(notice.id, status)}
                              disabled={updatingNoticeId === notice.id || notice.status === status}
                              className="btn-download"
                              style={{ opacity: notice.status === status ? 0.6 : 1 }}
                            >
                              {updatingNoticeId === notice.id ? '...' : getStatusLabel(status)}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">{content?.payment_noInvoices || 'Aucune facture générée'}</p>
        )}
      </section>
      <section className="payment-history-section">
        <h2>{content?.payment_paymentHistory || 'Historique des Paiements'}</h2>
        {payments && payments.length > 0 ? (
          <div className="payment-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead style={{ background: '#dbeafe', color: '#1e3a8a' }}>
                <tr>
                  <th style={th}>{content?.payment_date || 'Date'}</th>
                  <th style={th}>{content?.payment_studentName || 'Élève'}</th>
                  <th style={th}>{content?.payment_amount || 'Montant'}</th>
                  <th style={th}>{content?.payment_method || 'Méthode'}</th>
                  <th style={th}>{content?.payment_reference || 'Référence'}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={payment.id} style={{ background: index % 2 === 0 ? '#f0f9ff' : '#fff' }}>
                    <td style={td}>{formatDate(payment.paymentDate)}</td>
                    <td style={td}>{payment.studentName}</td>
                    <td style={td}>{payment.amount.toFixed(2)} {payment.currency}</td>
                    <td style={td}>{payment.method}</td>
                    <td style={td}>{payment.reference || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">{content?.payment_noPaymentHistory || 'Aucun paiement enregistré'}</p>
        )}
      </section>
    </div>
  );
};

const th = { padding: '8px 12px', textAlign: 'left', fontWeight: 600 };
const td = { padding: '8px 12px' };

export default PaymentsPage;





