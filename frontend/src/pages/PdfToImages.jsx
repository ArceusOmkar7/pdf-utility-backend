// frontend/src/pages/PdfToImages.jsx (with Tailwind padding)
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonMenuButton } from "@ionic/react";
import FileUploadCard from "../components/FileUploadCard";

const PdfToImages = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>PDF to Images</IonTitle>
        </IonToolbar>
      </IonHeader>
       {/* Add Tailwind padding to IonContent */}
      <IonContent fullscreen className="p-4 md:p-6"> {/* Example padding */}
        <FileUploadCard
          title="Convert PDF to Images"
          endpoint="/pdf-to-images"
          acceptedFiles=".pdf"
          multiple={false}
          instructions="Upload a PDF file to convert it into a collection of images. Each page of the PDF will be converted to a separate image. The result will be downloaded as a ZIP file."
        />
      </IonContent>
    </IonPage>
  );
};

export default PdfToImages;