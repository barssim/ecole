import React, { useState } from "react";
import fr from "../locales/header/fr.json";
import ar from "../locales/header/ar.json";
import en from "../locales/header/en.json";

const Contact = ({ language }) => {
  const content =
    language === "fr" ? fr : language === "en" ? en : ar;
  const isArabic = language === "ar";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="contact-page" dir={isArabic ? "rtl" : "ltr"}>
      <div className="contact-card">
        <div className="contact-intro">
          <span className="contact-eyebrow">{content.contact || "Contact"}</span>
          <h2>{content.contactUs}</h2>
          <p className="contact-subtitle">{content.companyAdresse}</p>
        </div>

        {submitted && (
          <div className="contact-success">{content.thankForContact}</div>
        )}

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-field">
            <label htmlFor="contact-name">{content.name || "Nom"}</label>
            <input
              id="contact-name"
              type="text"
              name="name"
              placeholder={content.name || "Votre nom"}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-email">{content.email || "Email"}</label>
            <input
              id="contact-email"
              type="email"
              name="email"
              placeholder={content.email || "Votre email"}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-message">{content.message || "Message"}</label>
            <textarea
              id="contact-message"
              name="message"
              placeholder={content.message || "Votre message"}
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
            />
          </div>

          <button type="submit" className="contact-submit">
            {content.submit}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
