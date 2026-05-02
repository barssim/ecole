import React, { useEffect, useState } from "react";
import axios from "axios";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

const ExamProgram = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 const roles = JSON.parse(localStorage.getItem("user_roles") || "[]");
 console.log("User roles:", roles);
 const token = sessionStorage.getItem("jwt_token");
 console.log("Token:", token);
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_GATEWAY_URL}/api/exams`)
      .then((res) => setExams(res.data))
      .catch(() => setError(content.exam_error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto px-6 py-6 bg-white shadow rounded-md">
      <h2 className="text-2xl font-bold text-blue-800">
        {content.exam_program_title}
      </h2>

      {loading ? (
        <p className="text-gray-500">{content.loading}</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : exams.length === 0 ? (
        <p className="text-gray-500">{content.exam_program_empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-collapse text-sm text-left">
            <thead className="bg-blue-100 text-blue-900 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-2 w-[180px]">{content.exam_subject}</th>
                <th className="px-4 py-2 w-[140px]">{content.exam_class}</th>
                <th className="px-4 py-2 w-[130px]">{content.exam_date}</th>
                <th className="px-4 py-2 w-[120px]">{content.exam_start_time}</th>
                <th className="px-4 py-2 w-[120px]">{content.exam_end_time}</th>
                <th className="px-4 py-2 w-[140px]">{content.exam_room}</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam, i) => (
                <tr key={i} className="even:bg-gray-50 hover:bg-blue-50 transition">
                  <td className="px-4 py-2 truncate">{exam.subject}</td>
                  <td className="px-4 py-2">{exam.className}</td>
                  <td className="px-4 py-2">{exam.date}</td>
                  <td className="px-4 py-2">{exam.startTime}</td>
                  <td className="px-4 py-2">{exam.endTime}</td>
                  <td className="px-4 py-2">{exam.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExamProgram;
