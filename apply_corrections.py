import json
import requests
import sys

URL = "http://localhost:8000/api/marks/corrections/"
JSON_PATH = "corrections.json"

def main():
    try:
        with open(JSON_PATH, "r", encoding="utf-8") as f:
            corrections = json.load(f)
    except FileNotFoundError:
        print(f"Error: {JSON_PATH} not found.")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Failed to parse JSON from {JSON_PATH}.")
        sys.exit(1)

    print(f"Loaded {len(corrections)} corrections from {JSON_PATH}.\n")

    success_count = 0
    fail_count = 0

    for idx, c in enumerate(corrections, 1):
        print(f"[{idx}] Sending correction for Student: {c.get('admission_no')}, Subject: {c.get('subject')}, Marks: {c.get('marks')}...")
        try:
            response = requests.post(URL, json=c)
            if response.status_code == 200:
                print(f"    SUCCESS: Status 200 - {response.json().get('message', 'Applied')}")
                success_count += 1
            else:
                print(f"    FAILED: Status {response.status_code} - {response.text}")
                fail_count += 1
        except requests.exceptions.ConnectionError:
            print(f"    ERROR: Could not connect to backend server at {URL}. Is the Django server running?")
            sys.exit(1)

    print("\n--- Corrections Summary ---")
    print(f"Total processed: {len(corrections)}")
    print(f"Successfully applied (200 OK): {success_count}")
    print(f"Rejected / Invalid (400 Bad Request): {fail_count}")

if __name__ == "__main__":
    main()
