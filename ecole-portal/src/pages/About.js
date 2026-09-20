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

const About = ({ language = 'fr', tenantCustomization }) => {
  const content = labels[language] || labels.fr;
  const tenant = tenantCustomization || {};
  const aboutTitle = getLocalizedValue(tenant.about?.title, language, getLocalizedValue(tenant.name, language, content.title));
  const aboutDescription = getLocalizedValue(tenant.about?.description, language, '');
  const address = getLocalizedValue(tenant.adresse, language, '');

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
		  {tenant.phone && (
			<p><span className="about-contact-icon">📞</span><strong>{content.phone}:</strong> {tenant.phone}</p>
		  )}
		  {tenant.mail && (
			<p><span className="about-contact-icon">✉️</span><strong>{content.email}:</strong> {tenant.mail}</p>
		  )}
		</div>
	  </div>
	 </div>
   );
};

export default About;
