from cachetools import cached, TTLCache
from celery.schedules import crontab
from datetime import timedelta
from email.utils import formataddr
from flask_appbuilder import expose
from flask_appbuilder.security.manager import AUTH_OAUTH
from flask_appbuilder.security.views import AuthOAuthView
from flask_babel import lazy_gettext as _
from flask_jwt_extended import verify_jwt_in_request
from sqlalchemy import event, or_, and_, not_, exists
from sqlalchemy.orm import Session
from superset.commands.exceptions import ForbiddenError
from superset.errors import ErrorLevel, SupersetError, SupersetErrorType
from superset.exceptions import SupersetSecurityException
from superset.extensions import cache_manager
from superset.extensions import db
from superset.security import SupersetSecurityManager
from superset.security.manager import query_context_modified
from superset.tasks.types import ExecutorType, FixedExecutor
from superset.utils.log import StdOutEventLogger
from superset.utils.machine_auth import MachineAuthProvider
from superset.utils.urls import headless_url
import threading

FEATURE_FLAGS = {
  # used in govhub and nice in Superset directly
  "THUMBNAILS": True,

  # use Playwright for thumbnail generation for better results
  "PLAYWRIGHT_REPORTS_AND_THUMBNAILS": True,

  # generate PDFs on server
  "ENABLE_DASHBOARD_SCREENSHOT_ENDPOINTS": True,
  "ENABLE_DASHBOARD_DOWNLOAD_WEBDRIVER_SCREENSHOT": True,

  # more flexibility in "custom columns"
  "ALLOW_ADHOC_SUBQUERY": True,

  # tag dashboards and charts
  "TAGGING_SYSTEM": True,

  # email if SQL condition is reached / by schedule
  "ALERT_REPORTS": True,
}

# for govhub / citizenhub iframes
ENABLE_CORS = True
CORS_OPTIONS = {
  "origins": [f"https://{os.environ['UGH_FE_HOSTNAME']}"],
  "supports_credentials": True,
}

with open("/app/superset/templates/head_custom_extra.html") as f:
    from hashlib import sha256
    from base64 import b64encode
    import re
    inline_sha256 = b64encode(sha256(
        re.search(r'<script[^>]*>(.*?)</script>', f.read(), re.DOTALL).group(1).encode()
        ).digest()).decode()

TALISMAN_CONFIG = {
    "content_security_policy": {
        "base-uri": ["'self'"],
        "default-src": ["'self'"],
        "img-src": [
            "'self'",
            "blob:",
            "data:",
            "ows.terrestris.de",
        ],
        "worker-src": ["'self'", "blob:"],
        "connect-src": [
            "'self'",
            "https://api.mapbox.com",
            "https://events.mapbox.com",
        ],
        "object-src": "'none'",
        "style-src": [
            "'self'",
            "'unsafe-inline'",
        ],
        "script-src": ["'self'", "'strict-dynamic'",
                       f"'sha256-{inline_sha256}'"],
        "frame-ancestors": ["'self'", f"https://{os.environ['UGH_FE_HOSTNAME']}", f"https://{os.environ['CITIZENHUB_HOSTNAME']}"],
    },
    "content_security_policy_nonce_in": ["script-src"],
    "force_https": False,
    "session_cookie_secure": False,
    "frame_options": None,
}

WTF_CSRF_TIME_LIMIT = None

# allow Referer from GovHub
WTF_CSRF_SSL_STRICT = False

MAPBOX_API_KEY = os.environ["MAPBOX_API_KEY"]

# is required because TLS is terminated in the ingress controller, can also fix the client IP visible from Superset
# https://github.com/apache/superset/blob/27dde2a811a809bf570b54c085e541e176e01200/superset/config.py#L276-L279
# https://werkzeug.palletsprojects.com/en/3.0.x/middleware/proxy_fix/#werkzeug.middleware.proxy_fix.ProxyFix
ENABLE_PROXY_FIX = True
PROXY_FIX_CONFIG = {}

AUTH_TYPE = AUTH_OAUTH

AUTH_USER_REGISTRATION = True
AUTH_USER_REGISTRATION_ROLE = "User"
AUTH_ROLES_SYNC_AT_LOGIN = True

OAUTH_PROVIDERS = [ {
        "name": "keycloak",
        "icon": "fa-key",
        "token_key": "access_token",
        "remote_app": {
            "api_base_url": f"{os.environ['KEYCLOAK_REALM_URL']}/protocol/openid-connect",
            "server_metadata_url": f"{os.environ['KEYCLOAK_REALM_URL']}/.well-known/openid-configuration",
            "client_id": "superset",
            "client_secret": os.environ["CLIENT_SECRET"],
            "client_kwargs": { "scope": "openid" },
            "request_token_url": None,
        },
    } ]
PERMANENT_SESSION_LIFETIME = 36000 # 10h = one work day

def random_secret():
    import secrets
    import string
    return ''.join(secrets.choice(string.ascii_letters + string.digits + string.punctuation) for _ in range(64))

# both unused but potentially abusable
GUEST_TOKEN_JWT_SECRET = random_secret()
GLOBAL_ASYNC_QUERIES_JWT_SECRET = random_secret()

class UdpOAuthView(AuthOAuthView):
    @expose("/login/")
    @expose("/login/<provider>")
    def login(self, provider = "keycloak"):
        "skip login provider screen"
        return super().login(provider)

    @expose("/oauth-authorized/<provider>")
    def oauth_authorized(self, provider):
        try:
            return super().oauth_authorized(provider)
        finally:
            from flask import g, session
            from flask_login import AnonymousUserMixin
            if g and "user" in g and not isinstance(g.user, AnonymousUserMixin):
                cache_manager.cache.set(
                        oauth_token_cache_key(g.user.username),
                        session['oauth'][0],
                        timeout=PERMANENT_SESSION_LIFETIME
                    )

def make_auth_data_cache():
    return TTLCache(maxsize=10000, ttl=int(os.environ["AUTH_DATA_TTL"]))

@cached(cache=make_auth_data_cache())
def retrieve_auth_data_cached(token):
    """
    Retrieve the dashboard slugs for which the user is a dashboard owner
    as well as the projects and the buckets they can read from ClickHouse
    from the userinfo endpoint.
    Results are cached up to 60 seconds.
    """
    import requests
    from flask_login import logout_user
    r = requests.get(f"{os.environ['KEYCLOAK_REALM_URL']}/protocol/openid-connect/userinfo",
                     headers=dict(Authorization=f"Bearer {token}"))
    if r.ok:
        return r.json()
    else:
        logout_user() # trigger new login on error
        return None

def retrieve_auth_data(username=None):
    from flask import g
    if (u := username or (hasattr(g.user, "username") and g.user.username)):
        if oauth_token := cache_manager.cache.get(oauth_token_cache_key(u)):
            return retrieve_auth_data_cached(oauth_token)
        else:
            from flask_login import logout_user
            logout_user() # we have a user but somehow lack the access token from Redis, trigger new login by loggging out

    return None

@cached(cache=make_auth_data_cache())
def retrieve_vizgroup_projects(tenant, vizgroup):
    """
    Retrieve the projects that dashboards in a viz-group can read from.
    Results are cached up to 60 seconds.
    """
    import requests
    from requests.auth import HTTPBasicAuth
    token = requests.post(f"{os.environ['KEYCLOAK_REALM_URL']}/protocol/openid-connect/token",
                          "grant_type=client_credentials",
                          auth=HTTPBasicAuth("superset", os.environ["CLIENT_SECRET"]),
                          headers={"content-type": "application/x-www-form-urlencoded"}).json()["access_token"]
    r = requests.get(f"{os.environ['KEYCLOAK_REALM_URL']}/data-hub/_viz-group-projects/{tenant}/{vizgroup}",
                     headers=dict(Authorization=f"Bearer {token}"))
    if r.ok:
        return r.json()
    else:
        return None

def platform_dashboard_owner(slug):
    if auth_data := retrieve_auth_data():
        return slug in auth_data["owner_dashboards"]
    else:
        return False

def platform_dashboard_access(slug):
    if auth_data := retrieve_auth_data():
        return slug in auth_data["access_dashboards"]
    else:
        return False

def allowed_databases():
    database_names = ["clickhouse"]

    if hasattr(vizgroup_projects, "projects"):
        database_names.extend(vizgroup_projects.projects["buckets"])
    elif auth_data := retrieve_auth_data():
        database_names.extend(auth_data["buckets"])

    return database_names

def platform_database_access(name):
    return name in allowed_databases()

def platform_projects_setting(username):
    if auth_data := retrieve_auth_data(username):
        return " ".join(auth_data["projects"])
    else:
        return ""

def oauth_token_cache_key(username):
    return f"platform_oauth_token_{username}"

class UdpSecurityManager(SupersetSecurityManager):
    authoauthview = UdpOAuthView

    # ❤️ https://github.com/apache/superset/issues/24837#issuecomment-2501991590
    def is_item_public(self, permission_name, view_name):
        verify_jwt_in_request(optional=True)
        return super().is_item_public(permission_name, view_name)

    def sync_role_definitions(self):
        super().sync_role_definitions()
        self.add_role("Public").permissions = common_permissions = [
            self.find_permission_view_menu("menu_access", "Dashboards"),
            self.find_permission_view_menu("can_read", "Dashboard"),
            self.find_permission_view_menu("can_read", "Chart"),
            self.find_permission_view_menu("can_dashboard", "Superset"),
            self.find_permission_view_menu("can_dashboard_permalink", "Superset"),
            self.find_permission_view_menu("can_read", "DashboardPermalinkRestApi"),
            self.find_permission_view_menu("can_explore_json", "Superset"),
        ]
        self.add_role("User").permissions = common_permissions + [
            self.find_permission_view_menu("menu_access", "Charts"),
            self.find_permission_view_menu("menu_access", "Datasets"),
            self.find_permission_view_menu("menu_access", "SQL Lab"),
            self.find_permission_view_menu("menu_access", "SQL Editor"),
            self.find_permission_view_menu("menu_access", "Manage"),
            self.find_permission_view_menu("menu_access", "Alerts & Report"),
            self.find_permission_view_menu("can_explore", "Superset"),
            self.find_permission_view_menu("can_csv", "Superset"),
            self.find_permission_view_menu("can_slice", "Superset"),
            self.find_permission_view_menu("can_write", "Dashboard"),
            self.find_permission_view_menu("can_tag", "Dashboard"),
            self.find_permission_view_menu("can_cache_dashboard_screenshot", "Dashboard"),
            self.find_permission_view_menu("can_read", "Tag"),
            self.find_permission_view_menu("can_write", "Chart"),
            self.find_permission_view_menu("can_tag", "Chart"),
            self.find_permission_view_menu("can_read", "Explore"),
            self.find_permission_view_menu("can_read", "Dataset"),
            self.find_permission_view_menu("can_get_results", "SQLLab"),
            self.find_permission_view_menu("can_read", "SQLLab"),
            self.find_permission_view_menu("can_read", "Database"),
            self.find_permission_view_menu("can_read", "ReportSchedule"),
            self.find_permission_view_menu("can_write", "ReportSchedule"),
            self.find_permission_view_menu("can_execute_sql_query", "SQLLab"),
            self.find_permission_view_menu("can_export_csv", "SQLLab"),
            self.find_permission_view_menu("can_sqllab_history", "Superset"),
            self.find_permission_view_menu("can_userinfo", "UserOAuthModelView"),
            self.find_permission_view_menu("can_time_range", "Api"),
            self.find_permission_view_menu("can_fetch_datasource_metadata", "Superset"),
            self.find_permission_view_menu("can_get_column_values", "Datasource"),
            self.find_permission_view_menu("can_samples", "Datasource"),
            self.find_permission_view_menu("can_recent_activity", "Log"),
        ]

    def raise_for_ownership(self, resource):
        from superset.models.dashboard import Dashboard
        if isinstance(resource, Dashboard) and platform_dashboard_owner(resource.slug):
            pass
        else:
            super().raise_for_ownership(resource)

    def raise_for_access(
        self = None,
        dashboard = None,
        chart = None,
        database = None,
        datasource = None,
        query = None,
        query_context = None,
        table = None,
        viz = None,
        sql = None,
        catalog = None,
        schema = None,
    ):
        if dashboard:
            if self.is_admin() or dashboard.published or platform_dashboard_access(dashboard.slug):
                pass
            else:
                raise SupersetSecurityException(
                    self.get_dashboard_access_error_object(dashboard)
                )
        if database:
            if self.is_admin() or platform_database_access(database.database_name):
                pass
            else:
                raise SupersetSecurityException(SupersetError(
                        error_type=SupersetErrorType.TABLE_SECURITY_ACCESS_ERROR,
                        message="Database access denied",
                        level=ErrorLevel.WARNING))
        if query_context:
            if (ds := query_context.datasource):
                self.raise_for_access(datasource=ds)
            else:
                raise SupersetSecurityException(ForbiddenError())
        if query:
            if (db := query.database):
                self.raise_for_access(database=db)
            else:
                raise SupersetSecurityException(ForbiddenError())
        if datasource:
            if (db := datasource.database):
                self.raise_for_access(database=db)
            else:
                raise SupersetSecurityException(
                    self.get_datasource_access_error_object(datasource)
                )
        if viz:
            if (ds := viz.datasource):
                self.raise_for_access(datasource=ds)
            else:
                raise SupersetSecurityException(ForbiddenError())

        # everything not explicitly handled above (including combinations) should apply all normal restrictions
        if any([
                chart,
                sql,
                catalog,
                schema,
                ]) or (table and not viz):
            super().raise_for_access(
                    dashboard=dashboard,
                    chart=chart,
                    database=database,
                    datasource=datasource,
                    query=query,
                    query_context=query_context,
                    table=table,
                    viz=viz,
                    sql=sql,
                    catalog=catalog,
                    schema=schema,
                    )

    def get_oauth_user_info(self, provider, resp):
        info = super().get_oauth_user_info(provider, resp)
        info["username"] = self.appbuilder.sm.oauth_remotes[provider].get("openid-connect/userinfo").json()["sub"]
        return info

    def auth_user_oauth(self, userinfo):
        user = super().auth_user_oauth(userinfo)
        if user:
            user.first_name = userinfo["first_name"]
            user.last_name = userinfo["last_name"]
            user.email = userinfo["email"]
            self.update_user(user)
        return user

vizgroup_projects = threading.local()

def mutate_app(_app):
    # restrict dashboard access
    from superset.dashboards.filters import DashboardAccessFilter
    def filter_dashboards(_self, query, _value):
        if security_manager.is_admin():
            return query
        elif auth_data := retrieve_auth_data():
            return query.filter(or_(
                Dashboard.published,
                Dashboard.slug.in_(auth_data["access_dashboards"])
            ))
        else:
            return query.filter(
                Dashboard.published
            )
    DashboardAccessFilter.apply = filter_dashboards

    # control database access
    from superset.databases.filters import DatabaseFilter
    def filter_databases(self, query, _value):
        if security_manager.is_admin():
            return query

        return query.filter(self.model.database_name.in_(allowed_databases()))
    DatabaseFilter.apply = filter_databases

    # control dataset access
    from superset.views.base import DatasourceFilter
    def filter_datasets(self, query, _value):
        from superset.connectors.sqla import models

        if security_manager.is_admin():
            return query

        return query.join(
            models.Database,
            models.Database.id == self.model.database_id,
        ).filter(and_(
            models.Database.database_name.in_(allowed_databases()),
            not_(self.model.table_name.startswith("."))
            ))
    DatasourceFilter.apply = filter_datasets

    # control chart access
    from superset.charts.filters import ChartFilter
    def filter_charts(self, query, _value):
        from sqlalchemy.orm import aliased
        from superset.connectors.sqla import models
        from superset.connectors.sqla.models import SqlaTable

        if security_manager.is_admin():
            return query

        table_alias = aliased(SqlaTable)
        query = query.join(table_alias, self.model.datasource_id == table_alias.id)
        query = query.join(models.Database, table_alias.database_id == models.Database.id)
        return query.filter(models.Database.database_name.in_(allowed_databases()))
    ChartFilter.apply = filter_charts

    # prevent use of the dashboard owner attribute
    # write permissions are only granted by the platform
    from superset.models.dashboard import Dashboard
    def remove_all_owners(session, _flush_context, _instances):
        for x in list(session.new) + list(session.dirty):
            if isinstance(x, Dashboard):
                x.owners = []
    event.listen(Session, 'before_flush', remove_all_owners)

    # deny direct dashboard creation/deletion by users
    from superset import security_manager
    from flask import g
    def deny_dashboard_creation(session, _flush_context, _instances):
        invalidate_cache = False
        for x in list(session.new) + list(session.deleted):
            if isinstance(x, Dashboard):
                invalidate_cache = True
                if "user" in g and not security_manager.is_admin():
                    raise SupersetSecurityException(
                        SupersetError(
                            error_type=SupersetErrorType.DASHBOARD_SECURITY_ACCESS_ERROR,
                            message=_("User cannot create/delete dashboard directly"),
                            level=ErrorLevel.WARNING,
                        )
                    )
        if invalidate_cache:
            retrieve_auth_data_cached.cache.clear()
    event.listen(Session, 'before_flush', deny_dashboard_creation)

    def deny_slug_modification(session, _flush_context, _instances):
        "Prevent slug modification."
        for x in list(session.dirty):
            if isinstance(x, Dashboard):
                if Dashboard.slug.get_history(x).has_changes() and "user" in g and not security_manager.is_admin():
                    raise SupersetSecurityException(
                        SupersetError(
                            error_type=SupersetErrorType.DASHBOARD_SECURITY_ACCESS_ERROR,
                            message=_("Slug cannot be changed"),
                            level=ErrorLevel.WARNING,
                        )
                    )
    event.listen(Session, 'before_flush', deny_slug_modification)

    from marshmallow import post_dump
    from superset.dashboards.schemas import DashboardGetResponseSchema
    from superset.dashboards.api import DashboardRestApi
    class DashboardGetResponseSchemaWithOwner(DashboardGetResponseSchema):
        @post_dump
        def add_extra_data(self, data, **kwargs):
            """Add owner ID to response so that superset-frontend offers editing options."""
            from flask import g
            if platform_dashboard_owner(data["slug"]):
                data["owners"] = [{"id": g.user.id}]
            return data
    DashboardRestApi.dashboard_get_response_schema = DashboardGetResponseSchemaWithOwner()

    # use viz-group permissions for charts and filters in dashboards
    from superset.commands.chart.data.get_data_command import ChartDataCommand
    from superset.common.query_context import QueryContext
    from superset.models.slice import Slice
    old_validate = ChartDataCommand.validate
    def validate(self):
        try:
            from superset.models.dashboard import Dashboard, dashboard_slices
            if ((query_context := self._query_context) and
                (datasource_id := query_context.datasource.id) and
                isinstance(datasource_id, int) and
                (form_data := query_context.form_data) and
                (dashboard_id := form_data.get("dashboardId")) and
                isinstance(dashboard_id, int) and
                db.session.query(
                    # the given dashboard has a slice which uses the given datasource
                    exists().where(
                        dashboard_slices.c.dashboard_id == dashboard_id,
                        Slice.id == dashboard_slices.c.slice_id,
                        Slice.datasource_id == datasource_id
                    )
                ).scalar() and
                (dashboard := db.session.query(Dashboard).get(dashboard_id)) and
                (slug := dashboard.slug) and
                (slug_parts := slug.split("_")) and
                len(slug_parts) == 3):
                    security_manager.raise_for_access(dashboard=dashboard)

                    [tenant, vizgroup, _dashboard] = slug_parts
                    self._vizgroup_projects = retrieve_vizgroup_projects(tenant, vizgroup)
                    vizgroup_projects.projects = self._vizgroup_projects
            return old_validate(self)
        finally:
            if hasattr(vizgroup_projects, "projects"):
                del vizgroup_projects.projects
    ChartDataCommand.validate = validate

    # legacy charts use different API, same as above
    from superset.views.core import Superset
    old_generate_json = Superset.generate_json
    def generate_json(self, viz, response_type = None):
        try:
            from superset.models.dashboard import Dashboard, dashboard_slices
            from superset.viz import BaseViz
            if (viz and
                isinstance(viz, BaseViz) and
                (form_data := viz.form_data) and
                (dashboard_id := form_data.get("dashboardId")) and
                isinstance(dashboard_id, int) and
                (slice_id := form_data.get("slice_id")) and
                isinstance(slice_id, int) and
                db.session.query(dashboard_slices).filter_by(dashboard_id=dashboard_id, slice_id=slice_id).first() and
                (dashboard := db.session.query(Dashboard).get(dashboard_id)) and
                (slice_ := db.session.query(Slice).get(slice_id)) and
                (slug := dashboard.slug) and
                (slug_parts := slug.split("_")) and
                len(slug_parts) == 3):
                    security_manager.raise_for_access(dashboard=dashboard)

                    [tenant, vizgroup, _dashboard] = slug_parts
                    self._vizgroup_projects = retrieve_vizgroup_projects(tenant, vizgroup)
                    vizgroup_projects.projects = self._vizgroup_projects
            return old_generate_json(self, viz, response_type)
        finally:
            if hasattr(vizgroup_projects, "projects"):
                del vizgroup_projects.projects
    Superset.generate_json = generate_json

    # wrapped by Superset.generate_json which sets context
    from superset.charts.data.api import ChartDataRestApi
    old_get_data_response = ChartDataRestApi._get_data_response
    def _get_data_response(
        self,
        command,
        force_cached = False,
        form_data = None,
        datasource = None,
    ):
        try:
            if hasattr(command, "_vizgroup_projects"):
                vizgroup_projects.projects = command._vizgroup_projects
            return old_get_data_response(self, command, force_cached, form_data, datasource)
        finally:
            if hasattr(vizgroup_projects, "projects"):
                del vizgroup_projects.projects
    ChartDataRestApi._get_data_response = _get_data_response

    # dashboard creation is done in govhub in the platform
    from superset.views.dashboard.views import Dashboard as DashboardView
    @expose("/new/")
    def redirectForNewDashboard(_self):
        """Redirects to GovHub instead of handling dashboard creation in Superset"""
        from flask import redirect
        return redirect(f"https://{os.environ['UGH_FE_HOSTNAME']}/dashboards")
    DashboardView.new = redirectForNewDashboard

FLASK_APP_MUTATOR = mutate_app

CUSTOM_SECURITY_MANAGER = UdpSecurityManager

# deny direct listing of users
EXTRA_RELATED_QUERY_FILTERS = {
  "user": lambda q: q.filter(False)
}

BABEL_DEFAULT_LOCALE = 'de'

# utility function to log in Playwright browser for thumbnail generation
def auth(browser_context, user):
    page = browser_context.new_page()
    page.goto(headless_url("/health"))
    browser_context.clear_cookies()
    browser_context.add_cookies(
        [
            {
                "name": cookie_name,
                "value": cookie_val,
                "domain": os.environ["SUPERSET_HOST"],
                "path": "/",
                "sameSite": "Lax",
                "httpOnly": True,
            }
            for cookie_name, cookie_val in MachineAuthProvider.get_auth_cookies(user).items()
        ]
    )
    page.close()
    return browser_context

WEBDRIVER_AUTH_FUNC = auth
WEBDRIVER_BASEURL = f"http://{os.environ['SUPERSET_HOST']}/"
THUMBNAIL_CACHE_CONFIG = {
      **CACHE_CONFIG,
      'CACHE_DEFAULT_TIMEOUT': 7*24*60*60,
      'CACHE_KEY_PREFIX': 'thumbnail_',
}

THUMBNAIL_EXECUTORS = [
    ExecutorType.CURRENT_USER,
    FixedExecutor("anonymous_screenshotter"),
]

# Don't cache queries for now, if this is re-enabled later make sure to include SQL_projects (or a hash thereof) in the key
DATA_CACHE_CONFIG = {"CACHE_TYPE": "NullCache"}

# set SQL_projects and related settings for sensor_messages DB only
def DB_CONNECTION_MUTATOR(uri, params, username, *_args):
    if uri.username == "queryonly":
        if hasattr(vizgroup_projects, "projects"):
            projects = " ".join(vizgroup_projects.projects["clickhouse"])
        elif username:
            projects = platform_projects_setting(username)
        else:
            projects = ""

        params["connect_args"] = {"ch_SQL_projects": projects,
                                  "output_format_write_statistics": "0",
                                  "readonly": "1"}
    else:
        pass # bucket database, restricted via ClickHouse user
    return uri, params

# results should not be cached because of RLS
# they are not cached because the queries are not executed asynchronously as per https://superset.apache.org/docs/configuration/cache/#sql-lab-query-results
# this ensures we don't accidentally start caching if we ever enable asynchronous queries
RESULTS_BACKEND = None

# hide version info in menu
VERSION_STRING = ""
VERSION_SHA = ""

EVENT_LOGGER = StdOutEventLogger()
SUPERSET_LOG_VIEW = False

# for alerts + reports
SMTP_HOST = os.environ["SMTP_HOST"]
SMTP_PORT = int(os.environ["SMTP_PORT"])
SMTP_STARTTLS = False
SMTP_SSL = os.environ["SMTP_SSL"] != "false"
SMTP_USER = os.environ["SMTP_USER"]
SMTP_PASSWORD = os.environ["SMTP_PASSWORD"]
SMTP_MAIL_FROM = formataddr((os.environ["SMTP_MAIL_FROM_DISPLAY_NAME"], os.environ["SMTP_MAIL_FROM"]))
SMTP_SSL_SERVER_AUTH = os.environ["SMTP_AUTH"] != "false"
EMAIL_REPORTS_CTA = "Ansehen im Urban Stack"
WEBDRIVER_BASEURL_USER_FRIENDLY = f"https://{os.environ['SUPERSET_HOST_EXTERNAL']}/"

# for alerts + reports
CELERY_CONFIG.imports += ("superset.tasks.scheduler",)
CELERY_CONFIG.beat_schedule = {
        "reports.scheduler": {
            "task": "reports.scheduler",
            "schedule": crontab(minute="*", hour="*"),
            "options": {"expires": int(timedelta(weeks=1).total_seconds())},
        },
        "reports.prune_log": {
            "task": "reports.prune_log",
            "schedule": crontab(minute=0, hour=4),
        },
    }

ALERT_REPORTS_DEFAULT_RETENTION = 30
ALERT_REPORTS_DEFAULT_CRON_VALUE = "0 6 * * *"
