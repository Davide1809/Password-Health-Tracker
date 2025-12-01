# CREDENTIAL ENCRYPTION FIX - December 1, 2025

## Issue
When clicking the "Show" button to reveal a saved password, users were seeing the error:
```
***DECRYPTION_ERROR***
```

## Root Cause
The `CREDENTIAL_ENCRYPTION_KEY` environment variable was not being initialized consistently:
1. **Previous behavior**: If the key wasn't set, a random new key was generated each time
2. **Problem**: Passwords encrypted with one key couldn't be decrypted with a different key
3. **Result**: Existing credentials couldn't be decrypted

## Solution
Implemented persistent encryption key initialization in the application startup:

### Changes Made

#### 1. **backend/app.py**
```python
# Ensure credential encryption key is set (required for password encryption)
if not os.environ.get('CREDENTIAL_ENCRYPTION_KEY'):
    from cryptography.fernet import Fernet
    # Generate a key for development if not provided
    generated_key = Fernet.generate_key().decode()
    os.environ['CREDENTIAL_ENCRYPTION_KEY'] = generated_key
    logger.warning('CREDENTIAL_ENCRYPTION_KEY not set. Generated a temporary development key...')
```

**Effect**: The app now generates and maintains a consistent encryption key for the entire session

#### 2. **backend/models/credential.py**
Improved `get_cipher()` to use the app-initialized key consistently

#### 3. **Environment Configuration**
Added `CREDENTIAL_ENCRYPTION_KEY` to:
- `backend/.env.example`
- `.env.cloud`

### Testing the Fix

✅ **Encryption/Decryption verified working:**
```
Original: MySecurePassword123!
Encrypted: gAAAAABpLbKJDzalc3TRIj2d_4nPKDuVixEUUh_34jZn5oRHWgrqskJb3AMUu-wEgis1UxrPdQgw-...
Decrypted: MySecurePassword123!
✓ Encryption/Decryption working correctly!
```

## How to Verify the Fix

1. **Local Development**: 
   - The app will automatically generate a temporary key on startup
   - All passwords saved in a session can be shown/hidden correctly
   
2. **Production (Cloud Run)**:
   - Set `CREDENTIAL_ENCRYPTION_KEY` as an environment variable in Cloud Run service settings
   - Generate with: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`
   - Use same key across all Cloud Run instances to ensure consistent decryption

## Important Notes

### For Development
- The automatically generated key is only valid for the current session
- Credentials encrypted in one session may not decrypt after server restart
- This is acceptable for development/testing

### For Production
- **Must set `CREDENTIAL_ENCRYPTION_KEY` as an environment variable**
- All app instances must use the **same key**
- Backup your encryption key; losing it means all encrypted credentials become irrecoverable
- Changing the key will invalidate all existing encrypted credentials

## Helper Script
A utility script is available to manage encryption keys:

```bash
# Generate a new encryption key
python backend/scripts/fix_credentials_encryption.py generate

# Verify an existing key is valid
python backend/scripts/fix_credentials_encryption.py verify <key>
```

## Migration for Existing Production Deployments

If you have existing credentials encrypted with a previous key:

1. Note the old encryption key
2. Set `CREDENTIAL_ENCRYPTION_KEY` to the old key
3. Export all credentials
4. Regenerate a new key (recommended)
5. Re-import credentials (they'll be re-encrypted with the new key)

## Related Issues Fixed
- Decryption errors when showing passwords ✅
- Inconsistent encryption key across requests ✅
- Missing environment variable documentation ✅

## Files Changed
- `backend/app.py` - Key initialization
- `backend/models/credential.py` - Error handling
- `backend/.env.example` - Added CREDENTIAL_ENCRYPTION_KEY
- `.env.cloud` - Added CREDENTIAL_ENCRYPTION_KEY  
- `backend/scripts/fix_credentials_encryption.py` - New helper script
- `.gitignore` - Added key files

## Next Steps
✅ All password show/hide operations should now work correctly
✅ GitHub Actions will rebuild and deploy the fix
✅ Test adding a new credential and showing the password
