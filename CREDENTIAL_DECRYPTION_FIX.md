# Credential Decryption Error - Root Cause & Solution

## Issue
When saving credentials and later signing back in:
- ✅ Credentials appear in the list
- ❌ Clicking "Show" displays: `***DECRYPTION_ERROR***`
- ✅ But NEW credentials added in same session work fine

After closing and re-signing in:
- ❌ All credentials show `***DECRYPTION_ERROR***`

## Root Cause

**The encryption key is being regenerated on each Cloud Run restart!**

### How It Works (Wrong Way)
1. First sign in → App generates temporary key A → Save credentials (encrypted with A)
2. Close browser/app restarts → New key B generated
3. Try to view credentials → Uses key B to decrypt data encrypted with A → **ERROR!**
4. Save NEW credentials → Encrypted with key B → Works immediately
5. Close browser again → New key C generated
6. Reopen → All credentials fail (A's data needs A, B's data needs B, can't use C)

### Why This Happens

In `backend/app.py`:
```python
# ❌ WRONG: Generates new random key each restart
if not os.environ.get('CREDENTIAL_ENCRYPTION_KEY'):
    generated_key = Fernet.generate_key().decode()
    os.environ['CREDENTIAL_ENCRYPTION_KEY'] = generated_key
```

**Problem:**
- Each Cloud Run restart = new instance
- New instance = app.py runs again
- No `CREDENTIAL_ENCRYPTION_KEY` env var set = generates new random key
- Database has credentials encrypted with OLD key
- New key can't decrypt old data

## Solution

**Set `CREDENTIAL_ENCRYPTION_KEY` as a permanent Cloud Run environment variable!**

### Step 1: Generate an Encryption Key

**Option A: Use the helper script**
```bash
bash backend/scripts/set_encryption_key.sh
```

**Option B: Manual generation**
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Output example:
```
EK5uVyHdUCt7vMkPqW3LhJ-zQ9RtA2Bnx5mN0kF6G7s=
```

### Step 2: Set in Cloud Run

**Option A: Using gcloud CLI**
```bash
gcloud run services update password-tracker-backend \
  --set-env-vars CREDENTIAL_ENCRYPTION_KEY="YOUR_KEY_HERE" \
  --region us-central1
```

**Option B: Using Google Cloud Console**
1. Go to Cloud Run: https://console.cloud.google.com/run
2. Click `password-tracker-backend` service
3. Click "Edit and Deploy New Revision"
4. Scroll to "Environment Variables"
5. Add new variable:
   - Name: `CREDENTIAL_ENCRYPTION_KEY`
   - Value: `YOUR_KEY_HERE`
6. Click "Deploy"

### Step 3: Verify

After deployment (1-2 minutes):
1. Sign in to the app
2. Go to "Saved Credentials"
3. Click "Show" on a password
4. ✅ Should see the password (not `***DECRYPTION_ERROR***`)

## Important!

### ⚠️ Save Your Key!
```
Store this key in a SECURE location:
- 1Password, LastPass, Bitwarden, etc.
- NOT in Git, NOT in plain text files
- NOT in email or chat
```

**Why?** If you lose this key, all encrypted credentials become **permanently unrecoverable**.

### 🔄 What About Existing Credentials?

If you haven't set the key yet and credentials are already saved:

**Option 1: Keep using workaround**
- Workaround: Re-save credentials in each session
- They work until you close the app

**Option 2: Clear and reset**
1. Delete all saved credentials
2. Set the encryption key (steps above)
3. Re-add credentials
4. They'll persist forever now ✅

### 📋 Migration Path

If you have credentials encrypted with old keys:

**Automatic (if keys were consistent):**
1. If you're using same key → just set it as env var
2. Old credentials decrypt automatically

**Manual (if keys were different):**
1. Export/note down credentials while they work
2. Set new consistent key
3. Delete corrupted credentials
4. Re-add credentials
5. Done!

## How to Verify Fix Works

### Test 1: Same Session (Should Already Work)
1. Sign in
2. Add new credential
3. Click Show → Shows password ✅
4. Delete & re-add → Still works ✅

### Test 2: Across Sessions (Will Work After Env Var Is Set)
1. Sign in
2. Add credential: "Gmail" with password "test123"
3. Click Show → Shows "test123" ✅
4. **Close browser completely**
5. Re-sign in
6. Go to Credentials
7. Click Show on Gmail → Should show "test123" ✅ (NOT error)

If Test 2 fails: encryption key is still not persistent (env var not set)

## Technical Details

### Why Encryption Keys Work This Way

**Fernet (symmetric encryption):**
- Same key encrypts AND decrypts
- Password encrypted with Key A can ONLY be decrypted with Key A
- Key B cannot decrypt A's data (throws error)
- This is intentional security design

**Solution:**
- Use ONE persistent key for the app
- All credentials encrypted with same key
- All credentials can decrypt with same key

### Cloud Run Considerations

**Cloud Run restart = new container instance**
- Environment variables in container are reset
- Hardcoded values are lost
- Need explicit env vars from Cloud Run service settings

**Persistent env vars in Cloud Run:**
- Set via `gcloud run services update`
- Or via Cloud Console UI
- Persisted in Cloud Run service configuration
- Applied to every new instance

## Verification Checklist

After setting the encryption key:

- [ ] `gcloud run services describe password-tracker-backend` shows `CREDENTIAL_ENCRYPTION_KEY` in environment
- [ ] Cloud Console shows the env var is set
- [ ] Sign in to app
- [ ] Add credential and show password → Works
- [ ] Close browser completely
- [ ] Re-sign in
- [ ] Show same credential → Works (not error)
- [ ] Close and re-sign again
- [ ] Still works ✅

All checks pass = **Fixed!**

## Troubleshooting

### Symptoms: Still Getting ***DECRYPTION_ERROR***

**Cause 1: Env var not set**
- Check: `gcloud run services describe password-tracker-backend`
- Should show `CREDENTIAL_ENCRYPTION_KEY` in output
- If missing: Set it again and wait 1-2 min

**Cause 2: Wrong key value**
- Check: `gcloud run services describe password-tracker-backend`
- Key should look like: `Ct6_kQ9R...` (43 chars)
- If malformed: Generate and set new key

**Cause 3: Cloud Run not restarted**
- After setting env var, Cloud Run automatically restarts
- Takes 1-2 minutes
- Check Cloud Run UI for "Service is being deployed" message

**Cause 4: Old credentials with different key**
- Credentials encrypted with OLD key can't use NEW key
- Solution: Delete and re-add credentials

### No SSH? No gcloud CLI?

**Via Google Cloud Console:**
1. https://console.cloud.google.com/run
2. Click `password-tracker-backend`
3. Click "Edit and Deploy New Revision"
4. Find "Environment Variables"
5. Add `CREDENTIAL_ENCRYPTION_KEY` = your key value
6. Click "Deploy"

## Prevention

**For future deployments:**

In `backend/app.py`, this is already fixed:
```python
# ✅ GOOD: Falls back to env var, errors if not set
if not os.environ.get('CREDENTIAL_ENCRYPTION_KEY'):
    raise ValueError('CREDENTIAL_ENCRYPTION_KEY environment variable not set')
```

But we're using fallback generation for development. To be safe:

1. Always set `CREDENTIAL_ENCRYPTION_KEY` before deploying to production
2. Never commit keys to Git
3. Use Cloud Run Secrets for sensitive values (not just env vars)

## Summary

| Issue | Cause | Solution |
|-------|-------|----------|
| Credentials show error after restart | Key regenerates | Set env var in Cloud Run |
| New credentials work, old ones don't | Different keys used | Set consistent key |
| Lost the key | No backup | Generate new key, clear credentials |

**Key Takeaway:** Set `CREDENTIAL_ENCRYPTION_KEY` as Cloud Run environment variable and never lose the key!

---

**Next Step:** Run the setup script or manually set the encryption key in Cloud Run, then test! 🔐
