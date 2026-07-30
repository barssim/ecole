import React from 'react';
import fr from "../locales/footer/fr.json";
import ar from "../locales/footer/ar.json";
import en from "../locales/footer/en.json";

const Footer = ({ language, tenantCustomization }) => {
	let content;
  const tenant = tenantCustomization || {};

if (language === "fr") {
  content = fr;
} else if (language === "en") {
  content = en;
} else {
  content = ar;
};
   return (
       <footer className="footer">
           <p>&copy; 2024 {tenant.name?.[language] || tenant.name?.["fr"] || "School"} </p>
           <p>{content.legal_notice || "© 2026 Company TAB-Logic. All rights reserved."}</p>
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
            {tenant.customerVersion ? <p>Version: {tenant.customerVersion}</p> : null}
       </footer>
   );
};
export default Footer;
