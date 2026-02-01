#!/bin/bash
set -e

echo "============================================"
echo "Starting Vitality Application"
echo "============================================"
echo "PORT: $PORT"
echo "Working Directory: $(pwd)"
echo "JAR file exists: $(ls -lh build/libs/*.war)"
echo "============================================"

exec java \
  -Dserver.port=${PORT:-9090} \
  -Xmx512m \
  -XX:+UseContainerSupport \
  -Djava.security.egd=file:/dev/./urandom \
  -jar build/libs/Vitality-0.0.1-SNAPSHOT.war
