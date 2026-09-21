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
import { fetchSchoolCustomization, getFallbackCustomization } from './ecoleLoader';
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
import StudentGradesPage from "./pages/StudentGradesPage";
import TeacherCourseDetails from "./pages/TeacherCourseDetails";
import PartiesPage  from "./pages/PartiesPage";
import MeetingPage  from "./pages/MeetingPage";
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/ProfilePage';
import TeacherAttendancePage from './pages/TeacherAttendancePage';
import TeacherNotesPage from './pages/TeacherNotesPage';
import OutingPage from './pages/OutingPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import GalleryPage from './pages/GalleryPage';
import SchoolCustomizationPage from './pages/SchoolCustomizationPage';
import TeacherAssignmentsPage from './pages/TeacherAssignmentsPage';
import { getSchoolId } from './school';
import { createApiUrlFor, readJsonResponse } from './utils/apiClient';




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

const AnnouncementsFeedPanel = ({ content, language, schoolCustomization }) => {
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    let mounted = true;
    const apiUrlFor = createApiUrlFor("http://localhost:8085");
    const userRoles = JSON.parse(localStorage.getItem("user_roles") || "[]");
    const userName = localStorage.getItem("LoggedIn") || "";
    const headers = {
      "X-School-Id": getSchoolId(),
      "X-User-Roles": userRoles.join(","),
      "X-User-Name": userName,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const keepUpcoming = (data) => (Array.isArray(data) ? data : [])
      .filter((activity) => {
        if (!activity.date) return true;
        const activityDate = new Date(activity.date);
        return !Number.isNaN(activityDate.getTime()) && activityDate >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    fetch(apiUrlFor("/activities?type=announcements"), { headers })
      .then((response) => readJsonResponse(response, "Impossible de charger les annonces."))
      .catch(() => [])
      .then((announcements) => {
        if (!mounted) return;
        setFeed(keepUpcoming(announcements || []));
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="home-stat-card home-stat-card-marquee">
      <h3 className="announcements-feed-title">{content.annonces_activites || "Annonces actuelles"}</h3>
      {feed.length > 0 ? (
        <div className="home-outings-marquee" aria-label={content.annonces_activites || "Annonces actuelles"}>
          <div className="home-outings-track">
            {[0, 1].flatMap((cycle) => [
              <span className="home-outings-item home-outings-logo" key={`logo-${cycle}`}>
                <img
                  src={schoolCustomization?.logo}
                  alt={schoolCustomization?.name?.[language] || schoolCustomization?.name?.["fr"] || "School"}
                />
              </span>,
              ...feed.map((activity, index) => (
                <span className="home-outings-item" key={`${activity.id}-${activity.type}-${cycle}-${index}`}>
                  📣 {activity.title}
                  {activity.destination ? ` — ${activity.destination}` : ""}
                  {activity.date ? ` (${activity.date})` : ""}
                </span>
              )),
            ])}
          </div>
        </div>
      ) : (
        <span>{content.annonces_fallback || content.messages}</span>
      )}
    </div>
  );
};

const HomeLanding = ({ content, language, schoolCustomization }) => {
  const navigate = useNavigate();
  const schoolName = schoolCustomization.name?.[language] || schoolCustomization.name?.["fr"] || "School";
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <main className="home-landing" dir={language === "ar" ? "rtl" : "ltr"}>
      <section className="home-hero-card">
        <div className="home-hero-copy">
          <span className="home-eyebrow">ECole • PORTAIL DIGITAL</span>
          <h1>{content.whatWeDo}<strong>{schoolName}</strong></h1>
          <p>{content.whatYouFind}</p>
          <h3>{content.ourGoal}</h3>
        </div>
      </section>

      <section className="home-bottom-row">
        <div>
          <span className="home-section-kicker">UN ESPACE, TOUTE L'ÉCOLE</span>
          <h2
            className="home-whoarewe-link"
            onClick={() => navigate("/about")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/about")}
            role="button"
            tabIndex={0}
          >
            {content.whoAreWe}
          </h2>
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
  const schoolId = getSchoolId();
	const [language, setLanguage] = useState("fr"); // Track current language
  const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [schoolCustomization, setSchoolCustomization] = useState(() => getFallbackCustomization(schoolId));
	let content;
  const schoolPrimaryColor = normalizeHex(schoolCustomization.primaryColor) || "#007bff";
  const schoolAccentColor = normalizeHex(schoolCustomization.accentColor) || mixWithWhite(schoolPrimaryColor, 0.35);
  const schoolSoftColor = normalizeHex(schoolCustomization.softColor) || mixWithWhite(schoolPrimaryColor, 0.7);
  const schoolThemeStyle = {
    "--school-primary": schoolPrimaryColor,
    "--school-accent": schoolAccentColor,
    "--school-soft": schoolSoftColor,
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
  setSchoolCustomization(getFallbackCustomization(schoolId));
  fetchSchoolCustomization().then((customization) => {
    if (mounted && customization) {
      setSchoolCustomization(customization);
    }
  });
  return () => {
    mounted = false;
  };
}, [schoolId]);

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
    <div className="app-shell" style={schoolThemeStyle}>
      <div className="app-header-shell">
        <Header language={language} toggleLanguage={toggleLanguage} schoolCustomization={schoolCustomization}/>
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
					<Menu language={language} toggleLanguage={toggleLanguage} />
				</aside>
        {isMenuOpen && <div className="layout-backdrop" onClick={() => setIsMenuOpen(false)} />}

				{/* Right Content */}
        <main className="center-content">
                 {isHomePage ? (
                   <HomeLanding
                     content={content}
                     language={language}
                     schoolCustomization={schoolCustomization}
                   />
                 ) : (
                   <div className="hero-title" style={{ textAlign: "center" }}>
                     <h1 style={{ color: "var(--school-primary, #007bff)" }}>{content.whatWeDo}{schoolCustomization.name?.[language] || schoolCustomization.name?.["fr"]}</h1>
                     <h4 style={{ color: "var(--school-accent, #00bbff)" }}>{content.whatYouFind}</h4>
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
                      <Route path="/administration/announcements" element={<AnnouncementsPage language={language} />} />
                      <Route path="/administration/parties" element={<PartiesPage language={language} />} />
                      <Route path="/administration/meetings" element={<MeetingPage language={language} />} />
                      <Route path="/administration/attestations" element={<AttestationsPage language={language} />} />
                      <Route path="/administration/customization" element={<SchoolCustomizationPage language={language} />} />
                      <Route path="/services/outings" element={<OutingPage language={language} />} />
                      <Route path="/services/announcements" element={<AnnouncementsPage language={language} />} />
                      <Route path="/services/gallery" element={<GalleryPage language={language} />} />
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
				      <Route path="/about" element={<About language={language} toggleLanguage={toggleLanguage} schoolCustomization={schoolCustomization} />} />
				      <Route path="/inscription" element={<Inscription language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/contact" element={<Contact language={language} toggleLanguage={toggleLanguage} />} />
              <Route path="/profile" element={<ProfilePage language={language} />} />
              <Route path="/parents/attestation_demand" element={<AttestationsPage language={language} />} />
				      <Route path="/students/schedule" element={<StudentSchedulePage language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/students/courses" element={<StudentCoursesPage language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/students/devoirs" element={<StudentAssignmentsPage language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/students/grades" element={<StudentGradesPage language={language} />} />
				       <Route path="/parents/inscription" element={<InscriptionForm  isAuthorized={true} language={language} toggleLanguage={toggleLanguage} />} />
                   </Routes>
                 </div>
        </main>

        <aside className="right-panel">
          <div className="right-panel-art">
            <img src={schoolCustomization.image} alt={schoolCustomization.name?.[language] || "School"} />
          </div>
          <div className="right-panel-content">
            <span className="panel-heading-mark">✦</span>
            <h2>{schoolCustomization.name?.[language] || schoolCustomization.name?.["fr"] || "School"}</h2>
            <div className="portal-status"><span /> {content.overTheTime}</div>
          </div>
          <AnnouncementsFeedPanel content={content} language={language} schoolCustomization={schoolCustomization} />
        </aside>
			</div>
      <Footer language={language} schoolCustomization={schoolCustomization} />
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
