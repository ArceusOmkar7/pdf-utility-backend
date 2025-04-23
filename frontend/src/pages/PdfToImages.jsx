import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonMenuButton } from "@ionic/react"
import FileUploadCard from "../components/FileUploadCard"

const PdfToImages = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>PDF to Images</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <FileUploadCard
          title="Convert PDF to Images"
          endpoint="/pdf-to-images"
          acceptedFiles=".pdf"
          multiple={false}
          instructions="Upload a PDF file to convert it into a collection of images. Each page of the PDF will be converted to a separate image. The result will be downloaded as a ZIP file."
        />
      </IonContent>
    </IonPage>
  )
}

export default PdfToImages
