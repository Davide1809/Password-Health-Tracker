# Email Configuration Guide

Password Health Tracker uses Flask-Mail to send password reset emails. This guide explains how to configure email sending for your deployment.

## Quick Setup (Gmail)

The easiest way to get started is using Gmail with an app-specific password.

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** in the left sidebar
3. Enable **2-Step Verification**

### Step 2: Generate App Password

1. Go back to **Security** in Google Account
2. Find **App passwords** (only appears if 2FA is enabled)
3. Select **Mail** and **Windows Computer** (or your device)
4. Google will generate a 16-character password

### Step 3: Set Environment Variables

Add these to your `.env` file or cloud deployment settings:

```bash
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_DEFAULT_SENDER=noreply@yourcompany.com
FRONTEND_URL=https://your-frontend-url.com
```

**Example for local development** (create `.env` file in `backend/` directory):

```bash
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=davidesilverii@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx
MAIL_DEFAULT_SENDER=noreply@passwordhealthtracker.com
FRONTEND_URL=http://localhost:3000
```

**Important:** Never commit `.env` file to git. Add it to `.gitignore`.

## Alternative: Other Email Providers

### SendGrid

1. Get API key from SendGrid dashboard
2. Use these environment variables:

```bash
MAIL_SERVER=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=apikey
MAIL_PASSWORD=SG.your-sendgrid-api-key
MAIL_DEFAULT_SENDER=noreply@yourdomain.com
FRONTEND_URL=https://your-frontend-url.com
```

### Office 365

```bash
MAIL_SERVER=smtp.office365.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@company.com
MAIL_PASSWORD=your-password
MAIL_DEFAULT_SENDER=noreply@company.com
FRONTEND_URL=https://your-frontend-url.com
```

### AWS SES

```bash
MAIL_SERVER=email-smtp.your-region.amazonaws.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-smtp-username
MAIL_PASSWORD=your-smtp-password
MAIL_DEFAULT_SENDER=noreply@yourdomain.com
FRONTEND_URL=https://your-frontend-url.com
```

## Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MAIL_SERVER` | SMTP server address | smtp.gmail.com | No |
| `MAIL_PORT` | SMTP port | 587 | No |
| `MAIL_USE_TLS` | Use TLS encryption | True | No |
| `MAIL_USERNAME` | Email account username | - | **Yes** |
| `MAIL_PASSWORD` | Email account password | - | **Yes** |
| `MAIL_DEFAULT_SENDER` | From address for emails | noreply@passwordhealthtracker.com | No |
| `FRONTEND_URL` | Frontend URL for reset links | http://localhost:3000 | No |

## Testing Email Configuration

### Local Testing

1. Set up environment variables in `.env`
2. Run the backend:

```bash
cd backend
python app.py
```

3. Use curl or Postman to test forgot-password endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@gmail.com"}'
```

4. Check your email for the reset link

### Troubleshooting

**"Module not found: Flask-Mail"**
- Install dependencies: `pip install -r requirements.txt`

**"SMTP connection failed"**
- Verify MAIL_SERVER and MAIL_PORT are correct
- Check internet connectivity
- For Gmail: ensure app-specific password is used (not regular Gmail password)

**"Authentication failed"**
- Verify MAIL_USERNAME and MAIL_PASSWORD are correct
- Check for typos in environment variables
- Ensure 2FA is enabled on Gmail account (for app passwords)

**"Email not received"**
- Check spam/junk folder
- Verify MAIL_DEFAULT_SENDER is valid
- Check application logs for errors: `docker logs password_tracker_backend`

## Cloud Deployment

### Google Cloud Run

Set environment variables during deployment:

```bash
gcloud run deploy password-tracker-backend \
  --set-env-vars=MAIL_SERVER=smtp.gmail.com,MAIL_PORT=587,MAIL_USE_TLS=True \
  --set-env-vars=MAIL_USERNAME=your-email@gmail.com \
  --set-env-vars=MAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx \
  --set-env-vars=MAIL_DEFAULT_SENDER=noreply@passwordhealthtracker.com \
  --set-env-vars=FRONTEND_URL=https://your-frontend-url.com
```

Or set in GitHub Secrets and CI/CD pipeline:

```yaml
--set-env-vars=MAIL_SERVER=${{ secrets.MAIL_SERVER }},MAIL_PORT=${{ secrets.MAIL_PORT }},...
```

### Docker Compose (Local)

Add to `docker-compose.yml`:

```yaml
environment:
  - MAIL_SERVER=smtp.gmail.com
  - MAIL_PORT=587
  - MAIL_USE_TLS=True
  - MAIL_USERNAME=${MAIL_USERNAME}
  - MAIL_PASSWORD=${MAIL_PASSWORD}
  - MAIL_DEFAULT_SENDER=${MAIL_DEFAULT_SENDER}
  - FRONTEND_URL=${FRONTEND_URL}
```

Then run with environment file:

```bash
docker-compose --env-file .env up
```

## Security Best Practices

1. **Never commit credentials** to git
2. **Use app-specific passwords** for Gmail, not your main password
3. **Enable 2FA** on your email account
4. **Use TLS** for all connections (MAIL_USE_TLS=True)
5. **Store secrets** in GitHub Secrets, environment variables, or secure vaults
6. **Rotate passwords** regularly
7. **Monitor email logs** for suspicious activity

## Email Template Customization

To customize the password reset email, edit `backend/utils/email_sender.py`:

- Modify HTML template in `send_password_reset_email()` function
- Change subject line, body text, colors, and styling
- Add company logo or branding

## Common Issues and Solutions

### Issue: Emails not being sent

**Check 1:** Verify environment variables are set
```bash
# In Python shell
import os
print(os.environ.get('MAIL_USERNAME'))
print(os.environ.get('MAIL_PASSWORD'))
```

**Check 2:** Test SMTP connection manually
```python
import smtplib
server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()
server.login('your-email@gmail.com', 'your-app-password')
server.quit()
```

**Check 3:** Check application logs
```bash
docker logs password_tracker_backend | grep -i mail
```

### Issue: Gmail security warning

If you see "Less secure app access" warning:
- Use **app-specific passwords** instead of your Gmail password
- This is the recommended approach

### Issue: Email headers showing up in email

This usually means the HTML rendering isn't supported by the email client:
- Email client is using plain text mode
- Add both HTML and plain text versions (already done)
- Try different email client (Gmail, Outlook, etc.)

## Support

For additional help:
1. Check logs: `docker logs password_tracker_backend`
2. Test SMTP connection with your email provider's documentation
3. Review Flask-Mail documentation: https://flask-mail.readthedocs.io/
