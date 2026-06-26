from os import environ
import os
from typing import Optional
import requests
import logging
from time import sleep

logging.basicConfig(level=environ.get("LOGLEVEL", "INFO").upper())

READY_URLS = os.getenv("READY_URLS", "").split(",")

def check_ready(url: str) -> bool:
  try:
    requests.get(url).raise_for_status()
    return True
  except Exception as e:
    logging.debug(f"{url} is not ready: {e}")
    return False

def getenv_or_die(var: str):
  if value := os.getenv(var):
    return value
  logging.error(f"missing env var {var}")
  exit(1)

KEYCLOAK_REALM_URL = getenv_or_die("KEYCLOAK_REALM_URL")
KEYCLOAK_ADMIN_URL = getenv_or_die("KEYCLOAK_ADMIN_URL")

def get_token() -> str:
  response = requests.post(f'{KEYCLOAK_REALM_URL}/protocol/openid-connect/token',
  auth=(getenv_or_die("CLIENT_ID"), getenv_or_die("CLIENT_SECRET")),
  data={
    "grant_type": "client_credentials"
  })
  response.raise_for_status()
  return response.json()["access_token"]

base_url = f"{KEYCLOAK_REALM_URL}/data-hub"

def sync(current_path: str, typ: str, rest, headers):
  if typ == "attributes":
    logging.info(f'patching attributes of {current_path}')
    requests.patch(f"{base_url}/{current_path}/attributes", headers=headers, json=rest).raise_for_status()
    return
  elif typ == "members":
    # handled separately
    return
  res = requests.get(f"{base_url}/{current_path}/{typ}", headers=headers)
  current = set(res.json())
  desired = set(rest.keys())
  logging.debug(f'at {current_path}: {current} vs {desired}')
  # don't delete resources
  for to_create in desired - current:
    logging.info(f'creating {current_path}/{typ}/{to_create}')
    requests.put(f"{base_url}/{current_path}/{typ}/{to_create}", headers=headers).raise_for_status()
  for subname, subresources in rest.items():
    for subtyp, subrest in subresources.items():
      sync(f"{current_path}/{typ}/{subname}", subtyp, subrest, headers)

def ensure_group_member(email: str, tenant_name: str, group_name: Optional[str], headers):
  # get group id
  groups = requests.get(f"{KEYCLOAK_ADMIN_URL}/groups", params={"search": tenant_name, "exact": "true"}, headers=headers).json()
  group = next(g for g in groups if g['name'] == tenant_name)
  if group_name:
    sub_groups = requests.get(f"{KEYCLOAK_ADMIN_URL}/groups/{group["id"]}/children", headers=headers).json()
    group = next(g for g in sub_groups if g['name'] == group_name)

  # get user
  user = requests.get(f"{KEYCLOAK_ADMIN_URL}/users", {"email": email, "exact": "true"}, headers=headers).json()[0]
  requests.put(f"{KEYCLOAK_ADMIN_URL}/users/{user["id"]}/groups/{group["id"]}", headers=headers).raise_for_status()

def sync_group_memberships(data, headers):
  for tenant, tenant_data in data.get("tenants", {}).items():
    for member in tenant_data.get("members", []):
      ensure_group_member(member, tenant, None, headers)
    for group, group_data in tenant_data.get("groups", {}).items():
      for member in group_data.get("members", []):
        ensure_group_member(member, tenant, group, headers)

def full_sync(data):
  # wait for dependencies to be ready
  for _ in range(200):
    if all((check_ready(url) for url in READY_URLS)):
      break
    logging.info("waiting on dependencies...")
    sleep(5)
  else:
    logging.error("dependencies are still not ready")
    exit(1)

  token = get_token()
  headers = {"Authorization": f"Bearer {token}"}

  for typ, rest in data.items():
    sync("", typ, rest, headers)
  sync_group_memberships(data, headers)
