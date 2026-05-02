import React, { useState } from 'react';
import axios from 'axios';

const PostInvoice = () => {
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('');
  const [items, setItems] = useState([{ description: '', amount: '' }]);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', amount: '' }]);
  };

  const generateInvoice = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8093/api/facture/generate',
        {
          studentName,
          className,
          items: items.map(item => ({
            description: item.description,
            amount: parseFloat(item.amount)
          }))
        },
        { responseType: 'blob' } // important for PDF
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      alert('Erreur lors de la génération de la facture');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h2>Générer une Facture Scolaire</h2>

      <input
        type="text"
        placeholder="Nom de l'élève"
        value={studentName}
        onChange={e => setStudentName(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />
      <input
        type="text"
        placeholder="Classe"
        value={className}
        onChange={e => setClassName(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <h4>Services</h4>
      {items.map((item, index) => (
        <div key={index} style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Description"
            value={item.description}
            onChange={e => handleItemChange(index, 'description', e.target.value)}
            style={{ marginRight: 10 }}
          />
          <input
            type="number"
            placeholder="Montant"
            value={item.amount}
            onChange={e => handleItemChange(index, 'amount', e.target.value)}
          />
        </div>
      ))}

      <button onClick={addItem} style={{ marginBottom: 20 }}>
        + Ajouter un service
      </button>
      <br />
      <button onClick={generateInvoice}>Générer la facture PDF</button>

      {pdfUrl && (
        <div style={{ marginTop: 20 }}>
          <h4>Facture générée :</h4>
          <iframe src={pdfUrl} width="100%" height="500px" title="Invoice PDF" />
          <br />
          <a href={pdfUrl} download="facture.pdf">📥 Télécharger</a>
        </div>
      )}
    </div>
  );
};

export default PostInvoice;
