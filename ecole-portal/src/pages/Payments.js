import React, { useEffect, useState } from 'react';
import axios from 'axios';
import fr from "../locales/fr.json";
import ar from "../locales/ar.json";
import en from "../locales/en.json";

const Payments = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_GATEWAY_URL}/api/payments`)
      .then(response => setPayments(response.data))
      .catch(error => console.error("Error fetching payments:", error));
  }, []);

  return (
   	<div
                                         style={{
                                           display: "flex",
                                           flexDirection: "column",
                                           gap: "10px",
                                           maxWidth: "800px",
                                           margin: "0 auto",
                                           width: "100%"
                                         }}
                                       >
      <h2 className="text-2xl font-bold text-blue-800 mb-6">
        {content.payments_title || "Liste des paiements"}
      </h2>

      {payments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-800 border-collapse">
            <thead className="bg-blue-100 text-left text-blue-900 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3 border">{content.date}</th>
                <th className="px-4 py-3 border">{content.student}</th>
                <th className="px-4 py-3 border">{content.amount}</th>
                <th className="px-4 py-3 border">{content.method}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, i) => (
                <tr key={i} className="even:bg-gray-50 hover:bg-blue-50 transition">
                  <td className="px-4 py-3 border">{payment.date}</td>
                  <td className="px-4 py-3 border">{payment.studentName}</td>
                  <td className="px-4 py-3 border">{payment.amount} {payment.currency}</td>
                  <td className="px-4 py-3 border">{payment.method}</td>
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

export default Payments;
