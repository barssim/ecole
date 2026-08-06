import React, { useState } from "react";
import { getTenantId } from "../tenant";

const FileUpload = ({ filename, onUploadSuccess }) => {
  const [file, setFile] = useState(null);

  const isPdfFile = (value) => {
    if (!value) return false;
    if (value.type === "application/pdf") return true;
    return String(value.name || "").toLowerCase().endsWith(".pdf");
  };

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!isPdfFile(file)) {
      console.error("Only PDF files are allowed");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", filename);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_GATEWAY_URL}/api/upload`, {
        method: "POST",
        headers: {
          "X-Tenant-Id": getTenantId(),
        },
        body: formData,
      });

      const data = await res.json();
      onUploadSuccess(data); // Pass uploaded file info back to parent
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  return (
    <div style={{ marginTop: "8px" }}>
      <input type="file" accept="application/pdf,.pdf" onChange={handleChange} />
      <button onClick={handleUpload}>📤 Upload</button>
    </div>
  );
};

export default FileUpload;
