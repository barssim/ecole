import React from 'react';
import styles from '../cssFiles/styles.css';
import fr from "../locales/header/fr.json";
import ar from "../locales/header/ar.json";
import en from "../locales/header/en.json";

const About = ({ language }) => {
	let content;

if (language === "fr") {
  content = fr;
} else if (language === "en") {
  content = en;
} else {
  content = ar;
};
	return (
		<div style={{ flex: 1, padding: "10px", textAlign: "center" }}>
			<h1 style={styles.heading}> {content.group_gardinia}</h1>
	   </div>
   );
};

export default About;
