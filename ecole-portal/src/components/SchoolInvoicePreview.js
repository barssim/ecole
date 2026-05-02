import React, { useEffect, useState } from 'react';
import axios from 'axios';
import fr from "../locales/fr.json";
import ar from "../locales/ar.json";
import en from "../locales/en.json";

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

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}/api/paymentNotice`)
      .then((response) => setInvoice(response.data))
      .catch((error) => console.error('API error:', error));
  }, []);

  if (!invoice) return <div>Loading...</div>;

  return (
    <div dir={language === "ar" ? 'rtl' : 'ltr'}>

      <h2>{content.Payment_Notice}: {invoice.invoiceNumber}</h2>
      <p>{content.date}: {invoice.invoiceDate}</p>
      <p>{content.invoice_due}: {invoice.dueDate}</p>
      <p>{content.invoice_recipient}: {invoice.recipient}</p>
      <p>{content.invoice_class}: {invoice.class}</p>

      <h3>{content.invoice_fees_title}:</h3>
      <ul>
        {invoice.items.map((item, index) => (
          <li key={index}>
            {item.label}: {item.amount} {invoice.currency}
          </li>
        ))}
      </ul>

      <h4>{content.invoice_total}: {invoice.total} {invoice.currency}</h4>
    </div>
  );
};

export default SchoolInvoicePreview;
