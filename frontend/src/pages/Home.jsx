// frontend/src/pages/Home.jsx (with Tailwind)
import React, { useState, useEffect } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonIcon, IonGrid, IonRow, IonCol,
    IonButtons, IonMenuButton,
} from "@ionic/react";
import { imagesOutline, documentOutline, imageOutline, layersOutline } from "ionicons/icons";
import { sunnyOutline, moonOutline } from "ionicons/icons";

const Home = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage for theme preference on component mount
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark');
    }

  }, []); // Empty dependency array means this only runs once on mount

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const tools = [
    { title: "PDF to Images", description: "Convert PDF files to a collection of images", icon: imagesOutline, path: "/pdf-to-images" },
    { title: "Word to PDF", description: "Convert Word documents to PDF format", icon: documentOutline, path: "/word-to-pdf" },
    { title: "Images to PDF", description: "Combine multiple images into a single PDF", icon: imageOutline, path: "/images-to-pdf" },
    { title: "Merge PDFs", description: "Combine multiple PDF files into one document", icon: layersOutline, path: "/merge-pdfs" },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color={darkMode ? "dark" : "primary"}>
          <IonButtons slot="start">
            <IonMenuButton color="light" />
          </IonButtons>
          <IonTitle className={`font-bold ${darkMode ? 'text-[var(--almond)]' : 'text-[var(--black)]'}`}>PDF Utility Tool</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={toggleDarkMode}>
              <IonIcon icon={darkMode ? sunnyOutline : moonOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className={`ion-padding ${darkMode ? 'bg-[var(--black)] text-[var(--almond)]' : 'bg-[var(--almond)] text-[var(--black)]'}`}>

        {/* Welcome Card */}
        <IonCard className={`mb-6 shadow-md rounded-2xl ${darkMode ? 'bg-[var(--gunmetal)] border border-[var(--walnut-brown)]' : 'bg-[var(--almond)] border border-[var(--khaki)]'}`}>
          <IonCardHeader>
            <IonCardTitle className={`text-2xl font-semibold ${darkMode ? 'text-[var(--almond)]' : 'text-[var(--black)]'}`}>Welcome to PDF Utility Tool</IonCardTitle>
          </IonCardHeader>
          <IonCardContent className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            <p>
              This application provides various tools to work with PDF files. Select one of the tools below to get
              started.
            </p>
          </IonCardContent>
        </IonCard>

        {/* Grid for Tools */}
        <IonGrid>
          <IonRow className="flex flex-nowrap overflow-x-auto space-x-4">
            {tools.map((tool) => (
              <IonCol size="auto" key={tool.path} className="flex-shrink-0">
                <IonCard
                  routerLink={tool.path}
                  className="h-40 md:h-48 bg-gradient-to-br from-zinc-800 to-zinc-700 text-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.05] transition-transform duration-300 flex flex-col items-center justify-center text-center cursor-pointer"
                >
                  <IonCardHeader>
                    <div className="flex flex-col items-center space-y-2">
                      <ion-icon icon={tool.icon} class="text-5xl text-sky-400"></ion-icon>
                      <IonCardTitle className="text-lg font-semibold tracking-wide text-white">{tool.title}</IonCardTitle>
                    </div>
                  </IonCardHeader>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;