import React, { useEffect, useState } from 'react';
import axios from 'axios';
import fr from "../locales/fr.json";
import ar from "../locales/ar.json";
import en from "../locales/en.json";
import { getTenantId } from '../tenant';
import { normalizeRoles } from '../utils/roles';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';
import '../cssFiles/Finance.css';

const SchoolInvoicePreview =  ({language}) => {
                             	let content;

                             if (language === "fr") {
                               content = fr;
                             } else if (language === "en") {
                               content = en;
                             } else {
                               content = ar;
                             };
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const configuredBase = resolveApiBaseUrl('http://localhost:8085');
  const browserIsLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const localhostApiTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBase);
  const inferredRemoteBase = `${window.location.protocol}//${window.location.hostname}:8085`;
  const effectiveBase = localhostApiTarget && !browserIsLocal ? inferredRemoteBase : configuredBase;
  const useRelativeApi = process.env.REACT_APP_USE_RELATIVE_API === 'true';
  const token = sessionStorage.getItem('jwt_token');
  const userRoles = normalizeRoles(JSON.parse(localStorage.getItem('user_roles') || '[]'));

  useEffect(() => {
    const apiBase = effectiveBase.endsWith('/api') ? effectiveBase : `${effectiveBase}/api`;
    const apiUrl = useRelativeApi ? '/api/paymentNotices' : `${apiBase}/paymentNotices`;

    setLoading(true);
    axios.get(apiUrl, {
      headers: {
        'X-Tenant-Id': getTenantId(),
        ...(userRoles.length > 0 ? { 'X-User-Roles': userRoles.join(',') } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    })
      .then((response) => setNotices(Array.isArray(response.data) ? response.data : []))
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'API error while loading payment notices');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatAmount = (notice) => `${Number(notice.totalAmount || 0).toFixed(2)} ${notice.currency || ''}`.trim();

  const statusLabels = {
    paid: content.payment_statusPaid || 'Paid',
    pending: content.payment_statusPending || 'Pending',
    overdue: content.payment_statusOverdue || 'Overdue',
    unpaid: content.payment_statusUnpaid || 'Unpaid',
    partially_paid: content.payment_statusPartiallyPaid || 'Partially Paid',
  };
  const formatStatus = (status) => statusLabels[String(status || '').toLowerCase()] || status;

  return (
    <div className="finance-page" dir={language === "ar" ? 'rtl' : 'ltr'}>
      <div className="finance-header">
        <div>
          <span className="finance-title-badge">{content.finance_badge || "Finance"}</span>
          <h2 className="finance-title">{content.Payment_Notice}</h2>
        </div>
      </div>

      {error && <div className="finance-alert finance-alert-error">{error}</div>}

      {loading ? (
        <p className="finance-loading">{content.loading || 'Loading...'}</p>
      ) : notices.length > 0 ? (
        <div className="finance-table-wrapper">
          <table className="finance-table">
            <thead>
              <tr>
                <th>{content.invoice_number || 'Facture'}</th>
                <th>{content.invoice_recipient}</th>
                <th>{content.invoice_class}</th>
                <th>{content.date}</th>
                <th>{content.invoice_due}</th>
                <th>{content.presence_status || 'Status'}</th>
                <th>{content.amount}</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice) => (
                <tr key={notice.id}>
                  <td><strong>{notice.invoiceNumber}</strong></td>
                  <td>{notice.studentName}</td>
                  <td>{notice.className}</td>
                  <td>{notice.invoiceDate}</td>
                  <td>{notice.dueDate}</td>
                  <td>
                    <span className="finance-status-badge finance-status-badge-inline">{formatStatus(notice.status)}</span>
                  </td>
                  <td className="finance-amount">{formatAmount(notice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="finance-empty">{content.no_payments || 'Aucune facture enregistrée pour le moment.'}</p>
      )}
    </div>
  );
};

export default SchoolInvoicePreview;
