import React, { useState } from "react";
import { Link } from "react-router-dom";


const AdminBlock = ({ isAuthorized, content }) => {
  const [showActivites, setShowActivites] = useState(false);

  return (
   <div className="bg-white p-4 shadow-md rounded-md">

          <li
                   className={`menu-item ${isAuthorized ? "menu-item-active" : "menu-item-inactive"}`}
                   onClick={() => isAuthorized && setShowActivites(!showActivites)}
                 >
                   {content.administration}
                 </li>
        {showActivites && (
      <ul className="ml-6 mt-2 space-y-1 list-disc list-inside">
        <li>
          <Link
            to="/administration/classes"
            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 inline-block"
          >
            {content.classes}
          </Link>
        </li>
        <li>
          <Link
            to="/administration/attestations"
            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 inline-block"
          >
            {content.attestations}
          </Link>
        </li>
        <li>
          <Link
            to="/administration/examens"
            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 inline-block"
          >
            {content.examens}
          </Link>
        </li>
        <li>
          <Link
            to="/administration/presence"
            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 inline-block"
          >
            {content.presence}
          </Link>
        </li>
        <li>
          <button
            onClick={() => setShowActivites(!showActivites)}
            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 inline-block w-full text-left"
          >
            {content.activités || "Activités"}
          </button>
          {showActivites && (
            <ul className="ml-4 mt-1 list-[circle] space-y-1">
              <li>
                <Link
                  to="/administration/activites/sorties"
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 inline-block"
                >
                  {content.sorties || "Sorties"}
                </Link>
              </li>
              <li>
                <Link
                  to="/administration/activites/fetes"
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 inline-block"
                >
                  {content.fetes || "Fêtes"}
                </Link>
              </li>
              <li>
                <Link
                  to="/administration/activites/reunions"
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 inline-block"
                >
                  {content.reunions || "Réunions"}
                </Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
      )}
    </div>
  )
}

export default AdminBlock

