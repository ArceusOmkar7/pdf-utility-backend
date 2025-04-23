// frontend/src/components/FileUploadCard.jsx (Complete, Updated with Tailwind and Fixes)
"use client" // Keep this if using Next.js App Router, otherwise remove if standard Vite

import { useState } from "react";
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
} from "@ionic/react";
import { cloudUploadOutline, downloadOutline, closeCircleOutline } from "ionicons/icons";

// Use Vite's way to access environment variables, prefixed with VITE_
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FileUploadCard = ({ title, endpoint, acceptedFiles, multiple = false, instructions }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState(null); // Store { url, filename }
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState("medium");

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!multiple && selectedFiles.length > 1) {
      setFiles([selectedFiles[0]]);
      setToastMessage("Only one file can be selected for this operation.");
      setToastColor("warning");
      setShowToast(true);
    } else {
      setFiles(selectedFiles);
    }
    setDownloadInfo(null); // Clear previous download info
    e.target.value = null; // Allow selecting the same file again after clearing
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setToastMessage("Please select file(s) to upload");
      setToastColor("warning");
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    setDownloadInfo(null);
    setToastMessage("");

    try {
      const formData = new FormData();
      let fieldName;

      if (multiple) {
        if (endpoint === '/images-to-pdf') {
          fieldName = 'images';
        } else if (endpoint === '/merge-pdfs') {
          fieldName = 'pdfs';
        } else {
          console.error("Unknown endpoint for multiple file upload:", endpoint);
          throw new Error("Configuration error: Unknown endpoint for multiple files.");
        }
        files.forEach((file) => {
          formData.append(fieldName, file);
        });
      } else {
        fieldName = 'file';
        formData.append(fieldName, files[0]);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Server Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.warn("Could not parse error response as JSON:", parseError);
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let suggestedFilename = "download";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch.length > 1) {
          suggestedFilename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      setDownloadInfo({ url, filename: suggestedFilename });

      setToastMessage("File processed successfully! Click Download.");
      setToastColor("success");
      setShowToast(true);
      // Optionally clear files: setFiles([]);

    } catch (error) {
      console.error("Error during file processing:", error);
      setToastMessage(`Error: ${error.message}`);
      setToastColor("danger");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!downloadInfo || !downloadInfo.url) return;

    const link = document.createElement("a");
    link.href = downloadInfo.url;
    link.download = downloadInfo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Optional: Revoke URL after a delay
    // setTimeout(() => window.URL.revokeObjectURL(downloadInfo.url), 100);
    // setDownloadInfo(null); // Clear download state after clicking
  };

  const clearFiles = () => {
    setFiles([]);
    setDownloadInfo(null);
    const fileInput = document.getElementById(`file-input-${endpoint}`);
    if (fileInput) {
      fileInput.value = null;
    }
  };

  return (
    // Add some margin if needed within parent container, e.g., className="mx-auto max-w-xl"
    <IonCard className="m-0 shadow-md rounded-lg"> {/* Added shadow and rounding */}
      <IonCardHeader className="pb-2"> {/* Reduced bottom padding */}
        <IonCardTitle className="text-xl font-semibold text-gray-800">{title}</IonCardTitle>
      </IonCardHeader>

      {/* Ensure IonCardContent wraps all the body content */}
      <IonCardContent>

        <IonText color="medium"> {/* Use Ionic color or Tailwind text-gray-600 */}
          <p className="text-sm mb-4 leading-relaxed">{instructions}</p>
        </IonText>

        <div className="file-upload-container space-y-4"> {/* Use Tailwind for vertical spacing */}
          <input
            type="file"
            id={`file-input-${endpoint}`}
            accept={acceptedFiles}
            multiple={multiple}
            onChange={handleFileChange}
            style={{ display: "none" }} // Keep hidden
            disabled={isLoading}
          />

          {/* Select File Button */}
          <IonButton
            expand="block"
            fill="outline" // Outline style
            onClick={() => document.getElementById(`file-input-${endpoint}`).click()}
            disabled={isLoading}
            className="py-2.5" // Tailwind for padding if needed, but Ionic sizing might be better
          >
            <IonIcon slot="start" icon={cloudUploadOutline} />
            Select File{multiple ? "s" : ""}
          </IonButton>

          {/* Selected Files Display Area */}
          {files.length > 0 && (
            <div className="selected-files bg-gray-50 p-3 rounded-md border border-gray-200">
              <IonItem lines="none" color="transparent"> {/* Transparent background for Item */}
                <IonLabel>
                  <h3 className="mb-1 text-sm font-medium text-gray-700">Selected:</h3>
                  {files.map((file, index) => (
                    <p key={index} className="text-xs text-gray-900 truncate py-0.5"> {/* Truncate long names */}
                      {file.name}
                    </p>
                  ))}
                </IonLabel>
                {/* Clear Button */}
                <IonButton
                  fill="clear"
                  color="medium" // Or "danger"
                  onClick={clearFiles}
                  slot="end"
                  disabled={isLoading}
                  className="mr-[-8px]" // Adjust spacing if needed
                 >
                  <IonIcon icon={closeCircleOutline} />
                </IonButton>
              </IonItem>
            </div>
          )}

          {/* Action Buttons Area */}
          <div className="action-buttons pt-2 space-y-3"> {/* Add top padding and space */}
            {/* Process Button */}
            <IonButton
              expand="block"
              onClick={handleSubmit}
              disabled={isLoading || files.length === 0}
              color="primary"
              className="font-medium text-base py-2.5" // Example: Tailwind font/size/padding adjustments
            >
              {isLoading ? <IonSpinner name="dots" color="light" /> : `Process ${multiple ? "Files" : "File"}`}
            </IonButton>

            {/* Download Button - Conditionally Rendered */}
            {downloadInfo && (
              <IonButton
                expand="block"
                onClick={handleDownload}
                color="success" // Use success color for download
                className="font-medium text-base py-2.5" // Example: Tailwind font/size/padding adjustments
              >
                <IonIcon slot="start" icon={downloadOutline} />
                Download Result
              </IonButton>
            )}
          </div> {/* Closing div for action-buttons */}

        </div> {/* Closing div for file-upload-container */}

      </IonCardContent> {/* *** ENSURE THIS CLOSING TAG IS PRESENT *** */}

      {/* Toast Notification */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={4000}
        color={toastColor}
        position="bottom"
      />
    </IonCard> // Closing IonCard
  ); // Closing return
}; // Closing component function

export default FileUploadCard;