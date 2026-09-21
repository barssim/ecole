import React from 'react';

const getLocalizedValue = (value, language, fallback = '') => {
  if (value && typeof value === 'object') {
	return value[language] || value.fr || value.en || value.ar || fallback;
  }
  return value || fallback;
};

const labels = {
  fr: {
	title: 'À propos',
	contact: 'Contact',
	address: 'Adresse',
	phone: 'Téléphone',
	email: 'Email',
  },
  en: {
	title: 'About',
	contact: 'Contact',
	address: 'Address',
	phone: 'Phone',
	email: 'Email',
  },
  ar: {
	title: 'من نحن',
	contact: 'التواصل',
	address: 'العنوان',
	phone: 'الهاتف',
	email: 'البريد الإلكتروني',
  },
};

const About = ({ language = 'fr', schoolCustomization }) => {
  const content = labels[language] || labels.fr;
  const school = schoolCustomization || {};
  const aboutTitle = getLocalizedValue(school.about?.title, language, getLocalizedValue(school.name, language, content.title));
  const aboutDescription = getLocalizedValue(school.about?.description, language, '');
  const address = getLocalizedValue(school.adresse, language, '');

	return (
	<div className="about-page">
	  <div className="about-card">
		<h1 className="about-title">{aboutTitle}</h1>
		{aboutDescription && (
		  <p className="about-description">{aboutDescription}</p>
		)}
		<div className={`about-contact${language === 'ar' ? ' is-rtl' : ''}`}>
		  <h2>{content.contact}</h2>
		  {address && (
			<p><span className="about-contact-icon">📍</span><strong>{content.address}:</strong> {address}</p>
		  )}
		  {school.phone && (
			<p><span className="about-contact-icon">📞</span><strong>{content.phone}:</strong> {school.phone}</p>
		  )}
		  {school.mail && (
			<p><span className="about-contact-icon">✉️</span><strong>{content.email}:</strong> {school.mail}</p>
		  )}
		</div>
	  </div>
	 </div>
   );
};

export default About;
