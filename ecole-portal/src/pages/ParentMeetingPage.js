import React from "react";

const ParentMeetingPage = () => {
  const meetings = [
    { id: 1, title: "Réunion parents-professeurs - Octobre", date: "2025-10-15", location: "Salle B1" },
    { id: 2, title: "Orientation scolaire - Terminale", date: "2025-11-10", location: "Salle A2" }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">👨‍👩‍👧 Réunions avec les parents</h2>
      <ul className="space-y-4">
        {meetings.map(meeting => (
          <li key={meeting.id} className="bg-gray-100 p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-medium">{meeting.title}</p>
              <p className="text-sm text-gray-600">📅 {meeting.date}</p>
              <p className="text-sm text-gray-600">📍 {meeting.location}</p>
            </div>
            <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
              📄 Voir les détails
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ParentMeetingPage;
