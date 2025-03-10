import React, { useState } from "react";
import ModelViewer from "./ModelViewer";
import "./styles.css";

function App() {
  // Get API URL from environment or use a default for production
  // In production, you would set this through environment variables during build
  const API_URL = process.env.REACT_APP_API_URL || "https://your-render-backend-url.onrender.com";
  
  const [modelUrl, setModelUrl] = useState(null);
  const [originalFilename, setOriginalFilename] = useState(null);
  const [convertedUrl, setConvertedUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validExtensions = ['.stl', '.obj'];
    const fileExt = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!validExtensions.includes(fileExt)) {
      setError(`Unsupported file type. Please upload STL or OBJ files only.`);
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);
    setModelUrl(null);
    setOriginalFilename(null);
    setConvertedUrl(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setModelUrl(data.url);
        setOriginalFilename(data.original_filename);
        setSuccess("File uploaded successfully!");
      } else {
        setError(`Upload error: ${data.error}`);
      }
    } catch (error) {
      setError(`Error uploading file: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConvert = async () => {
    if (!modelUrl || !originalFilename) return;

    setIsConverting(true);
    setError(null);
    setSuccess(null);
    setConvertedUrl(null);

    try {
      const response = await fetch(`${API_URL}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_url: modelUrl, original_filename: originalFilename }),
      });

      const data = await response.json();
      if (response.ok) {
        setConvertedUrl(data.converted_url);
        setSuccess("File converted successfully!");
      } else {
        setError(`Conversion error: ${data.error}`);
      }
    } catch (error) {
      setError(`Error converting file: ${error.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="container">
      <header className="app-header">
        <div className="logo-div">
        <img className="logo-icon" src="/logo.png" alt="Dimensia Logo" />
        <h1 className="app-title">Dimensia</h1>
        </div>
        
        <div className="app-controls">
          <div className="file-input-wrapper">
            <input 
              type="file" 
              accept=".stl,.obj" 
              onChange={handleFileChange} 
              className="file-input"
              disabled={isUploading}
            />
            <button className="button" disabled={isUploading}>
              {isUploading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <img className="button-icon" src="/upload-icon.png" alt="Upload" />
                  <span>Upload Model</span>
                </>
              )}
            </button>
          </div>
          
          {modelUrl && !originalFilename?.toLowerCase().endsWith('.obj') && (
            <button 
              className="button button-secondary"
              onClick={handleConvert}
              disabled={isConverting || !modelUrl}
            >
              {isConverting ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <img className="button-icon" src="/convert.png" alt="Convert" />
                  <span>Convert to OBJ</span>
                </>
              )}
            </button>
          )}
          
          {convertedUrl && (
            <a 
              href={convertedUrl} 
              className="button button-secondary"
              download
              target="_blank" 
              rel="noopener noreferrer"
            >
              <img className="button-icon" src="/download.png" alt="Download" />
              <span>Download OBJ</span>
            </a>
          )}
        </div>
      </header>

      <div className="model-preview-container">
        {modelUrl ? (
          <ModelViewer modelUrl={modelUrl} fileName={originalFilename} />
        ) : (
          <div className="model-viewer-container">
            <div className="center-content">
              <img className="file-upload" src="/upload.png" alt="Upload" />
              <p>Upload a 3D model to view it here</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>Supported formats: STL, OBJ</p>
            </div>
          </div>
        )}
        
        {modelUrl && (
          <div className="model-status-bar">
            <div className="file-info">
              <span className="button-icon">📄</span>
              <span className="file-name">{originalFilename}</span>
            </div>
            
            {originalFilename?.toLowerCase().endsWith('.obj') && (
              <span className="status-indicator">OBJ format ready for use</span>
            )}
          </div>
        )}
        
        {modelUrl && (
          <div className="model-instructions">
            Use mouse to rotate • Scroll to zoom • Shift+drag to pan
          </div>
        )}
      </div>

      <div className="message-container">
        {error && (
          <div className="error-message">
            {error}
            <button className="button-close" onClick={clearMessages}>×</button>
          </div>
        )}
        
        {success && (
          <div className="success-message">
            {success}
            <button className="button-close" onClick={clearMessages}>×</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;