import React, { useEffect, useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import '../cssFiles/PaymentsPage.css';

const PaymentsPage = ({ language }) => {
  const content = language === 'fr' ? fr : language === 'en' ? en : ar;
  const [paymentNotice, setPaymentNotice] = useState(null);
  const [allNotices, setAllNotices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);

  const baseUrl = (process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8085').replace(/\/$/, '');
  const token = sessionStorage.getItem('jwt_token');
  const studentName = localStorage.getItem('userName') || 'Default Student';

  useEffect(() => {
    fetchData();
  }, [studentName]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current payment notice
      const noticeResponse = await fetch(`${baseUrl}/api/paymentNotice?studentName=${encodeURIComponent(studentName)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (noticeResponse.ok) {
        const notice = await noticeResponse.json();
        setPaymentNotice(notice);
      }

      // Fetch all payment notices for this student
      const allNoticesResponse = await fetch(`${baseUrl}/api/paymentNotices?studentName=${encodeURIComponent(studentName)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (allNoticesResponse.ok) {
        const noticesData = await allNoticesResponse.json();
        setAllNotices(Array.isArray(noticesData) ? noticesData : []);
      }

      // Fetch payment history
      const paymentsResponse = await fetch(`${baseUrl}/api/payments?studentName=${encodeURIComponent(studentName)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      }
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
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
          <div className="invoices-list">
            {allNotices.map((notice) => (
              <div key={notice.id} className="invoice-item">
                <div className="invoice-item-header">
                  <div className="invoice-item-number">
                    <strong>{notice.invoiceNumber}</strong>
                  </div>
                  <div className={`status-badge ${getStatusBadgeClass(notice.status)}`}>
                    {getStatusLabel(notice.status)}
                  </div>
                </div>
                <div className="invoice-item-details">
                  <div className="detail-row">
                    <label>{content?.payment_studentName || 'Élève'}:</label>
                    <span>{notice.studentName}</span>
                  </div>
                  <div className="detail-row">
                    <label>{content?.payment_class || 'Classe'}:</label>
                    <span>{notice.className}</span>
                  </div>
                  <div className="detail-row">
                    <label>{content?.payment_invoiceDate || 'Date de facture'}:</label>
                    <span>{formatDate(notice.invoiceDate)}</span>
                  </div>
                  <div className="detail-row">
                    <label>{content?.payment_dueDate || 'Échéance'}:</label>
                    <span>{formatDate(notice.dueDate)}</span>
                  </div>
                  {notice.paidDate && (
                    <div className="detail-row">
                      <label>{content?.payment_paidDate || 'Date de paiement'}:</label>
                      <span>{formatDate(notice.paidDate)}</span>
                    </div>
                  )}
                </div>
                <div className="invoice-item-amount">
                  <strong>{notice.totalAmount.toFixed(2)} {notice.currency}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">{content?.payment_noInvoices || 'Aucune facture générée'}</p>
        )}
      </section>
      <section className="payment-history-section">
        <h2>{content?.payment_paymentHistory || 'Historique des Paiements'}</h2>
        {payments && payments.length > 0 ? (
          <div className="payment-table-wrapper">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>{content?.payment_date || 'Date'}</th>
                  <th>{content?.payment_studentName || 'Élève'}</th>
                  <th>{content?.payment_amount || 'Montant'}</th>
                  <th>{content?.payment_method || 'Méthode'}</th>
                  <th>{content?.payment_reference || 'Référence'}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.paymentDate)}</td>
                    <td>{payment.studentName}</td>
                    <td className="amount">{payment.amount.toFixed(2)} {payment.currency}</td>
                    <td>{payment.method}</td>
                    <td>{payment.reference || '-'}</td>
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

export default PaymentsPage;





