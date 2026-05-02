import React, { useState } from "react";
import axios from 'axios';
import fr from "../locales/fr.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

const AiChatBox = ({ language }) => {
   const content = language === "fr" ? fr : language === "en" ? en : ar;
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_GATEWAY_URL}/api/ai/ask`, {
        prompt: prompt,
      });
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      setResponse("Error connecting to the AI backend.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h4>{content.askSchoolAI}</h4>
      <textarea
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask a question like: Who enrolled in 2024?"
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <button onClick={handleSubmit}>{content.submit}</button>
      <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
        <p>{response}</p>
      </div>
    </div>
  );
}

export default AiChatBox;
