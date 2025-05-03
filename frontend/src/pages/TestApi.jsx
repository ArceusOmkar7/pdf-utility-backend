import React, { useContext, useState } from 'react';
import { BackendContext } from '../App';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonInput, 
  IonLabel, 
  IonSelect, 
  IonSelectOption, 
  IonTextarea, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonButtons, 
  IonMenuButton 
} from '@ionic/react';

const endpoints = [
  { label: 'API Info (GET /)', method: 'GET', path: '/' },
  { label: 'PDF to Images (POST /pdf-to-images)', method: 'POST', path: '/pdf-to-images', file: true },
  { label: 'Word to PDF (POST /word-to-pdf)', method: 'POST', path: '/word-to-pdf', file: true },
  { label: 'Images to PDF (POST /images-to-pdf)', method: 'POST', path: '/images-to-pdf', file: true, images: true },
  { label: 'Merge PDFs (POST /merge-pdfs)', method: 'POST', path: '/merge-pdfs', file: true, pdfs: true },
];

const TestApi = () => {
  const { backendUrl, backendPort } = useContext(BackendContext);
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0]);
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [response, setResponse] = useState('');
  const [customPath, setCustomPath] = useState('');
  const [customMethod, setCustomMethod] = useState('GET');

  const apiBase = `${backendUrl.replace(/\/$/, '')}:${backendPort}`;

  const handleTest = async () => {
    setResponse('');
    let url = apiBase + (selectedEndpoint.path || customPath);
    let options = { method: selectedEndpoint.method || customMethod };
    if (selectedEndpoint.method === 'POST') {
      const formData = new FormData();
      if (selectedEndpoint.file && file) formData.append('file', file);
      if (selectedEndpoint.images && files.length) files.forEach(f => formData.append('images', f));
      if (selectedEndpoint.pdfs && files.length) files.forEach(f => formData.append('files', f));
      options.body = formData;
    }
    try {
      const res = await fetch(url, options);
      if (res.headers.get('content-type')?.includes('application/json')) {
        setResponse(JSON.stringify(await res.json(), null, 2));
      } else if (res.headers.get('content-type')?.includes('application/zip') || res.headers.get('content-type')?.includes('application/pdf')) {
        setResponse('Received file: ' + (res.headers.get('content-disposition') || '')); // Could add download logic
      } else {
        setResponse(await res.text());
      }
    } catch (e) {
      setResponse('Error: ' + e.message);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Test API</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Backend: {apiBase}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonLabel>Select Endpoint</IonLabel>
            <IonSelect value={selectedEndpoint} placeholder="Select endpoint" onIonChange={e => setSelectedEndpoint(e.detail.value)}>
              {endpoints.map((ep, i) => (
                <IonSelectOption key={i} value={ep}>{ep.label}</IonSelectOption>
              ))}
              <IonSelectOption value={{ label: 'Custom', method: customMethod, path: customPath }}>Custom</IonSelectOption>
            </IonSelect>
            {selectedEndpoint.label === 'Custom' && (
              <>
                <IonInput placeholder="/your-endpoint" value={customPath} onIonChange={e => setCustomPath(e.detail.value)} />
                <IonInput placeholder="GET or POST" value={customMethod} onIonChange={e => setCustomMethod(e.detail.value)} />
              </>
            )}
            {(selectedEndpoint.file || selectedEndpoint.images || selectedEndpoint.pdfs) && (
              <>
                <IonLabel>{selectedEndpoint.images ? 'Select Images' : selectedEndpoint.pdfs ? 'Select PDFs' : 'Select File'}</IonLabel>
                <input type="file" multiple={!!(selectedEndpoint.images || selectedEndpoint.pdfs)} accept={selectedEndpoint.images ? '.jpg,.jpeg,.png' : selectedEndpoint.pdfs ? '.pdf' : '*'} onChange={e => {
                  if (selectedEndpoint.images || selectedEndpoint.pdfs) setFiles(Array.from(e.target.files));
                  else setFile(e.target.files[0]);
                }} />
              </>
            )}
            <IonButton expand="block" onClick={handleTest} className="ion-margin-top">Test</IonButton>
            <IonLabel className="ion-margin-top">Response</IonLabel>
            <IonTextarea value={response} readonly autoGrow style={{ minHeight: 120, fontFamily: 'monospace' }} />
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default TestApi;