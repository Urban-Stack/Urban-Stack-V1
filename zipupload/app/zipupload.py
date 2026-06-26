import logging
from os import getenv
from typing import Literal
from io import BytesIO
from http import HTTPStatus
import mimetypes
import json
from zipfile import ZipFile, BadZipFile

from flask import Flask, request, abort, g, jsonify, Response, url_for
import requests
from waitress import serve
import boto3
from botocore.exceptions import ClientError
import pyseto

# max size of a file inside a zip file in bytes
MAX_FILE_SIZE = 100 * 1024 * 1024


def json_abort(status_code: int, error: str, **kwargs):
    response = jsonify({"error": error, **kwargs})
    response.status_code = status_code
    abort(response)


logging.basicConfig(level=getenv("LOGLEVEL", "INFO").upper())


def getenv_or_die(var):
    env = getenv(var)
    if env is None or env == "":
        logging.error("required environment variable %s is missing!", var)
        exit(1)
    return env


bucket_url = getenv_or_die("BUCKET_URL")
upload_token_secret = getenv_or_die("UPLOAD_TOKEN_SECRET").encode("ASCII")

app = Flask(__name__)


@app.route("/livez")
def livez():
    return "I am alive."


@app.route("/readyz")
def readyz():
    def ready(url):
        try:
            if requests.get(url, timeout=4, allow_redirects=False).ok:
                return True
        except requests.exceptions.RequestException:
            logging.exception("bad")
        return False

    dependencies = {
        "storage": ready(bucket_url),
    }

    return (
        {d: "READY" if ready else "NOT READY" for d, ready in dependencies.items()},
        200 if all(dependencies.values()) else 503,
    )


@app.post("/api/v1/zipupload/presign/<bucket>")
def presign_upload_token(bucket: str):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        json_abort(HTTPStatus.UNAUTHORIZED, "unauthorized")

    sts_client = boto3.client("sts", endpoint_url=bucket_url)

    try:
        response = sts_client.assume_role_with_web_identity(
            RoleArn="arn:aws:iam::RGW99999999999999999:role/usercode",
            RoleSessionName="usercode",
            WebIdentityToken=auth_header.removeprefix("Bearer "),
        )
    except ClientError as e:
        logging.warn("client error from sts", e)
        error_code = e.response.get("Error", {}).get("Code")
        if error_code == "AccessDenied":
            json_abort(HTTPStatus.FORBIDDEN, "storage access denied")
        raise

    data = json.dumps(
        {
            "aws_access_key_id": response["Credentials"]["AccessKeyId"],
            "aws_secret_access_key": response["Credentials"]["SecretAccessKey"],
            "aws_session_token": response["Credentials"]["SessionToken"],
        }
    )

    upload_token_key = pyseto.Key.new(
        version=4, purpose="local", key=upload_token_secret
    )
    token = pyseto.encode(upload_token_key, data)

    upload_url = url_for(
        "upload_with_token",
        bucket=bucket,
        _scheme="https",
        token=token,
        _external=True,
    )

    return jsonify(
        {
            "uploadUrl": upload_url,
        }
    )


@app.put("/api/v1/zipupload/upload/<bucket>")
def upload_with_token(bucket: str):
    provided_token = request.args.get("token")
    if not provided_token:
        json_abort(HTTPStatus.UNAUTHORIZED, "invalid token")

    upload_token_key = pyseto.Key.new(
        version=4, purpose="local", key=upload_token_secret
    )
    try:
        decrypted = json.loads(pyseto.decode(upload_token_key, provided_token).payload)
    except pyseto.DecryptError | pyseto.VerifyError:
        json_abort(HTTPStatus.UNAUTHORIZED, "invalid token")

    try:
        zf = ZipFile(request.stream)

        files_too_big = []

        filenames_with_sizes = list(
            map(
                lambda x: (x.filename, x.file_size),
                filter(lambda x: not x.is_dir(), zf.filelist),
            )
        )

        for filename, filesize in filenames_with_sizes:
            if filesize > MAX_FILE_SIZE:
                files_too_big.append({"filename": filename, "size": filesize})

        if files_too_big:
            json_abort(
                HTTPStatus.CONTENT_TOO_LARGE,
                "files are too large, max is 100 MiB",
                files=files_too_big,
            )

        client = boto3.client(
            "s3",
            aws_access_key_id=decrypted["aws_access_key_id"],
            aws_secret_access_key=decrypted["aws_secret_access_key"],
            aws_session_token=decrypted["aws_session_token"],
            endpoint_url=bucket_url,
        )

        for filename, filesize in filenames_with_sizes:
            with zf.open(filename) as f:
                try:
                    logging.info(
                        "uploading to %s (%s bytes): %s", bucket, filesize, filename
                    )
                    args = {"Bucket": bucket, "Key": filename, "Body": f}
                    (content_type, compression) = mimetypes.guess_file_type(
                        filename.lower()
                    )
                    if content_type:
                        args["ContentType"] = content_type
                    client.put_object(**args)
                except ClientError as e:
                    logging.warn("client error from put_object", e)
                    error_code = e.response.get("Error", {}).get("Code")
                    if error_code == "NotFound":
                        json_abort(
                            HTTPStatus.NOT_FOUND,
                            "bucket doesn't exist or no write permissions",
                        )
                    raise
    except BadZipFile:
        json_abort(HTTPStatus.BAD_REQUEST, "invalid zip file")

    return jsonify({})


if __name__ == "__main__":
    logging.info("starting server")

    serve(app, host="0.0.0.0", port=8091)
