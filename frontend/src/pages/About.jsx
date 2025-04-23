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
    IonButtons,
    IonMenuButton,
    IonItem,
    IonIcon,
    IonLabel,
  } from "@ionic/react"
  import { documentTextOutline, imageOutline, layersOutline, cloudDownloadOutline } from "ionicons/icons"
  
  const About = () => {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>About Us</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>About PDF Utility Tool</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                PDF Utility Tool is a comprehensive solution for all your PDF-related needs. Our application provides a
                simple and intuitive interface to perform various operations on PDF files, making document management
                easier than ever.
              </p>
  
              <p>
                Built with Ionic and React, this application offers a seamless experience across all devices, from
                desktops to mobile phones.
              </p>
            </IonCardContent>
          </IonCard>
  
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Our Features</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem lines="none">
                <IonIcon icon={documentTextOutline} slot="start" />
                <IonLabel>
                  <h2>PDF to Images</h2>
                  <p>Convert PDF documents to high-quality images</p>
                </IonLabel>
              </IonItem>
  
              <IonItem lines="none">
                <IonIcon icon={documentTextOutline} slot="start" />
                <IonLabel>
                  <h2>Word to PDF</h2>
                  <p>Convert Word documents to PDF format</p>
                </IonLabel>
              </IonItem>
  
              <IonItem lines="none">
                <IonIcon icon={imageOutline} slot="start" />
                <IonLabel>
                  <h2>Images to PDF</h2>
                  <p>Combine multiple images into a single PDF file</p>
                </IonLabel>
              </IonItem>
  
              <IonItem lines="none">
                <IonIcon icon={layersOutline} slot="start" />
                <IonLabel>
                  <h2>Merge PDFs</h2>
                  <p>Combine multiple PDF files into one document</p>
                </IonLabel>
              </IonItem>
  
              <IonItem lines="none">
                <IonIcon icon={cloudDownloadOutline} slot="start" />
                <IonLabel>
                  <h2>Easy Download</h2>
                  <p>Download your processed files with a single click</p>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>
  
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Privacy & Security</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                We take your privacy seriously. All file processing is done on our secure servers, and we do not store
                your files after processing. Your documents are automatically deleted once the conversion is complete.
              </p>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    )
  }
  
  export default About
  