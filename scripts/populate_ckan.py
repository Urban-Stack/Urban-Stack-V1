import requests
import json
import os
import subprocess
import base64
import uuid
import random
import string

different_formats = [
    "json",
    "yml",
    "xml",
    "png",
    "svg",
    "dae",
    "fbx",
    "html",
    "css",
    "js",
]

different_prefixes = [
    "knuffigen",
    "donnertal",
    "regenhausen",
    "tsunami-city"
]



def get_k8s_secret_key(secret_name, key, namespace):
    try:
        result = subprocess.run(
            ["kubectl", "get", "secret", secret_name, "-n", namespace, "-o", "json"],
            capture_output=True,
            check=True,
            text=True
        )
        secret_data = json.loads(result.stdout)
        encoded_value = secret_data["data"][key]
        decoded_value = base64.b64decode(encoded_value).decode("utf-8")
        return decoded_value
    except subprocess.CalledProcessError as e:
        print("Error executing kubectl:", e.stderr)
    except KeyError:
        print(f"Key '{key}' not found in secret '{secret_name}'.")


CKAN_TOKEN = get_k8s_secret_key("local-udh-platform-ckan-ckan-config", "emailApiKey", "udh")
print("Secret Value:", CKAN_TOKEN)

url = "https://ckan.data-hub.local/api/3/action/organization_create"

headers = {
    "Authorization": CKAN_TOKEN,
    "Content-Type": "application/json"
}

data = {
    "id": "e2201a25-2b77-8bce-5a3d-77710667afdd",
    "name": "test_organisation",
    "title": "Test Organisation"
}

response = requests.post(url, headers=headers, data=json.dumps(data), verify=False)

print("Status Code:", response.status_code)
print("Response:", response.json())

url = "https://ckan.data-hub.local/api/3/action/organization_member_create"

headers = {
    "Authorization": CKAN_TOKEN,
    "Content-Type": "application/json"
}

data = {
    "username": "data-hub-admin",
    "id": "test_organisation",
    "role": "admin"
}

response = requests.post(url, headers=headers, data=json.dumps(data), verify=False)

print("Status Code:", response.status_code)
print("Response:", response.json())

for i in range(9):
    dataset_random = ''.join(random.choices(string.ascii_lowercase, k=5))
    headers = {
        "Authorization": CKAN_TOKEN,
        "Content-Type": "application/json"
    }

    # Step 1: Create dataset
    dataset = {
        "name": f"{random.choice(different_prefixes)}-{dataset_random}",
        "title": f"{random.choice(different_prefixes)}-{dataset_random}",
        "notes": f"Dies ist ein Beispiel-Datensatz über die CKAN API. {dataset_random}",
        "private": random.choice([True, False]),
        "owner_org": "test_organisation",
        "tags": [{"name": "test"}, {"name": "api"}]
    }

    url = "https://ckan.data-hub.local/api/3/action/package_create"
    response = requests.post(url, json=dataset, headers=headers, verify=False)

    if response.status_code == 200:
        print("Datensatz erfolgreich erstellt!")
        dataset_id = response.json()['result']['id']
        for i in range(0,3):
            ressource_uuid = uuid.uuid4()

            resource = {
                "package_id": dataset_id,
                "name": f"resource-{ressource_uuid}",
                "format": f"{random.choice(different_formats)}",
                "url": "https://example.com/data.csv"  # You need to provide a URL or upload data
            }
            resource_url = "https://ckan.data-hub.local/api/3/action/resource_create"
            resource_response = requests.post(resource_url, json=resource, headers=headers, verify=False)

            if resource_response.status_code == 200:
                print("Ressource erfolgreich erstellt!")
            else:
                print("Fehler beim Erstellen der Ressource:", resource_response.status_code)
                print(resource_response.text)

    else:
        print("Fehler:", response.status_code)
        print(response.text)
