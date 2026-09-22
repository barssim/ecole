import React from 'react';
import fr from "../locales/footer/fr.json";
import ar from "../locales/footer/ar.json";
import en from "../locales/footer/en.json";

const Footer = ({ language, schoolCustomization }) => {
	let content;
  const school = schoolCustomization || {};
  const appVersion = (
    process.env.REACT_APP_RELEASE_VERSION
    || process.env.REACT_APP_APP_VERSION
    || "dev"
  ).trim();
  const customerVersion = (school.customerVersion || "").toLowerCase();
  let trialIndicatorColor = null;

  if (customerVersion.includes("gold")) {
    trialIndicatorColor = "#d4af37";
  } else if (customerVersion.includes("silver")) {
    trialIndicatorColor = "#c0c0c0";
  } else if (customerVersion.includes("bronze") || customerVersion.includes("bronz")) {
    trialIndicatorColor = "#cd7f32";
  } else if (["trial", "test"].some((tag) => customerVersion.includes(tag))) {
    trialIndicatorColor = "#000";
  }

if (language === "fr") {
  content = fr;
} else if (language === "en") {
  content = en;
} else {
  content = ar;
};

  // Render legal notice with TAB-Logic as a link
  const renderLegalNotice = () => {
    const text = content.legal_notice || "© 2026 Company TAB-Logic. All rights reserved.";
    const parts = text.split("TAB-Logic");

    return (
      <>
        {parts[0]}
        <a href="https://tab-logic.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
          TAB-Logic
        </a>
        {parts.slice(1).join("TAB-Logic")}
      </>
    );
  };

   return (
       <footer className="footer">
           <div className="footer-main">
             <div className="footer-brand">
               <span className="footer-mark">✦</span>
               <div>
                 <strong>{school.name?.[language] || school.name?.["fr"] || "School"}</strong>
                 <p>{content.overTheTime}</p>
               </div>
             </div>
             <address>
               <span>{school.adresse?.[language] || ""}</span>
               <span>{school.phone ? `Phone: ${school.phone}` : ""}</span>
               <span>{school.mail ? `Email: ${school.mail}` : ""}</span>
             </address>
             <div className="footer-socials">
               <span>Suivez-nous</span>
               <div>
                 <a href={content.facebook_link} target="_blank" rel="noopener noreferrer">Facebook</a>
                 <a href={content.twitter_link} target="_blank" rel="noopener noreferrer">Twitter</a>
               </div>
             </div>
           </div>
           <div className="footer-bottom">
             <p className="legal-notice">{renderLegalNotice()}</p>
             <a className="footer-privacy-link" href="/politique-confidentialite">
               Politique de confidentialité
             </a>
             <a className="footer-privacy-link" href="/cgu">
               Conditions générales d'utilisation
             </a>
             <p>{`Version: ${appVersion}`}</p>
           </div>
            {trialIndicatorColor ? (
              <span
                className="trial-indicator"
                aria-label="Trial version indicator"
                style={{ "--trial-indicator-color": trialIndicatorColor }}
              />
            ) : null}
       </footer>
   );
};
export default Footer;
