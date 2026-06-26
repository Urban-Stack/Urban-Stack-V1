import csv
import io
import itertools
import logging
import time
import uuid
from collections.abc import Iterator
from io import StringIO
from os import getenv
from typing import Literal, TextIO
from typing import TypedDict

import clickhouse_connect
import jwt
import psycopg
import requests
from flask import Flask, request, abort, jsonify, Response
from flask import url_for
from waitress import serve

CHECK_SCOPE_QUERY = """
query ckeckScope($tenant:String!,$project:String!,$scope:String!) {
  project(tenant:$tenant,project:$project) {
    hasScopes(scopes:[$scope])
  }
}
"""


def json_abort(status_code: int, error: str, **kwargs):
    logging.warning(f"json_abort: {status_code}, {error}, {kwargs}")
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


keycloak_realm_url = getenv_or_die("KEYCLOAK_REALM_URL")

postgres_host = getenv_or_die("POSTGRES_HOST")
postgres_name = getenv_or_die("POSTGRES_NAME")
postgres_username = getenv_or_die("POSTGRES_USER")
postgres_password = getenv_or_die("POSTGRES_PASSWORD")

clickhouse_host = getenv_or_die("CLICKHOUSE_HOST")
clickhouse_username = getenv_or_die("CLICKHOUSE_USERNAME")
clickhouse_password = getenv_or_die("CLICKHOUSE_PASSWORD")
upload_token_secret = getenv_or_die("UPLOAD_TOKEN_SECRET")


def connect_postgresql():
    return psycopg.connect(
        f"host={postgres_host} dbname={postgres_name} user={postgres_username} password={postgres_password}",
        autocommit=False,
    )


def connect_clickhouse() -> clickhouse_connect.driver.Client:
    return clickhouse_connect.get_client(
        host=clickhouse_host,
        username=clickhouse_username,
        password=clickhouse_password,
    )


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
            pass
        return False

    def postgres_ready():
        try:
            with connect_postgresql() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT 1")
                    return True
        except psycopg.Error:
            pass
        return False

    def clickhouse_ready():
        client = connect_clickhouse()
        result = client.query("SELECT 1")
        client.close()
        return result.row_count == 1

    dependencies = {
        "keycloak": ready(keycloak_realm_url),
        "postgres": postgres_ready(),
        "clickhouse": clickhouse_ready(),
    }

    return (
        {d: "READY" if ready else "NOT READY" for d, ready in dependencies.items()},
        200 if all(dependencies.values()) else 503,
    )


def check_scope(
    tenant: str,
    project: str,
    scope: Literal["sensor-metadata-read", "sensor-metadata-write"],
):
    response = requests.post(
        f"{keycloak_realm_url}/data-hub/graphql",
        json={
            "query": CHECK_SCOPE_QUERY,
            "variables": {"tenant": tenant, "project": project, "scope": scope},
        },
        headers={"Authorization": request.headers.get("Authorization")},
    )
    if response.status_code in [401, 403]:
        logging.warning(
            "authentication problem while checking scope: %s %s",
            response,
            response.text,
        )
        json_abort(response.status_code, "Check your token")
    elif response.status_code != 200:
        logging.error(
            "unexpected response while checking scope: %s %s",
            mdb_response,
            mdb_response.text,
        )
        json_abort(500, "internal server error")
    else:
        response_json = response.json()
        errors = response_json.get("errors") or []
        if any(
            "unauthorized" in e.get("exception", {}).get("message", "") for e in errors
        ):
            json_abort(401, "unauthorized")
        elif len(errors) > 0:
            logging.error("unexpected error while checking scope: %s", response.text)
            json_abort(500, "internal server error")
        has_scopes = (response_json["data"].get("project") or {}).get("hasScopes")
        if has_scopes == None:
            # if the project doesn't exist (or you don't have access to it)
            json_abort(404, "project doesn't exist or no permission to view it")
        elif has_scopes != True:
            # you know the project exists but don't have the correct scopes
            json_abort(403, f"you need the {scope} scope to perform this action")


SENSOR_ID = "sensor_id"

OPTIONAL_COLUMNS = [
    "external_reference",
    "location_description",
    "location_name",
    "sensor_type",
    "custom1",
    "custom2",
    "custom3",
    "custom4",
    "custom5",
]

CSV_CONTENT_TYPE = "text/csv"


@app.get("/api/v1/metadata/<tenant>/<project>")
def metadata_exists(tenant: str, project: str):
    logging.info("GET /api/v1/metadata/%s/%s", tenant, project)
    check_scope(tenant, project, "sensor-metadata-read")
    full_project = f"{tenant}.{project}"
    with connect_postgresql() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT COUNT(1) FROM public.sensormeta WHERE project = %s",
                (full_project,),
            )
            return jsonify({"count": cur.fetchone()[0]})


@app.get("/api/v1/metadata/<tenant>/<project>/download.csv")
def metadata_download(tenant: str, project: str):
    check_scope(tenant, project, "sensor-metadata-read")
    full_project = f"{tenant}.{project}"
    return process_download(full_project)


@app.delete("/api/v1/metadata/<tenant>/<project>")
def metadata_delete(tenant: str, project: str):
    check_scope(tenant, project, "sensor-metadata-write")
    full_project = f"{tenant}.{project}"
    with connect_postgresql() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM public.sensormeta WHERE project = %s",
                (full_project,),
            )
            conn.commit()

    refresh_clickhouse_view()

    return ("", 204)


def refresh_clickhouse_view():
    client = connect_clickhouse()
    client.command("SYSTEM REFRESH VIEW sensor_meta_mv")
    client.close()


@app.post("/api/v1/metadata/<tenant>/<project>")
def overwrite_metadata(tenant: str, project: str):
    check_scope(tenant, project, "sensor-metadata-write")
    full_project = f"{tenant}.{project}"
    text_stream = io.TextIOWrapper(request.stream, encoding="utf-8", newline="")
    return process_upload(text_stream, full_project)


@app.post("/api/v1/metadata/<tenant>/<project>/presign/upload-token")
def presign_upload_token(tenant: str, project: str):
    logging.info("POST /api/v1/metadata/%s/%s/presign/upload-token", tenant, project)
    check_scope(tenant, project, "sensor-metadata-write")

    upload_token = encode_token(tenant, project, "write")
    upload_url = url_for(
        "upload_with_token",
        tenant=tenant,
        project=project,
        _scheme="https",
        token=upload_token["token"],
        _external=True,
    )

    return jsonify(
        {
            "uploadUrl": upload_url,
            "expiresAt": upload_token["exp_at"],
        }
    )


@app.put("/api/v1/metadata/<tenant>/<project>/presign-upload")
def upload_with_token(tenant: str, project: str):
    logging.info("PUT /api/v1/metadata/%s/%s/presign-upload", tenant, project)
    provided_token = request.args.get("token")
    if not provided_token:
        json_abort(401, "invalid or expired token")

    decoded = decode_token(provided_token)

    if decoded["tenant"] != tenant or decoded["project"] != project:
        json_abort(403, "token tenant/project mismatch")

    if decoded["kind"] != "write":
        json_abort(403, "wrong kind of token")

    request_content_type = (
        (request.headers.get("Content-Type") or "").split(";", 1)[0].strip().lower()
    )
    if request_content_type != CSV_CONTENT_TYPE:
        logging.warning(f"potentially bad content type: {request_content_type}")

    text_stream = io.TextIOWrapper(request.stream, encoding="utf-8", newline="")
    full_project = f"{tenant}.{project}"
    return process_upload(text_stream, full_project)


@app.post("/api/v1/metadata/<tenant>/<project>/presign/download-token")
def presign_download_token(tenant: str, project: str):
    logging.info("POST /api/v1/metadata/%s/%s/presign/download-token", tenant, project)
    check_scope(tenant, project, "sensor-metadata-read")

    download_token = encode_token(tenant, project, "read")
    download_url = url_for(
        "download_with_token",
        tenant=tenant,
        project=project,
        _scheme="https",
        token=download_token["token"],
        _external=True,
    )

    return jsonify(
        {
            "downloadUrl": download_url,
            "expiresAt": download_token["exp_at"],
        }
    )


@app.get("/api/v1/metadata/<tenant>/<project>/presign-download")
def download_with_token(tenant: str, project: str):
    logging.info("PUT /api/v1/metadata/%s/%s/presign-download", tenant, project)
    provided_token = request.args.get("token")
    if not provided_token:
        json_abort(401, "invalid or expired token")

    decoded = decode_token(provided_token)

    if decoded["tenant"] != tenant or decoded["project"] != project:
        json_abort(403, "token tenant/project mismatch")

    if decoded["kind"] != "read":
        json_abort(403, "wrong kind of token")

    full_project = f"{tenant}.{project}"
    return process_download(full_project)


class UploadToken(TypedDict):
    token: str
    exp_at: int


def encode_token(
    tenant: str, project: str, kind: Literal["write", "read"], ttl_sec: int = 30
) -> UploadToken:
    issued_at = int(time.time())
    exp_at = issued_at + ttl_sec
    payload = {
        "tenant": tenant,
        "project": project,
        "kind": kind,
        "iat": issued_at,
        "exp": exp_at,
        "jti": uuid.uuid4().hex,
    }

    return {
        "token": jwt.encode(payload, upload_token_secret, algorithm="HS256"),
        "exp_at": exp_at,
    }


class DecodedToken(TypedDict):
    tenant: str
    project: str
    kind: Literal["read", "write"]


def decode_token(token: str) -> DecodedToken:
    payload = None
    try:
        payload = jwt.decode(token, upload_token_secret, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        json_abort(401, "invalid or expired token")

    tenant = payload.get("tenant")
    if not isinstance(tenant, str) or not tenant.strip():
        json_abort(400, "token missing tenant")
    tenant = tenant.strip()

    project = payload.get("project")
    if not isinstance(project, str) or not project.strip():
        json_abort(400, "token missing project")
    project = project.strip()

    kind = payload.get("kind")
    if not isinstance(kind, str) or kind not in ("read", "write"):
        json_abort(400, "token missing kind")
    kind = kind.strip()

    return {
        "tenant": tenant,
        "project": project,
        "kind": kind,
    }


def process_upload(data_stream: TextIO, full_project: str) -> Response:
    reader = new_csv_reader(data_stream)
    header = consume_header(reader)
    sensor_idx = header.index(SENSOR_ID)
    seen_sensor_ids: set[str] = set()

    with connect_postgresql() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM public.sensormeta WHERE project = %s",
                (full_project,),
            )
            with cur.copy(
                f"COPY public.sensormeta (project, {",".join(header)}) FROM STDIN"
            ) as db_copy:
                for row_number, row in enumerate(reader, start=2):
                    if len(row) == 0 or all(cell == "" for cell in row):
                        continue
                    if len(row) != len(header):
                        json_abort(422, "row column count mismatch", row=row_number)
                    sensor_id = row[sensor_idx].strip()
                    if not sensor_id:
                        json_abort(422, "sensor_id can not be empty", row=row_number)
                    if sensor_id in seen_sensor_ids:
                        json_abort(422, "duplicate sensor_id", sensor_id=sensor_id)
                    seen_sensor_ids.add(sensor_id)
                    normalized_row = [value if value != "" else None for value in row]
                    db_copy.write_row([full_project] + normalized_row)
            conn.commit()

    refresh_clickhouse_view()

    return jsonify({})


def process_download(full_project: str) -> Response:
    # all columns except project
    all_columns = [SENSOR_ID] + OPTIONAL_COLUMNS
    output = StringIO()
    writer = csv.writer(output)
    # write header
    writer.writerow(all_columns)
    with connect_postgresql() as conn:
        with conn.cursor() as cur:
            with cur.copy(
                f"COPY (SELECT {",".join(all_columns)} FROM public.sensormeta WHERE project = %s ORDER BY {SENSOR_ID}) TO STDOUT",
                (full_project,),
            ) as copy:
                for row in copy.rows():
                    writer.writerow(row)
    response = Response(output.getvalue())
    response.headers["Content-Disposition"] = (
        f"attachment; filename=metadata-{full_project}.csv"
    )
    response.headers["Content-type"] = "text/csv"
    return response


def consume_header(reader: Iterator[list[str]]) -> list[str]:
    try:
        header_raw = next(reader)
    except StopIteration:
        json_abort(400, "missing CSV header")
    return validate_header(header_raw)


def validate_header(header_raw: list[str]) -> list[str]:
    header = [h.strip() for h in header_raw]
    if SENSOR_ID not in header:
        json_abort(422, "sensor_id column is required")
    unknown_headers = sorted(set(header) - set(OPTIONAL_COLUMNS + [SENSOR_ID]))
    if unknown_headers:
        json_abort(422, "unknown columns", columns=unknown_headers)
    return header


def new_csv_reader(text_stream: TextIO) -> Iterator[list[str]]:
    first_line = consume_nonempty_line(text_stream)
    if first_line is None:
        json_abort(400, "empty CSV payload")
    delimiter = detect_delimiter(first_line)
    if not delimiter:
        json_abort(415, "unrecognized CSV format")
    return csv.reader(itertools.chain([first_line], text_stream), delimiter=delimiter)


def detect_delimiter(first_line: str) -> str | None:
    for candidate in [",", ";", "\t"]:
        if candidate in first_line:
            return candidate
    return None


def consume_nonempty_line(text_stream: TextIO) -> str | None:
    first_data_line = None
    for line in text_stream:
        if line.strip() == "":
            continue
        first_data_line = line
        break
    return first_data_line


@app.cli.command("ensure-table")
def ensure_table():
    while True:
        try:
            with connect_postgresql() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "select column_name from information_schema.columns where table_name = 'sensormeta' and table_schema = 'public'"
                    )
                    columns = [c[0] for c in cur.fetchall()]
                    if len(columns) == 0:
                        # only create the required columns
                        cur.execute(
                            "CREATE TABLE public.sensormeta (sensor_id TEXT NOT NULL, project TEXT NOT NULL, CONSTRAINT pk PRIMARY KEY (sensor_id, project))"
                        )
                        logging.info("creating table public.sensormeta")
                    # create optional columns
                    for column in OPTIONAL_COLUMNS:
                        if column in columns:
                            continue
                        logging.info("creating column %s", column)
                        cur.execute(
                            f"ALTER TABLE public.sensormeta ADD COLUMN {column} TEXT"
                        )
                    # ensure readonly user can SELECT the table
                    cur.execute(
                        "GRANT SELECT ON public.sensormeta TO sensormeta_reader"
                    )
                    conn.commit()
            return
        except psycopg.Error as e:
            logging.info("postgres command failed: %s", e)
            pass


@app.cli.command("refresh-view")
def refresh_view():
    refresh_clickhouse_view()


if __name__ == "__main__":
    logging.info("starting server")

    serve(app, host="0.0.0.0", port=8091)
