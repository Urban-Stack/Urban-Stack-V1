#!/usr/bin/env bash

pod=$(kubectl get po | cut -f 1 -d ' ' | grep -E 'discourse' | grep -v 'redis')
pnpm run build &&
kubectl cp -n udh ./dist/**.js "$pod":/opt/bitnami/discourse/public/assets/