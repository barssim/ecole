import React, { useEffect, useState } from "react";
import axios from "axios";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

const ProfessorPresence = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const today = new Date().toISOString().split("T")[0];

  const [presenceList, setPresenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
   try {
    axios
      .get(`${process.env.REACT_APP_API_GATEWAY_URL}/api/presence/professors`)
      .then((response) => setPresenceList(response.data))
      .finally(() => setLoading(false));
       } catch (error) {
              console.error(content.presence_error);
       }
  }, []);

  const renderStatus = (status) => {
    switch (status) {
      case "Present":
        return (
          <span className="text-green-600 font-semibold">
            {content.presence_status_present}
          </span>
        );
      case "Late":
        return (
          <span className="text-yellow-600 font-semibold">
            {content.presence_status_late}
          </span>
        );
      case "Absent":
      default:
        return (
          <span className="text-red-600 font-semibold">
            {content.presence_status_absent}
          </span>
        );
    }
  };

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
      <h2 className="text-2xl font-bold mb-4 text-blue-800">
        {content.presence_title} – {today}
      </h2>

      {loading ? (
        <p className="text-gray-500">{content.presence_loading}</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : presenceList.length === 0 ? (
        <p className="text-gray-500">{content.presence_empty}</p>
      ) : (
       <table  dir={language === 'ar' ? 'rtl' : 'ltr'} className="w-full text-sm border-separate border-spacing-y-1">
         <thead  className="bg-blue-100 sticky top-0 shadow-sm z-10">
           <tr>
             <th className="px-4 py-2 text-left rounded-tl-md">{content.presence_name}</th>
             <th className="px-4 py-2 text-left">{content.presence_scheduled}</th>
             <th className="px-4 py-2 text-left">{content.presence_checkin}</th>
             <th className="px-4 py-2 text-left rounded-tr-md">{content.presence_status}</th>
           </tr>
         </thead>
         <tbody>
           {presenceList.map((prof, index) => (
             <tr
               key={index}
               className="bg-white hover:bg-blue-50 transition rounded shadow-sm"
             >
               <td className="px-4 py-2 font-medium text-gray-800">{prof.name}</td>
               <td className="px-4 py-2 text-gray-700">{prof.scheduledTime}</td>
               <td className="px-4 py-2 text-gray-700">
                 {prof.checkInTime ? (
                   prof.checkInTime
                 ) : (
                   <span className="text-gray-400" title="Non renseigné">–</span>
                 )}
               </td>
               <td className="px-4 py-2">
                 <span className="inline-flex items-center gap-1 font-semibold">
                   {prof.status === "Present" && (
                     <>
                       <span className="w-2 h-2 bg-green-500 rounded-full" />
                       <span className="text-green-600">{content.presence_status_present}</span>
                     </>
                   )}
                   {prof.status === "Late" && (
                     <>
                       <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                       <span className="text-yellow-600">{content.presence_status_late}</span>
                     </>
                   )}
                   {prof.status === "Absent" && (
                     <>
                       <span className="w-2 h-2 bg-red-500 rounded-full" />
                       <span className="text-red-600">{content.presence_status_absent}</span>
                     </>
                   )}
                 </span>
               </td>
             </tr>
           ))}
         </tbody>
       </table>

      )}
    </div>
  );
};

export default ProfessorPresence;
