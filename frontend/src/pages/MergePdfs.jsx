import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonMenuButton } from "@ionic/react"
import FileUploadCard from "../components/FileUploadCard"

const MergePdfs = () => {
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
      <IonContent fullscreen>
        <FileUploadCard
          title="Merge PDF Files"
          endpoint="/merge-pdfs"
          acceptedFiles=".pdf"
          multiple={true}
          instructions="Upload multiple PDF files to combine them into a single PDF document. The PDFs will be merged in the order they were selected. This is useful for combining chapters, reports, or any related PDF documents."
        />
      </IonContent>
    </IonPage>
  )
}

export default MergePdfs
