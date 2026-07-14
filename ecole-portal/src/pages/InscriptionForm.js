import React, { useState } from "react";
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";
import "../cssFiles/Inscription.css";

const InscriptionForm = ({isAuthorized, language }) => {
const content = language === "fr" ? fr : language === "en" ? en : ar;
  const [formData, setFormData] = useState({
    studentName: '',
    birthDate: '',
    classLevel: '',
    guardianContact: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmittedData(formData);
    setSubmitted(true);

    // Reset form
    setFormData({
      studentName: '',
      birthDate: '',
      classLevel: '',
      guardianContact: '',
    });

    // Auto-hide confirmation after 4 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="inscription-container">
      {submitted && submittedData && (
        <div className="inscription-overlay">
          <div className="inscription-confirmation">
            <div className="confirmation-content">
              <div className="confirmation-checkmark">✓</div>
              <h3>{content.submissionSuccess || "Inscription enregistrée!"}</h3>
              <p>{content.studentName}: <strong>{submittedData.studentName}</strong></p>
              <p className="confirmation-message">
                {content.confirmationMessage || "Votre demande d'inscription a été reçue avec succès."}
              </p>
            </div>
          </div>
        </div>
      )}
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
