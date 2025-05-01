// frontend/src/App.jsx (Fixed structure)
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  setupIonicReact
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

/* Components */
import Navigation from "./components/Navigation";

/* Theme */
import "./theme/variables.css";
import "./index.css";

/* Icons for Tabs */
import { homeOutline, informationCircleOutline, imagesOutline, layersOutline, documentOutline, imageOutline } from "ionicons/icons";

setupIonicReact();

// Define tab items
const tabItems = [
  { title: "Home", tab: "home", path: "/home", icon: homeOutline },
  { title: "PDF->IMG", tab: "pdf-to-images", path: "/pdf-to-images", icon: imagesOutline },
  { title: "Word->PDF", tab: "word-to-pdf", path: "/word-to-pdf", icon: documentOutline },
  { title: "IMG->PDF", tab: "images-to-pdf", path: "/images-to-pdf", icon: imageOutline },
  { title: "MergePDFs", tab: "merge-pdfs", path: "/merge-pdfs", icon: layersOutline },
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
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>

        {/* Tab Bar remains inside IonTabs */}
        <IonTabBar slot="bottom">
          {tabItems.map((item) => (
            <IonTabButton key={item.tab} tab={item.tab} href={item.path}>
              <IonIcon icon={item.icon} aria-hidden="true" />
              <IonLabel>{item.title}</IonLabel>
            </IonTabButton>
          ))}
        </IonTabBar>
      </IonTabs>
    </>
  );
};

const App = () => (
  <IonApp>
    <IonReactRouter>
      <AppContent />
    </IonReactRouter>
  </IonApp>
);

export default App;