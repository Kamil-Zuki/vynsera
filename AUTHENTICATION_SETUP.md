# Google Authentication Setup Guide

## Overview

Vynsera now supports Google OAuth authentication to sync your progress and watchlist across devices!

## ✨ Features

With Google authentication, users can:

- ☁️ **Sync watchlist** across all devices
- 📊 **Sync progress** - completed roadmap steps
- 🔐 **Secure login** - no passwords to remember
- 🎨 **Personalized experience** - your data follows you
- 📱 **Cross-device** - start on phone, continue on desktop

## 🔧 Setup Instructions

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**

   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)

   - Click "Select a Project" → "New Project"
   - Name: "Vynsera" (or your preferred name)
   - Click "Create"

3. **Enable Google+ API**

   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**

   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - User Type: "External"
     - App name: "Vynsera"
     - User support email: your email
     - Developer contact: your email
     - Scopes: Add `email` and `profile`
     - Test users: Add your email (for testing)
     - Click "Save and Continue"

5. **Configure OAuth Client**

   - Application type: "Web application"
   - Name: "Vynsera Web"
   - Authorized JavaScript origins:
     - http://localhost:3000 (for development)
     - https://yourdomain.com (for production)
   - Authorized redirect URIs:
     - http://localhost:3000/api/auth/callback/google (development)
     - https://yourdomain.com/api/auth/callback/google (production)
   - Click "Create"

6. **Copy Credentials**
   - You'll see "Client ID" and "Client Secret"
   - Copy both - you'll need them in Step 2

### Step 2: Configure Environment Variables

1. **Open or create `.env.local` file** in project root

2. **Add the following variables**:

```env
# Existing MongoDB connection
MONGODB_URI=mongodb://localhost:27017/vynsera

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here
```

3. **Generate NEXTAUTH_SECRET**:

```bash
# Option 1: Using openssl (Linux/Mac)
openssl rand -base64 32

# Option 2: Using PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

4. **Replace placeholder values** with your actual credentials

### Step 3: Test the Setup

1. **Restart the dev server**:

```bash
npm run dev
```

2. **Open the app**: http://localhost:3000

3. **Click "Sign In"** in the navigation

4. **Sign in with Google** account

5. **Check if it works**:
   - You should be redirected back to homepage
   - Your profile picture should appear in navigation
   - Click it to see user menu with logout option

## 🚀 Production Deployment

### Environment Variables for Production

In your production environment (Docker, VPS, etc.), set:

```env
MONGODB_URI=mongodb://mongodb:27017/vynsera
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_production_secret_key
NODE_ENV=production
```

### Docker Compose

Update `docker-compose.yml` environment section:

```yaml
environment:
  - NODE_ENV=production
  - MONGODB_URI=mongodb://mongodb:27017/vynsera
  - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
  - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
  - NEXTAUTH_URL=https://yourdomain.com
  - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
```

Then create `.env` file (NOT .env.local for production):

```env
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
NEXTAUTH_SECRET=your_production_secret
```

## 📱 How It Works

### User Flow

1. **User clicks "Sign In"**
   ↓
2. **Redirected to Google login**
   ↓
3. **User authenticates with Google**
   ↓
4. **Google redirects back to app**
   ↓
5. **NextAuth creates/updates user in MongoDB**
   ↓
6. **User is logged in, session created**
   ↓
7. **Progress and watchlist sync to database**

### Data Syncing

**Watchlist**:

- localStorage used when not logged in
- Database synced when logged in
- On login: localStorage data merged with database
- Changes auto-sync to database

**Progress**:

- localStorage used when not logged in
- Database synced when logged in
- On login: localStorage progress merged with database
- Roadmap completion tracked per user

### Session Management

- **Session stored** in MongoDB (not JWT)
- **Secure** - uses MongoDB adapter
- **Persistent** - stays logged in across visits
- **Auto-renewal** - session refreshes automatically

## 🔒 Security

### Best Practices Implemented

✅ **No passwords stored** - OAuth only  
✅ **HTTPS required** in production  
✅ **Secure session** storage (MongoDB)  
✅ **CSRF protection** built-in  
✅ **Same-site cookies**  
✅ **HTTP-only cookies**

### Privacy

- **Minimal data collection** - only name, email, image
- **No tracking** - user data stays in MongoDB
- **User control** - can sign out anytime
- **Data export** - API to get all user data
- **Account deletion** - delete all data on request

## 🐛 Troubleshooting

### "Callback URL mismatch" Error

**Problem**: Redirect URI not authorized  
**Solution**: Add the exact callback URL to Google Console:

- `http://localhost:3000/api/auth/callback/google`

### "Invalid client" Error

**Problem**: Wrong CLIENT_ID or CLIENT_SECRET  
**Solution**: Double-check credentials in `.env.local`

### "NEXTAUTH_SECRET must be provided"

**Problem**: Missing or empty NEXTAUTH_SECRET  
**Solution**: Generate a new secret key (see Step 2 above)

### Session not persisting

**Problem**: MongoDB not connected or credentials wrong  
**Solution**:

- Check MongoDB is running: `docker-compose ps`
- Check MONGODB_URI is correct
- Check MongoDB logs: `docker-compose logs mongodb`

### User menu not showing

**Problem**: Session not loaded yet  
**Solution**: Wait for page to fully load, check browser console for errors

## 📊 Database Collections

### Users Collection

NextAuth creates these collections automatically:

- `users` - User accounts
- `sessions` - Active sessions
- `accounts` - OAuth provider accounts
- `verificationtokens` - Email verification (if used)

### User Document Example

```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "image": "https://...googleusercontent.com/...",
  "emailVerified": null,
  "watchlist": ["resource-id-1", "resource-id-2"],
  "completedSteps": ["hangul-mastery", "basic-greetings"],
  "preferences": {
    "language": "en",
    "theme": "dark"
  },
  "lastActive": "2025-10-10T10:30:00.000Z",
  "createdAt": "2025-10-01T00:00:00.000Z",
  "updatedAt": "2025-10-10T10:30:00.000Z"
}
```

## 🎯 API Endpoints

### Authentication

- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session
- `GET /api/auth/callback/google` - OAuth callback

### User Data

- `GET /api/user/watchlist` - Get user's watchlist
- `POST /api/user/watchlist` - Update watchlist
- `GET /api/user/progress` - Get completed steps
- `POST /api/user/progress` - Update progress

## 🔄 Migration from localStorage

When a user signs in for the first time, their existing localStorage data (watchlist and progress) can be migrated to the database.

This happens automatically in the updated providers:

1. User signs in
2. Providers check if user has localStorage data
3. If yes, sync to database
4. From then on, use database as source of truth

## 🌐 Environment Variables Reference

### Required for Authentication

| Variable               | Description            | Example                              |
| ---------------------- | ---------------------- | ------------------------------------ |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID | `123-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret    | `GOCSPX-abc123...`                   |
| `NEXTAUTH_SECRET`      | Random secret key      | Generated 32-char string             |
| `NEXTAUTH_URL`         | App URL                | `http://localhost:3000`              |

### Optional

| Variable      | Description        | Default                             |
| ------------- | ------------------ | ----------------------------------- |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017/vynsera` |
| `NODE_ENV`    | Environment        | `development`                       |

## 📚 Additional OAuth Providers

To add more login options (GitHub, Facebook, etc.):

### GitHub

1. Create OAuth App at https://github.com/settings/developers
2. Add to `src/auth.ts`:

```typescript
import GitHub from "next-auth/providers/github";

providers: [
  Google({...}),
  GitHub({
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
  }),
],
```

3. Add to `.env.local`:

```env
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_secret
```

### Email Magic Link (Passwordless)

1. Add to `src/auth.ts`:

```typescript
import Email from "next-auth/providers/email";

providers: [
  Google({...}),
  Email({
    server: process.env.EMAIL_SERVER,
    from: process.env.EMAIL_FROM,
  }),
],
```

2. Add to `.env.local`:

```env
EMAIL_SERVER=smtp://user:pass@smtp.example.com:587
EMAIL_FROM=noreply@vynsera.com
```

## 🎨 Customization

### Custom Sign-In Page

The sign-in page is at `src/app/auth/signin/SignInClient.tsx`.

Customize:

- Add more providers
- Change button styles
- Add branding
- Add terms of service checkbox

### Session Duration

Edit `src/auth.ts`:

```typescript
session: {
  strategy: "database",
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60,    // Update every 24 hours
},
```

### Callbacks

Add custom logic in `src/auth.ts`:

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    // Custom logic before sign in
    return true; // Allow sign in
  },
  async session({ session, user }) {
    // Add custom data to session
    session.user.id = user.id;
    return session;
  },
},
```

## ✅ Testing Checklist

Before going live:

- [ ] Google OAuth credentials created
- [ ] All environment variables set
- [ ] NEXTAUTH_SECRET is secure (32+ characters)
- [ ] Callback URLs match exactly
- [ ] MongoDB connection working
- [ ] Test sign in flow
- [ ] Test sign out flow
- [ ] Test watchlist sync
- [ ] Test progress sync
- [ ] Test on mobile
- [ ] Test in production environment

## 🎓 User Benefits

Authenticated users get:

- ✅ **Cloud backup** - never lose progress
- ✅ **Cross-device sync** - seamless experience
- ✅ **Faster experience** - personalized recommendations (future)
- ✅ **Community features** - comments, ratings (future)
- ✅ **Advanced analytics** - detailed insights (future)

Anonymous users can still:

- ✅ Browse all resources
- ✅ View roadmap
- ✅ Use watchlist (localStorage)
- ✅ Track progress (localStorage)
- ✅ All core features available

---

## 🚀 You're All Set!

Follow the steps above to enable Google authentication. Users will be able to sign in and sync their data across devices!

For questions or issues, check the troubleshooting section or review the NextAuth.js documentation: https://authjs.dev/
