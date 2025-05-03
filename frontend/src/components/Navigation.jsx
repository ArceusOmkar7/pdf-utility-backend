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
  IonRippleEffect,
} from "@ionic/react";
import {
  homeOutline,
  informationCircleOutline,
  imagesOutline,
  documentOutline,
  imageOutline,
  layersOutline,
  beakerOutline,
} from "ionicons/icons";
import { useLocation } from "react-router-dom";

// Define menuItems outside or pass as prop if needed elsewhere
const menuItems = [
  { title: "Home", path: "/home", icon: homeOutline, color: "#3B82F6" },
  { title: "About Us", path: "/about", icon: informationCircleOutline, color: "#9CA3AF" },
  { title: "PDF to Images", path: "/pdf-to-images", icon: imagesOutline, color: "#C084FC" },
  { title: "Word to PDF", path: "/word-to-pdf", icon: documentOutline, color: "#4ADE80" },
  { title: "Images to PDF", path: "/images-to-pdf", icon: imageOutline, color: "#F87171" },
  { title: "Merge PDFs", path: "/merge-pdfs", icon: layersOutline, color: "#FBBF24" },
  { title: "Test API", path: "/test-api", icon: beakerOutline, color: "#38BDF8" },
];

const Navigation = () => {
  const location = useLocation();

  return (
    // Ensure contentId="main" matches the IonRouterOutlet ID in App.jsx
    <IonMenu contentId="main" type="overlay">
      <IonHeader>
        <IonToolbar color="primary" className="animate-fade-in">
          <IonTitle>PDF Tools</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList lines="none" className="p-2">
          {menuItems.map((item, index) => (
            <IonMenuToggle key={item.path} autoHide={false}>
              <IonItem
                className={`${
                  location.pathname === item.path ? "selected" : ""
                } my-2 rounded-lg animate-slide-up`}
                routerLink={item.path}
                routerDirection="none"
                detail={false}
                style={{
                  animationDelay: `${index * 50}ms`,
                  transition: "background-color 0.3s, transform 0.2s",
                }}
                lines="none"
              >
                <IonRippleEffect />
                <IonIcon
                  slot="start"
                  icon={item.icon}
                  size="large"
                  className={`mr-2 ${
                    location.pathname === item.path
                      ? "animate-pulse-light"
                      : ""
                  }`}
                  style={{ color: item.color }}
                />
                <IonLabel>{item.title}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Navigation;
