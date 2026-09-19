// src/App.js
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import { fetchTenantCustomization, getFallbackCustomization } from './ecoleLoader';
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
import ClassManagePage from './pages/ClassManagePage';
import AttestationsPage from './pages/AttestationsPage';
import SharedDocumentsPage from "./pages/SharedDocumentsPage";
import ParentMeetingPage from "./pages/ParentMeetingPage";
import StudentSchedulePage from "./components/StudentSchedulePage";
import TeacherCourses  from "./pages/TeacherCourses";
import StudentCoursesPage from "./pages/StudentCoursesPage";
import StudentAssignmentsPage from "./pages/StudentAssignmentsPage";
import TeacherCourseDetails from "./pages/TeacherCourseDetails";
import PartiesPage  from "./pages/PartiesPage";
import MeetingPage  from "./pages/MeetingPage";
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/ProfilePage';
import TeacherAttendancePage from './pages/TeacherAttendancePage';
import TeacherNotesPage from './pages/TeacherNotesPage';
import OutingPage from './pages/OutingPage';
import TenantCustomizationPage from './pages/TenantCustomizationPage';
import TeacherAssignmentsPage from './pages/TeacherAssignmentsPage';
import { getTenantId } from './tenant';




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

const HomeLanding = ({ content, language, tenantCustomization }) => {
  const navigate = useNavigate();
  const schoolName = tenantCustomization.name?.[language] || tenantCustomization.name?.["fr"] || "School";
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <main className="home-landing" dir={language === "ar" ? "rtl" : "ltr"}>
      <section className="home-hero-card">
        <div className="home-hero-copy">
          <span className="home-eyebrow">ECole • PORTAIL DIGITAL</span>
          <h1>{content.whatWeDo}<strong>{schoolName}</strong></h1>
          <p>{content.whatYouFind}</p>
          <div className="home-hero-actions">
            <button className="home-primary-action" onClick={() => navigate(isLoggedIn ? "/profile" : "/login")}>
              {isLoggedIn ? content.profile : content.connection}
              <span aria-hidden="true">→</span>
            </button>
            <button className="home-secondary-action" onClick={() => navigate("/about")}>
              {content.whoAreWe}
            </button>
          </div>
        </div>
      </section>

      <section className="home-stat-grid" aria-label="Portal highlights">
        <article className="home-stat-card">
          <span className="home-stat-icon">01</span>
          <div><strong>{content.annonces}</strong><span>{content.messages}</span></div>
        </article>
        <article className="home-stat-card">
          <span className="home-stat-icon">02</span>
          <div><strong>{content.activités}</strong><span>{content.sorties}</span></div>
        </article>
        <article className="home-stat-card home-stat-card-accent">
          <span className="home-stat-icon">03</span>
          <div><strong>{content.services}</strong><span>{content.bibliotheque}</span></div>
        </article>
      </section>

      <section className="home-bottom-row">
        <div>
          <span className="home-section-kicker">UN ESPACE, TOUTE L'ÉCOLE</span>
          <h2>{content.whoAreWe}</h2>
        </div>
        <p>{content.welcomeon_site}</p>
        <button className="home-link-action" onClick={() => navigate("/contact")}>
          {content.contact} <span aria-hidden="true">↗</span>
        </button>
      </section>
    </main>
  );
};

function App() {
  const tenantId = getTenantId();
	const [language, setLanguage] = useState("fr"); // Track current language
  const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [tenantCustomization, setTenantCustomization] = useState(() => getFallbackCustomization(tenantId));
	let content;
  const tenantPrimaryColor = normalizeHex(tenantCustomization.primaryColor) || "#007bff";
  const tenantAccentColor = normalizeHex(tenantCustomization.accentColor) || mixWithWhite(tenantPrimaryColor, 0.35);
  const tenantSoftColor = normalizeHex(tenantCustomization.softColor) || mixWithWhite(tenantPrimaryColor, 0.7);
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
  let mounted = true;
  setTenantCustomization(getFallbackCustomization(tenantId));
  fetchTenantCustomization().then((customization) => {
    if (mounted && customization) {
      setTenantCustomization(customization);
    }
  });
  return () => {
    mounted = false;
  };
}, [tenantId]);

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
    <div className="app-shell" style={tenantThemeStyle}>
      <div className="app-header-shell">
        <Header language={language} toggleLanguage={toggleLanguage} tenantCustomization={tenantCustomization}/>
      </div>
      <div className="layout-controls">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
        >
          <span className="menu-toggle-lines" aria-hidden="true">☰</span>
          {isMenuOpen ? content.closeMenu || "Close menu" : content.openMenu || "Open menu"}
        </button>
      </div>
      <div className={`main-layout ${isRtl ? "layout-rtl" : "layout-ltr"}`}>
				{/* Left Menu */}
        <aside className={`left-panel ${isMenuOpen ? "left-panel-open" : ""}`}>
          <div className="panel-heading">
            <span className="panel-heading-mark">✦</span>
            <span>{content.services}</span>
          </div>
					<Menu language={language} toggleLanguage={toggleLanguage} />
				</aside>
        {isMenuOpen && <div className="layout-backdrop" onClick={() => setIsMenuOpen(false)} />}

				{/* Right Content */}
        <main className="center-content">
                 {isHomePage ? (
                   <HomeLanding
                     content={content}
                     language={language}
                     tenantCustomization={tenantCustomization}
                   />
                 ) : (
                   <div className="hero-title" style={{ textAlign: "center" }}>
                     <h1 style={{ color: "var(--tenant-primary, #007bff)" }}>{content.whatWeDo}{tenantCustomization.name?.[language] || tenantCustomization.name?.["fr"]}</h1>
                     <h4 style={{ color: "var(--tenant-accent, #00bbff)" }}>{content.whatYouFind}</h4>
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
                     <Route path="/administration/classes/:id" element={<ClassManagePage language={language} />} />
                      <Route path="/administration/examens" element={<ExamProgram language={language} toggleLanguage={toggleLanguage} />} />
                      <Route path="/administration/outings" element={<OutingPage language={language} />} />
                      <Route path="/administration/parties" element={<PartiesPage language={language} />} />
                      <Route path="/administration/meetings" element={<MeetingPage language={language} />} />
                      <Route path="/administration/attestations" element={<AttestationsPage language={language} />} />
                      <Route path="/administration/customization" element={<TenantCustomizationPage language={language} />} />
                      <Route path="/services/outings" element={<OutingPage language={language} />} />
                      <Route path="/services/parties" element={<PartiesPage language={language} />} />
                      <Route path="/services/meetings" element={<MeetingPage language={language} />} />
                      <Route path="/enseignement/parent-meetings" element={<ParentMeetingPage language={language} toggleLanguage={toggleLanguage} />} />
                       <Route path="/enseignant/cours/:id" element={<TeacherCourseDetails language={language} />} />
                       <Route path="/enseignant/cours" element={<TeacherCourses language={language} toggleLanguage={toggleLanguage} />} />
                      <Route path="/enseignant/attendance" element={<TeacherAttendancePage language={language} />} />
                      <Route path="/enseignant/absence" element={<TeacherAttendancePage language={language} />} />
                      <Route path="/enseignant/notes" element={<TeacherNotesPage language={language} />} />
                       <Route path="/enseignant/assignments" element={<TeacherAssignmentsPage language={language} />} />
                        <Route path="/enseignant/devoirs" element={<TeacherAssignmentsPage language={language} />} />
                      <Route path="/services/bibliotheque" element={<Bibliotheque />} />
                      <Route path="/services/bibliotheque/catalogue" element={<Catalogue />} />
                      <Route path="/services/bibliotheque/emprunts" element={<Borrow />} />
                      <Route path="/services/bibliotheque/reglement" element={<Rules />} />
				      <Route path="/login" element={<Login language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/logout" element={<Logout language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/about" element={<About language={language} toggleLanguage={toggleLanguage} tenantCustomization={tenantCustomization} />} />
				      <Route path="/inscription" element={<Inscription language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/contact" element={<Contact language={language} toggleLanguage={toggleLanguage} />} />
              <Route path="/profile" element={<ProfilePage language={language} />} />
              <Route path="/parents/attestation_demand" element={<AttestationsPage language={language} />} />
				      <Route path="/students/schedule" element={<StudentSchedulePage language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/students/courses" element={<StudentCoursesPage language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/students/devoirs" element={<StudentAssignmentsPage language={language} toggleLanguage={toggleLanguage} />} />
				       <Route path="/parents/inscription" element={<InscriptionForm  isAuthorized={true} language={language} toggleLanguage={toggleLanguage} />} />
                   </Routes>
                 </div>
        </main>

        <aside className="right-panel">
          <div className="right-panel-art">
            <img src={tenantCustomization.image} alt={tenantCustomization.name?.[language] || "School"} />
          </div>
          <div className="right-panel-content">
            <span className="panel-heading-mark">✦</span>
            <h2>{tenantCustomization.name?.[language] || tenantCustomization.name?.["fr"] || "School"}</h2>
            <p>{content.overTheTime}</p>
            <div className="portal-status"><span /> {content.overTheTime}</div>
          </div>
        </aside>
			</div>
      <Footer language={language} tenantCustomization={tenantCustomization} />
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
