import React, { useState, createContext } from "react";
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  setupIonicReact,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route, useLocation } from "react-router-dom";

/* Core CSS */
import "@ionic/react/css/core.css";
/* Basic CSS */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
/* Optional CSS */
import "@ionic/react/css/padding.css";
// ... other optional css ...
import "@ionic/react/css/display.css";

/* Pages */
import Home from "./pages/Home";
import About from "./pages/About";
import PdfToImages from "./pages/PdfToImages";
import WordToPdf from "./pages/WordToPdf";
import ImagesToPdf from "./pages/ImagesToPdf";
import MergePdfs from "./pages/MergePdfs";
import TestApi from "./pages/TestApi";

/* Components */
import Navigation from "./components/Navigation";

/* Theme */
import "./theme/variables.css";
import "./index.css";

/* Icons for Tabs */
import {
  homeOutline,
  informationCircleOutline,
  imagesOutline,
  layersOutline,
  documentOutline,
  imageOutline,
  beakerOutline,
} from "ionicons/icons";

setupIonicReact();

export const BackendContext = createContext({
  backendUrl: "http://localhost",
  backendPort: "5000",
  setBackendUrl: () => {},
  setBackendPort: () => {},
});

// Define tab items
const tabItems = [
  { 
    title: "Home", 
    tab: "home", 
    path: "/home", 
    icon: homeOutline,
    color: "#3B82F6" // Blue color for home
  },
  {
    title: "PDF→IMG",
    tab: "pdf-to-images",
    path: "/pdf-to-images",
    icon: imagesOutline,
    color: "#C084FC" // Purple color matching home page
  },
  {
    title: "DOCX→PDF",
    tab: "word-to-pdf",
    path: "/word-to-pdf",
    icon: documentOutline,
    color: "#4ADE80" // Green color matching home page
  },
  {
    title: "IMG→PDF",
    tab: "images-to-pdf",
    path: "/images-to-pdf",
    icon: imageOutline,
    color: "#F87171" // Red color matching home page
  },
  {
    title: "Merge",
    tab: "merge-pdfs",
    path: "/merge-pdfs",
    icon: layersOutline,
    color: "#FBBF24" // Amber/yellow color matching home page
  },
  {
    title: "API Test",
    tab: "test-api",
    path: "/test-api",
    icon: beakerOutline,
    color: "#38BDF8" // Cyan color for API Test
  },
];

// Define paths that would normally be under "More"
const morePaths = ["/about", "/images-to-pdf", "/merge-pdfs"];

const AppContent = () => {
  const location = useLocation();
  const isMoreTabActive = morePaths.includes(location.pathname);

  return (
    <>
      {/* Render the Menu */}
      <Navigation />

      {/* The key fix: IonTabs must wrap IonRouterOutlet */}
      <IonTabs>
        {/* Router Outlet is now inside IonTabs */}
        <IonRouterOutlet id="main">
          <Route exact path="/home" component={Home} />
          <Route exact path="/about" component={About} />
          <Route exact path="/pdf-to-images" component={PdfToImages} />
          <Route exact path="/word-to-pdf" component={WordToPdf} />
          <Route exact path="/images-to-pdf" component={ImagesToPdf} />
          <Route exact path="/merge-pdfs" component={MergePdfs} />
          <Route exact path="/test-api" component={TestApi} />
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>

        {/* Tab Bar remains inside IonTabs */}
        <IonTabBar slot="bottom">
          {tabItems.map((item) => (
            <IonTabButton key={item.tab} tab={item.tab} href={item.path}>
              <IonIcon icon={item.icon} style={{ color: item.color }} aria-hidden="true" />
              <IonLabel>{item.title}</IonLabel>
            </IonTabButton>
          ))}
        </IonTabBar>
      </IonTabs>
    </>
  );
};

const App = () => {
  const [showModal, setShowModal] = useState(true);
  const [backendUrl, setBackendUrl] = useState("http://localhost");
  const [backendPort, setBackendPort] = useState("5000");

  const backendContextValue = {
    backendUrl,
    backendPort,
    setBackendUrl,
    setBackendPort,
  };

  const handleSave = () => {
    setShowModal(false);
  };

  return (
    <BackendContext.Provider value={backendContextValue}>
      <IonApp>
        <IonReactRouter>
          <AppContent />
        </IonReactRouter>

        <IonModal isOpen={showModal} backdropDismiss={false}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Enter Backend Details</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonLabel>Backend URL</IonLabel>
            <IonInput
              placeholder="Enter Backend URL (e.g., http://localhost)"
              value={backendUrl}
              onIonChange={(e) => setBackendUrl(e.detail.value)}
            />
            <IonLabel>Backend Port</IonLabel>
            <IonInput
              placeholder="Enter Backend Port (e.g., 5000)"
              value={backendPort}
              onIonChange={(e) => setBackendPort(e.detail.value)}
            />
            <IonButton expand="block" onClick={handleSave}>
              Save
            </IonButton>
          </IonContent>
        </IonModal>
      </IonApp>
    </BackendContext.Provider>
  );
};

export default App;
