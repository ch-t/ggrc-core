#!/usr/bin/env bash

APPENGINE_INSTANCE=some-project
SETTINGS_MODULE="app_engine ggrc_basic_permissions.settings.development ggrc_risks.settings.development ggrc_risk_assessments.settings.development ggrc_workflows.settings.development ggrc_gdrive_integration.settings.development"
DATABASE_URI='mysql+mysqldb://db-user@/db_name?unix_socket=/cloudsql/some-project:db-server-id&charset=utf8'
SECRET_KEY='Something-secret'
GOOGLE_ANALYTICS_ID=""
GOOGLE_ANALYTICS_DOMAIN=""
GAPI_KEY='<Google Browser Key>'
GAPI_CLIENT_ID='<Google OAuth Client ID>'
GAPI_CLIENT_SECRET='<Google OAuth Client Secret>'
GAPI_ADMIN_GROUP='<Google Group Email Address>'
BOOTSTRAP_ADMIN_USERS='user@example.com'
MIGRATOR='Default Migrator <migrator@example.com>'
RISK_ASSESSMENT_URL='#'
CUSTOM_URL_ROOT=''
ABOUT_URL='#'
ABOUT_TEXT='About GGRC'
EXTERNAL_HELP_URL='#set_GGRC_EXTERNAL_HELP_URL_env_var'
INSTANCE_CLASS='B4'
MAX_INSTANCES='4'
SCALING=$(printf "manual_scaling:\n  instances: ${MAX_INSTANCES}\n")
STATIC_SERVING=""
GGRC_Q_INTEGRATION_URL=""
DASHBOARD_INTEGRATION=""
ALLOWED_QUERYAPI_APP_IDS=""
APPENGINE_EMAIL=""
AUTHORIZED_DOMAINS=""
