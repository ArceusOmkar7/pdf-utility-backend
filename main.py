from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import platform
import subprocess
import tempfile
import sys
import logging
from werkzeug.utils import secure_filename
import zipfile
import io

# Load environment variables from .env file if present
try:
    from dotenv import load_dotenv
    load_dotenv()
    env_loaded = True
except ImportError:
    env_loaded = False

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    handlers=[logging.StreamHandler()])
logger = logging.getLogger(__name__)

if env_loaded:
    logger.info("Loaded environment variables from .env file")
else:
    logger.info(
        "dotenv not installed or .env file not found. Using default environment variables.")

# Check for required packages
try:
    from pdf2image import convert_from_path
    import img2pdf
    from PyPDF2 import PdfMerger
except ImportError as e:
    logger.error(f"Missing required dependency: {str(e)}")
    logger.error(
        "Please install all required packages: pip install -r requirements.txt")
    sys.exit(1)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Environment configuration
UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
MAX_CONTENT_LENGTH = int(os.environ.get(
    'MAX_CONTENT_LENGTH', 10 * 1024 * 1024))  # Default 10MB
DEBUG_MODE = os.environ.get('DEBUG_MODE', 'False').lower() == 'true'
PORT = int(os.environ.get('PORT', 5000))
HOST = os.environ.get('HOST', '127.0.0.1')

# Create upload folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    try:
        os.makedirs(UPLOAD_FOLDER)
        logger.info(f"Created upload folder: {UPLOAD_FOLDER}")
    except Exception as e:
        logger.error(f"Failed to create upload folder: {str(e)}")
        sys.exit(1)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def convert_docx_to_pdf(input_path, output_path):
    """Platform-specific Word to PDF conversion"""
    logger.info(f"Converting {input_path} to {output_path}")

    if platform.system() == 'Windows':
        try:
            from docx2pdf import convert
            import pythoncom

            # Initialize COM for this thread
            pythoncom.CoInitialize()
            try:
                convert(input_path, output_path)
            finally:
                # Make sure to uninitialize COM when done to prevent issues with subsequent conversions
                pythoncom.CoUninitialize()
            return True
        except ImportError:
            logger.error(
                "docx2pdf package is missing. Install with: pip install docx2pdf")
            raise Exception(
                "Missing docx2pdf package. Please install it with 'pip install docx2pdf'")
        except Exception as e:
            logger.error(f"Windows conversion error: {str(e)}")
            raise Exception(f"Windows conversion error: {str(e)}")
    else:
        try:
            # Check if LibreOffice is installed
            libreoffice_cmd = 'libreoffice'
            if platform.system() == 'Darwin':  # macOS
                # Check for macOS-specific LibreOffice paths
                macos_paths = [
                    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
                    '/Applications/soffice.app/Contents/MacOS/soffice'
                ]
                for path in macos_paths:
                    if os.path.exists(path):
                        libreoffice_cmd = path
                        break

            libreoffice_check = subprocess.run(['which', libreoffice_cmd],
                                               stdout=subprocess.PIPE,
                                               stderr=subprocess.PIPE)

            if libreoffice_check.returncode != 0:
                error_message = "LibreOffice is not installed or not in PATH. "
                if platform.system() == 'Linux':
                    error_message += "Please install it with 'sudo apt install libreoffice' or equivalent for your distribution."
                elif platform.system() == 'Darwin':
                    error_message += "Please install it from https://www.libreoffice.org/download/download-libreoffice/"
                raise Exception(error_message)

            # Use LibreOffice for conversion
            output_dir = os.path.dirname(output_path)
            subprocess.run([libreoffice_cmd, '--headless', '--convert-to', 'pdf',
                           '--outdir', output_dir, input_path],
                           stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                           check=True)

            # LibreOffice saves with the same name but .pdf extension
            base_name = os.path.basename(input_path)
            pdf_name = os.path.splitext(base_name)[0] + '.pdf'
            expected_path = os.path.join(output_dir, pdf_name)

            # Rename if needed
            if expected_path != output_path and os.path.exists(expected_path):
                os.rename(expected_path, output_path)

            return True
        except subprocess.CalledProcessError as e:
            logger.error(
                f"LibreOffice conversion error: {e.stderr.decode('utf-8') if e.stderr else str(e)}")
            raise Exception(
                f"LibreOffice conversion error: {e.stderr.decode('utf-8') if e.stderr else str(e)}")
        except Exception as e:
            logger.error(f"Conversion error: {str(e)}")
            raise Exception(f"Conversion error: {str(e)}")


@app.route('/', methods=['GET'])
def index():
    """Base endpoint that provides API information"""
    api_info = {
        'name': 'PDF Utility Backend',
        'version': '1.0.0',
        'endpoints': [
            {'path': '/', 'methods': ['GET'],
                'description': 'API information'},
            {'path': '/pdf-to-images',
                'methods': ['POST', 'OPTIONS'], 'description': 'Convert PDF to images'},
            {'path': '/word-to-pdf', 'methods': ['POST', 'OPTIONS'],
                'description': 'Convert Word documents to PDF'},
            {'path': '/images-to-pdf',
                'methods': ['POST', 'OPTIONS'], 'description': 'Convert images to PDF'},
            {'path': '/merge-pdfs', 'methods': ['POST', 'OPTIONS'],
                'description': 'Merge multiple PDFs into one'}
        ],
        'status': 'operational'
    }
    return jsonify(api_info)


@app.route('/pdf-to-images', methods=['POST', 'OPTIONS'])
def pdf_to_images():
    """Handle PDF to images conversion"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return '', 200

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename) and file.filename.lower().endswith('.pdf'):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            # Convert PDF to images
            images = convert_from_path(filepath)
            image_paths = []

            # Base name for the files without extension
            base_name = os.path.splitext(filename)[0]

            # Create images and save them
            for i, image in enumerate(images):
                image_path = os.path.join(
                    app.config['UPLOAD_FOLDER'], f'{base_name}_page_{i+1}.jpg')
                image.save(image_path, 'JPEG')
                image_paths.append(image_path)

            # Create a ZIP file in memory
            memory_file = io.BytesIO()
            with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for i, path in enumerate(image_paths):
                    # Add each image to the ZIP with a simple name
                    arcname = f'page_{i+1}.jpg'
                    zipf.write(path, arcname)

            # Reset the memory file position to the beginning
            memory_file.seek(0)

            # Clean up original images after adding to zip
            for path in image_paths:
                if os.path.exists(path):
                    os.remove(path)

            # Send the ZIP file as attachment
            return send_file(
                memory_file,
                mimetype='application/zip',
                as_attachment=True,
                download_name=f'{base_name}_images.zip'
            )
        except Exception as e:
            logger.error(f"PDF to images error: {str(e)}")
            return jsonify({'error': str(e)}), 500
        finally:
            # Clean up the original PDF file
            if os.path.exists(filepath):
                os.remove(filepath)

    return jsonify({'error': 'Invalid file type'}), 400


@app.route('/word-to-pdf', methods=['POST', 'OPTIONS'])
def word_to_pdf():
    """Handle Word to PDF conversion"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return '', 200

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename) and (file.filename.lower().endswith('.docx') or file.filename.lower().endswith('.doc')):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            # Convert Word to PDF
            pdf_path = os.path.join(
                app.config['UPLOAD_FOLDER'], f'{os.path.splitext(filename)[0]}.pdf')
            convert_docx_to_pdf(filepath, pdf_path)

            # Clean up the Word document before sending the PDF
            if os.path.exists(filepath):
                os.remove(filepath)

            # Return the PDF file without trying to delete it immediately
            return send_file(
                pdf_path,
                as_attachment=True,
                download_name=os.path.basename(pdf_path)
            )
        except Exception as e:
            # Clean up files in case of an error
            if os.path.exists(filepath):
                os.remove(filepath)
            if os.path.exists(pdf_path):
                try:
                    os.remove(pdf_path)
                except:
                    pass
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'Invalid file type'}), 400


@app.route('/images-to-pdf', methods=['POST', 'OPTIONS'])
def images_to_pdf():
    """Handle images to PDF conversion"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return '', 200

    if 'images' not in request.files:
        return jsonify({'error': 'No files part'}), 400

    files = request.files.getlist('images')
    if not files:
        return jsonify({'error': 'No selected files'}), 400

    image_paths = []
    pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], 'output.pdf')
    try:
        for file in files:
            if file and allowed_file(file.filename) and file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                image_paths.append(filepath)

        if not image_paths:
            return jsonify({'error': 'No valid image files'}), 400

        # Convert images to PDF
        with open(pdf_path, "wb") as f:
            f.write(img2pdf.convert(image_paths))

        # Clean up the image files before sending the PDF
        for path in image_paths:
            if os.path.exists(path):
                os.remove(path)

        return send_file(
            pdf_path,
            as_attachment=True,
            download_name="combined_images.pdf"
        )
    except Exception as e:
        # Clean up all files in case of error
        for path in image_paths:
            if os.path.exists(path):
                os.remove(path)
        if os.path.exists(pdf_path):
            try:
                os.remove(pdf_path)
            except:
                pass
        return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'Invalid request'}), 400


@app.route('/merge-pdfs', methods=['POST', 'OPTIONS'])
def merge_pdfs():
    """Handle PDF merging"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return '', 200

    if 'pdfs' not in request.files:
        return jsonify({'error': 'No files part'}), 400

    files = request.files.getlist('pdfs')
    if not files:
        return jsonify({'error': 'No selected files'}), 400

    pdf_paths = []
    output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'merged.pdf')
    try:
        for file in files:
            if file and allowed_file(file.filename) and file.filename.lower().endswith('.pdf'):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                pdf_paths.append(filepath)

        if not pdf_paths:
            return jsonify({'error': 'No valid PDF files'}), 400

        # Merge PDFs
        merger = PdfMerger()
        for pdf in pdf_paths:
            merger.append(pdf)

        merger.write(output_path)
        merger.close()

        # Clean up the individual PDF files before sending the merged PDF
        for path in pdf_paths:
            if os.path.exists(path):
                os.remove(path)

        return send_file(
            output_path,
            as_attachment=True,
            download_name="merged.pdf"
        )
    except Exception as e:
        # Clean up all files in case of error
        for path in pdf_paths:
            if os.path.exists(path):
                os.remove(path)
        if os.path.exists(output_path):
            try:
                os.remove(output_path)
            except:
                pass
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=DEBUG_MODE, host=HOST, port=PORT)
