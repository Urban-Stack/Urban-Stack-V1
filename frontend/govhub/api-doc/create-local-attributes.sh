#!/usr/bin/env bash

TOKEN=""

tenants=(detmold guetersloh)
for tenant in "${tenants[@]}"; do
  echo $tenant
  curl -X PUT --insecure "https://login.data-hub.local/realms/udh/data-hub/tenants/$tenant" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: text/plain" \

  echo "PUT request sent for $tenant with value ${attributes_dt[$tenant]}"
done

TENANT_IMAGE_GT="https://www.guetersloh.de/de-wAssets/img/stadtansichten-und-akteure/weblication/wThumbnails/Adenauerplatz_046-070a0a52-6e4e3d30@2000w.jpg"
TENANT_COORDS_GT="51.9087:8.381:13"

TENANT_IMAGE_DT="https://serviceportal-detmold.de/documents/33528/0/d1.jpg"
TENANT_COORDS_DT="51.9355:8.8795:13"
if [ -z "$TOKEN" ]; then
  echo "Error: TOKEN must be set. Please provide a valid authentication token."
  exit 1
fi


declare -A attributes_gt=(
  ["tenant-image"]="$TENANT_IMAGE_GT"
  ["tenant-coords"]="$TENANT_COORDS_GT"
  ["logo-path"]="/Logo.svg"
  ["color-primary-900"]="215.5 100% 34.5%"
  ["color-primary-800"]="231, 40%, 40%"
  ["color-primary-700"]="232, 31%, 47%"
  ["color-primary-600"]="231, 27%, 54%"
  ["color-primary-500"]="231, 27%, 60%"
  ["color-primary-400"]="232, 27%, 67%"
  ["color-primary-300"]="232, 26%, 73%"
  ["color-primary-200"]="233, 27%, 80%"
  ["color-primary-100"]="230, 26%, 87%"
  ["color-primary-50"]="233, 27%, 94%"
)

BASE_URL_GT="https://login.data-hub.local/realms/udh/data-hub/tenants/guetersloh/attributes"
for key in "${!attributes_gt[@]}"; do
  curl -X PUT --insecure "$BASE_URL_GT/$key" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: text/plain" \
    -d "${attributes_gt[$key]}"

  echo "PUT request sent for $key with value ${attributes_gt[$key]}"
done

declare -A attributes_dt=(
  ["tenant-image"]="$TENANT_IMAGE_DT"
  ["tenant-coords"]="$TENANT_COORDS_DT"
  ["logo-path"]="/logo-dt-white.svg"
  ["color-primary-900"]="130, 62%, 29%"
  ["color-primary-800"]="130, 45%, 36%"
  ["color-primary-700"]="131, 34%, 43%"
  ["color-primary-600"]="130, 26%, 50%"
  ["color-primary-500"]="130, 25%, 57%"
  ["color-primary-400"]="130, 26%, 65%"
  ["color-primary-300"]="131, 26%, 72%"
  ["color-primary-200"]="131, 26%, 79%"
  ["color-primary-100"]="130, 25%, 86%"
  ["color-primary-50"]="132, 28%, 93%"
)

BASE_URL_DT="https://login.data-hub.local/realms/udh/data-hub/tenants/detmold/attributes"
for key in "${!attributes_dt[@]}"; do
  curl -X PUT --insecure "$BASE_URL_DT/$key" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: text/plain" \
    -d "${attributes_dt[$key]}"

  echo "PUT request sent for $key with value ${attributes_dt[$key]}"
done