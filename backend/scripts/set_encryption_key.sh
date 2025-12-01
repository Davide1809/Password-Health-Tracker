#!/bin/bash

# Script to generate and set the CREDENTIAL_ENCRYPTION_KEY in Cloud Run
# This must be done to ensure credentials can be decrypted across restarts

set -e

echo "🔐 Password Health Tracker - Encryption Key Setup"
echo "=================================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Generate a new Fernet encryption key
echo "📦 Generating new Fernet encryption key..."
ENCRYPTION_KEY=$(/Users/davidesilverii/Final-Project1/.venv/bin/python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

echo "✅ Key generated: ${ENCRYPTION_KEY:0:20}...${ENCRYPTION_KEY: -10}"
echo ""

# Set the environment variable in Cloud Run
echo "🚀 Setting CREDENTIAL_ENCRYPTION_KEY in Cloud Run backend service..."
echo ""

gcloud run services update password-tracker-backend \
  --set-env-vars CREDENTIAL_ENCRYPTION_KEY="$ENCRYPTION_KEY" \
  --region us-central1 \
  --quiet

echo ""
echo "✅ Encryption key set successfully!"
echo ""
echo "⚠️  IMPORTANT: Save this key in a secure location (e.g., 1Password, LastPass)"
echo "   If you lose this key, all encrypted credentials will become unrecoverable!"
echo ""
echo "📝 Key (save this):"
echo "   $ENCRYPTION_KEY"
echo ""
echo "🔄 Cloud Run will restart with the new key"
echo "✨ Existing credentials will now decrypt correctly!"
echo ""
echo "Next steps:"
echo "1. Wait 1-2 minutes for Cloud Run to restart"
echo "2. Sign in to the app"
echo "3. Go to Saved Credentials"
echo "4. Credentials should now show passwords without ***DECRYPTION_ERROR***"
