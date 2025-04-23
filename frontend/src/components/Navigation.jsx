// frontend/src/components/Navigation.jsx (Example - Renders only Menu)
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonHeader,
  IonToolbar,
  IonTitle,
} from "@ionic/react";
import {
  homeOutline,
  informationCircleOutline,
  imagesOutline,
  documentOutline,
  imageOutline,
  layersOutline,
} from "ionicons/icons";
import { useLocation } from "react-router-dom";

// Define menuItems outside or pass as prop if needed elsewhere
const menuItems = [
    { title: "Home", path: "/home", icon: homeOutline },
    { title: "About Us", path: "/about", icon: informationCircleOutline },
    { title: "PDF to Images", path: "/pdf-to-images", icon: imagesOutline },
    { title: "Word to PDF", path: "/word-to-pdf", icon: documentOutline },
    { title: "Images to PDF", path: "/images-to-pdf", icon: imageOutline },
    { title: "Merge PDFs", path: "/merge-pdfs", icon: layersOutline },
];

const Navigation = () => { // Or NavigationMenu if you prefer
  const location = useLocation();

  return (
    // Ensure contentId="main" matches the IonRouterOutlet ID in App.jsx
    <IonMenu contentId="main" type="overlay">
      <IonHeader>
        <IonToolbar color="primary"> {/* Optional: Add color */}
          <IonTitle>PDF Tools</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList lines="none"> {/* Adjusted lines */}
          {menuItems.map((item) => (
            <IonMenuToggle key={item.path} autoHide={false}>
              <IonItem
                className={location.pathname === item.path ? "selected" : ""}
                routerLink={item.path}
                routerDirection="none"
                detail={false}
              >
                <IonIcon slot="start" icon={item.icon} />
                <IonLabel>{item.title}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Navigation; // Export the menu component