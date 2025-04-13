import os
import re
import json
import time
import requests
from tempfile import TemporaryDirectory
from pathlib import Path
import pytesseract
from pdf2image import convert_from_path
from PIL import Image

# Configure paths
pdf_directory = Path("/Users/Opeyemi/Documents/Business/Sanusi OI LLC/Cold Call/PYTHON CODE/TODAY_LIS_FILES")
log_directory = Path("/Users/Opeyemi/Documents/Business/Sanusi OI LLC/Cold Call/PYTHON CODE/OCR_LOGS")

# Create log directory if it doesn't exist
log_directory.mkdir(parents=True, exist_ok=True)

# Airtable configuration
AIRTABLE_API_TOKEN = "uskStXfVaaiXAnh3E0EGLoa"
DATASHEET_ID = "dstJU9PH5N8HpVdNB8"
VIEW_ID = "viwuPTSALHNy9"  # From your curl command
FIELD_NAME_ID = "fld6m1HQdRf0k"     # Field for name
FIELD_ADDRESS_ID = "fld5K532xtpqm"  # Field for address
FIELD_ZIP_ID = "fldbsSLE6tyzJ"      # Field for zip code
FIELD_DOCUMENT_ID = "fld7sjf1TLDyS" # Field for document name
FIELD_COUNTY_ID = "fldoKqVM0sUfr"   # Field for county
FIELD_CASENO_ID = "fld1uQRRKHQUs"   # Field for case number

# Straico API configuration
STRAICO_API_KEY = "vO-cYh3mhuDVvzsQRfEeMRl48f0Yh49kA9uLaJZgFwiqhCj3be1"
MODEL = "anthropic/claude-3-5-haiku-20241022"

def log_message(message):
    """Log message to console and to the log file."""
    print(message)
    with open(log_directory / "process_log.txt", "a") as log_file:
        log_file.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {message}\n")

def ocr_pdf(pdf_file_path):
    """
    Performs OCR on a PDF file and returns the extracted text.
    """
    extracted_text = ""
    with TemporaryDirectory() as tempdir:
        try:
            # Convert PDF to images at 500 DPI.
            pdf_pages = convert_from_path(pdf_file_path, 500)
            # Process each page.
            for page_enumeration, page in enumerate(pdf_pages, start=1):
                filename = os.path.join(tempdir, f"page_{page_enumeration:03}.jpg")
                page.save(filename, "JPEG")
                # Extract text from image.
                text = str(pytesseract.image_to_string(Image.open(filename)))
                text = text.replace("-\n", "")
                extracted_text += text
            return extracted_text
        except Exception as e:
            log_message(f"Error during OCR process: {e}")
            return None

def extract_information(text, pdf_name):
    """
    Sends the OCR'd text to Straico API for information extraction.
    """
    if not text:
        log_message(f"No text to extract from {pdf_name}")
        return {"name": "error occurred", "address": "error occurred", "zip": "error occurred"}
    
    prompt = f"""Extract the following information from the text below:
1. The name of the main defendant (usually the first name on the list) and the Second defendant if any
2. The address of the property mentioned in the text, if not found provide the legal description instead (also looks like an address)
3. The zip code if found
4. The county of the case
5. Case Number if found
Format your response EXACTLY as shown below, including all XML tags: <name>NAME OF MAIN DEFENDANT, (line break) SECOND DEFENDANT NAME</name>
<address>ADDRESS FOUND</address>
<zip>ZIP CODE FOUND</zip>
<county>COUNTY OF CASE</county>
<caseno>CASE NUMBER</caseno>
If any piece of information is not available, use "not available" as the value. For example: <address>not available</address>
Do not include any introduction, explanation, or conclusion in your response - ONLY the tagged data.
There are sometimes the owner of the home might be deceased and a representative listed in that case list BOTH(when two name are available) with a bracket beside their name eg: john doe (deceased), maria doe (representative)
TEXT TO EXTRACT FROM:

{text}"""

    max_retries = 6
    consecutive_failures = 0
    while consecutive_failures < max_retries:
        try:
            response = requests.post(
                "https://api.straico.com/v1/prompt/completion",
                headers={
                    "Authorization": f"Bearer {STRAICO_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "models": [MODEL],
                    "message": prompt,
                },
                timeout=60
            )
            if response.status_code not in [200, 201]:
                log_message(f"API request failed for {pdf_name} with status {response.status_code}: {response.text}")
                consecutive_failures += 1
                time.sleep(5)
                continue
            
            result = response.json()
            if (result.get("success") and 
                result.get("data", {}).get("completions", {}).get(MODEL, {}).get("completion", {}).get("choices", [])):
                extracted_text_api = result["data"]["completions"][MODEL]["completion"]["choices"][0]["message"]["content"]
                log_message(f"API Response for {pdf_name}:")
                log_message(f"Raw extracted text: {extracted_text_api}")
                parsed_data = parse_extracted_info(extracted_text_api)
                log_message(f"Parsed data: {json.dumps(parsed_data, indent=2)}")
                consecutive_failures = 0
                return parsed_data
            else:
                log_message(f"Invalid response format for {pdf_name}: {result}")
                consecutive_failures += 1
                time.sleep(5)
        except Exception as e:
            log_message(f"Error calling Straico API for {pdf_name}: {e}")
            consecutive_failures += 1
            time.sleep(5)
    
    log_message(f"Too many consecutive API failures ({max_retries}). Stopping processing.")
    return {"name": "error occurred", "address": "error occurred", "zip": "error occurred"}

def parse_extracted_info(extracted_text):
    """
    Parses the XML-formatted text returned by the API.
    """
    data = {
        "name": "error occurred",
        "address": "error occurred",
        "zip": "error occurred",
        "county": "error occurred",
        "caseno": "error occurred"
    }
    try:
        name_match = re.search(r'<name>(.*?)</name>', extracted_text, re.DOTALL)
        if name_match:
            data["name"] = name_match.group(1).strip()
        address_match = re.search(r'<address>(.*?)</address>', extracted_text, re.DOTALL)
        if address_match:
            data["address"] = address_match.group(1).strip()
        zip_match = re.search(r'<zip>(.*?)</zip>', extracted_text, re.DOTALL)
        if zip_match:
            data["zip"] = zip_match.group(1).strip()
        county_match = re.search(r'<county>(.*?)</county>', extracted_text, re.DOTALL)
        if county_match:
            data["county"] = county_match.group(1).strip()
        caseno_match = re.search(r'<caseno>(.*?)</caseno>', extracted_text, re.DOTALL)
        if caseno_match:
            data["caseno"] = caseno_match.group(1).strip()
    except Exception as e:
        log_message(f"Error parsing extracted info: {e}")
    return data

def add_to_airtable_http(data, document_name):
    """
    Adds the extracted data to Airtable using a direct HTTP request.
    """
    try:
        url = f"https://aitable.ai/fusion/v1/datasheets/{DATASHEET_ID}/records"
        if VIEW_ID:
            url += f"?viewId={VIEW_ID}&fieldKey=id"
        else:
            url += "?fieldKey=id"
        headers = {
            "Authorization": f"Bearer {AIRTABLE_API_TOKEN}",
            "Content-Type": "application/json"
        }
        record = {
            "fields": {
                FIELD_NAME_ID: data["name"],
                FIELD_ADDRESS_ID: data["address"],
                FIELD_ZIP_ID: data["zip"],
                FIELD_DOCUMENT_ID: document_name,
                FIELD_COUNTY_ID: data["county"],
                FIELD_CASENO_ID: data["caseno"]
            }
        }
        payload = {
            "records": [record],
            "fieldKey": "id"
        }
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code not in [200, 201, 202]:
            log_message(f"Error adding to Airtable for {document_name}: Status code {response.status_code}, Response: {response.text}")
            return False
        log_message(f"Successfully added record to Airtable for {document_name}")
        return True
    except Exception as e:
        log_message(f"Error adding to Airtable for {document_name}: {e}")
        return False

def process_all_pdfs():
    """
    Processes all PDF files in the specified directory.
    """
    pdf_files = list(pdf_directory.glob("*.pdf"))
    if not pdf_files:
        log_message(f"No PDF files found in {pdf_directory}")
        return
    log_message(f"Found {len(pdf_files)} PDF files to process")
    
    consecutive_api_errors = 0
    max_consecutive_api_errors = 6
    
    for pdf_file in pdf_files:
        document_name = pdf_file.name
        log_message(f"Processing {document_name}...")
        
        extracted_text = ocr_pdf(pdf_file)
        if extracted_text is None:
            log_message(f"OCR failed for {document_name}")
            error_data = {"name": "error occurred", "address": "error occurred", "zip": "error occurred"}
            add_to_airtable_http(error_data, document_name)
            continue
        
        try:
            extracted_data = extract_information(extracted_text, document_name)
            if all(value == "error occurred" for value in extracted_data.values()):
                consecutive_api_errors += 1
                log_message(f"API error count: {consecutive_api_errors}/{max_consecutive_api_errors}")
                if consecutive_api_errors >= max_consecutive_api_errors:
                    log_message("Too many consecutive API errors. Stopping processing.")
                    break
            else:
                consecutive_api_errors = 0
            add_to_airtable_http(extracted_data, document_name)
        except Exception as e:
            log_message(f"Error processing {document_name}: {e}")
            error_data = {"name": "error occurred", "address": "error occurred", "zip": "error occurred"}
            add_to_airtable_http(error_data, document_name)

def main():
    """
    Main function to run the full OCR workflow.
    """
    try:
        log_message("Starting PDF processing...")
        process_all_pdfs()
        log_message("Processing complete!")
    except Exception as e:
        log_message(f"An error occurred during processing: {e}")

# This run() function enables your controller to simply import and call run()
def run():
    main()

if __name__ == "__main__":
    run()
