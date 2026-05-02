import React from "react";

const SharedDocumentsPage = () => {
  const documents = [
    { id: 1, title: "Programme annuel 2024", type: "PDF", link: "#" },
    { id: 2, title: "Plan de cours - Term 1", type: "DOCX", link: "#" },
    { id: 3, title: "Règlement intérieur", type: "PDF", link: "#" }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">📁 Documents partagés</h2>
      <ul className="space-y-4">
        {documents.map(doc => (
          <li key={doc.id} className="flex items-center justify-between bg-gray-100 p-4 rounded shadow-sm">
            <div>
              <p className="font-medium">{doc.title}</p>
              <p className="text-sm text-gray-500">📄 {doc.type}</p>
            </div>
            <a
              href={doc.link}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              ⬇ Télécharger
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SharedDocumentsPage;
