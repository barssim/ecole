import React, { useEffect, useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

const AttestationsPage = ({ language }) => {
  const content =
    language === 'fr' ? fr :
    language === 'en' ? en :
    ar;

  const [attestations, setAttestations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAttestations = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_GATEWAY_URL}/api/attestations`);
        const data = await response.json();
        setAttestations(data);
      } catch (error) {
        console.error('Failed to fetch attestations:', error);
      }
    };

    fetchAttestations();
  }, []);

  const filtered = attestations.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">{content.attestation_title}</h2>

      <input
        type="text"
        placeholder={content.attestation_searchPlaceholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded shadow-sm"
      />

      <ul className="space-y-4">
        {filtered.map((attestation) => (
          <li key={attestation.id} className="bg-gray-100 p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-semibold">{attestation.title}</p>
              <p className="text-sm text-gray-500">🗓 {attestation.date}</p>
            </div>
            <div className="space-x-2">
              <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
                {content.attestation_viewButton}
              </button>
              <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm">
                {content.attestation_downloadButton}
              </button>
            </div>
          </li>
        ))}

        {filtered.length === 0 && (
          <li className="italic text-gray-500">{content.attestation_noResults}</li>
        )}
      </ul>
    </div>
  );
};

export default AttestationsPage;
