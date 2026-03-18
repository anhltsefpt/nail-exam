#!/bin/bash
set -e

# ─────────────────────────────────────────────────
# OTA Hot Update: Build, Upload, and Record
# ─────────────────────────────────────────────────
# Builds iOS + Android JS bundles, uploads to
# Supabase Storage ("Update" bucket), and inserts
# a row into the `update` table.
# ─────────────────────────────────────────────────

# Load env vars (for SUPABASE_URL etc.)
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

SUPABASE_URL="${EXPO_PUBLIC_SUPABASE_URL}"

# Secret key must be exported in terminal: export SUPABASE_SECRET_KEY=sb_secret_...
if [ -z "$SUPABASE_SECRET_KEY" ]; then
  read -s -p "🔑 Enter Supabase Secret Key: " SUPABASE_SECRET_KEY
  echo ""
fi
SUPABASE_KEY="${SUPABASE_SECRET_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "❌ Missing EXPO_PUBLIC_SUPABASE_URL in .env or SUPABASE_SECRET_KEY not exported"
  exit 1
fi

# Get current version from app.json
CURRENT_VERSION=$(grep '"version"' app.json | head -1 | sed 's/.*"version": *"\([^"]*\)".*/\1/')
echo "📦 Current app version: $CURRENT_VERSION"

# Prompt for versions
read -p "From version (users on this version will get the update) [$CURRENT_VERSION]: " FROM_VERSION
FROM_VERSION="${FROM_VERSION:-$CURRENT_VERSION}"

read -p "To version (label for this update) [$CURRENT_VERSION]: " TO_VERSION
TO_VERSION="${TO_VERSION:-$CURRENT_VERSION}"

echo ""
echo "📋 Update: $FROM_VERSION → $TO_VERSION"
echo ""

# Entry file for expo-router projects
ENTRY_FILE="node_modules/expo-router/entry.js"
if [ ! -f "$ENTRY_FILE" ]; then
  ENTRY_FILE="node_modules/expo/AppEntry.js"
fi
echo "📄 Entry file: $ENTRY_FILE"

# ─────────────────────────────────────────────────
# Build iOS bundle
# ─────────────────────────────────────────────────
echo ""
echo "🍎 Building iOS bundle..."
rm -rf ios/output ios/main.jsbundle.zip
mkdir -p ios/output

npx expo export:embed \
  --platform ios \
  --entry-file "$ENTRY_FILE" \
  --bundle-output ios/output/main.jsbundle \
  --dev false \
  --assets-dest ios/output

cd ios
find output -type f | zip main.jsbundle.zip -@
cd ..
echo "✅ iOS bundle built: ios/main.jsbundle.zip"

# ─────────────────────────────────────────────────
# Build Android bundle
# ─────────────────────────────────────────────────
echo ""
echo "🤖 Building Android bundle..."
rm -rf android/output android/index.android.bundle.zip
mkdir -p android/output

npx expo export:embed \
  --platform android \
  --entry-file "$ENTRY_FILE" \
  --bundle-output android/output/index.android.bundle \
  --dev false \
  --assets-dest android/output

cd android
find output -type f | zip index.android.bundle.zip -@
cd ..
echo "✅ Android bundle built: android/index.android.bundle.zip"

# ─────────────────────────────────────────────────
# Upload to Supabase Storage
# ─────────────────────────────────────────────────
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BUCKET="Update"
IOS_PATH="ota/${TO_VERSION}/${TIMESTAMP}/main.jsbundle.zip"
ANDROID_PATH="ota/${TO_VERSION}/${TIMESTAMP}/index.android.bundle.zip"

echo ""
echo "☁️  Uploading iOS bundle to Supabase Storage..."
curl -s -X POST \
  "${SUPABASE_URL}/storage/v1/object/${BUCKET}/${IOS_PATH}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Content-Type: application/zip" \
  --data-binary @ios/main.jsbundle.zip \
  -o /dev/null -w "HTTP %{http_code}\n"

echo "☁️  Uploading Android bundle to Supabase Storage..."
curl -s -X POST \
  "${SUPABASE_URL}/storage/v1/object/${BUCKET}/${ANDROID_PATH}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Content-Type: application/zip" \
  --data-binary @android/index.android.bundle.zip \
  -o /dev/null -w "HTTP %{http_code}\n"

# Build public URLs
IOS_LINK="${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${IOS_PATH}"
ANDROID_LINK="${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${ANDROID_PATH}"

echo ""
echo "🔗 iOS link:     $IOS_LINK"
echo "🔗 Android link: $ANDROID_LINK"

# ─────────────────────────────────────────────────
# Get next build_num (auto-increment)
# ─────────────────────────────────────────────────
echo ""
echo "🔢 Fetching latest build number..."
LATEST_BUILD=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/update?select=build_num&order=build_num.desc&limit=1" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Accept: application/json")

# Parse the build_num from response (e.g., [{"build_num":3}] -> 3)
PREV_BUILD=$(echo "$LATEST_BUILD" | grep -o '"build_num":[0-9]*' | head -1 | grep -o '[0-9]*')
PREV_BUILD="${PREV_BUILD:-0}"
NEXT_BUILD=$((PREV_BUILD + 1))
echo "   Previous build: $PREV_BUILD → Next build: $NEXT_BUILD"

# ─────────────────────────────────────────────────
# Remove old records for the same from_version, then insert new one
# ─────────────────────────────────────────────────
echo ""
echo "�️  Removing old update records for v${FROM_VERSION}..."
curl -s -X DELETE \
  "${SUPABASE_URL}/rest/v1/update?from_version=eq.${FROM_VERSION}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "apikey: ${SUPABASE_KEY}" \
  -o /dev/null -w "HTTP %{http_code}\n"

echo "💾 Inserting new update record..."
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/update" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{
    \"from_version\": \"${FROM_VERSION}\",
    \"to_version\": \"${TO_VERSION}\",
    \"build_num\": ${NEXT_BUILD},
    \"ios_link\": \"${IOS_LINK}\",
    \"android_link\": \"${ANDROID_LINK}\"
  }")

echo "$RESPONSE" | head -c 500
echo ""

# ─────────────────────────────────────────────────
# Cleanup
# ─────────────────────────────────────────────────
rm -rf ios/output ios/main.jsbundle.zip
rm -rf android/output android/index.android.bundle.zip

echo ""
echo "🎉 OTA update published! (build #${NEXT_BUILD})"
echo "   Users on v${FROM_VERSION} will receive update to v${TO_VERSION}"
echo ""
