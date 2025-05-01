import React, { useState, useRef } from 'react';
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
  useIonToast
} from "@ionic/react";
// Import different icons for visual feedback
import { cloudUploadOutline, documentTextOutline, trashOutline, cloudDownloadOutline, checkmarkCircleOutline } from 'ionicons/icons';

// Component Function (for MergePdfs.jsx)
const MergePdfs = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false); // State for drop zone highlight
  const [presentToast] = useIonToast();
  const fileInputRef = useRef(null);

  // --- Drag and Drop Handlers ---

  const handleDragEnter = (event) => {
    event.preventDefault(); // Necessary to allow dropping
    event.stopPropagation();
    setIsDraggingOver(true); // Highlight the drop zone
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    // Check if the leave event is not heading towards a child element
    // This check might need refinement depending on exact structure
    const relatedTarget = event.relatedTarget;
    if (!event.currentTarget.contains(relatedTarget)) {
        setIsDraggingOver(false); // Remove highlight
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Necessary to allow dropping
    event.stopPropagation();
    // Can add other visual cues here if needed while hovering
     setIsDraggingOver(true); // Ensure highlight stays on if dragging continues over
  };

  const handleDrop = (event) => {
    event.preventDefault(); // Prevent browser's default file handling
    event.stopPropagation();
    setIsDraggingOver(false); // Remove highlight

    const droppedFiles = event.dataTransfer.files; // Get the dropped files

    if (droppedFiles && droppedFiles.length > 0) {
      // Convert FileList to array and filter for PDFs
      const newFiles = Array.from(droppedFiles).filter(file =>
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      );

      if (newFiles.length !== droppedFiles.length) {
        presentToast({
          message: 'Some non-PDF files were ignored.',
          duration: 3000,
          color: 'warning'
        });
      }

      if (newFiles.length > 0) {
         // Append valid new files to the existing list
        setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
      }

      // Clear the drag data cache (good practice)
      if (event.dataTransfer.items) {
        event.dataTransfer.items.clear();
      } else {
        event.dataTransfer.clearData();
      }
    }
  };

  // --- Existing Handlers (modified slightly if needed) ---

  const handleSelectFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files); // Already filtered by 'accept' attribute
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
      event.target.value = '';
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
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleMergeSubmit = async () => {
    if (selectedFiles.length < 2) {
      presentToast({ message: 'Please select at least two PDF files.', duration: 3000, color: 'warning' });
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      // Using the absolute URL that works for you
      const response = await fetch('http://localhost:5000/api/merge-pdfs', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try { const errData = await response.json(); errorMsg = errData.error || errorMsg; } catch (e) {}
        throw new Error(errorMsg);
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none'; a.href = downloadUrl;
      const disposition = response.headers.get('Content-Disposition');
      let filename = 'merged.pdf';
      if (disposition && disposition.includes('attachment')) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches?.[1]) { filename = matches[1].replace(/['"]/g, ''); }
      }
      a.download = filename; document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(downloadUrl); a.remove();
      presentToast({ message: 'Files merged successfully!', duration: 3000, color: 'success' });
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error merging files:', error);
      presentToast({ message: `Error merging files: ${error?.message || 'Please try again.'}`, duration: 4000, color: 'danger' });
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
          <IonTitle>Merge PDFs</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">

        {/* Hidden file input element */}
        <input
          type="file"
          accept=".pdf"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* --- Drop Zone Area --- */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDraggingOver ? 'var(--ion-color-primary)' : 'var(--ion-color-medium)'}`, // Dynamic border color
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px',
            backgroundColor: isDraggingOver ? 'rgba(var(--ion-color-primary-rgb), 0.1)' : 'transparent', // Subtle background on hover
            transition: 'border-color 0.3s ease, background-color 0.3s ease' // Smooth transition
          }}
        >
          <IonIcon
            icon={isDraggingOver ? cloudDownloadOutline : cloudUploadOutline} // Change icon on drag over
            style={{ fontSize: '48px', marginBottom: '10px', color: isDraggingOver ? 'var(--ion-color-primary)' : 'var(--ion-color-medium)'}}
            aria-hidden="true"
           />
          <IonText color="medium">
            <p>Drag and drop PDF files here</p>
            <p style={{fontSize: 'smaller', margin: '5px 0'}}>or</p>
          </IonText>
          {/* Button to trigger the hidden file input */}
          <IonButton fill="outline" onClick={handleSelectFilesClick} disabled={isLoading}>
            Select Files From Computer
          </IonButton>
          <IonText color="medium" style={{display: 'block', fontSize: 'smaller', marginTop: '10px'}}>
            (Combine multiple PDFs into one)
          </IonText>
        </div>
        {/* --- End Drop Zone --- */}


        {/* List of selected files (unchanged) */}
        {selectedFiles.length > 0 && (
          <>
            <IonList lines="full">
              <IonReorderGroup disabled={isLoading} onIonItemReorder={handleReorder}>
                {selectedFiles.map((file, index) => (
                  <IonItem key={`${file.name}-${index}-${file.lastModified}`}> {/* Slightly more unique key */}
                     <IonIcon slot="start" icon={documentTextOutline} color="medium"/>
                    <IonLabel>
                      {file.name}
                      <p><IonNote>{(file.size / 1024 / 1024).toFixed(2)} MB</IonNote></p>
                    </IonLabel>
                     <IonButton fill="clear" slot="end" color="danger" onClick={() => handleRemoveFile(index)} disabled={isLoading}>
                       <IonIcon slot="icon-only" icon={trashOutline} />
                     </IonButton>
                    <IonReorder slot="end" />
                  </IonItem>
                ))}
              </IonReorderGroup>
            </IonList>

            {/* Merge button area */}
            <div className="ion-text-center ion-margin-top">
              <IonButton onClick={handleMergeSubmit} disabled={selectedFiles.length < 2 || isLoading} expand="block">
                {isLoading ? <IonSpinner name="crescent" /> : (
                    <>
                        <IonIcon slot="start" icon={checkmarkCircleOutline}/> {/* Use checkmark icon */}
                        Merge {selectedFiles.length} Files
                    </>
                 )}
              </IonButton>
              {/* Optional: Button to add more files via click after initial selection */}
               <IonButton fill="clear" onClick={handleSelectFilesClick} disabled={isLoading} size="small" className="ion-margin-top">
                   <IonIcon slot="start" icon={cloudUploadOutline} />
                   Add More Files...
               </IonButton>
            </div>
          </>
        )}

         {/* Placeholder when no files selected (optional, as dropzone text covers this) */}
         {/* {selectedFiles.length === 0 && !isLoading && ( ... )} */}

      </IonContent>
    </IonPage>
  );
};

export default MergePdfs;