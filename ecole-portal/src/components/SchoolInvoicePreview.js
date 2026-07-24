import React, { useEffect, useState } from 'react';
import axios from 'axios';
import fr from "../locales/fr.json";
import ar from "../locales/ar.json";
import en from "../locales/en.json";
import { getTenantId } from '../tenant';
import { normalizeRoles } from '../utils/roles';
import { resolveApiBaseUrl } from '../utils/apiBaseUrl';

const SchoolInvoicePreview =  ({language}) => {
                             	let content;

                             if (language === "fr") {
                               content = fr;
                             } else if (language === "en") {
                               content = en;
                             } else {
                               content = ar;
                             };
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const baseUrl = resolveApiBaseUrl('http://localhost:8085');
  const token = sessionStorage.getItem('jwt_token');
  const studentName = localStorage.getItem('userName') || '';
  const userRoles = normalizeRoles(JSON.parse(localStorage.getItem('user_roles') || '[]'));

  useEffect(() => {
    axios.get(`${baseUrl}/api/paymentNotice?studentName=${encodeURIComponent(studentName)}`, {
      headers: {
        'X-Tenant-Id': getTenantId(),
        ...(userRoles.length > 0 ? { 'X-User-Roles': userRoles.join(',') } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    })
      .then((response) => setInvoice(response.data))
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'API error while loading payment notice');
      });
  }, [baseUrl, studentName, token]);

  if (error) return <div>{error}</div>;
  if (!invoice) return <div>Loading...</div>;

  return (
    <div dir={language === "ar" ? 'rtl' : 'ltr'}>

      <h2>{content.Payment_Notice}: {invoice.invoiceNumber}</h2>
      <p>{content.date}: {invoice.invoiceDate}</p>
      <p>{content.invoice_due}: {invoice.dueDate}</p>
      <p>{content.invoice_recipient}: {invoice.studentName}</p>
      <p>{content.invoice_class}: {invoice.className}</p>
      <p>{content.presence_status || 'Status'}: {invoice.status}</p>
      <h4>{content.invoice_total}: {invoice.totalAmount} {invoice.currency}</h4>
    </div>
  );
};

export default SchoolInvoicePreview;
