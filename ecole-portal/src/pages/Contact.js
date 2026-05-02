import React, { useState } from "react";
import fr from "../locales/header/fr.json";
import ar from "../locales/header/ar.json";
import en from "../locales/header/en.json";

const Contact = ({ language }) => {
  const content =
    language === "fr" ? fr : language === "en" ? en : ar;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(content.thankForContact);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>{content.contactUs}</h2>
        <input
          type="text"
          name="name"
          placeholder={content.name || "Dein Name"}
          value={formData.name}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="email"
          name="email"
          placeholder={content.email || "Deine E-Mail"}
          value={formData.email}
          onChange={handleChange}
          required
        />
        <br />
        <textarea
          name="message"
          placeholder={content.message || "Deine Nachricht"}
          value={formData.message}
          onChange={handleChange}
          required
          style={{ ...wideInputStyle, minHeight: "140px", resize: "vertical" }}
        />
        <br />
        <button type="submit" style={buttonStyle}>
          {content.submit}
        </button>
    </div>
  );
};

const containerStyle = {
  padding: "40px",
  width: "fit-content",         // Shrinks or grows to fit content width
  height: "auto",               // Grows vertically based on content
  margin: "auto",               // Centers the container if used inside a flex or block layout
  boxSizing: "border-box",      // Includes padding in total size
};


const headingStyle = {
  textAlign: "center",
  marginBottom: "30px",
  fontSize: "28px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const wideInputStyle = {
  padding: "16px",
  border: "2px solid #aaa",
  borderRadius: "6px",
  fontSize: "18px",
  fontWeight: "500",
  width: "100%",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "16px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontSize: "18px",
  fontWeight: "600",
  cursor: "pointer",
  width: "50%",
  alignSelf: "center",
};

export default Contact;
