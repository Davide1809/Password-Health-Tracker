# Password Reset Email Implementation - Setup Guide

## What Was Done

I've implemented **email sending functionality** for the password reset feature in your Password Health Tracker application. Previously, the forgot-password endpoint was returning the reset token in the response (marked with TODO), but now it actually sends emails to users.

### Changes Made

1. **Added Flask-Mail Dependency**
   - Updated `requirements.txt` with `Flask-Mail==0.9.1`
   - Flask-Mail handles SMTP communication for sending emails

2. **Created Email Utility Module** (`backend/utils/email_sender.py`)
   - `init_mail(app)`: Initializes Flask-Mail with SMTP configuration from environment variables
   - `send_password_reset_email()`: Sends formatted HTML email with reset link
   - `send_notification_email()`: Generic email sending for future notifications
   - Graceful error handling - logs failures without crashing

3. **Updated Backend Application** (`backend/app.py`)
   - Imports and initializes Flask-Mail on startup
   - Sets up SMTP configuration from environment variables

4. **Updated Forgot-Password Endpoint** (`backend/routes/auth_routes.py`)
   - Now calls `send_password_reset_email()` instead of returning token in response
   - Removed TODO comment - feature is now implemented
   - Maintains security by not revealing whether email exists in system

5. **Added Documentation**
   - `EMAIL_SETUP.md`: Comprehensive setup guide for multiple email providers
   - `setup-email.sh`: Interactive bash script to configure email settings

## How to Set Up Email Sending

### Option 1: Interactive Setup (Recommended)

Run the interactive setup script:

```bash
./setup-email.sh
```

This will:
- Ask you to choose your email provider (Gmail, SendGrid, Office 365, AWS SES, or custom)
- Guide you through provider-specific setup steps
- Create `.env` file with configuration
- Never commit `.env` to git (already in .gitignore)

### Option 2: Manual Setup

#### For Gmail (Easiest):

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to [myaccount.google.com](https://myaccount.google.com)
   - Click **Security**
   - Enable **2-Step Verification**

2. **Generate App-Specific Password**:
   - Go back to **Security** → **App passwords**
   - Select **Mail** and **Windows Computer** (or your device)
   - Google generates a 16-character password

3. **Create `.env` file** in `backend/` directory:

```bash
# backend/.env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_DEFAULT_SENDER=noreply@passwordhealthtracker.com
FRONTEND_URL=http://localhost:3000
```

⚠️ **Important:** Never commit `.env` file to git. It's already in `.gitignore`.

### Option 3: Other Email Providers

See `EMAIL_SETUP.md` for detailed instructions for:
- **SendGrid**: SaaS email service
- **Office 365**: Microsoft email
- **AWS SES**: Amazon's email service
- **Custom SMTP**: Any SMTP server

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MAIL_SERVER` | SMTP server address | smtp.gmail.com |
| `MAIL_PORT` | SMTP port | 587 |
| `MAIL_USE_TLS` | Use TLS encryption | True |
| `MAIL_USERNAME` | Email account username | your-email@gmail.com |
| `MAIL_PASSWORD` | Email account password | xxxx xxxx xxxx xxxx |
| `MAIL_DEFAULT_SENDER` | From address | noreply@passwordhealthtracker.com |
| `FRONTEND_URL` | Frontend URL for reset links | http://localhost:3000 |

## Testing Locally

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure email** (create `.env` file or run setup script)

3. **Start the backend**:
   ```bash
   python app.py
   ```

4. **Test with curl**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email": "your-email@gmail.com"}'
   ```

5. **Check your inbox** for the reset email

## What the Email Contains

The password reset email includes:
- ✅ Professional HTML template with your app branding
- ✅ Reset link button for easy clicking
- ✅ Plain text version for email clients without HTML support
- ✅ Security warning: "This link will expire in 1 hour"
- ✅ Direct link if button doesn't work
- ✅ Professional footer with company information

## For Production Deployment

### Google Cloud Run

Set environment variables during deployment:

```bash
gcloud run deploy password-tracker-backend \
  --set-env-vars=MAIL_SERVER=smtp.gmail.com,MAIL_PORT=587,MAIL_USE_TLS=True \
  --set-env-vars=MAIL_USERNAME=your-email@gmail.com \
  --set-env-vars=MAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx \
  --set-env-vars=MAIL_DEFAULT_SENDER=noreply@passwordhealthtracker.com \
  --set-env-vars=FRONTEND_URL=https://your-production-url.com
```

### GitHub Actions + GitHub Secrets

Add these secrets to your GitHub repository:
- `MAIL_SERVER`
- `MAIL_PORT`
- `MAIL_USE_TLS`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_DEFAULT_SENDER`
- `FRONTEND_URL`

Then in `.github/workflows/ci-cd.yml`:

```yaml
--set-env-vars=MAIL_SERVER=${{ secrets.MAIL_SERVER }},\
MAIL_PORT=${{ secrets.MAIL_PORT }},\
...
```

## Troubleshooting

### Email not received?

1. **Check spam/junk folder** - emails sometimes end up there
2. **Verify environment variables** are set correctly:
   ```bash
   cd backend
   python -c "import os; print('Username:', os.environ.get('MAIL_USERNAME'))"
   ```

3. **Check backend logs** for errors:
   ```bash
   docker logs password_tracker_backend | grep -i mail
   ```

4. **Test SMTP connection** manually:
   ```python
   import smtplib
   server = smtplib.SMTP('smtp.gmail.com', 587)
   server.starttls()
   server.login('your-email@gmail.com', 'your-app-password')
   print("Connected!")
   server.quit()
   ```

### Gmail says "Less secure app"?

- You **must** use app-specific passwords, not your regular Gmail password
- Regular passwords won't work with the "Allow less secure apps" toggle

### Getting "Connection refused" error?

- Check `MAIL_SERVER` and `MAIL_PORT` are correct
- Verify internet connection
- Try: `telnet smtp.gmail.com 587`

## Email Template Customization

To customize the email design, edit `backend/utils/email_sender.py`:

- Change HTML template colors, fonts, layout
- Add company logo or branding
- Customize subject line and messaging
- Modify signature/footer

## Next Steps

1. ✅ Run `./setup-email.sh` to configure email
2. ✅ Test locally by requesting a password reset
3. ✅ Deploy to Cloud Run with environment variables
4. ✅ Add GitHub Secrets for CI/CD pipeline

## Files Changed

- `backend/requirements.txt` - Added Flask-Mail
- `backend/utils/email_sender.py` - New: Email utility module
- `backend/app.py` - Initialize Flask-Mail
- `backend/routes/auth_routes.py` - Update forgot-password endpoint to send emails
- `EMAIL_SETUP.md` - New: Comprehensive setup guide
- `setup-email.sh` - New: Interactive configuration script

## Security Notes

✅ **Never commit `.env` file** - it's in `.gitignore`  
✅ **Use app-specific passwords** for Gmail, not your main password  
✅ **Enable TLS** for all SMTP connections  
✅ **Store secrets** in GitHub Secrets or environment variables  
✅ **Don't reveal email existence** - endpoint always returns success message  
✅ **Reset tokens expire in 1 hour** - security best practice  

---

**Questions?** Check `EMAIL_SETUP.md` for provider-specific guides and troubleshooting.
