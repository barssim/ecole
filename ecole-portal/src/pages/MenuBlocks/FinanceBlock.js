import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../App.css";

const FinanceBlock = ({ isAuthorized, content }) => {
  const [showActivites, setShowActivites] = useState(false);

  return (
    <div className="bg-white p-4 shadow-md rounded-md">

  <li
           className={`menu-item ${isAuthorized ? "menu-item-active" : "menu-item-inactive"}`}
           onClick={() => isAuthorized && setShowActivites(!showActivites)}
         >
           {content.finance}
         </li>
      {showActivites && (
        <ul className="ml-6 mt-2 space-y-1 list-disc list-inside">
          <li>
            <Link
              to="/finance/payments"
              className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 inline-block"
            >
              {content.payments || "Payments"}
            </Link>
          </li>
          <li>
            <Link
              to="/finance/factures"
              className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 inline-block"
            >
              {content.factures || "Factures"}
            </Link>
          </li>
          <li>
            <Link
              to="/finance/paymentNotice"
              className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 inline-block"
            >
              {content.Payment_Notice || "Payment Notice"}
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
};

export default FinanceBlock;
