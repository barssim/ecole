import React, { useState } from "react";
import en from "../locales/en.json";
import fr from "../locales/fr.json";
import ar from "../locales/ar.json";

const OuttingPage = ({ language }) => {
  const content =
    language === "fr" ? fr :
    language === "en" ? en :
    ar;
  const userRoles = JSON.parse(localStorage.getItem("user_roles") || "[]");
        const adminRoles = ["manager", "admin"];
        const isAdminAuthorized = adminRoles.some(role => userRoles.includes(role));
  const [outings, setOutings] = useState([]);
  const [form, setForm] = useState({
    title: "",
    date: "",
    destination: "",
    description: ""
  });
  const [selectedOuting, setSelectedOuting] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {

    e.preventDefault();

    if (isEditing && selectedOuting) {
      // Update existing outing
      setOutings(
        outings.map((o) =>
          o.id === selectedOuting.id ? { ...o, ...form } : o
        )
      );
      setIsEditing(false);
      setSelectedOuting(null);
    } else {
      // Add new outing
      const newOuting = { ...form, id: Date.now() };
      setOutings([...outings, newOuting]);
    }

    // Reset form
    setForm({ title: "", date: "", destination: "", description: "" });
  };

  const handleSelect = (outing) => {
    setSelectedOuting(outing);
    setForm({
      title: outing.title,
      date: outing.date,
      destination: outing.destination,
      description: outing.description
    });
    setIsEditing(true);
  };

  const handleRemove = (id) => {

    setOutings(outings.filter((o) => o.id !== id));
    if (selectedOuting && selectedOuting.id === id) {
      setSelectedOuting(null);
      setIsEditing(false);
      setForm({ title: "", date: "", destination: "", description: "" });
    }
  };

  const isArabic = language === "ar";

  return (
    <div
      style={{
        padding: "2rem",
        direction: isArabic ? "rtl" : "ltr",
        textAlign: isArabic ? "right" : "left"
      }}
    >
      <h1>{content.outing_page_title}</h1>
      <h3>{content.outing_add_title}</h3>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder={content.outing_title}
          required
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <input
          name="destination"
          value={form.destination}
          onChange={handleChange}
          placeholder={content.outing_destination}
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder={content.outing_description}
        />
        {isAdminAuthorized && (
        <button type="submit">
          {isEditing ? content.outing_update_button : content.outing_add_button}
        </button>
        )}
      </form>

      <hr />

      <ul style={{ listStyle: "none", padding: 0 }}>
        {outings.map((outing) => (
          <li
            key={outing.id}
            style={{
              border:
                selectedOuting?.id === outing.id
                  ? "2px solid blue"
                  : "1px solid #ccc",
              borderRadius: "8px",
              marginBottom: "10px",
              padding: "10px"
            }}
          >
            <strong>{outing.title}</strong> — {outing.date} —{" "}
            {outing.destination}
            <p>{outing.description}</p>
            <button onClick={() => handleSelect(outing)}>
              {content.outing_select_button}
            </button>
            {isAdminAuthorized && (
            <button
              onClick={() => handleRemove(outing.id)}
              style={{ marginLeft: "10px", color: "red" }}
            >
              {content.outing_remove_button}
            </button>
            )}
          </li>
        ))}
      </ul>

      {selectedOuting && (
        <div style={{ borderTop: "2px solid #ddd", paddingTop: "10px" }}>
          <h3>{content.outing_selected_label}:</h3>
          <p><b>{content.outing_title}:</b> {selectedOuting.title}</p>
          <p><b>{content.outing_date}:</b> {selectedOuting.date}</p>
          <p><b>{content.outing_destination}:</b> {selectedOuting.destination}</p>
          <p><b>{content.outing_description}:</b> {selectedOuting.description}</p>
        </div>
      )}
    </div>
  );
};

export default OuttingPage;
