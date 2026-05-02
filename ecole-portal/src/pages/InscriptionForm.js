import React, { useState } from "react";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

const InscriptionForm = ({isAuthorized, language }) => {
const content = language === "fr" ? fr : language === "en" ? en : ar;
  const [formData, setFormData] = useState({
    studentName: '',
    birthDate: '',
    classLevel: '',
    guardianContact: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="inscription-container">
      <h2>📝 {content.title}</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="studentName"
          type="text"
          placeholder={content.name}
          value={formData.studentName}
          onChange={handleChange}
          required
        />
        <input
          name="birthDate"
          type="date"
          placeholder={content.birth}
          value={formData.birthDate}
          onChange={handleChange}
          required
        />
        <select
          name="classLevel"
          value={formData.classLevel}
          onChange={handleChange}
          required
        >
          <option value="">{content.class}</option>
          <option value="CP">{content.cp}</option>
          <option value="CE1">{content.ce1}</option>
          <option value="CE2">{content.ce2}</option>
        </select>
        <input
          name="guardianContact"
          type="tel"
          placeholder={content.contact}
          value={formData.guardianContact}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          disabled={!isAuthorized}
        >
          {content.submit}
        </button>
      </form>
    </div>
  );
};

export default InscriptionForm;
