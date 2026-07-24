// src/App.js
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React, { useState } from "react";
import { useEffect } from "react";
import Header from './components/Header';
import Footer from './components/Footer';
import PostInvoice from './components/PostInvoice';
import Menu from './pages/Menu';
import About from './pages/About';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Inscription from './pages/Inscription';
import Contact from './pages/Contact';
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";
import en from "./locales/en.json";
import "./App.css";
import ecole from './ecoleLoader';
import SchoolInvoicePreview from './components/SchoolInvoicePreview';
import Payments from './pages/Payments';
import ExamProgram  from './pages/ExamProgram';
import ProfessorPresence from './components/ProfessorPresence';
import Catalogue from './pages/library/Catalogue';
import Borrow from './pages/library/Borrow';
import Rules from './pages/library/Rules';
import Bibliotheque from './pages/Bibliotheque';
import InscriptionForm from './pages/InscriptionForm';
import { Navigate } from "react-router-dom";
import ClassesPage from './pages/ClassesPage';
import AttestationsPage from './pages/AttestationsPage';
import SharedDocumentsPage from "./pages/SharedDocumentsPage";
import ParentMeetingPage from "./pages/ParentMeetingPage";
import StudentSchedulePage from "./components/StudentSchedulePage";
import TeacherCourses  from "./pages/TeacherCourses";
import PartiesPage  from "./pages/PartiesPage";
import MeetingPage  from "./pages/MeetingPage";
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/ProfilePage';
import TeacherAttendancePage from './pages/TeacherAttendancePage';
import TeacherNotesPage from './pages/TeacherNotesPage';




const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = sessionStorage.getItem("jwt_token");
  const roles = JSON.parse(localStorage.getItem("user_roles") || "[]");
  const isAuthorized = allowedRoles.some(role => roles.includes(role));
  if (!token) return <Navigate to="/login" replace />;
  return isAuthorized ? children : <Navigate to="/unauthorized" replace />;
};

const normalizeHex = (color) => {
  const value = String(color || "").trim();
  const shortHexMatch = value.match(/^#([0-9a-fA-F]{3})$/);
  if (shortHexMatch) {
    const [r, g, b] = shortHexMatch[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return /^#([0-9a-fA-F]{6})$/.test(value) ? value : null;
};

const mixWithWhite = (color, ratio) => {
  const normalized = normalizeHex(color);
  if (!normalized) {
    return color;
  }
  const channels = [1, 3, 5].map((index) => parseInt(normalized.slice(index, index + 2), 16));
  const mixed = channels.map((channel) => Math.round(channel + (255 - channel) * ratio));
  return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
};

function App() {
	const [language, setLanguage] = useState("fr"); // Track current language
  const [isMenuOpen, setIsMenuOpen] = useState(false);
	let content;
  const tenantPrimaryColor = normalizeHex(ecole.primaryColor) || "#007bff";
  const tenantAccentColor = normalizeHex(ecole.accentColor) || mixWithWhite(tenantPrimaryColor, 0.35);
  const tenantSoftColor = normalizeHex(ecole.softColor) || mixWithWhite(tenantPrimaryColor, 0.7);
  const tenantThemeStyle = {
    "--tenant-primary": tenantPrimaryColor,
    "--tenant-accent": tenantAccentColor,
    "--tenant-soft": tenantSoftColor,
  };

if (language === "fr") {
  content = fr;
} else if (language === "en") {
  content = en;
} else {
  content = ar;
};
	const toggleLanguage = () => {
      setLanguage((prevLang) => {
        if (prevLang === "fr") return "ar";
        if (prevLang === "ar") return "en";
        return "fr"; // from "en" back to "fr"
      });
    };
useEffect(() => {
  const token = sessionStorage.getItem("jwt_token");
  if (!token) {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("LoggedIn");
    localStorage.removeItem("user_roles");
  }
}, []);

useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth > 992) {
      setIsMenuOpen(false);
    }
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

const isRtl = language === "ar";

const AppContent = () => {
  const location = useLocation();
  const path = (location.pathname || "").toLowerCase();
  const isHomePage = path === "/" || path === "/home";


  return (
    <div style={tenantThemeStyle}>
			<Header language={language} toggleLanguage={toggleLanguage}/>
      <div className="layout-controls">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? "Close menu" : "Open menu"}
        </button>
      </div>
      <div className={`main-layout ${isRtl ? "layout-rtl" : "layout-ltr"}`}>
				{/* Left Menu */}
        <div className={`left-panel ${isMenuOpen ? "left-panel-open" : ""}`}>
					<Menu language={language} toggleLanguage={toggleLanguage} />
				</div>
        {isMenuOpen && <div className="layout-backdrop" onClick={() => setIsMenuOpen(false)} />}

				{/* Right Content */}
        <div className="center-content">


                 <div className="hero-title" style={{ textAlign: "center" }}>
                   <h1 style={{ color: "var(--tenant-primary, #007bff)" }}>{content.whatWeDo}{ecole.name[language] || ecole.name["fr"]}</h1>
                   <h4 style={{ color: "var(--tenant-accent, #00bbff)" }}>{content.whatYouFind}</h4>
                 </div>
{isHomePage && (
<div className="bounce-container">
  <div className="bounce-content">
    <img src={ecole.logo} width="300" />
  </div>
</div>
)}
                  <div className="routes-wrapper">

                    <Routes>
                      <Route path="/finance/factures" element={<PostInvoice language={language} toggleLanguage={toggleLanguage} />} />
                      <Route path="/finance/paymentNotice" element={<SchoolInvoicePreview  language={language} toggleLanguage={toggleLanguage} />} />
                      <Route path="/finance/payments" element={<Payments language={language} toggleLanguage={toggleLanguage} />} />
                      <Route path="/finance/invoices" element={<PaymentsPage language={language} />} />
                     <Route path="/administration/presence" element={<ProfessorPresence language={language} toggleLanguage={toggleLanguage} />} />
                     <Route path="/administration/classes" element={<ClassesPage language={language} toggleLanguage={toggleLanguage} />} />
                      <Route path="/administration/examens" element={<ExamProgram language={language} toggleLanguage={toggleLanguage} />} />
                      <Route path="/administration/outing" element={<OuttingPage language={language} activityType="sorties" />} />
                      <Route path="/administration/parties" element={<PartiesPage language={language} />} />
                      <Route path="/administration/meetings" element={<MeetingPage language={language} />} />
                      <Route path="/enseignement/parent-meetings" element={<ParentMeetingPage language={language} toggleLanguage={toggleLanguage} />} />
                       <Route path="/enseignant/cours" element={<TeacherCourses language={language} toggleLanguage={toggleLanguage} />} />
                      <Route path="/enseignant/attendance" element={<TeacherAttendancePage language={language} />} />
                      <Route path="/enseignant/absence" element={<TeacherAttendancePage language={language} />} />
                      <Route path="/enseignant/notes" element={<TeacherNotesPage language={language} />} />
                      <Route path="/services/bibliotheque" element={<Bibliotheque />} />
                      <Route path="/services/bibliotheque/catalogue" element={<Catalogue />} />
                      <Route path="/services/bibliotheque/emprunts" element={<Borrow />} />
                      <Route path="/services/bibliotheque/reglement" element={<Rules />} />
				      <Route path="/login" element={<Login language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/logout" element={<Logout language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/about" element={<About language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/inscription" element={<Inscription language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/contact" element={<Contact language={language} toggleLanguage={toggleLanguage} />} />
              <Route path="/profile" element={<ProfilePage language={language} />} />
				      <Route path="/students/schedule" element={<StudentSchedulePage language={language} toggleLanguage={toggleLanguage} />} />
				       <Route path="/parents/inscription" element={<InscriptionForm  isAuthorized={true} language={language} toggleLanguage={toggleLanguage} />} />
                   </Routes>
                 </div>
</div>

               <div
                 className="right-panel"
               >
                 <img
                   src={ecole.image}
                   alt="ecole image"
                   style={{ width: "100%", height: "auto" }}
                 />
</div>
			</div>
			<br />
			<Footer language={language} toggleLanguage={toggleLanguage} />
    </div>
	);
};

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
