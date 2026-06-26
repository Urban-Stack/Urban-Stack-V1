import time
import requests
from requests_oauthlib import OAuth2Session
from requests.auth import HTTPBasicAuth, AuthBase
from urllib.parse import urlencode
from oauthlib.oauth2 import BackendApplicationClient
from os import environ, makedirs
from types import SimpleNamespace
import boto3
from gql import Client, GraphQLRequest
from gql.transport.requests import RequestsHTTPTransport
import re

base_domain = environ.get("BASE_DOMAIN", "urbanstack.de")

client_id = "usercode"
kc_url_prefix = "https://login." + base_domain + "/realms/udh/protocol/openid-connect"
auth_url = kc_url_prefix + "/auth/device"
token_url = kc_url_prefix + "/token"
resource_api = "https://login." + base_domain + "/realms/udh/data-hub"
sensormeta_api = "https://api." + base_domain + "/api/v1/metadata/"

def oauth2_session(scope):
    """Obtains an OAuth2 Session object that can be used to make authenticated requests.

    :param scope: Scope to obtain a token for.
    """

    # the personal credential can either be supplied by environment variables or a global variable
    personal_credential_username = environ.get('PERSONAL_CREDENTIAL_USERNAME')
    personal_credential_password = environ.get('PERSONAL_CREDENTIAL_PASSWORD')

    # %env PERSONAL_CREDENTIAL_USERNAME user-a73c7375-a5f8-4ba4-ad3b-cbc84d9fe536
    # %env PERSONAL_CREDENTIAL_PASSWORD EspR3LUbqYzxkfIzXRMBLzhfWHsYBxzy
    # globals()["personal_credential"] ("user-a73c7375-a5f8-4ba4-ad3b-cbc84d9fe536", "EspR3LUbqYzxkfIzXRMBLzhfWHsYBxzy")
    # try:
    #     (personal_credential_username, personal_credential_password) = personal_credential
    # except (UnboundLocalError, NameError):
    #     pass

    print(f"personal user: {personal_credential_username}")
    if personal_credential_username and personal_credential_password:
        class BackendApplicationSession(requests.Session):
            def __init__(self, client_id: str, client_secret: str, token_url: str, scope: str):
                self.client_id = client_id
                self.client_secret = client_secret
                self.token_url = token_url
                self.scope = scope
                self.token = None
                super(BackendApplicationSession, self).__init__()

            def get_or_fetch_token(self):
                if not self.token or self.token["expires_at"] - 30 < time.time():
                    resp = requests.post(self.token_url,
                        urlencode({"grant_type": "client_credentials", "scope": "openid buckets data-hub"}),
                        auth=HTTPBasicAuth(self.client_id, self.client_secret),
                        headers={"content-type": "application/x-www-form-urlencoded"})
                    resp.raise_for_status()
                    self.token = resp.json()
                    self.token["expires_at"] = int(time.time()) + self.token["expires_in"]
                return self.token

            def refresh_token(self, *args, **kwargs):
                return self.get_or_fetch_token()
            
            def request(
                self,
                method,
                url,
                data=None,
                headers=None,
                files=None,
                **kwargs
            ):
                headers = headers or {}
                headers["Authorization"] = f"Bearer {self.get_or_fetch_token()["access_token"]}"
                return super(BackendApplicationSession, self).request(
                    method, url, headers=headers, data=data, files=files, **kwargs
                )
        session = BackendApplicationSession(client_id=personal_credential_username, client_secret=personal_credential_password, token_url=token_url, scope="openid " + " ".join(scope))
        session.get_or_fetch_token()
        return session

    # try to figure out if we're running in a jupyter scheduler environment
    if "JPY_PARENT_PID" in environ and "JPY_SESSION_NAME" not in environ:
        raise RuntimeError("to authenticate to urbanstack make sure `personal_credential` is set")

    auth_info = requests.post(auth_url, {
        "client_id": client_id,
        "scope": "openid " + " ".join(scope)
    }).json()
    print("Log in at " + auth_info["verification_uri_complete"])
    while True:
        time.sleep(auth_info["interval"])
        result = requests.post(
            token_url, {
                "client_id": client_id,
                "device_code": auth_info["device_code"],
                "grant_type": "urn:ietf:params:oauth:grant-type:device_code"
            })
        payload = result.json()

        def add_expires_at(token):
            token["expires_at"] = int(time.time()) + token["expires_in"]
            return token

        if result.status_code == 200:
            print("Login successful")
            return OAuth2Session(client_id,
                                 auto_refresh_url=token_url,
                                 token=add_expires_at(payload),
                                 auto_refresh_kwargs={"client_id": client_id},
                                 token_updater=add_expires_at)
        else:
            print("Still waiting for login confirmation...")
            if payload["error"] == "authorization_pending":
                pass
            elif payload["error"] == "slow_down":
                auth_info["interval"] += 5
            else:
                raise Exception("Login failed: " + result.text)


def s3_client(session):
    endpoint_url = f"https://storage.{base_domain}"

    sts_client = boto3.client("sts", endpoint_url=endpoint_url)

    response = sts_client.assume_role_with_web_identity(
        RoleArn="arn:aws:iam::RGW99999999999999999:role/usercode",
        RoleSessionName="usercode",
        WebIdentityToken=session.token["id_token"],
        DurationSeconds=min(session.token["refresh_expires_in"] or session.token["expires_in"], 36000))

    return boto3.client(
        "s3",
        aws_access_key_id=response["Credentials"]["AccessKeyId"],
        aws_secret_access_key=response["Credentials"]["SecretAccessKey"],
        aws_session_token=response["Credentials"]["SessionToken"],
        endpoint_url=endpoint_url)


def gql_client(session):
    def auth_bearer(r):
        if session.token["expires_at"] - 30 < time.time():
            session.refresh_token(token_url)

        r.headers["Authorization"] = f"Bearer {session.token["access_token"]}"
        return r

    transport = RequestsHTTPTransport(
        url=f"{resource_api}/graphql",
        auth=auth_bearer,
        use_json=True,
    )

    return Client(transport=transport)

def sensormeta_client(session):
    """Returns an API client for the sensormeta-API
    
    :param session: Authorized OAuth session object
    """

    def check(tenant: str, project: str):
        """Returns the count of available sensor metadata in JSON
        
        :param tenant: tenant name
        :param project: project name
        """
        print(f"Getting metadata for {tenant}/{project}")
        r = session.get(f"{sensormeta_api}{tenant}/{project}")
        return r.json()
    
    def delete(tenant: str, project: str):
        """Deletes all sensor metadata of a project
        
        :param tenant: tenant name
        :param project: project name
        """
        print(f"Deleting metadata for {tenant}/{project}")
        r = session.delete(f"{sensormeta_api}{tenant}/{project}")
        r.raise_for_status()
        return r.status_code
    
    def upload(tenant: str, project: str, csv_path: str):
        """Uploads a csv table to the database
        
        :param tenant: tenant name
        :param project: project name
        :param csv_path: path relative to current file to the csv file
        """
        print(f"Posting metadata for {tenant}/{project}")
        with open(csv_path, "r", encoding="utf-8") as f:
            csv_data = f.read()

        headers = {"Content-Type": "text/csv"}
        r = session.post(f"{sensormeta_api}{tenant}/{project}", headers=headers, data=csv_data)
        return r.json()
    
    def download(tenant: str, project: str):
        """Downloads the current sensor metadata as an csv and saves it under "downloads"
        
        :param tenant: tenant name
        :param project: project name
        """
        print(f"Downloading CSV for {tenant}/{project}")
        download_save_path = "downloads/"

        headers = {"Accept": "text/csv"}
        r = session.get(f"{sensormeta_api}{tenant}/{project}/download.csv", headers=headers)

        makedirs(download_save_path, exist_ok=True)

        file_save_path = download_save_path + F"metadata-{tenant}-{project}.csv"
        
        with open((file_save_path), "w", encoding="UTF-8") as f:
            f.write(r.text)

        return f'Metadata saved under: "{file_save_path}"'
    
    return SimpleNamespace(
        check=check,
        delete=delete,
        download=download,
        upload=upload
    )

_auth = None

def login(force=False):
    global _auth
    def refresh_tokens():
        try:
            _auth.http.refresh_token(token_url)
            _auth.s3 = s3_client(_auth.http)
            return True
        except:
            return False
    if not force and _auth and refresh_tokens():
        print("tokens refreshed")
        print("use login(force=True) to force a full login")
    else:
        session = oauth2_session(["data-hub", "buckets"])
        _auth = SimpleNamespace(
            http=session,
            s3=s3_client(session),
            graphql=gql_client(session),
            sensormeta=sensormeta_client(session))
    return _auth
