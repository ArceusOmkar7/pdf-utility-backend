# PDF Utility Backend API Documentation

## Overview
This backend service provides PDF manipulation capabilities through a RESTful API built with Flask. It enables frontend applications to perform various PDF operations like conversions, merging, and page extraction.

## Installation Instructions

### Prerequisites
- Python 3.6 or higher
- pip (Python package manager)
- Poppler utils (for PDF to image conversion)
- LibreOffice (for Word to PDF conversion on Linux/macOS) or Microsoft Word (for Windows)

### Platform-Specific Setup

#### Linux (Ubuntu/Debian)
1. Install system dependencies:
   ```bash
   sudo apt update
   sudo apt install -y python3 python3-venv python3-pip poppler-utils libreoffice
   ```

2. Clone or download this repository
3. Navigate to the project directory:
   ```bash
   cd pdf_util_backend
   ```

4. Set up and run the application following the instructions in the "Manual Setup" section below.

#### macOS
1. Install Homebrew if not already installed:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install dependencies:
   ```bash
   brew install python3 poppler
   brew install --cask libreoffice
   ```

3. Clone or download this repository
4. Navigate to the project directory:
   ```bash
   cd pdf_util_backend
   ```

5. Set up and run the application following the instructions in the "Manual Setup" section below.

#### Windows
1. Install Python 3.x from [python.org](https://www.python.org/downloads/)
2. Make sure to check "Add Python to PATH" during installation
3. Install LibreOffice from [libreoffice.org](https://www.libreoffice.org/download/download-libreoffice/) or ensure Microsoft Word is installed
4. Clone or download this repository
5. Navigate to the project directory in Command Prompt:
   ```cmd
   cd pdf_util_backend
   ```

6. Set up and run the application following the instructions in the "Manual Setup" section below.

### Manual Setup (All Platforms)

1. Create and activate a virtual environment:
   ```bash
   # Linux/macOS
   python3 -m venv env
   source env/bin/activate
   
   # Windows
   python -m venv env
   env\Scripts\activate
   ```

2. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment (optional):
   ```bash
   # Linux/macOS
   cp .env.example .env
   # Edit .env file with your settings
   
   # Windows
   copy .env.example .env
   # Edit .env file with your settings
   ```

4. Create uploads directory:
   ```bash
   mkdir uploads
   ```

5. Run the application:
   ```bash
   python main.py
   ```

## Configuration Options

The application can be configured via environment variables or a `.env` file:

| Variable           | Description                           | Default        |
|--------------------|---------------------------------------|----------------|
| PORT               | Server port                           | 5000           |
| HOST               | Server host address                   | 127.0.0.1      |
| DEBUG_MODE         | Enable Flask debug mode               | False          |
| UPLOAD_FOLDER      | Directory for file storage            | uploads        |
| MAX_CONTENT_LENGTH | Maximum allowed file size (bytes)     | 10485760 (10MB)|

## API Endpoints

### 1. PDF to Images Conversion
Converts each page of a PDF file to separate JPG images and returns them as a single ZIP file.

**Endpoint:** `/pdf-to-images`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data`

**Request:**
- Form field `file`: A single PDF file

**Response:**
- Success (200 OK): Returns a ZIP file containing all PDF pages converted to JPG images
  - Content-Type: `application/zip`
  - Content-Disposition: `attachment; filename=<original_filename>_images.zip`
- Error (400/500):
```json
{
  "error": "Error description"
}
```

### 2. Word to PDF Conversion
Converts Microsoft Word documents to PDF format.

**Endpoint:** `/word-to-pdf`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data`

**Request:**
- Form field `file`: A Word document (.docx or .doc)

**Response:**
- Success (200 OK): Returns the PDF file as attachment
- Error (400/500):
```json
{
  "error": "Error description"
}
```

### 3. Images to PDF Conversion
Combines multiple images into a single PDF document.

**Endpoint:** `/images-to-pdf`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data`

**Request:**
- Form field `images`: Multiple image files (jpg, jpeg, png)

**Response:**
- Success (200 OK): Returns the PDF file as attachment
- Error (400/500):
```json
{
  "error": "Error description"
}
```

### 4. Merge PDFs
Combines multiple PDF files into a single PDF document.

**Endpoint:** `/merge-pdfs`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data`

**Request:**
- Form field `pdfs`: Multiple PDF files

**Response:**
- Success (200 OK): Returns the merged PDF file as attachment
- Error (400/500):
```json
{
  "error": "Error description"
}
```

## Technical Implementation Notes

- **PDF to Images**: Uses `pdf2image` library with Poppler for high-quality image extraction
- **Word to PDF**: 
  - Linux/macOS: Uses LibreOffice for conversion (must be installed on server)
  - Windows: Uses `docx2pdf` library
- **Images to PDF**: Uses `img2pdf` library for lossless conversion
- **PDF Merging**: Uses `PyPDF2` for efficient merging

## Troubleshooting

### Common Issues

1. **PDF to Image Conversion Fails**:
   - Ensure Poppler utils is installed on your system
   - On Linux: `sudo apt install poppler-utils`
   - On macOS: `brew install poppler`
   - On Windows: Download from [poppler releases](https://github.com/oschwartz10612/poppler-windows/releases/)

2. **Word to PDF Conversion Fails**:
   - On Linux/macOS: Ensure LibreOffice is installed and in PATH
   - On Windows: Ensure Microsoft Word is installed or install LibreOffice

3. **Port Already in Use**:
   - Change the PORT in your .env file to an available port
   - Check for existing processes: `lsof -i :5000` (Linux/macOS) or `netstat -ano | findstr :5000` (Windows)

4. **Large Files Timeout**:
   - Increase MAX_CONTENT_LENGTH in your .env file
   - Consider splitting very large PDFs into smaller chunks

## Frontend Integration Examples

### JavaScript (Fetch API)
```javascript
// PDF to Images example
async function convertPdfToImages(pdfFile) {
  const formData = new FormData();
  formData.append('file', pdfFile);
  
  try {
    const response = await fetch('http://your-api-url/pdf-to-images', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Conversion failed');
    }
    
    const result = await response.json();
    return result.images;  // Array of image URLs
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### React Example
```javascript
import React, { useState } from 'react';

function PdfConverter() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://your-api-url/pdf-to-images', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setImages(data.images);
      } else {
        alert(data.error || 'Conversion failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to convert PDF');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h2>PDF to Images Converter</h2>
      <input type="file" accept=".pdf" onChange={handleFileUpload} />
      
      {loading && <p>Converting...</p>}
      
      <div className="image-gallery">
        {images.map((imgPath, index) => (
          <img 
            key={index}
            src={`http://your-api-url/${imgPath}`} 
            alt={`Page ${index + 1}`}
            style={{ maxWidth: '300px', margin: '10px' }}
          />
        ))}
      </div>
    </div>
  );
}

export default PdfConverter;
```

## Security Considerations

- Add proper authentication for production environments
- Implement rate limiting to prevent abuse
- Regularly clean up the uploads folder to prevent disk space issues
- Consider using HTTPS in production environments

## Known Issues and Limitations

- The Word to PDF conversion requires different dependencies on different operating systems
- Very large PDF files may cause memory issues
- The API currently has no built-in rate limiting
- Files are temporarily stored in the uploads directory

## Cross-Origin Resource Sharing (CORS)

The API has CORS enabled for cross-domain requests. Frontend applications from any origin can access this API.

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200 OK`: Operation successful
- `400 Bad Request`: Invalid input or file format
- `500 Internal Server Error`: Server-side processing error

Error responses always include a JSON object with an `error` field containing the error description.

## File Size Limitations

- Maximum file size: 10MB per file (default, configurable)
- For PDF merging: Maximum 20 files per request

## License

[MIT License](LICENSE)
