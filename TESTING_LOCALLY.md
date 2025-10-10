# Testing Google Authentication Locally

## ✅ **No Domain or Hosting Needed!**

You can test Google OAuth on `localhost` during development. Only need a domain when deploying to production.

---

## 🔧 **Setup Google OAuth for Localhost (One-Time)**

### **Step 1: Go to Google Cloud Console**

Open: https://console.cloud.google.com/apis/credentials

### **Step 2: Find Your OAuth Client**

Look for your OAuth 2.0 Client ID:

- **Client ID**: `546192084855-i6o5glqr8go034dfvrg74nns477fklvi`

Click on it to edit.

### **Step 3: Add Localhost URLs**

#### **Authorized JavaScript origins:**

```
http://localhost:3000
http://127.0.0.1:3000
```

#### **Authorized redirect URIs:**

```
http://localhost:3000/api/auth/callback/google
http://127.0.0.1:3000/api/auth/callback/google
```

**Screenshot example:**

```
┌─────────────────────────────────────────────────────┐
│ Authorized JavaScript origins                        │
├─────────────────────────────────────────────────────┤
│ URIs 1   http://localhost:3000              [×]     │
│ URIs 2   http://127.0.0.1:3000              [×]     │
│                                              [+ ADD] │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Authorized redirect URIs                             │
├─────────────────────────────────────────────────────┤
│ URIs 1   http://localhost:3000/api/auth/callback... │
│ URIs 2   http://127.0.0.1:3000/api/auth/callback... │
│                                              [+ ADD] │
└─────────────────────────────────────────────────────┘
```

### **Step 4: Save**

Click **"SAVE"** at the bottom of the page.

---

## 🧪 **Test Right Now**

### **Your app is already running!**

```
http://localhost:3000
```

### **Test Steps:**

1. **Open:** http://localhost:3000
2. **Click:** "Sign In" button (top-right)
3. **Click:** "Continue with Google"
4. **Select:** Your Google account
5. **Done!** You'll be redirected back, logged in ✅

---

## 🎯 **What You'll See**

### **Before Login:**

```
┌──────────────────────────────────────┐
│  Vynsera    Home  Roadmap  Search   [Sign In] │
└──────────────────────────────────────┘
```

### **After Login:**

```
┌──────────────────────────────────────────────────┐
│  Vynsera    Home  Roadmap  Search   [Profile Pic] │
│                                                   │
│  Click profile → See your name, email            │
│                  + "Sign Out" button             │
└──────────────────────────────────────────────────┘
```

### **Now Your Data Syncs:**

- ✅ Add to watchlist → Saves to MongoDB
- ✅ Complete roadmap step → Saves to MongoDB
- ✅ Open on another device → Same data!

---

## 🌐 **Testing on Your Phone (Same WiFi)**

Your app is also accessible from your phone!

```
http://192.168.1.69:3000
```

**On your phone:**

1. Connect to same WiFi as your computer
2. Open: http://192.168.1.69:3000
3. Sign in with Google
4. See all your synced data! 📱✅

---

## 🚫 **Common Errors & Fixes**

### **Error: "redirect_uri_mismatch"**

**Problem:**

```
Error 400: redirect_uri_mismatch
The redirect URI in the request: http://localhost:3000/api/auth/callback/google
does not match the ones authorized for the OAuth client.
```

**Fix:**

1. Go to Google Cloud Console
2. Make sure you added: `http://localhost:3000/api/auth/callback/google`
3. Click SAVE (don't forget this!)
4. Wait 30 seconds for changes to propagate
5. Try again

---

### **Error: "Access blocked: This app is not verified"**

**This is NORMAL for development!**

**You'll see:**

```
┌────────────────────────────────────────┐
│  This app isn't verified                │
│                                         │
│  This app hasn't been verified by      │
│  Google yet. Only proceed if you       │
│  know and trust the developer.         │
│                                         │
│  [Go back]  [Advanced] ▼               │
└────────────────────────────────────────┘
```

**To continue:**

1. Click **"Advanced"** at the bottom left
2. Click **"Go to Vynsera (unsafe)"**
3. This is YOUR app, so it's safe!
4. You won't see this for accounts you add as test users

**To avoid this warning:**

- Go to Google Cloud Console
- APIs & Services → OAuth consent screen
- Add your Google account as a "Test user"
- Now you won't see the warning!

---

## 📊 **Verify It's Working**

### **1. Check Browser DevTools**

Open DevTools (F12) → Console:

```javascript
// You should see:
GET /api/auth/session 200
```

### **2. Check MongoDB**

```bash
docker exec vynsera-mongodb-1 mongosh vynsera --eval "db.users.find().pretty()"
```

You should see your user:

```json
{
  "_id": ObjectId("..."),
  "name": "Your Name",
  "email": "you@gmail.com",
  "image": "https://lh3.googleusercontent.com/...",
  "emailVerified": null,
  "watchlist": [],
  "completedSteps": []
}
```

### **3. Test Sync**

1. Add a resource to watchlist (bookmark icon)
2. Check MongoDB again:

```bash
docker exec vynsera-mongodb-1 mongosh vynsera --eval "db.users.findOne({}, {watchlist:1})"
```

Should show:

```json
{
  "watchlist": ["resource-id-here"]
}
```

---

## 🎨 **Development vs Production**

### **Development (Now):**

- ✅ Uses `http://localhost:3000`
- ✅ No domain needed
- ✅ Free!
- ✅ Test everything locally
- ⚠️ May show "unverified app" warning
- ⚠️ Only you can access it

### **Production (Later):**

- 🌐 Uses your domain: `https://vynsera.com`
- 💰 Needs domain (~$10-15/year)
- 💰 Needs hosting (free options available!)
- 📝 Update Google OAuth URLs to production domain
- ✅ No "unverified" warnings after verification
- 🌍 Everyone can access it

---

## 🚀 **When You're Ready for Production**

You'll need to:

1. **Buy a domain** (~$10-15/year)

   - Namecheap, Google Domains, etc.

2. **Deploy to hosting** (free options!)

   - Vercel (recommended, free for hobby)
   - Railway (free tier available)
   - DigitalOcean ($5/month)

3. **Update Google OAuth:**

   ```
   https://yourdomain.com
   https://yourdomain.com/api/auth/callback/google
   ```

4. **Update .env.local:**
   ```
   NEXTAUTH_URL=https://yourdomain.com
   ```

**But for now, just use localhost!** 🎉

---

## ✅ **Quick Checklist**

**Before testing:**

- [ ] Google OAuth Client created ✅ (You have this)
- [ ] Client ID & Secret in `.env.local` ✅ (You have this)
- [ ] Localhost URLs added to Google Console ⚠️ (Do this now)
- [ ] MongoDB running ✅ (It's running)
- [ ] Dev server running ✅ (It's running)

**Ready to test:**

- [ ] Open http://localhost:3000
- [ ] Click "Sign In"
- [ ] Click "Continue with Google"
- [ ] Success! ✅

---

## 🎯 **Summary**

**Question:** Do I need a domain and hosting to test?
**Answer:** **NO!** Use `localhost` for free testing.

**Only need domain when:**

- You want others to use your app
- You want to deploy publicly
- You're ready for production

**For now:**
Just add the localhost URLs to Google Console and test immediately! 🚀
