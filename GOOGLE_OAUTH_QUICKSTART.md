# Google OAuth Quick Start (5 Minutes)

## 🚀 Fastest Way to Get Google Login Working

### 1. Get Google Credentials (2 min)

1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. If asked, configure consent screen:
   - External user type
   - App name: Vynsera
   - Add your email
   - Save
6. Create OAuth client:
   - Type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Create
7. **COPY** the Client ID and Client Secret

### 2. Update .env.local (1 min)

Create or edit `.env.local` file in project root:

```env
MONGODB_URI=mongodb://localhost:27017/vynsera

GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_secret_here

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_32_chars_here
```

**Generate NEXTAUTH_SECRET** (pick one method):

**Windows PowerShell**:

```powershell
[Convert]::ToBase64String((1..32|%{Get-Random -Min 0 -Max 256}))
```

**Linux/Mac**:

```bash
openssl rand -base64 32
```

**Online**:

- Visit: https://generate-secret.vercel.app/32
- Copy the generated secret

### 3. Restart Server (30 sec)

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 4. Test (1 min)

1. Open http://localhost:3000
2. Click "Sign In" in navigation
3. Click "Continue with Google"
4. Sign in with your Google account
5. You should be redirected back
6. See your profile picture in navigation? ✅ Success!

## ✅ That's It!

You now have:

- ✅ Google authentication working
- ✅ User sessions stored in MongoDB
- ✅ Ready to sync user data
- ✅ Production-ready auth system

## 🐛 Quick Fixes

**"Redirect URI mismatch"**:

- Go back to Google Console
- Add exact URL: `http://localhost:3000/api/auth/callback/google`

**"NEXTAUTH_SECRET must be provided"**:

- Generate a secret using command above
- Add to `.env.local`
- Restart server

**"Can't connect to database"**:

- Make sure MongoDB is running: `docker-compose up -d mongodb`
- Check MONGODB_URI is correct

---

**Need more details?** See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for complete guide.
