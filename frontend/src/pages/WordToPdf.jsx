import React, { useState, useRef } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  // Import components needed for list/reorder
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonReorderGroup,
  IonReorder,
  IonText,
  IonNote,
  IonSpinner,
  useIonToast,
} from "@ionic/react";
// Import relevant icons
import {
  cloudUploadOutline,
  documentTextOutline,
  trashOutline,
  cloudDownloadOutline,
  documentAttachOutline,
} from "ionicons/icons"; // Use documentAttachOutline for convert

// Component Function (for WordToPdf.jsx - Supports Multiple Files)
const WordToPdf = () => {
  // --- CHANGE: Use array state for multiple files ---
  const [selectedFiles, setSelectedFiles] = useState([]);
  // --- END CHANGE ---
  const [isLoading, setIsLoading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [presentToast] = useIonToast();
  const fileInputRef = useRef(null);

  // Constants specific to this conversion
  const acceptedFiles =
    ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  // --- CHANGE: Assuming backend will be updated for multiple files ---
  const backendEndpoint = "http://localhost:5000/word-to-pdf"; // Endpoint needs backend update for multiple
  const backendFileKey = "files"; // Key needs backend update to use getlist('files')
  // --- END CHANGE ---

  // Validation arrays
  const validWordTypes = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const validWordExtensions = [".doc", ".docx"];

  // --- Drag and Drop Handlers (Allow Multiple) ---
  const handleDragEnter = (event) => {
    /* ... (same) ... */
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };
  const handleDragLeave = (event) => {
    /* ... (same) ... */
    event.preventDefault();
    event.stopPropagation();
    const relatedTarget = event.relatedTarget;
    if (!event.currentTarget.contains(relatedTarget)) {
      setIsDraggingOver(false);
    }
  };
  const handleDragOver = (event) => {
    /* ... (same) ... */
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      // --- CHANGE: Filter and append ALL valid Word files ---
      const newFiles = Array.from(droppedFiles).filter(
        (file) =>
          validWordTypes.includes(file.type) ||
          validWordExtensions.some((ext) =>
            file.name.toLowerCase().endsWith(ext)
          )
      );
      if (newFiles.length !== droppedFiles.length) {
        presentToast({
          message: "Some non-Word files (.doc, .docx) were ignored.",
          duration: 3000,
          color: "warning",
        });
      }
      if (newFiles.length > 0) {
        setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]); // Append valid files
      }
      // --- END CHANGE ---
      if (event.dataTransfer.items) {
        event.dataTransfer.items.clear();
      } else {
        event.dataTransfer.clearData();
      }
    }
  };

  // --- Standard File Selection and Management Handlers (Allow Multiple) ---
  const handleSelectFileClick = () => {
    /* ... (same) ... */
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      // --- CHANGE: Append ALL selected valid Word files ---
      const newFiles = Array.from(event.target.files).filter(
        (
          file // Filter here too
        ) =>
          validWordTypes.includes(file.type) ||
          validWordExtensions.some((ext) =>
            file.name.toLowerCase().endsWith(ext)
          )
      );
      if (newFiles.length !== event.target.files.length) {
        presentToast({
          message: "Some non-Word files (.doc, .docx) were ignored.",
          duration: 3000,
          color: "warning",
        });
      }
      if (newFiles.length > 0) {
        setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]); // Append valid files
      }
      // --- END CHANGE ---
      event.target.value = ""; // Reset input
    }
  };
  // --- CHANGE: Reintroduce Reorder Handler ---
  const handleReorder = (event) => {
    const fromIndex = event.detail.from;
    const toIndex = event.detail.to;
    const filesInOrder = [...selectedFiles];
    const [movedItem] = filesInOrder.splice(fromIndex, 1);
    filesInOrder.splice(toIndex, 0, movedItem);
    setSelectedFiles(filesInOrder);
    event.detail.complete();
  };
  // --- END CHANGE ---
  // --- CHANGE: Reintroduce Remove Handler for list item ---
  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };
  // --- END CHANGE ---

  // --- Submit Handler (Adjusted for Multiple Word to PDF) ---
  // --- ASSUMES BACKEND WILL BE UPDATED to return a ZIP ---
  const handleConvertSubmit = async () => {
    // --- CHANGE: Check if at least one file is selected ---
    if (selectedFiles.length < 1) {
      presentToast({
        message: "Please select at least one Word file to convert.",
        duration: 3000,
        color: "warning",
      });
      return;
    }
    // --- END CHANGE ---

    setIsLoading(true);
    const formData = new FormData();

    // --- CHANGE: Append all files using the backend key ('files' assuming backend update) ---
    selectedFiles.forEach((file) => {
      formData.append(backendFileKey, file); // Use the key backend expects (e.g., 'files')
    });
    // --- END CHANGE ---

    try {
      // Endpoint remains /word-to-pdf, but backend needs update to handle multiple files
      const response = await fetch(backendEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch (e) {}
        // Keep specific error hints
        if (
          (response.status === 500 &&
            errorMsg.toLowerCase().includes("libreoffice")) ||
          errorMsg.toLowerCase().includes("conversion tool")
        ) {
          errorMsg =
            "Conversion failed. Ensure LibreOffice (Linux/Mac) or MS Office (Windows) is installed correctly on the server.";
        } else if (
          response.status === 500 &&
          errorMsg.toLowerCase().includes("docx2pdf")
        ) {
          errorMsg =
            "Conversion failed. Ensure docx2pdf requirements (like MS Office COM) are met on the Windows server.";
        }
        throw new Error(errorMsg);
      }

      // --- CHANGE: Expecting a ZIP file containing multiple PDFs ---
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = downloadUrl;

      const disposition = response.headers.get("Content-Disposition");
      let filename = "converted_word_files.zip"; // Default name for the ZIP
      if (disposition && disposition.includes("attachment")) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches?.[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();

      presentToast({
        message:
          "Word documents converted to PDFs successfully! Check downloads for the ZIP file.",
        duration: 4000,
        color: "success",
      });
      // --- END CHANGE ---
      setSelectedFiles([]); // Clear list on success
    } catch (error) {
      console.error("Error converting Word to PDF:", error);
      presentToast({
        message: `Conversion Error: ${error?.message || "Please try again."}`,
        duration: 5000,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Component Render ---
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Word to PDF</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="p-4 md:p-6">
        {/* New Title and Description Section */}
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl font-bold mb-2 text-center">
            Word to PDF Conversion
          </h1>
          <p className="text-center text-gray-600 mb-4">
            Transform your Word documents (.doc, .docx) into professional PDF
            files. Upload multiple documents at once and receive a convenient
            zip file with all conversions.
          </p>
          <div className="w-16 h-1 bg-primary mx-auto mb-6"></div>
        </div>

        {/* --- CHANGE: Hidden input allows MULTIPLE --- */}
        <input
          type="file"
          accept={acceptedFiles}
          multiple // Allow multiple selection
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        {/* --- END CHANGE --- */}

        {/* Drop Zone Area */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${
              isDraggingOver
                ? "var(--ion-color-primary)"
                : "var(--ion-color-medium)"
            }`,
            borderRadius: "8px",
            padding: "20px",
            textAlign: "center",
            marginTop: "20px",
            marginBottom: "20px",
            backgroundColor: isDraggingOver
              ? "rgba(var(--ion-color-primary-rgb), 0.1)"
              : "transparent",
            transition: "border-color 0.3s ease, background-color 0.3s ease",
            cursor: "pointer",
          }}
          onClick={!isLoading ? handleSelectFileClick : undefined}
        >
          {/* --- CHANGE: Simplified prompt, list shown below --- */}
          <IonIcon
            icon={isDraggingOver ? cloudDownloadOutline : cloudUploadOutline}
            style={{
              fontSize: "48px",
              marginBottom: "10px",
              color: isDraggingOver
                ? "var(--ion-color-primary)"
                : "var(--ion-color-medium)",
            }}
            aria-hidden="true"
          />
          <IonText color="medium">
            <p>Drag and drop Word file(s) here (.doc, .docx)</p>
            <p style={{ fontSize: "smaller", margin: "5px 0" }}>or</p>
          </IonText>
          <IonButton fill="clear" disabled={isLoading} size="small">
            Click to Select File(s)
          </IonButton>
          <IonText
            color="medium"
            style={{ display: "block", fontSize: "smaller", marginTop: "10px" }}
          >
            (Convert one or more Word documents to PDF)
          </IonText>
          {/* --- END CHANGE --- */}
        </div>

        {/* --- CHANGE: Reintroduce List Display --- */}
        {selectedFiles.length > 0 && (
          <>
            <IonList lines="full">
              {/* Optional: Add reorder group if order matters */}
              <IonReorderGroup
                disabled={isLoading}
                onIonItemReorder={handleReorder}
              >
                {selectedFiles.map((file, index) => (
                  <IonItem key={`${file.name}-${index}-${file.lastModified}`}>
                    <IonIcon
                      slot="start"
                      icon={documentTextOutline}
                      color="medium"
                    />
                    <IonLabel>
                      {file.name}
                      <p>
                        <IonNote>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </IonNote>
                      </p>
                    </IonLabel>
                    <IonButton
                      fill="clear"
                      slot="end"
                      color="danger"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isLoading}
                    >
                      <IonIcon slot="icon-only" icon={trashOutline} />
                    </IonButton>
                    {/* Optional: Add reorder handle */}
                    <IonReorder slot="end" />
                  </IonItem>
                ))}
              </IonReorderGroup>
            </IonList>

            {/* Convert Button */}
            <div className="ion-text-center ion-margin-top">
              <IonButton
                onClick={handleConvertSubmit}
                disabled={selectedFiles.length === 0 || isLoading} // Enable if 1 or more files
                expand="block"
              >
                {isLoading ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <>
                    <IonIcon slot="start" icon={documentAttachOutline} />
                    Convert {selectedFiles.length} Word File
                    {selectedFiles.length !== 1 ? "s" : ""} to PDF
                  </>
                )}
              </IonButton>
              {/* Optional: Button to add more files */}
              <IonButton
                fill="clear"
                onClick={handleSelectFileClick}
                disabled={isLoading}
                size="small"
                className="ion-margin-top"
              >
                <IonIcon slot="start" icon={cloudUploadOutline} />
                Add More Word File(s)...
              </IonButton>
            </div>
          </>
        )}
        {/* --- END CHANGE --- */}
      </IonContent>
    </IonPage>
  );
};

export default WordToPdf;
