import React from 'react';
import fr from "../locales/header/fr.json";
import ar from "../locales/header/ar.json";
import en from "../locales/header/en.json";

import "../App.css";
import { useNavigate } from "react-router-dom";

const Header = ({ language, toggleLanguage, schoolCustomization }) => {
	let content;
  const school = schoolCustomization || {};

if (language === "fr") {
  content = fr;
} else if (language === "en") {
  content = en;
} else {
  content = ar;
};
	const navigate = useNavigate();
	const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
	const loggedIn = localStorage.getItem("LoggedIn");
	const civilite = localStorage.getItem("civilite");
	const welcomeName = civilite ? `${civilite} ${loggedIn}` : loggedIn;
	  const userRoles = JSON.parse(localStorage.getItem("user_roles") || "[]");
      const adminRoles = ["manager"];
      const isAdminAuthorized = adminRoles.some(role => userRoles.includes(role));
	return (
		<header
			className="site-header"
		>
			<div className="header-logo">
				<img
					src={school.logo}
					alt={school.name?.[language] || school.name?.["fr"] || "School"}
				/>
				<span className="header-brand-name">{school.name?.[language] || school.name?.["fr"] || "School"}</span>
			</div>

			<nav className="site-navigation">
				<a href="/Home" className="linkStyle">{content.home}</a>
				<a href="/about" className="linkStyle" dir={language === "ar" ? "rtl" : "ltr"}>{content.about}</a>
				<a href="/contact" className="linkStyle">{content.contact}</a>
			</nav>

			<div className="header-actions">
				{isLoggedIn && (
					<span className="header-welcome">Bonjour, {welcomeName}</span>
				)}
				{isLoggedIn && (
					<button className="buttonStyle header-action-btn" onClick={() => navigate("/profile")}>
						{content.profile}
					</button>
				)}
				<button
					className={`buttonStyle header-action-btn ${isLoggedIn ? "header-logout-btn" : ""}`.trim()}
					onClick={() => navigate(isLoggedIn ? "/logout" : "/login")}
				>
					{isLoggedIn ? content.logout : content.login}
				</button>
				{isLoggedIn && isAdminAuthorized && (
					<button
                      className={"buttonStyle header-action-btn"}
                      onClick={() => navigate("/inscription")}
                    >
						{content.inscription}
					</button>
				)}
				<button
					className="language-toggle"
					onClick={toggleLanguage}
					style={{
						backgroundImage: `url(${
                          language === "ar"
                            ? "/images/maroc.jpg"
                            : language === "fr"
                            ? "/images/french.jpg"
                            : "/images/english.jpeg"
                        })`,

						backgroundSize: "cover",
						backgroundPosition: "center",
						width: "40px",
						height: "40px",
						padding: 0,
						borderRadius: "50%",
					}}
				/>
			</div>
		</header>
	);
};

export default Header;
