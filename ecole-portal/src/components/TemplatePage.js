import React from 'react';

const TemplatePage = ({ title, children }) => (
  <div className="template-page">
    <h1>{title}</h1>
    <div className="template-content">
      {children || <p>No content yet.</p>}
    </div>
  </div>
);

export default TemplatePage;
