import React from 'react';
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
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonMenuButton,
} from "@ionic/react";
import {
  documentTextOutline,
  imageOutline,
  layersOutline,
  cloudDownloadOutline,
} from "ionicons/icons";
import aboutImage from "../assets/about-image.png"; // Import the image

const About = () => { // Changed to a standard JavaScript function
  const imageStyle = {
    maxWidth: '100%',
    height: 'auto',
    marginTop: '1rem',
  };

  const textStyle = {
    padding: '1rem',
    marginTop: '1rem',
  };

  const featuresSectionStyle = {
    padding: '1rem',
    marginTop: '2rem',
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="text-[var(--almond)] font-bold">About Us</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding bg-[var(--gunmetal)] text-[var(--almond)]">
        {/* About PDF Utility Tool Section */}
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <h1>About PDF Utility Tool</h1>
          <p>
            PDF Utility Tool is a comprehensive solution for all your PDF-related needs. Our application provides a simple and intuitive interface to perform various operations on PDF files, making document management easier than ever.
          </p>
          <p>
            Built with Ionic and React, this application offers a seamless experience across all devices, from desktops to mobile phones.
          </p>
        </div>

        {/* New Image Section (Centered) */}
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <img
            src={aboutImage} // Use the imported image
            alt="About Us"
            style={{ maxWidth: '50%', height: 'auto' }} // Adjusted size to make the image smaller
          />
        </div>

        {/* Text Content
        <div style={textStyle}>
          <p>We're a fully distributed team of 85 people living and working in 15 countries around the world. And we're working to build the best products to help our customers build their brands and grow their businesses on social media.</p>
          <p>We've always aimed to do things a little differently at Buffer. Since the early days, we've had a focus on building one of the most unique and fulfilling workplaces by rethinking a lot of traditional practices.</p>
        </div> */}

        {/* Our Features Section */}
        <div style={featuresSectionStyle}>
          <h2>Our Features</h2>
          <IonGrid>
            <IonRow>
              {[
                { icon: documentTextOutline, title: "PDF to Images", desc: "Convert PDF documents to high-quality images" },
                { icon: documentTextOutline, title: "Word to PDF", desc: "Convert Word documents to PDF format" },
                { icon: imageOutline, title: "Images to PDF", desc: "Combine multiple images into a single PDF file" },
                { icon: layersOutline, title: "Merge PDFs", desc: "Combine multiple PDF files into one document" },
                { icon: cloudDownloadOutline, title: "Easy Download", desc: "Download your processed files with a single click" },
              ].map(({ icon, title, desc }, index) => (
                <IonCol size="6" key={index}>
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>{title}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p>{desc}</p>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default About;