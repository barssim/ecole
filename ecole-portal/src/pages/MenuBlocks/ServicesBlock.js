import React, { useState } from "react";
import { Link } from "react-router-dom";


const ServicesBlock = ({ isAuthorized, content }) => {
const [showActivites, setShowActivites] = useState(false);
  return (
     <div className="bg-white p-4 shadow-md rounded-md">
             <li
                      className={`menu-item ${isAuthorized ? "menu-item-active" : "menu-item-inactive"}`}
                      onClick={() => isAuthorized && setShowActivites(!showActivites)}
                    >
                      {content.services}
                    </li>
                    {showActivites && (
            <ul className="ml-6 mt-2 space-y-1 list-disc list-inside">
              <li>
                <Link
                  to="/services/bibliotheque"
                  className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded hover:bg-purple-200 inline-block"
                >
                  {content.bibliotheque || "Bibliothèque"}
                </Link>
              </li>
              <li>
                <Link
                  to="/services/cantine"
                  className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded hover:bg-purple-200 inline-block"
                >
                  {content.cantine || "Cantine"}
                </Link>
              </li>
              <li>
                <Link
                  to="/services/transport"
                  className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded hover:bg-purple-200 inline-block"
                >
                  {content.transport || "Transport"}
                </Link>
              </li>
              <li>
                <Link
                  to="/services/sport"
                  className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded hover:bg-purple-200 inline-block"
                >
                  {content.sport || "Sport"}
                </Link>
              </li>
            </ul>
            )}
          </div>
  );
}

export default ServicesBlock;

