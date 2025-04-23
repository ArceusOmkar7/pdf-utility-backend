// frontend/src/pages/Home.jsx (with Tailwind)
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonButton, IonIcon, IonGrid, IonRow, IonCol,
  IonButtons, IonMenuButton,
} from "@ionic/react";
import { imagesOutline, documentOutline, imageOutline, layersOutline } from "ionicons/icons";

const Home = () => {
  const tools = [
      // ... (tools array remains the same) ...
      { title: "PDF to Images", description: "Convert PDF files to a collection of images", icon: imagesOutline, path: "/pdf-to-images" },
      { title: "Word to PDF", description: "Convert Word documents to PDF format", icon: documentOutline, path: "/word-to-pdf" },
      { title: "Images to PDF", description: "Combine multiple images into a single PDF", icon: imageOutline, path: "/images-to-pdf" },
      { title: "Merge PDFs", description: "Combine multiple PDF files into one document", icon: layersOutline, path: "/merge-pdfs" },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary"> {/* Example: Add color to toolbar */}
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="font-bold">PDF Utility Tool</IonTitle> {/* Example: font bold */}
        </IonToolbar>
      </IonHeader>
      {/* Add padding directly to IonContent using Tailwind */}
      <IonContent fullscreen className="ion-padding"> {/* Keep ion-padding or use Tailwind p-4/p-6 */}

        {/* Welcome Card */}
        <IonCard className="mb-6 shadow-md rounded-lg"> {/* Add margin bottom, shadow, rounding */}
          <IonCardHeader>
            <IonCardTitle className="text-xl font-semibold text-gray-800">Welcome to PDF Utility Tool</IonCardTitle>
          </IonCardHeader>
          <IonCardContent className="text-gray-600">
            <p>
              This application provides various tools to work with PDF files. Select one of the tools below to get
              started.
            </p>
          </IonCardContent>
        </IonCard>

        {/* Grid for Tools - Use Tailwind for gaps */}
        <IonGrid>
          <IonRow className="g-4"> {/* Use Tailwind gap utilities if preferred: grid grid-cols-1 md:grid-cols-2 gap-4 */}
            {tools.map((tool) => (
              <IonCol size="12" sizeMd="6" key={tool.path} className="flex"> {/* Use flex to make card fill height */}
                {/* Tool Card - Add Tailwind styling */}
                <IonCard className="w-full flex flex-col rounded-lg shadow hover:shadow-lg transition-shadow duration-200"> {/* Fill width, flex column layout */}
                  <IonCardHeader className="flex items-center space-x-3"> {/* Flex layout for header */}
                     <IonIcon icon={tool.icon} className="text-2xl text-blue-500"/> {/* Style icon */}
                     <IonCardTitle className="text-lg font-medium text-gray-700 m-0">{tool.title}</IonCardTitle> {/* Reset margin */}
                  </IonCardHeader>
                  {/* Use flex-grow to make content fill space */}
                  <IonCardContent className="text-sm text-gray-500 flex-grow">
                    <p>{tool.description}</p>
                  </IonCardContent>
                  {/* Add margin top to button */}
                  <div className="p-4 pt-0"> {/* Wrapper for button padding */}
                     <IonButton expand="block" routerLink={tool.path} color="secondary" className="mt-auto font-medium">
                       Open Tool
                     </IonButton>
                  </div>
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