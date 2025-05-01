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
            convert(input_path, output_path)
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


# In your Flask app.py (or equivalent)

@app.route('/pdf-to-images', methods=['POST', 'OPTIONS'])
def pdf_to_images():
    """Handle PDF to images conversion for MULTIPLE PDFs"""
    if request.method == 'OPTIONS':
        return '', 200

    # --- CHANGE: Expect 'files' key and use getlist ---
    if 'files' not in request.files:
        return jsonify({'error': "No file parts named 'files'"}), 400

    files = request.files.getlist('files') # Get list of files
    if not files or len(files) == 0:
        return jsonify({'error': 'No selected files received'}), 400
    # --- END CHANGE ---

    all_image_details = [] # Store details {arcname: path} for zipping
    temp_dirs = [] # Keep track of temp dirs created per PDF

    try:
        # --- CHANGE: Loop through each uploaded PDF file ---
        for file in files:
            if file and allowed_file(file.filename) and file.filename.lower().endswith('.pdf'):
                filename = secure_filename(file.filename)
                pdf_base_name = os.path.splitext(filename)[0] # Base name for organizing zip

                # Create a unique temporary directory for THIS PDF's processing
                pdf_temp_dir = tempfile.mkdtemp(dir=app.config['UPLOAD_FOLDER'], prefix=f'pdfimg_{pdf_base_name}_')
                temp_dirs.append(pdf_temp_dir) # Track for cleanup
                filepath = os.path.join(pdf_temp_dir, filename)
                file.save(filepath)
                logger.info(f"Processing PDF: {filename}")

                try:
                    # Convert this PDF to images
                    images = convert_from_path(filepath)
                    if not images:
                         logger.warning(f"No images generated from {filename}")
                         continue # Skip to next file if conversion yields nothing

                    # Save images for this PDF
                    for i, image in enumerate(images):
                        # Save images inside this PDF's temp dir
                        image_filename = f'page_{i+1}.jpg'
                        image_path = os.path.join(pdf_temp_dir, image_filename)
                        image.save(image_path, 'JPEG')
                        # Define the path INSIDE the final ZIP file
                        # Include original PDF name as a folder in the zip
                        arcname = os.path.join(pdf_base_name, image_filename)
                        all_image_details.append({'arcname': arcname, 'path': image_path})
                        logger.debug(f"Generated image: {arcname} from {filename}")

                except Exception as convert_error:
                     logger.error(f"Failed to convert pages from {filename}: {convert_error}")
                     # Decide whether to skip this PDF or fail the whole request
                     # Failing the whole request might be safer:
                     raise Exception(f"Failed to convert pages from {filename}") from convert_error
                finally:
                     # Clean up the saved PDF for this iteration if needed (temp dir handles it later)
                     # if os.path.exists(filepath): os.remove(filepath)
                     pass

            else:
                logger.warning(f"Skipping invalid file: {file.filename if file else 'No File Object'}")
        # --- END LOOP ---

        if not all_image_details:
            logger.error("No images were generated from any of the provided PDFs.")
            return jsonify({'error': 'No images could be generated from the input PDFs'}), 400

        # --- CHANGE: Zip all collected images ---
        memory_file = io.BytesIO()
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for img_detail in all_image_details:
                zipf.write(img_detail['path'], img_detail['arcname'])
        memory_file.seek(0)
        # --- END CHANGE ---

        # --- CHANGE: Determine overall zip name ---
        zip_download_name = 'converted_pdf_images.zip'
        if len(files) == 1: # If only one PDF was processed, use its name
             first_pdf_base = os.path.splitext(secure_filename(files[0].filename))[0]
             zip_download_name = f'{first_pdf_base}_images.zip'
        # --- END CHANGE ---

        return send_file(
            memory_file,
            mimetype='application/zip',
            as_attachment=True,
            download_name=zip_download_name
        )
    except Exception as e:
        logger.error(f"PDF to images processing error: {str(e)}")
        return jsonify({'error': f"Processing failed: {str(e)}"}), 500
    finally:
        # --- CHANGE: Clean up all temporary directories ---
        logger.debug(f"Cleaning up {len(temp_dirs)} temporary directories.")
        for d in temp_dirs:
            shutil.rmtree(d, ignore_errors=True)
        # --- END CHANGE ---

# ... rest of your Flask app ...
import shutil

# Keep all existing imports at the top of your file
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
import shutil # Make sure shutil is imported

# --- (Keep your existing Flask app setup, CORS, logging, UPLOAD_FOLDER etc.) ---
# --- (Keep the existing allowed_file and convert_docx_to_pdf functions) ---

# ... other routes like /pdf-to-images, /merge-pdfs etc. ...

# MODIFIED Word-to-PDF Route
@app.route('/word-to-pdf', methods=['POST', 'OPTIONS'])
def word_to_pdf():
    """Handle Word to PDF conversion for MULTIPLE files, returns a ZIP."""
    if request.method == 'OPTIONS':
        return '', 200

    # --- CHANGE: Expect 'files' key and use getlist ---
    if 'files' not in request.files:
        logger.warning("Request at /word-to-pdf missing 'files' part.")
        return jsonify({'error': "No file parts named 'files'"}), 400

    files = request.files.getlist('files') # Get list of files
    if not files or len(files) == 0:
        logger.warning("/word-to-pdf called with 'files' key, but no files present.")
        return jsonify({'error': 'No selected files received'}), 400
    # --- END CHANGE ---

    received_filenames = [f.filename for f in files]
    logger.info(f"Received {len(files)} files for Word-to-PDF conversion: {received_filenames}")

    output_pdf_details = [] # Store details {arcname: path} for zipping
    # Use one temporary directory for the whole request
    with tempfile.TemporaryDirectory(dir=app.config['UPLOAD_FOLDER'], prefix='wordpdf_') as temp_dir:
        logger.info(f"Created temporary directory for Word->PDF: {temp_dir}")
        conversion_errors = [] # Track errors for individual files

        # --- CHANGE: Loop through each uploaded Word file ---
        for file in files:
            if file and file.filename and allowed_file(file.filename) and \
               (file.filename.lower().endswith('.docx') or file.filename.lower().endswith('.doc')):

                word_filename = secure_filename(file.filename)
                word_filepath = os.path.join(temp_dir, word_filename)
                pdf_filename = f'{os.path.splitext(word_filename)[0]}.pdf'
                pdf_filepath = os.path.join(temp_dir, pdf_filename)

                try:
                    logger.debug(f"Saving temporary Word file: {word_filepath}")
                    file.save(word_filepath)

                    logger.info(f"Attempting conversion for: {word_filename}")
                    # Call your existing conversion function
                    conversion_success = convert_docx_to_pdf(word_filepath, pdf_filepath)

                    if conversion_success and os.path.exists(pdf_filepath):
                        logger.info(f"Successfully converted {word_filename} to {pdf_filename}")
                        # Store details for zipping (use PDF filename as name inside zip)
                        output_pdf_details.append({'arcname': pdf_filename, 'path': pdf_filepath})
                    else:
                        # This case might indicate convert_docx_to_pdf returned False or file wasn't created
                        logger.error(f"Conversion reported success=False or PDF file missing for {word_filename}")
                        conversion_errors.append(f"Failed to convert {word_filename} (file possibly empty or converter issue).")

                except Exception as convert_error:
                    logger.error(f"Error converting {word_filename}: {convert_error}")
                    conversion_errors.append(f"Error converting {word_filename}: {str(convert_error)}")
                    # Decide if you want to continue processing other files or stop
                    # continue # To process other files despite one error

                finally:
                    # Clean up the original temporary Word file for this iteration
                    if os.path.exists(word_filepath):
                        try:
                            os.remove(word_filepath)
                            logger.debug(f"Removed temporary Word file: {word_filepath}")
                        except Exception as rm_err:
                             logger.warning(f"Could not remove temp Word file {word_filepath}: {rm_err}")
            else:
                logger.warning(f"Skipping invalid file type/name for Word->PDF: {file.filename if file else 'No File Object'}")
                if file and file.filename: # Add specific file to errors if skipped
                    conversion_errors.append(f"Skipped invalid file: {file.filename}")
        # --- END LOOP ---

        # --- Check if any PDFs were successfully created ---
        if not output_pdf_details:
            logger.error("No Word files were successfully converted to PDF.")
            error_summary = "Conversion failed for all files."
            if conversion_errors:
                error_summary += " Details: " + "; ".join(conversion_errors)
            # temp_dir is cleaned automatically by 'with' block exiting
            return jsonify({'error': error_summary}), 400

        # --- Create ZIP file containing the successful PDFs ---
        memory_file = io.BytesIO()
        zip_filename = 'converted_word_files.zip'
        logger.info(f"Creating ZIP file for {len(output_pdf_details)} converted PDFs.")

        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for pdf_detail in output_pdf_details:
                try:
                    zipf.write(pdf_detail['path'], pdf_detail['arcname'])
                    logger.debug(f"Added {pdf_detail['arcname']} to ZIP from {pdf_detail['path']}")
                except Exception as zip_err:
                    logger.error(f"Error adding {pdf_detail['arcname']} to zip: {zip_err}")
                    conversion_errors.append(f"Could not add {pdf_detail['arcname']} to output ZIP.")
                    # Potentially stop or just log and continue

        memory_file.seek(0)

        # temp_dir (containing the temporary PDFs) will be auto-cleaned up now
        # The data is safe in memory_file

        # Optionally include error summary in headers or response if partial success
        if conversion_errors:
             logger.warning(f"Word->PDF conversion completed with errors: {'; '.join(conversion_errors)}")
             # Could add a custom header: response.headers['X-Conversion-Errors'] = "; ".join(conversion_errors)

        return send_file(
            memory_file,
            mimetype='application/zip',
            as_attachment=True,
            download_name=zip_filename
        )

    # # This except block catches errors outside the inner try/except (e.g., temp dir creation)
    # except Exception as e:
    # logger.error(f"Outer error during Word->PDF process: {str(e)}")
    #     # If temp_dir was created, 'with' block ensures cleanup attempt
    # return jsonify({'error': f"Failed to process Word files: {str(e)}"}), 500

# ... (rest of your Flask app, including the if __name__ == '__main__': block) ...

    return jsonify({'error': 'Invalid request'}), 400


# ... (keep all the imports and setup code above) ...

# --- Fixes applied below ---
import shutil


@app.route('/api/merge-pdfs', methods=['POST', 'OPTIONS'])  # Corrected Path
def merge_pdfs():
    """Handle PDF merging"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return '', 200

    # Use the key 'files' as sent by the frontend
    if 'files' not in request.files:
        logger.warning("Request received at /api/merge-pdfs but missing 'files' part.")
        return jsonify({'error': "No file parts named 'files'"}), 400  # More specific error

    # Get the list of files using the key 'files'
    files = request.files.getlist('files')
    if not files or len(files) == 0:  # Check if list is empty
        logger.warning("/api/merge-pdfs called with 'files' key, but no files were present.")
        return jsonify({'error': 'No selected files received'}), 400

    # Log received filenames for debugging
    received_filenames = [f.filename for f in files]
    logger.info(f"Received {len(files)} files for merging: {received_filenames}")

    if len(files) < 2:
        logger.warning(f"Merge attempt with insufficient files: {len(files)}")
        return jsonify({"error": "At least two PDF files are required for merging"}), 400

    pdf_paths = []
    temp_dir = tempfile.mkdtemp(dir=app.config['UPLOAD_FOLDER'], prefix='merge_')
    try:
        for file in files:
            # Securely save the file within the temporary directory
            if file and file.filename and allowed_file(file.filename) and file.filename.lower().endswith('.pdf'):
                filename = secure_filename(file.filename)
                filepath = os.path.join(temp_dir, filename)
                file.save(filepath)
                pdf_paths.append(filepath)
                logger.debug(f"Saved temporary file for merging: {filepath}")
            else:
                logger.warning(f"Skipping invalid file during merge: {file.filename if file else 'No File Object'}")
                # Optionally return error if non-PDFs are strictly forbidden
                # return jsonify({'error': f"Invalid file type received: {file.filename}"}), 400

        if not pdf_paths or len(pdf_paths) < 2:  # Check again after filtering
            logger.error("Not enough valid PDF files found after saving.")
            # Cleanup paths created so far before erroring
            for path in pdf_paths:
                if os.path.exists(path): os.remove(path)
            return jsonify({'error': 'Not enough valid PDF files provided for merging'}), 400

        merger = PdfMerger()
        logger.info(f"Merging {len(pdf_paths)} PDF files in order received.")
        for pdf in pdf_paths:
            try:
                merger.append(pdf)
            except Exception as append_error:  # Catch errors during append (e.g., corrupted PDF)
                merger.close()  # Close before raising
                logger.error(f"Error appending PDF '{os.path.basename(pdf)}': {append_error}")
                raise Exception(f"Error processing file '{os.path.basename(pdf)}'. It might be corrupted or invalid.") from append_error

        # ✅ ✅ FIX: Use NamedTemporaryFile to avoid deletion issues on Windows
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf', dir=app.config['UPLOAD_FOLDER']) as tmp_file:
            output_path = tmp_file.name
            merger.write(output_path)
            merger.close()
            logger.info(f"Successfully merged PDFs to {output_path}")

        # Cleanup temp_dir manually (pdf_paths) → no open file in it
        shutil.rmtree(temp_dir, ignore_errors=True)

        try:
            return send_file(
                output_path,
                mimetype='application/pdf',
                as_attachment=True,
                download_name='merged_document.pdf'
            )
        finally:
            if os.path.exists(output_path):
                try:
                    os.remove(output_path)
                    logger.info(f"Temporary merged PDF {output_path} deleted after sending.")
                except Exception as cleanup_error:
                    logger.warning(f"Could not delete temporary merged file {output_path}: {cleanup_error}")

    except Exception as e:
        logger.error(f"Error during PDF merge process: {str(e)}")
        shutil.rmtree(temp_dir, ignore_errors=True)  # Cleanup on error
        return jsonify({'error': f"Failed to merge PDFs: {str(e)}"}), 500



# images to PDF route
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


# ... (keep the rest of the file, including if __name__ == '__main__': ...) ...


if __name__ == '__main__':
    app.run(debug=DEBUG_MODE, host=HOST, port=PORT)
