import React from 'react';
import fr from "../locales/footer/fr.json";
import ar from "../locales/footer/ar.json";
import en from "../locales/footer/en.json";

const Footer = ({ language, tenantCustomization }) => {
	let content;
  const tenant = tenantCustomization || {};
  const appVersion = (
    process.env.REACT_APP_RELEASE_VERSION
    || process.env.REACT_APP_APP_VERSION
    || "dev"
  ).trim();
  const customerVersion = (tenant.customerVersion || "").toLowerCase();
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
           <p> {tenant.name?.[language] || tenant.name?.["fr"] || "School"} </p>
           <div>
               <a href={content.facebook_link} target="_blank" rel="noopener noreferrer" style={{ marginRight: '10px' }}>Facebook</a>
               <a href={content.twitter_link} target="_blank" rel="noopener noreferrer">Twitter</a>
           </div>
            <address>
                 {tenant.adresse?.[language] || ""}
                <br />
                 Phone: {tenant.phone || ""}
                <br />
                 Email: {tenant.mail || ""}
            </address>
            <p className="legal-notice">{renderLegalNotice()}</p>
            <p style={{ marginTop: "4px", fontSize: "0.85rem", opacity: 0.85 }}>
              {`Version: ${appVersion}`}
            </p>
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
