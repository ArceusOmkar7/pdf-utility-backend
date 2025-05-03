import React, { useState, useRef } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
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
  IonProgressBar,
  useIonToast,
} from "@ionic/react";
// Import relevant icons
import {
  cloudUploadOutline,
  imageOutline,
  trashOutline,
  cloudDownloadOutline,
  checkmarkCircleOutline,
  documentAttachOutline,
} from "ionicons/icons";

// Component Function (for ImagesToPdf.jsx)
const ImagesToPdf = () => {
  // State for selected image files
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false); // State for drop zone visual feedback
  const [progress, setProgress] = useState(0); // Add progress state
  const [progressText, setProgressText] = useState(""); // Add progress text state
  const [presentToast] = useIonToast();
  const fileInputRef = useRef(null);

  // Constants specific to this conversion
  const acceptedFiles = ".jpg,.jpeg,.png";
  const backendEndpoint = "http://localhost:5000/images-to-pdf"; // Use the correct backend route
  const backendFileKey = "images"; // The key the backend expects for image files

  // Function to handle fetch with progress tracking
  const fetchWithProgress = (url, options, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(options.method || "GET", url);

      // Listen for progress events
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          onProgress(percentComplete, "Uploading images...");
        }
      });

      xhr.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          onProgress(percentComplete, "Processing...");
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = {
            ok: true,
            status: xhr.status,
            headers: {
              get: (name) => xhr.getResponseHeader(name),
            },
            blob: () => Promise.resolve(xhr.response),
          };
          resolve(response);
        } else {
          reject(new Error(`HTTP error! status: ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Request aborted"));
      });

      // Set headers
      if (options.headers) {
        Object.keys(options.headers).forEach((key) => {
          xhr.setRequestHeader(key, options.headers[key]);
        });
      }

      // Handle response as blob
      xhr.responseType = "blob";

      // Send the request
      xhr.send(options.body);
    });
  };

  // --- Drag and Drop Handlers (Similar to MergePdfs) ---

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const relatedTarget = event.relatedTarget;
    // Only remove highlight if leaving the dropzone entirely
    if (!event.currentTarget.contains(relatedTarget)) {
      setIsDraggingOver(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Important to allow drop
    event.stopPropagation();
    setIsDraggingOver(true); // Keep highlight active
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);

    const droppedFiles = event.dataTransfer.files;

    if (droppedFiles && droppedFiles.length > 0) {
      // Filter for allowed image types
      const allowedTypes = ["image/jpeg", "image/png"];
      const allowedExtensions = [".jpg", ".jpeg", ".png"];
      const newFiles = Array.from(droppedFiles).filter(
        (file) =>
          allowedTypes.includes(file.type) ||
          allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
      );

      if (newFiles.length !== droppedFiles.length) {
        presentToast({
          message: "Some non-image files (only JPG, PNG allowed) were ignored.",
          duration: 3500,
          color: "warning",
        });
      }

      if (newFiles.length > 0) {
        setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      }

      if (event.dataTransfer.items) {
        event.dataTransfer.items.clear();
      } else {
        event.dataTransfer.clearData();
      }
    }
  };

  // --- Standard File Selection and List Management Handlers ---

  const handleSelectFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    if (event.target.files) {
      // Input 'accept' attribute already filters, but double-check if needed
      const newFiles = Array.from(event.target.files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      event.target.value = ""; // Reset input
    }
  };

  const handleReorder = (event) => {
    const fromIndex = event.detail.from;
    const toIndex = event.detail.to;
    const filesInOrder = [...selectedFiles];
    const [movedItem] = filesInOrder.splice(fromIndex, 1);
    filesInOrder.splice(toIndex, 0, movedItem);
    setSelectedFiles(filesInOrder);
    event.detail.complete();
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  // --- Submit Handler (Adjusted for Images to PDF) ---

  const handleConvertSubmit = async () => {
    // Allow converting even a single image
    if (selectedFiles.length < 1) {
      presentToast({
        message: "Please select at least one image file.",
        duration: 3000,
        color: "warning",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setProgressText("Preparing...");
    const formData = new FormData();

    // Append files using the key the backend expects ('images')
    selectedFiles.forEach((file) => {
      formData.append(backendFileKey, file); // Use the correct key
    });

    try {
      const response = await fetchWithProgress(
        backendEndpoint,
        {
          method: "POST",
          body: formData,
        },
        (percentComplete, statusText) => {
          setProgress(percentComplete);
          setProgressText(statusText);
        }
      );

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = downloadUrl;

      // Set appropriate download filename
      const disposition = response.headers.get("Content-Disposition");
      let filename = "converted_images.pdf"; // Default name
      if (disposition && disposition.includes("attachment")) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches?.[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }
      a.download = filename; // Use extracted or default name
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();

      presentToast({
        message: "Images converted to PDF successfully!",
        duration: 3000,
        color: "success",
      });
      setSelectedFiles([]); // Clear list on success
      setProgress(0);
      setProgressText("");
    } catch (error) {
      console.error("Error converting images to PDF:", error);
      presentToast({
        message: `Error converting images: ${
          error?.message || "Please try again."
        }`,
        duration: 4000,
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
          <IonTitle>Images to PDF</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="p-4 md:p-6">
        {/* New Title and Description Section */}
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl font-bold mb-2 text-center">
            Images to PDF Conversion
          </h1>
          <p className="text-center text-gray-600 mb-4">
            Combine multiple images into a single PDF document. Upload, arrange,
            and convert your JPG and PNG files into a professional-looking PDF.
          </p>
          <div className="w-16 h-1 bg-primary mx-auto mb-6"></div>
        </div>

        {/* Hidden file input for image selection */}
        <input
          type="file"
          accept={acceptedFiles} // Set accepted image types
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {/* --- Drop Zone Area --- */}
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
          onClick={!isLoading ? handleSelectFilesClick : undefined}
        >
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
            <p>Drag and drop image files here (JPG, PNG)</p>
            <p style={{ fontSize: "smaller", margin: "5px 0" }}>or</p>
          </IonText>
          <IonButton
            fill="clear"
            onClick={handleSelectFilesClick}
            disabled={isLoading}
            size="small"
          >
            Click to Select File(s)
          </IonButton>
          <IonText
            color="medium"
            style={{ display: "block", fontSize: "smaller", marginTop: "10px" }}
          >
            (Combine images into a single PDF)
          </IonText>
        </div>
        {/* --- End Drop Zone --- */}

        {/* List of selected image files */}
        {selectedFiles.length > 0 && (
          <>
            <IonList lines="full">
              <IonReorderGroup
                disabled={isLoading}
                onIonItemReorder={handleReorder}
              >
                {selectedFiles.map((file, index) => (
                  <IonItem key={`${file.name}-${index}-${file.lastModified}`}>
                    {/* Use an image icon */}
                    <IonIcon slot="start" icon={imageOutline} color="medium" />
                    <IonLabel>
                      {file.name}
                      <p>
                        <IonNote>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </IonNote>
                      </p>
                    </IonLabel>
                    {/* Remove button */}
                    <IonButton
                      fill="clear"
                      slot="end"
                      color="danger"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isLoading}
                    >
                      <IonIcon slot="icon-only" icon={trashOutline} />
                    </IonButton>
                    {/* Reorder handle */}
                    <IonReorder slot="end" />
                  </IonItem>
                ))}
              </IonReorderGroup>
            </IonList>

            {/* Convert button area */}
            <div className="ion-text-center ion-margin-top">
              <IonButton
                onClick={handleConvertSubmit} // Call the correct submit handler
                disabled={selectedFiles.length < 1 || isLoading} // Enable for 1 or more files
                expand="block"
              >
                {isLoading ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <>
                    {/* Use a relevant icon like documentAttachOutline */}
                    <IonIcon slot="start" icon={documentAttachOutline} />
                    Convert {selectedFiles.length} Image
                    {selectedFiles.length !== 1 ? "s" : ""} to PDF
                  </>
                )}
              </IonButton>
              {/* Optional: Button to add more images */}
              <IonButton
                fill="clear"
                onClick={handleSelectFilesClick}
                disabled={isLoading}
                size="small"
                className="ion-margin-top"
              >
                <IonIcon slot="start" icon={cloudUploadOutline} />
                Add More Images...
              </IonButton>
            </div>
          </>
        )}

        {/* Progress Bar */}
        {isLoading && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-blue-700 dark:text-white">
                {progressText}
              </span>
              <span className="text-sm font-medium text-blue-700 dark:text-white">
                {progress}%
              </span>
            </div>
            <IonProgressBar
              value={progress / 100}
              color="primary"
              style={{ height: "8px", borderRadius: "4px" }}
            ></IonProgressBar>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ImagesToPdf;
