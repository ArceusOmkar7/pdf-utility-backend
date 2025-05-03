// frontend/src/pages/Home.jsx (with Tailwind)
import React, { useState, useEffect } from "react";
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
} from "@ionic/react";
import {
  imagesOutline,
  documentOutline,
  imageOutline,
  layersOutline,
} from "ionicons/icons";
import { sunnyOutline, moonOutline } from "ionicons/icons";

const Home = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage for theme preference on component mount
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark");
    }
  }, []); // Empty dependency array means this only runs once on mount

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const tools = [
    {
      title: "PDF to Images",
      description: "Convert PDF files to a collection of images",
      icon: imagesOutline,
      path: "/pdf-to-images",
      color: "from-purple-500 to-purple-700",
      iconColor: "#C084FC", // Purple icon color
    },
    {
      title: "Word to PDF",
      description: "Convert Word documents to PDF format",
      icon: documentOutline,
      path: "/word-to-pdf",
      color: "from-green-500 to-green-700",
      iconColor: "#4ADE80", // Green icon color
    },
    {
      title: "Images to PDF",
      description: "Combine multiple images into a single PDF",
      icon: imageOutline,
      path: "/images-to-pdf",
      color: "from-red-500 to-red-700",
      iconColor: "#F87171", // Red icon color
    },
    {
      title: "Merge PDFs",
      description: "Combine multiple PDF files into one document",
      icon: layersOutline,
      path: "/merge-pdfs",
      color: "from-yellow-500 to-amber-700",
      iconColor: "#FBBF24", // Amber/yellow icon color
    },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar
          style={{
            backgroundColor: darkMode
              ? "var(--ion-toolbar-background)"
              : "var(--ion-background-color)",
            color: darkMode
              ? "var(--ion-toolbar-color)"
              : "var(--ion-text-color)",
          }}
        >
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle
            className={`font-bold ${
              darkMode ? "text-[var(--almond)]" : "text-[var(--black)]"
            } animate-fade-in`}
          >
            PDF Utility Tool
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={toggleDarkMode} className="animate-spin-slow">
              <IonIcon icon={darkMode ? sunnyOutline : moonOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent
        fullscreen
        className={`ion-padding ${
          darkMode
            ? "bg-gradient-to-br from-gray-900 to-black text-[var(--almond)]"
            : "bg-gradient-to-br from-white to-gray-100 text-[var(--black)]"
        }`}
      >
        {/* Enhanced Welcome Section with Animation */}
        <div className="relative mb-8 animate-slide-up">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url(/assets/about-image.png)" }}
          ></div>
          <IonCard
            className={`relative z-10 mb-6 shadow-2xl rounded-3xl overflow-hidden ${
              darkMode
                ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
                : "bg-gradient-to-br from-white to-gray-100 border border-gray-300"
            }`}
          >
            <IonCardHeader className="p-8">
              <IonCardTitle
                className={`text-4xl font-extrabold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Welcome to PDF Utility Tool
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent
              className={`p-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              <p className="text-lg leading-relaxed">
                Simplify your PDF tasks with our powerful tools. Convert, merge,
                and create PDFs effortlessly.
              </p>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Enhanced Grid for Tools with larger icons and animations */}
        <IonGrid>
          <IonRow className="flex flex-wrap justify-center gap-8">
            {tools.map((tool, index) => (
              <IonCol
                size="12"
                sizeMd="5"
                sizeLg="3"
                key={tool.path}
                className="flex-shrink-0"
              >
                <IonCard
                  routerLink={tool.path}
                  className={`h-60 bg-gradient-to-br ${tool.color} text-white rounded-3xl shadow-2xl transition-transform duration-300 
                  hover:scale-105 animate-slide-up cursor-pointer`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <IonCardHeader>
                    <div className="flex flex-col items-center space-y-4">
                      <div
                        className="text-8xl animate-pulse-light"
                        style={{ fontSize: "96px", color: tool.iconColor }}
                      >
                        <IonIcon icon={tool.icon} />
                      </div>
                      <IonCardTitle className="text-2xl font-bold tracking-wide text-white">
                        {tool.title}
                      </IonCardTitle>
                    </div>
                  </IonCardHeader>
                  <IonCardContent className="text-md text-gray-200">
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
