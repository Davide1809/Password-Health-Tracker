# Production Security Setup Guide

## 🔒 Hardening Your Password Health Tracker for Production/Family Use

This guide walks through securing your application before deployment or sharing with family members.

---

## ✅ Security Features Added

### 1. **Rate Limiting** (Brute-force Protection)
- **Login**: 5 attempts per 15 minutes
- **Registration**: 5 attempts per hour  
- **Password Reset**: 3 attempts per hour
- **Default limit**: 200 per day, 50 per hour

### 2. **CORS Restrictions** (Origin Validation)
- Only allows requests from your configured domain
- Prevents cross-site attacks
- Configurable via `ALLOWED_ORIGINS` env variable

### 3. **Encrypted Secrets** (Already Implemented)
- Passwords: bcrypt hashing (12 rounds)
- Saved credentials: Fernet symmetric encryption
- Security question answers: bcrypt hashing

---

## 🚀 Setup Instructions

### Step 1: Generate Production Secrets (5 minutes)

Already generated for you:

```bash
# JWT Secret (for signing authentication tokens)
export JWT_SECRET_KEY="38fR7esWiuigvmEv_4uAIF0as-86K0nRB6bGZEtivJA"

# Credential Encryption Key (for encrypting saved passwords)
export CREDENTIAL_ENCRYPTION_KEY="4km6-ALlZhae-UB515XEm5Acu7N-y157_6rDY5O8xcM="
```

⚠️ **IMPORTANT**: These secrets are now known to you. In a real production scenario:
- Store these in Google Cloud Secret Manager or AWS Secrets Manager
- Never commit these to git
- Rotate them periodically
- Use different secrets for each environment (dev, staging, production)

### Step 2: Install Rate Limiting Dependency

Already added to `requirements.txt`. When deploying:

```bash
pip install -r requirements.txt
```

This installs Flask-Limiter for rate limiting functionality.

### Step 3: Configure for Your Domain

Before deployment, set your domain:

```bash
# For development (localhost)
export ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# For production (e.g., family domain)
export ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Multiple domains separated by commas
export ALLOWED_ORIGINS="https://yourdomain.com,https://yourfamilydomain.com"
```

### Step 4: Use MongoDB Atlas (Not Local MongoDB)

For family use, use MongoDB Atlas:

1. **Create account**: https://www.mongodb.com/cloud/atlas
2. **Create cluster**: Free tier available
3. **Set strong password**: At least 12 characters, mixed case, numbers, special chars
4. **Get connection string**:
   ```bash
   export MONGO_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/password_health?retryWrites=true&w=majority"
   ```

5. **Enable IP whitelist**:
   - Only allow your app server's IP
   - For Cloud Run, use auto-discovery or whitelist Google Cloud IPs

### Step 5: Deploy to Google Cloud Run (Production HTTPS)

```bash
# Build and deploy
gcloud run deploy password-health-tracker \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars \
    JWT_SECRET_KEY=38fR7esWiuigvmEv_4uAIF0as-86K0nRB6bGZEtivJA \
    CREDENTIAL_ENCRYPTION_KEY=4km6-ALlZhae-UB515XEm5Acu7N-y157_6rDY5O8xcM= \
    MONGO_URI=mongodb+srv://... \
    ALLOWED_ORIGINS=https://yourdomain.com \
    FLASK_ENV=production \
    FLASK_PORT=8080
```

Benefits:
- ✅ Automatic HTTPS/TLS (encrypted in transit)
- ✅ No plaintext passwords over the internet
- ✅ Automatic scaling
- ✅ Free tier available for low usage

---

## 🔐 Security Checklist

### Before Production Deployment

- [ ] Generated strong JWT_SECRET_KEY
- [ ] Generated strong CREDENTIAL_ENCRYPTION_KEY
- [ ] Set ALLOWED_ORIGINS to your domain(s)
- [ ] Configured MongoDB Atlas with strong password
- [ ] Enabled MongoDB IP whitelist
- [ ] Deployed to Cloud Run or HTTPS-enabled server
- [ ] Tested login rate limiting (try 6 logins quickly)
- [ ] Tested password reset rate limiting
- [ ] Verified CORS works from your domain
- [ ] Verified CORS blocks unknown domains
- [ ] Backup MongoDB Atlas enabled
- [ ] Monitoring/alerting configured (optional)

### Ongoing Security Practices

- [ ] Rotate secrets every 6 months
- [ ] Monitor failed login attempts
- [ ] Keep dependencies updated: `pip list --outdated`
- [ ] Review MongoDB access logs monthly
- [ ] Enable audit logging (advanced)
- [ ] Implement 2FA for admin access (future enhancement)
- [ ] Regular security audits

---

## 🧪 Testing Security Features

### Test Rate Limiting

```bash
# Try logging in 6 times within 15 minutes
# 6th attempt should be rejected

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Response after limit exceeded:
# {"message":"<h1>429 Too Many Requests</h1>"}
```

### Test CORS Restrictions

```bash
# From allowed domain - should work ✅
curl -H "Origin: https://yourdomain.com" \
  http://api.yourdomain.com/api/health

# From unknown domain - should fail ❌
curl -H "Origin: https://evil.com" \
  http://api.yourdomain.com/api/health
```

### Test HTTPS (Production)

```bash
# Verify SSL certificate is valid
curl -I https://your-app.cloudrun.app/api/health

# Should show: "HTTP/2 200" and valid SSL certificate
```

---

## 📊 Environment Variables Summary

| Variable | Purpose | Example |
|----------|---------|---------|
| `JWT_SECRET_KEY` | Sign JWT tokens (DO NOT SHARE) | `38fR7esWiuigvmEv...` |
| `CREDENTIAL_ENCRYPTION_KEY` | Encrypt saved passwords (DO NOT SHARE) | `4km6-ALlZhae-UB...` |
| `MONGO_URI` | Database connection (includes password) | `mongodb+srv://...` |
| `ALLOWED_ORIGINS` | CORS whitelist | `https://yourdomain.com` |
| `FLASK_ENV` | Environment mode | `production` or `development` |
| `FLASK_PORT` | Server port | `8080` (Cloud Run) or `5000` (local) |
| `MAIL_SERVER` | Email SMTP server | `smtp.gmail.com` |
| `MAIL_USERNAME` | Email account | `your-email@gmail.com` |
| `MAIL_PASSWORD` | Email password/app key | (app-specific password) |

---

## 🚨 What NOT to Do

- ❌ Don't commit secrets to git
- ❌ Don't use the same JWT secret across environments
- ❌ Don't share encryption keys in chat/email
- ❌ Don't use weak MongoDB password
- ❌ Don't allow all CORS origins in production
- ❌ Don't deploy without HTTPS
- ❌ Don't log sensitive user data
- ❌ Don't ignore rate limit violations

---

## 🆘 If You Forget Your Secret

If you lose JWT_SECRET_KEY or CREDENTIAL_ENCRYPTION_KEY:

1. **Regenerate it immediately**:
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **All existing JWT tokens become invalid** - Users will need to re-login
3. **Cannot recover encrypted credentials** - Users will lose saved passwords
   - Consider re-encryption if this happens

⚠️ **Prevention**: Store these in a password manager (1Password, Bitwarden, etc.)

---

## 📞 Support & Questions

For additional security questions or issues:
1. Check Flask-Limiter docs: https://flask-limiter.readthedocs.io/
2. MongoDB Atlas security: https://docs.atlas.mongodb.com/security/
3. Cloud Run deployment: https://cloud.google.com/run/docs/

---

## 📈 Next Steps

After basic security is in place, consider:

1. **2FA (Two-Factor Authentication)** - Add TOTP support (Google Authenticator)
2. **Audit Logging** - Track all security events (logins, password changes, etc.)
3. **Encryption at Rest** - Enable MongoDB field-level encryption
4. **DDoS Protection** - Use Cloud Armor with Cloud Run
5. **Security Headers** - Add CSP, HSTS, X-Frame-Options headers
6. **Penetration Testing** - Professional security audit

---

**Last Updated**: December 4, 2025  
**Status**: ✅ Production-Ready with Security Hardening
