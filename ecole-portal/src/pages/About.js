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
	directrice: 'Directrice',
	directeur: 'Directeur Manager',
	team: 'Notre équipe de direction',
  },
  en: {
	title: 'About',
	contact: 'Contact',
	address: 'Address',
	phone: 'Phone',
	email: 'Email',
	directrice: 'Headmistress',
	directeur: 'Manager Director',
	team: 'Our leadership team',
  },
  ar: {
	title: 'من نحن',
	contact: 'التواصل',
	address: 'العنوان',
	phone: 'الهاتف',
	email: 'البريد الإلكتروني',
	directrice: 'المديرة',
	directeur: 'المدير المسير',
	team: 'فريق الإدارة',
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

		<div className="about-team">
		  <h2 className="about-team-title">{content.team}</h2>
		  <div className="about-team-grid">
			<div className="about-team-member">
			  <div className="about-team-photo">
				<img src="/images/directrice-avatar.svg" alt={content.directrice} />
			  </div>
			  <span className="about-team-role">{content.directrice}</span>
			</div>
			<div className="about-team-member">
			  <div className="about-team-photo">
				<img src="/images/directeur-avatar.svg" alt={content.directeur} />
			  </div>
			  <span className="about-team-role">{content.directeur}</span>
			</div>
		  </div>
		</div>

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
