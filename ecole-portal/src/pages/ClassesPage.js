import React, { useEffect, useState } from 'react';
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

const ClassesPage = ({ language }) => {
const content = language === "fr" ? fr : language === "en" ? en : ar;
  const [classes, setClasses] = useState([]);
  const [expandedClassId, setExpandedClassId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedClassId(expandedClassId === id ? null : id);
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_GATEWAY_URL}/api/classes`);
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      }
    };

    fetchClasses();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">🏫 {content.classes_title}</h2>

      {classes.map((cls) => (
        <div key={cls.id} className="bg-gray-100 rounded shadow p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">{cls.name}</span>
            <div className="space-x-2">
              <button
                onClick={() => toggleExpand(cls.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                {expandedClassId === cls.id
                  ? content.classes_hideStudents
                  : content.classes_showStudents}
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                {content.classes_addStudent}
              </button>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                {content.classes_editClass}
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                {content.classes_removeClass}
              </button>
            </div>
          </div>

          {expandedClassId === cls.id && (
            <ul className="mt-3 ml-4 list-disc list-inside text-sm space-y-1">
              {cls.students.length > 0 ? (
                cls.students.map((student, index) => (
                  <li key={index}>{student}</li>
                ))
              ) : (
                <li className="italic text-gray-500">
                  {content.classes_noStudents}
                </li>
              )}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default ClassesPage;
