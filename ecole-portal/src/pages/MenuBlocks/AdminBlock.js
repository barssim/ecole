import React, { useState } from "react";
import { Link } from "react-router-dom";

const AdminBlock = ({ isAuthorized, canAccessAttestations = false, content }) => {
  const [showActivites, setShowActivites] = useState(false);
  const canOpenAdministration = isAuthorized || canAccessAttestations;

  return (
   <div className="bg-white p-4 shadow-md rounded-md">

          <li
                   className={`menu-item ${canOpenAdministration ? "menu-item-active" : "menu-item-inactive"}`}
                   onClick={() => canOpenAdministration && setShowActivites(!showActivites)}
                 >
                   {content.administration}
                 </li>
        {showActivites && (
      <ul className="ml-6 mt-2 space-y-1 list-disc list-inside">
        {isAuthorized && (
        <li>
          <Link
            to="/administration/classes"
            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 inline-block"
          >
            {content.classes}
          </Link>
        </li>
        )}
        {(isAuthorized || canAccessAttestations) && (
        <li>
          <Link
            to="/administration/attestations"
            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 inline-block"
          >
            {content.attestations}
          </Link>
        </li>
        )}
        {isAuthorized && (
        <li>
          <Link
            to="/administration/examens"
            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 inline-block"
          >
            {content.examens}
          </Link>
        </li>
        )}
        {isAuthorized && (
        <li>
          <Link
            to="/administration/presence"
            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 inline-block"
          >
            {content.presence}
          </Link>
        </li>
        )}
        {isAuthorized && (
        <li>
          <Link
            to="/administration/activites/sorties"
            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 inline-block"
          >
            {content.sorties}
          </Link>
        </li>
        )}
        {isAuthorized && (
        <li>
          <Link
            to="/administration/activites/fetes"
            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 inline-block"
          >
            {content.fetes}
          </Link>
        </li>
        )}
        {isAuthorized && (
        <li>
          <Link
            to="/administration/activites/reunions"
            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 inline-block"
          >
            {content.reunions}
          </Link>
        </li>
        )}
      </ul>
      )}
    </div>
  )
}

export default AdminBlock
