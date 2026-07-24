import React from 'react';
import ecole from '../ecoleLoader';

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

const About = ({ language = 'fr' }) => {
  const content = labels[language] || labels.fr;
  const aboutTitle = getLocalizedValue(ecole.about?.title, language, getLocalizedValue(ecole.name, language, content.title));
  const aboutDescription = getLocalizedValue(ecole.about?.description, language, '');
  const address = getLocalizedValue(ecole.adresse, language, '');

	return (
	<div style={{ flex: 1, padding: '24px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
	  <h1 style={{ color: 'var(--tenant-primary, #007bff)', marginBottom: '16px' }}>{aboutTitle}</h1>
	  {aboutDescription && (
		<p style={{ fontSize: '18px', lineHeight: 1.6, color: '#444', marginBottom: '24px' }}>{aboutDescription}</p>
	  )}
	  <div
		style={{
		  backgroundColor: 'var(--tenant-soft, #f3f9ff)',
		  borderRadius: '12px',
		  padding: '20px',
		  textAlign: language === 'ar' ? 'right' : 'left',
		}}
	  >
		<h2 style={{ color: 'var(--tenant-primary, #007bff)', marginTop: 0 }}>{content.contact}</h2>
		<p><strong>{content.address}:</strong> {address}</p>
		<p><strong>{content.phone}:</strong> {ecole.phone}</p>
		<p><strong>{content.email}:</strong> {ecole.mail}</p>
	  </div>
	 </div>
   );
};

export default About;
