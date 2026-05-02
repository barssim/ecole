import React, { useEffect, useState } from "react";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

const StudentSchedulePage = ({ language }) => {
  const content =
    language === "fr" ? fr :
    language === "en" ? en :
    ar;

  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_GATEWAY_URL}/api/studentschedule?user=${userId}`
        );
        const data = await response.json();
        setSchedule(data);
      } catch (error) {
        console.error("Failed to fetch student schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const getTranslatedDay = (dayKey) =>
    content[`schedule_${dayKey.toLowerCase()}`] || dayKey;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">{content.schedule_title}</h2>

      {loading ? (
        <p className="italic text-gray-500">Loading...</p>
      ) : schedule.length === 0 ? (
        <p className="italic text-gray-500">{content.schedule_noData}</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto py-2">
          {schedule.map((dayPlan, index) => (
            <div
              key={index}
              className="min-w-[16rem] bg-gray-100 p-4 rounded shadow flex-shrink-0"
            >
              <h3 className="font-semibold text-lg mb-2">
                {getTranslatedDay(dayPlan.day)}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {dayPlan.slots.map((slot, i) => (
                  <li key={i}>{slot}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentSchedulePage;
