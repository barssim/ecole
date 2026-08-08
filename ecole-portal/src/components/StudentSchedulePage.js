import React, { useEffect, useState } from "react";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";
import { getTenantId } from "../tenant";
import { createApiUrlFor, readJsonResponse } from "../utils/apiClient";

const StudentSchedulePage = ({ language }) => {
  const content =
    language === "fr" ? fr :
    language === "en" ? en :
    ar;

  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState("");
  const [notice, setNotice] = useState("");
  const userId = localStorage.getItem("userId");
  const currentUserName = (
    localStorage.getItem("LoggedIn")
    || localStorage.getItem("userName")
    || localStorage.getItem("username")
    || ""
  );
  const apiUrlFor = createApiUrlFor('http://localhost:8085');
  const token = sessionStorage.getItem('jwt_token');

  const normalizeText = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const buildHeaders = () => ({
    "X-Tenant-Id": getTenantId(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setNotice("");
      setClassName("");
      try {
        const headers = buildHeaders();
        const classesResponse = await fetch(apiUrlFor('/classes'), { headers });
        const classes = await readJsonResponse(classesResponse, content.schedule_noData || 'Unable to load schedule.');
        const studentClass = Array.isArray(classes)
          ? classes.find((schoolClass) => (schoolClass.students || []).some((student) => normalizeText(student) === normalizeText(currentUserName)))
          : null;

        if (studentClass) {
          setClassName(studentClass.name || '');
          const scheduleResponse = await fetch(apiUrlFor(`/classes/${studentClass.id}/schedule`), { headers });
          const data = await readJsonResponse(scheduleResponse, content.schedule_noData || 'Unable to load schedule.');
          setSchedule(Array.isArray(data) ? data : []);
          if (!Array.isArray(data) || data.length === 0) {
            setNotice(content.schedule_noData || 'No schedule available.');
          }
        } else if (String(userId || '').trim()) {
          const response = await fetch(apiUrlFor(`/studentschedule?user=${userId}`), { headers });
          const data = await readJsonResponse(response, content.schedule_noData || 'Unable to load schedule.');
          setSchedule(Array.isArray(data) ? data : []);
          setNotice(content.schedule_noClass || 'No class assigned yet.');
        } else {
          setSchedule([]);
          setNotice(content.schedule_noClass || 'No class assigned yet.');
        }
      } catch (error) {
        console.error("Failed to fetch student schedule:", error);
        setSchedule([]);
        setNotice(content.schedule_noData || 'No schedule available.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [content.schedule_noClass, content.schedule_noData, currentUserName, userId]);

  const getTranslatedDay = (dayKey) =>
    content[`schedule_${dayKey.toLowerCase()}`] || dayKey;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">{content.schedule_title}</h2>
      {className && (
        <p className="text-sm text-gray-600">
          {content.schedule_classLabel || 'Class'}: <strong>{className}</strong>
        </p>
      )}
      {notice && <p className="text-sm text-gray-500">{notice}</p>}

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
                {(dayPlan.slots || []).map((slot, i) => (
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
