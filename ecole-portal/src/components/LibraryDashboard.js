import React from 'react';
import { Link } from 'react-router-dom';

const LibraryDashboard = () => {
  return (
    <div className="library-dashboard">
      <ul>
        <li><Link to="/services/bibliotheque/catalogue">📖 Book Catalogue</Link></li>
        <li><Link to="/services/bibliotheque/emprunts">📦 Borrow & Return</Link></li>
        <li><Link to="/services/bibliotheque/reglement">📜 Library Rules</Link></li>
      </ul>
    </div>
  );
};

export default LibraryDashboard;
