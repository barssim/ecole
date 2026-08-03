import React from 'react';
import fr from "../locales/footer/fr.json";
import ar from "../locales/footer/ar.json";
import en from "../locales/footer/en.json";

const Footer = ({ language, tenantCustomization }) => {
	let content;
  const tenant = tenantCustomization || {};
  const customerVersion = (tenant.customerVersion || "").toLowerCase();
  let customerVersionLabel = null;
  let trialIndicatorColor = null;

  if (customerVersion.includes("gold")) {
    customerVersionLabel = "Gold";
    trialIndicatorColor = "#d4af37";
  } else if (customerVersion.includes("silver")) {
    customerVersionLabel = "Silver";
    trialIndicatorColor = "#c0c0c0";
  } else if (customerVersion.includes("bronze") || customerVersion.includes("bronz")) {
    customerVersionLabel = "Bronze";
    trialIndicatorColor = "#cd7f32";
  } else if (["trial", "test"].some((tag) => customerVersion.includes(tag))) {
    customerVersionLabel = "Trial";
    trialIndicatorColor = "#000";
  }

if (language === "fr") {
  content = fr;
} else if (language === "en") {
  content = en;
} else {
  content = ar;
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
            {customerVersionLabel ? (
              <p className="customer-version-label">
                {customerVersionLabel}
                {trialIndicatorColor ? (
                  <span
                    className="trial-indicator"
                    aria-label="Trial version indicator"
                    style={{ "--trial-indicator-color": trialIndicatorColor }}
                  />
                ) : null}
              </p>
            ) : null}
            <p>{content.legal_notice || "© 2026 Company TAB-Logic. All rights reserved."}</p>
       </footer>
   );
};
export default Footer;
