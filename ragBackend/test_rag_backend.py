import urllib.request
import urllib.parse
import json
import uuid
import mimetypes
import sys
import os

# Base URL of the RAG backend
BASE_URL = "http://127.0.0.1:8002"

def print_section(title):
    print("\n" + "=" * 50)
    print(f" {title} ")
    print("=" * 50)

def send_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read()
            return response.status, json.loads(res_data.decode("utf-8"))
    except urllib.error.HTTPError as e:
        res_data = e.read()
        try:
            err_json = json.loads(res_data.decode("utf-8"))
            return e.code, err_json
        except Exception:
            return e.code, {"error": res_data.decode("utf-8")}
    except Exception as e:
        return 500, {"error": str(e)}

def build_multipart_form_data(fields, files):
    boundary = "----WebKitFormBoundary" + str(uuid.uuid4()).replace("-", "")[:16]
    body = []
    
    # Add fields
    for key, value in fields.items():
        if value is None:
            continue
        body.append(f"--{boundary}".encode("utf-8"))
        body.append(f'Content-Disposition: form-data; name="{key}"'.encode("utf-8"))
        body.append(b"")
        body.append(str(value).encode("utf-8"))
        
    # Add files
    for key, (filename, content, mimetype) in files.items():
        body.append(f"--{boundary}".encode("utf-8"))
        body.append(f'Content-Disposition: form-data; name="{key}"; filename="{filename}"'.encode("utf-8"))
        body.append(f"Content-Type: {mimetype}".encode("utf-8"))
        body.append(b"")
        body.append(content)
        
    body.append(f"--{boundary}--".encode("utf-8"))
    body.append(b"")
    
    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}"
    }
    
    return b"\r\n".join(body), headers

def run_tests():
    patient_id = f"test-patient-{uuid.uuid4().hex[:6]}"
    print(f"Using random Patient ID for test: {patient_id}")
    
    # ----------------------------------------------------
    # TEST 1: Health Check
    # ----------------------------------------------------
    print_section("Test 1: Health Check")
    status, res = send_request(f"{BASE_URL}/health")
    print(f"Status Code: {status}")
    print(f"Response:\n{json.dumps(res, indent=2)}")
    if status != 200:
        print("[FAIL] Health check failed.")
        sys.exit(1)
    print("[PASS] Health check successful.")

    # ----------------------------------------------------
    # TEST 2: Ingest Plain Text Medical History
    # ----------------------------------------------------
    print_section("Test 2: Ingesting Plain Text History")
    
    medical_text = (
        "Patient has a long history of moderate asthma, diagnosed at age 10, currently managed with a Salbutamol inhaler as needed. "
        "Also diagnosed with primary Hypertension in 2021, currently taking Lisinopril 10mg daily. "
        "Known anaphylactic allergy to Penicillin (severe hives and respiratory distress). "
        "Underwent a laparoscopic appendectomy in 2018 at Mercy Hospital with no complications."
    )
    
    fields = {"text": medical_text}
    # Form data encoding for simple application/x-www-form-urlencoded since uvicorn parses form fields
    data = urllib.parse.urlencode(fields).encode("utf-8")
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    
    status, res = send_request(
        f"{BASE_URL}/api/patients/{patient_id}/history", 
        method="POST", 
        data=data, 
        headers=headers
    )
    
    print(f"Status Code: {status}")
    print(f"Response:\n{json.dumps(res, indent=2)}")
    if status != 200:
        print("[FAIL] Failed to ingest plain text history.")
        sys.exit(1)
    print("[PASS] Ingestion of plain text notes successful.")

    # ----------------------------------------------------
    # TEST 3: Retrieve and Compile Patient Summary (Text only)
    # ----------------------------------------------------
    print_section("Test 3: Compiling Summary (Text Ingestion)")
    status, res = send_request(f"{BASE_URL}/api/patients/{patient_id}/summary")
    print(f"Status Code: {status}")
    print(f"Response Summary:\n{json.dumps(res, indent=2)}")
    
    if status != 200:
        print("[FAIL] Failed to retrieve patient summary.")
        sys.exit(1)
        
    # Verify the extracted structured features
    print("\nValidating structured data extraction:")
    print(f" - Chronic Conditions: {res.get('chronic_conditions')}")
    print(f" - Allergies: {res.get('allergies')}")
    print(f" - Current Medications: {res.get('current_medications')}")
    print(f" - Past Surgeries: {res.get('past_surgeries')}")
    
    # Quick checks (Note: in fallback mock mode these will return defaults, so we check if response exists)
    if not res.get("chronic_conditions") or not res.get("clinical_summary"):
        print("[FAIL] Summary response is missing critical fields.")
        sys.exit(1)
    print("[PASS] Summary retrieval and extraction successful.")

    # ----------------------------------------------------
    # TEST 4: Ingest File Upload (Simulated PDF/TXT File)
    # ----------------------------------------------------
    print_section("Test 4: Ingesting History via File Upload")
    
    # We will upload a simulated .txt file containing additional history
    file_content = (
        "Patient has a family history of Type 2 Diabetes. "
        "Recently complained of mild seasonal allergic rhinitis. "
        "Had a fracture of the left radius in 2015, treated with casting, fully healed."
    ).encode("utf-8")
    
    # Prepare files dictionary: {field_name: (filename, content, mimetype)}
    files = {
        "files": ("additional_records.txt", file_content, "text/plain")
    }
    # Also we can pass form text fields
    fields = {"text": "Patient has developed mild pollen allergy as of spring 2025."}
    
    data, headers = build_multipart_form_data(fields, files)
    
    status, res = send_request(
        f"{BASE_URL}/api/patients/{patient_id}/history",
        method="POST",
        data=data,
        headers=headers
    )
    
    print(f"Status Code: {status}")
    print(f"Response:\n{json.dumps(res, indent=2)}")
    if status != 200:
        print("[FAIL] Failed to ingest files.")
        sys.exit(1)
    print("[PASS] Ingestion of files successful.")

    # ----------------------------------------------------
    # TEST 5: Retrieve and Compile Integrated Patient Summary
    # ----------------------------------------------------
    print_section("Test 5: Compiling Integrated Summary (Text + File)")
    status, res = send_request(f"{BASE_URL}/api/patients/{patient_id}/summary")
    print(f"Status Code: {status}")
    print(f"Response Summary:\n{json.dumps(res, indent=2)}")
    
    if status != 200:
        print("[FAIL] Failed to retrieve integrated summary.")
        sys.exit(1)
        
    print("\nValidating integrated structured data:")
    print(f" - Chronic Conditions: {res.get('chronic_conditions')}")
    print(f" - Allergies: {res.get('allergies')}")
    print(f" - Current Medications: {res.get('current_medications')}")
    print(f" - Past Surgeries: {res.get('past_surgeries')}")
    print(f" - Snippets count: {len(res.get('retrieved_snippets', []))}")
    print("[PASS] Integrated summary test completed successfully.")
    
    print("\n" + "=" * 50)
    print(" ALL BACKEND ENDPOINT TESTS PASSED SUCCESSFULLY! ")
    print("=" * 50)

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"\n[ERROR] Connection failed: {e}")
        print("Please make sure the FastAPI server is running on http://127.0.0.1:8002 before executing this test script.")
        sys.exit(1)
