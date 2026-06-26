#!/usr/bin/env bash
# generate_sensors_csv.sh
# Usage: ./generateSensormeta.sh <size_in_mb> <output.csv>

target_mb=${1:-30}
outfile=${2:-sensors.csv}
target_bytes=$((target_mb * 1024 * 1024))

echo "sensor_id,external_reference,location_description,location_name,sensor_type" >"$outfile"

id=0

# Each quoted field is roughly 250 chars long (within your 256-char limit)
long_desc="Hamsterrad $(printf 'X%.0s' {1..240})"
long_name="HAMRAD $(printf 'Y%.0s' {1..240})"
long_type="Thermometer $(printf 'Z%.0s' {1..240})"

line_template="42,\"$long_desc\",\"$long_name\",\"$long_type\""

# simple progress bar vars
bar_width=50
last_printed=0

while [ "$(stat -c%s "$outfile")" -lt "$target_bytes" ]; do
  echo "${id},${line_template}" >>"$outfile"
  ((id++))

  # simple progress bar (update every 1% to keep it fast)
  current_bytes=$(stat -c%s "$outfile")
  percent=$((current_bytes * 100 / target_bytes))
  if ((percent > last_printed)); then
    last_printed=$percent
    filled=$((percent * bar_width / 100))
    printf "\r[%-*s] %3d%%" "$bar_width" "$(printf '#%.0s' $(seq 1 $filled))" "$percent"
  fi
done

echo
echo "✅ Done: wrote $(stat -c%s "$outfile") bytes (~$(($(stat -c%s "$outfile") / 1024 / 1024)) MB)"
