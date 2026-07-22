import React, { useEffect, useState } from "react";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

const ProfessorPresence = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const today = new Date().toISOString().split("T")[0];

  const [presenceList, setPresenceList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = (process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8085').replace(/\/$/, '');
  const token = sessionStorage.getItem('jwt_token');
  const userRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');
  const rolesHeader = userRoles.join(',');

  useEffect(() => {
    const fetchPresence = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${baseUrl}/api/presence/professors?date=${selectedDate}`, {
          headers: {
            'Content-Type': 'application/json',
            'X-User-Roles': rolesHeader,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error(content.presence_error || 'Failed to fetch attendance');
        }

        const data = await response.json();
        setPresenceList(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        setError(fetchError.message || content.presence_error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresence();
  }, [baseUrl, selectedDate, token, rolesHeader, content.presence_error]);

  const presentCount = presenceList.filter((item) => item.status === 'present').length;
  const lateCount = presenceList.filter((item) => item.status === 'late').length;
  const absentCount = presenceList.filter((item) => item.status === 'absent').length;

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
                                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                                    >
      <h2 className="text-2xl font-bold mb-4 text-blue-800">
        {content.presence_title} – {selectedDate}
      </h2>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>{content.payment_date || 'Date'}</span>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#ecfdf5', padding: 14, borderRadius: 10 }}>
          <strong>{content.presence_status_present}</strong>
          <div>{presentCount}</div>
        </div>
        <div style={{ background: '#fef9c3', padding: 14, borderRadius: 10 }}>
          <strong>{content.presence_status_late}</strong>
          <div>{lateCount}</div>
        </div>
        <div style={{ background: '#fee2e2', padding: 14, borderRadius: 10 }}>
          <strong>{content.presence_status_absent}</strong>
          <div>{absentCount}</div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">{content.presence_loading}</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : presenceList.length === 0 ? (
        <p className="text-gray-500">{content.presence_empty}</p>
      ) : (
       <table className="w-full text-sm border-separate border-spacing-y-1">
         <thead  className="bg-blue-100 sticky top-0 shadow-sm z-10">
           <tr>
             <th className="px-4 py-2 text-left rounded-tl-md">{content.presence_name}</th>
             <th className="px-4 py-2 text-left">{content.payment_date || 'Date'}</th>
             <th className="px-4 py-2 text-left">{content.presence_scheduled}</th>
             <th className="px-4 py-2 text-left">{content.presence_checkin}</th>
             <th className="px-4 py-2 text-left">{content.presence_status}</th>
             <th className="px-4 py-2 text-left rounded-tr-md">{content.presence_notes || 'Notes'}</th>
           </tr>
         </thead>
         <tbody>
           {presenceList.map((prof, index) => (
             <tr
               key={index}
               className="bg-white hover:bg-blue-50 transition rounded shadow-sm"
             >
               <td className="px-4 py-2 font-medium text-gray-800">{prof.teacherName}</td>
               <td className="px-4 py-2 text-gray-700">{prof.attendanceDate}</td>
               <td className="px-4 py-2 text-gray-700">{prof.scheduledTime}</td>
               <td className="px-4 py-2 text-gray-700">
                 {prof.checkInTime ? prof.checkInTime : (
                   <span className="text-gray-400" title="Non renseigné">–</span>
                 )}
               </td>
               <td className="px-4 py-2">
                 <span className="inline-flex items-center gap-1 font-semibold">
                    {prof.status === "present" && (
                     <>
                       <span className="w-2 h-2 bg-green-500 rounded-full" />
                       <span className="text-green-600">{content.presence_status_present}</span>
                     </>
                   )}
                    {prof.status === "late" && (
                     <>
                       <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                       <span className="text-yellow-600">{content.presence_status_late}</span>
                     </>
                   )}
                    {prof.status === "absent" && (
                     <>
                       <span className="w-2 h-2 bg-red-500 rounded-full" />
                       <span className="text-red-600">{content.presence_status_absent}</span>
                     </>
                   )}
                 </span>
               </td>
               <td className="px-4 py-2 text-gray-700">{prof.notes || '—'}</td>
             </tr>
           ))}
         </tbody>
       </table>

      )}
    </div>
  );
};

export default ProfessorPresence;
