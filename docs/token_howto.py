#!/usr/bin/env python3

# The data-hub API requires an access token that allows the client to query the data that the user is allowed to view.

# This is a demo script showing how to obtain and use access tokens to access the data-hub API
# Install dependencies with
#   pip install requests requests-oauthlib
# local usage: REQUESTS_CA_BUNDLE=docs/local-ca.crt BASE_DOMAIN=data-hub.local python3 -i docs/token_howto.py

import time
import requests
from requests_oauthlib import OAuth2Session
from os import environ

base_domain = environ.get("BASE_DOMAIN", "urbanstack.de")

client_id = "usercode"
kc_url_prefix = "https://login." + base_domain + "/realms/udh/protocol/openid-connect"
auth_url = kc_url_prefix + "/auth/device"
token_url = kc_url_prefix + "/token"


def log_in(scope):
    """Obtains an OAuth2 Session object that can be used to make authenticated requests.

     :param scope: Scope to obtain a token for.
     """
    auth_info = requests.post(auth_url, {"client_id": client_id, "scope": "openid " + scope}).json()
    print("Log in at " + auth_info["verification_uri_complete"])
    while True:
        time.sleep(auth_info["interval"])
        result = requests.post(token_url, {"client_id": client_id, "device_code": auth_info["device_code"],
                                           "grant_type": "urn:ietf:params:oauth:grant-type:device_code"})
        payload = result.json()

        if result.status_code == 200:
            print("Login successful")
            return OAuth2Session(client_id, auto_refresh_url=token_url, token=payload,
                                 auto_refresh_kwargs={"client_id": client_id}, token_updater=id)
        else:
            print("Still waiting for login confirmation...")
            if payload["error"] == "authorization_pending":
                pass
            elif payload["error"] == "slow_down":
                auth_info["interval"] += 5
            else:
                raise Exception("Login failed: " + result.text)


# This asks the user to log in at a URL where they can confirm the API access for this script.
# The resulting session can be used to perform authenticated queries against the data that the user is allowed to view.
oauth2_session = log_in("data-hub")

resource_api_url = f"https://login.{base_domain}/realms/udh/data-hub"

result = oauth2_session.get(resource_api_url + "/tenants").json()

for tenant in result:
    if tenant.startswith('knuffingen-'):
        print("deleting", tenant)
        oauth2_session.delete(resource_api_url + "/tenants/" + tenant)

print(result)

# useful for development
print("refreshing and printing access tokens until terminated:")
while True:
    print(oauth2_session.refresh_token(token_url)["access_token"])
    time.sleep(oauth2_session.refresh_token(token_url)["expires_in"] - 10)
