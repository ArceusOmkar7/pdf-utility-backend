import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonButtons,
    IonMenuButton,
  } from "@ionic/react"
  import { imagesOutline, documentOutline, imageOutline, layersOutline } from "ionicons/icons"
  
  const Home = () => {
    const tools = [
      {
        title: "PDF to Images",
        description: "Convert PDF files to a collection of images",
        icon: imagesOutline,
        path: "/pdf-to-images",
      },
      {
        title: "Word to PDF",
        description: "Convert Word documents to PDF format",
        icon: documentOutline,
        path: "/word-to-pdf",
      },
      {
        title: "Images to PDF",
        description: "Combine multiple images into a single PDF",
        icon: imageOutline,
        path: "/images-to-pdf",
      },
      {
        title: "Merge PDFs",
        description: "Combine multiple PDF files into one document",
        icon: layersOutline,
        path: "/merge-pdfs",
      },
    ]
  
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>PDF Utility Tool</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Welcome to PDF Utility Tool</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                This application provides various tools to work with PDF files. Select one of the tools below to get
                started.
              </p>
            </IonCardContent>
          </IonCard>
  
          <IonGrid>
            <IonRow>
              {tools.map((tool) => (
                <IonCol size="12" sizeMd="6" key={tool.path}>
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonIcon icon={tool.icon} style={{ marginRight: "8px" }} />
                        {tool.title}
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p>{tool.description}</p>
                      <IonButton expand="block" routerLink={tool.path}>
                        Open Tool
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    )
  }
  
  export default Home
  