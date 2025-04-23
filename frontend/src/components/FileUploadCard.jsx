"use client"

import { useState } from "react"
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonSpinner,
  IonToast,
  IonIcon,
  IonItem,
  IonLabel,
  IonText,
} from "@ionic/react"
import { cloudUploadOutline, downloadOutline, closeCircleOutline } from "ionicons/icons"

// FileUploadCard.jsx - Corrected line
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FileUploadCard = ({ title, endpoint, acceptedFiles, multiple = false, instructions }) => {
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastColor, setToastColor] = useState("medium") // Default toast color

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!multiple && selectedFiles.length > 1) {
        // If multiple is false, only take the first file
        setFiles([selectedFiles[0]]);
        setToastMessage("Only one file can be selected for this operation.");
        setToastColor("warning");
        setShowToast(true);
    } else {
        setFiles(selectedFiles);
    }
    setDownloadUrl(null) // Clear previous download link
    // Clear the file input value to allow selecting the same file again after clearing
    e.target.value = null;
  }

  const handleSubmit = async () => {
    if (files.length === 0) {
      setToastMessage("Please select file(s) to upload")
      setToastColor("warning")
      setShowToast(true)
      return
    }

    setIsLoading(true)
    setDownloadUrl(null)
    setToastMessage(""); // Clear previous toast

    try {
      const formData = new FormData()

      // --- CHANGE 1: Determine correct field name ---
      let fieldName;
      if (multiple) {
          // Backend expects 'images' or 'pdfs' for multiple files
          if (endpoint === '/images-to-pdf') {
              fieldName = 'images';
          } else if (endpoint === '/merge-pdfs') {
              fieldName = 'pdfs';
          } else {
              // Fallback or error if endpoint doesn't match expected multiple types
              console.error("Unknown endpoint for multiple file upload:", endpoint);
              setToastMessage("Configuration error: Unknown endpoint for multiple files.");
              setToastColor("danger");
              setShowToast(true);
              setIsLoading(false);
              return; // Stop processing
          }
          files.forEach((file) => {
              formData.append(fieldName, file); // Use the determined fieldName
          });
      } else {
          // Backend expects 'file' for single file uploads
          fieldName = 'file';
          formData.append(fieldName, files[0]);
      }
      // --- End CHANGE 1 ---

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        body: formData,
      })

      // --- CHANGE 2: Improved Error Handling ---
      if (!response.ok) {
          let errorMessage = `Server Error: ${response.status} ${response.statusText}`;
          try {
              // Try to parse the JSON error message from the backend
              const errorData = await response.json();
              if (errorData && errorData.error) {
                  errorMessage = errorData.error; // Use backend's specific error
              }
          } catch (parseError) {
              // If response body is not JSON or empty, stick with the status text
              console.warn("Could not parse error response as JSON:", parseError);
          }
          throw new Error(errorMessage); // Throw the specific or generic error message
      }
      // --- End CHANGE 2 ---

      // If response is OK, expect a file blob
      const blob = await response.blob()

      // --- CHANGE 3: Rely on Content-Disposition for filename ---
      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('content-disposition');
      let suggestedFilename = "download"; // Default filename
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch.length > 1) {
            suggestedFilename = filenameMatch[1];
        }
      }
      // Store the blob URL and the suggested filename
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl({ url, filename: suggestedFilename }); // Store URL and filename
      // --- End CHANGE 3 ---


      setToastMessage("File processed successfully! Click Download.")
      setToastColor("success")
      setShowToast(true)
      // Optionally clear files after successful processing
      // setFiles([]);

    } catch (error) {
      console.error("Error during file processing:", error)
      // Display the error message thrown from the fetch block or network error
      setToastMessage(`Error: ${error.message}`)
      setToastColor("danger")
      setShowToast(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Modified to use the filename stored in state
  const handleDownload = () => {
    if (!downloadUrl || !downloadUrl.url) return;

    const link = document.createElement("a");
    link.href = downloadUrl.url;

    // Use the filename obtained from the Content-Disposition header
    link.download = downloadUrl.filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Optional: Revoke the object URL after download starts to free up memory
    // setTimeout(() => window.URL.revokeObjectURL(downloadUrl.url), 100);
    // setDownloadUrl(null); // Clear download state after clicking
  };


  const clearFiles = () => {
    setFiles([])
    setDownloadUrl(null)
    // Reset the file input visually - find the input and reset its value
    const fileInput = document.getElementById(`file-input-${endpoint}`);
    if (fileInput) {
        fileInput.value = null;
    }
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{title}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonText color="medium">
          <p>{instructions}</p>
        </IonText>

        <div className="file-upload-container ion-padding-top">
          <input
            type="file"
            id={`file-input-${endpoint}`}
            accept={acceptedFiles}
            multiple={multiple}
            onChange={handleFileChange}
            style={{ display: "none" }} // Keep hidden, triggered by button
          />

          {/* Button to trigger the hidden file input */}
          <IonButton
             expand="block"
             fill="outline"
             onClick={() => document.getElementById(`file-input-${endpoint}`).click()}
             disabled={isLoading}
            >
            <IonIcon slot="start" icon={cloudUploadOutline} />
            Select File{multiple ? "s" : ""}
          </IonButton>

          {/* Display selected files */}
          {files.length > 0 && (
            <div className="selected-files ion-margin-top">
              <IonItem lines="none" color="light" style={{ borderRadius: '8px' }}> {/* Added background and rounding */}
                <IonLabel>
                  <h3 style={{ marginBottom: '5px', fontSize: '0.9em', fontWeight: 'bold' }}>Selected:</h3>
                  {files.map((file, index) => (
                    <p key={index} style={{ fontSize: '0.85em', margin: '2px 0' }}>{file.name}</p>
                  ))}
                </IonLabel>
                {/* Clear Button */}
                <IonButton fill="clear" color="medium" onClick={clearFiles} slot="end" disabled={isLoading}>
                  <IonIcon icon={closeCircleOutline} />
                </IonButton>
              </IonItem>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons ion-margin-top">
             {/* Process Button */}
            <IonButton
              expand="block"
              onClick={handleSubmit}
              disabled={isLoading || files.length === 0}
              color="primary" // Use primary color for main action
            >
              {isLoading ? <IonSpinner name="dots" /> : `Process ${multiple ? "Files" : "File"}`}
            </IonButton>

             {/* Download Button - Conditionally Rendered */}
            {downloadUrl && (
              <IonButton
                expand="block"
                onClick={handleDownload}
                color="success" // Use success color for download
                className="ion-margin-top" // Add some space above
              >
                <IonIcon slot="start" icon={downloadOutline} />
                Download Result
              </IonButton>
            )}
          </div>
        </div>
      </IonCardContent>

      {/* Toast for notifications */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={4000} // Slightly longer duration
        color={toastColor}
        position="bottom" // Position at the bottom
      />
    </IonCard>
  )
}

export default FileUploadCard