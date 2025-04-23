import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonMenuButton } from "@ionic/react";
import FileUploadCard from "../components/FileUploadCard"; // Ensure path is correct

const ImagesToPdf = () => {
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
      <IonContent fullscreen className="ion-padding"> {/* Added padding to content */}
        <FileUploadCard
          title="Convert Images to PDF"
          endpoint="/images-to-pdf"
          // --- CHANGE: Align accepted files with backend endpoint ---
          acceptedFiles=".jpg,.jpeg,.png"
          // --- End CHANGE ---
          multiple={true}
          instructions="Upload one or more images (JPG, JPEG, PNG) to combine them into a single PDF document. The images will be included in the PDF in the order they are selected."
        />
      </IonContent>
    </IonPage>
  );
};

export default ImagesToPdf;