// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import OuttingPage  from "./pages/OuttingPage";




const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = sessionStorage.getItem("jwt_token");
  const roles = JSON.parse(localStorage.getItem("user_roles") || "[]");
  const isAuthorized = allowedRoles.some(role => roles.includes(role));
  if (!token) return <Navigate to="/login" replace />;
  return isAuthorized ? children : <Navigate to="/unauthorized" replace />;
};

function App() {
	const [language, setLanguage] = useState("fr"); // Track current language
	let content;
	const today = new Date().toISOString().split("T")[0];

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


	return (
		<Router>
			<Header language={language} toggleLanguage={toggleLanguage}/>
			<div style={{
                     display: "flex",
                     alignItems: "center",
                     flexDirection: language === "ar" ? "row-reverse" : "row", }}>
				{/* Left Menu */}
				<div className="left-panel">
					<Menu language={language} toggleLanguage={toggleLanguage} />
				</div>

				{/* Right Content */}
				<div
                                 className="center-content"
                                >


               <div
                               style={{
                                 width: "fit-content",
                                 height: "fit-content",
                                 padding: "10px",
                                 alignItems: "center",
                               }}
                             >
                   <h1 style={{ color: "blue" }}>{content.whatWeDo}{ecole.name[language] || ecole.name["fr"]}</h1>

                 </div>
<div className="bounce-container">
  <div className="bounce-content">
    <h4 style={{ color: "#00BBFF" }}>{content.whatYouFind}</h4>
    <img src={ecole.logo} width="300" />
  </div>
              	<div
                                                style={{
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  gap: "10px",
                                                  maxWidth: "800px",
                                                  margin: "0 auto",
                                                  width: "100%"
                                                }}
                                              >

                   <Routes>
                     <Route path="/finance/factures" element={<PostInvoice language={language} toggleLanguage={toggleLanguage} />} />
                     <Route path="/finance/paymentNotice" element={<SchoolInvoicePreview  language={language} toggleLanguage={toggleLanguage} />} />
                     <Route path="/finance/payments" element={<Payments language={language} toggleLanguage={toggleLanguage} />} />
                     <Route path="/administration/presence" element={<ProfessorPresence language={language} toggleLanguage={toggleLanguage} />} />
                     <Route path="/administration/classes" element={<ClassesPage language={language} toggleLanguage={toggleLanguage} />} />
                      <Route path="/administration/examens" element={<ExamProgram language={language} toggleLanguage={toggleLanguage} />} />
                      <Route path="/administration/attestations" element={<AttestationsPage language={language} toggleLanguage={toggleLanguage} />} />
                      <Route path="/administration/activites/sorties" element={<OuttingPage language={language} toggleLanguage={toggleLanguage} />} />
                      <Route path="/enseignement/parent-meetings" element={<ParentMeetingPage language={language} toggleLanguage={toggleLanguage} />} />
                       <Route path="/enseignant/cours" element={<TeacherCourses language={language} toggleLanguage={toggleLanguage} />} />
                      <Route path="/services/bibliotheque" element={<Bibliotheque />} />
                      <Route path="/services/bibliotheque/catalogue" element={<Catalogue />} />
                      <Route path="/services/bibliotheque/emprunts" element={<Borrow />} />
                      <Route path="/services/bibliotheque/reglement" element={<Rules />} />
				      <Route path="/login" element={<Login language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/logout" element={<Logout language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/about" element={<About language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/inscription" element={<Inscription language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/contact" element={<Contact language={language} toggleLanguage={toggleLanguage} />} />
				      <Route path="/students/schedule" element={<StudentSchedulePage language={language} toggleLanguage={toggleLanguage} />} />
				       <Route path="/parents/inscription" element={<InscriptionForm  isAuthorized={true} language={language} toggleLanguage={toggleLanguage} />} />
                   </Routes>
                 </div>
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
		</Router>
	);
}

export default App;
