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
        <IonToolbar style={{ backgroundColor: darkMode ? 'var(--ion-toolbar-background)' : 'var(--ion-background-color)', color: darkMode ? 'var(--ion-toolbar-color)' : 'var(--ion-text-color)' }}>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className={`font-bold ${darkMode ? 'text-[var(--almond)]' : 'text-[var(--black)]'}`}>PDF Utility Tool</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={toggleDarkMode}>
              <IonIcon icon={darkMode ? sunnyOutline : moonOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className={`ion-padding ${darkMode ? 'bg-gradient-to-br from-gray-900 to-black text-[var(--almond)]' : 'bg-gradient-to-br from-white to-gray-100 text-[var(--black)]'}`}>

        {/* Enhanced Welcome Section */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: 'url(/assets/about-image.png)' }}></div>
          <IonCard className={`relative z-10 mb-6 shadow-2xl rounded-3xl overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-white to-gray-100 border border-gray-300'}`}>
            <IonCardHeader className="p-8">
              <IonCardTitle className={`text-4xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Welcome to PDF Utility Tool</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className={`p-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="text-lg leading-relaxed">
                Simplify your PDF tasks with our powerful tools. Convert, merge, and create PDFs effortlessly.
              </p>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Enhanced Grid for Tools */}
        <IonGrid>
          <IonRow className="flex flex-wrap justify-center gap-8">
            {tools.map((tool) => (
              <IonCol size="12" sizeMd="5" sizeLg="3" key={tool.path} className="flex-shrink-0">
                <IonCard
                  routerLink={tool.path}
                  className={`h-56 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-transform duration-300 flex flex-col items-center justify-center text-center cursor-pointer`}
                >
                  <IonCardHeader>
                    <div className="flex flex-col items-center space-y-4">
                      <ion-icon icon={tool.icon} class="text-6xl text-white"></ion-icon>
                      <IonCardTitle className="text-xl font-bold tracking-wide text-white">{tool.title}</IonCardTitle>
                    </div>
                  </IonCardHeader>
                  <IonCardContent className="text-sm text-gray-200">
                    {tool.description}
                  </IonCardContent>
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