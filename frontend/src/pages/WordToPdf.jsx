import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonMenuButton } from "@ionic/react"
import FileUploadCard from "../components/FileUploadCard"

const WordToPdf = () => {
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
      <IonContent fullscreen>
        <FileUploadCard
          title="Convert Word to PDF"
          endpoint="/word-to-pdf"
          acceptedFiles=".doc,.docx"
          multiple={false}
          instructions="Upload a Word document (.doc or .docx) to convert it to PDF format. The formatting and layout of your document will be preserved in the resulting PDF."
        />
      </IonContent>
    </IonPage>
  )
}

export default WordToPdf
