# Authentication & Cloud Sync Guide

## 🎉 How It Works

Vynsera now syncs your watchlist and progress to the cloud when you're logged in with Google!

---

## 📊 **Data Sync Behavior**

### **Not Logged In** (Default)

- 💾 **Watchlist** → Saved to localStorage (browser only)
- 📈 **Progress** → Saved to localStorage (browser only)
- 📱 **One device** → Data stays on that browser
- 🔄 **No sync** → Each device/browser is separate

### **Logged In with Google** ✨

- ☁️ **Watchlist** → Synced to MongoDB (cloud database)
- 📊 **Progress** → Synced to MongoDB (cloud database)
- 🌐 **All devices** → Data accessible everywhere
- 🔄 **Auto-sync** → Changes save automatically
- 💾 **Backup** → Still saves to localStorage too

---

## 🔄 **How Sync Works**

### **When You Sign In:**

```
1. Click "Sign In" → Google OAuth flow
   ↓
2. Authentication successful
   ↓
3. Providers check localStorage for existing data
   ↓
4. If localStorage has data:
   - Merge with database data
   - Sync to MongoDB
   ↓
5. Load combined data from database
   ↓
6. You're synced! ✅
```

### **When You Make Changes:**

**Add to Watchlist:**

```
Click bookmark
   ↓
Update React state (instant UI update)
   ↓
Save to localStorage (backup)
   ↓
If logged in: POST to /api/user/watchlist (background)
   ↓
MongoDB updated ✅
```

**Mark Step Complete:**

```
Toggle progress
   ↓
Update React state (instant UI update)
   ↓
Save to localStorage (backup)
   ↓
If logged in: POST to /api/user/progress (background)
   ↓
MongoDB updated ✅
```

### **When You Open on Another Device:**

```
Open app
   ↓
Sign in with Google (same account)
   ↓
Fetch watchlist from: GET /api/user/watchlist
   ↓
Fetch progress from: GET /api/user/progress
   ↓
Local state populated from database
   ↓
See all your data! 🎉
```

---

## 🎯 **Test the Sync**

### **Quick Test (1 minute):**

1. **Start logged OUT** on your computer

   - Add 2-3 resources to watchlist (localStorage)
   - Complete 1-2 roadmap steps (localStorage)

2. **Sign in with Google**

   - Your localStorage data uploads to MongoDB
   - Data is now in the cloud ✅

3. **Open incognito/private window**

   - Go to http://localhost:3000
   - Sign in with same Google account
   - See all your watchlist and progress! 🎉

4. **Add more resources** in incognito
   - Close incognito window
   - Refresh your original window
   - New resources appear! (synced)

### **Multi-Device Test:**

1. **On your computer**:

   - Sign in
   - Add to watchlist
   - Complete some steps

2. **On your phone**:
   - Open http://192.168.1.69:3000 (your network address)
   - Sign in with same Google account
   - See everything synced! 📱✅

---

## 💾 **Data Storage Locations**

### Not Authenticated:

| Data      | Storage      | Persistent?      | Cross-Device? |
| --------- | ------------ | ---------------- | ------------- |
| Watchlist | localStorage | ✅ (per browser) | ❌            |
| Progress  | localStorage | ✅ (per browser) | ❌            |

### Authenticated:

| Data      | Primary Storage | Backup       | Cross-Device? |
| --------- | --------------- | ------------ | ------------- |
| Watchlist | MongoDB         | localStorage | ✅            |
| Progress  | MongoDB         | localStorage | ✅            |

---

## 🔐 **Privacy & Security**

### **What Data is Stored:**

**In MongoDB (when logged in):**

- ✅ Google account info (name, email, profile picture)
- ✅ Your watchlist (array of resource IDs)
- ✅ Your progress (array of completed step IDs)
- ✅ Preferences (language, theme)
- ✅ Last active timestamp
- ❌ **NO passwords** (OAuth only)
- ❌ **NO personal data** beyond what Google provides
- ❌ **NO tracking or analytics** without consent

**In localStorage (always):**

- ✅ Watchlist backup
- ✅ Progress backup
- ✅ Language preference
- ✅ Theme preference

### **Security Features:**

- 🔒 **OAuth 2.0** - Industry standard
- 🔐 **Secure sessions** - Stored in MongoDB
- 🍪 **HTTP-only cookies** - Can't be accessed by JavaScript
- 🛡️ **CSRF protection** - Built into NextAuth
- 🔑 **Secret key** - 256-bit encryption
- ✅ **No password storage** - We never see your Google password

---

## 🎨 **User Experience**

### **Seamless Transition:**

```
Visitor (no account)
   ↓
Browsing resources, adding to watchlist
   ↓
Decides to sign in
   ↓
[Signs in with Google]
   ↓
All localStorage data automatically syncs!
   ↓
Logged-in user with cloud backup ✅
```

### **Multi-Device Journey:**

```
Morning: Phone → Add resources to watchlist
   ↓
Afternoon: Desktop → See resources from phone
   ↓
Evening: Tablet → Complete roadmap steps
   ↓
Next day: All devices → Progress synced everywhere!
```

---

## 🔧 **For Developers**

### **How to Access User Data:**

```typescript
// In any client component
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") {
    console.log("User:", session.user.name);
    console.log("Email:", session.user.email);
    console.log("ID:", session.user.id);
  }

  // Providers handle sync automatically!
  const { watchlist } = useWatchlist(); // Auto-synced
  const { completedSteps } = useProgress(); // Auto-synced
}
```

### **API Endpoints:**

```typescript
// Get user's watchlist
GET /api/user/watchlist
Response: { watchlist: string[] }

// Update watchlist
POST /api/user/watchlist
Body: { watchlist: string[] }
Response: { success: true, watchlist: string[] }

// Get user's progress
GET /api/user/progress
Response: { completedSteps: string[] }

// Update progress
POST /api/user/progress
Body: { completedSteps: string[] }
Response: { success: true, completedSteps: string[] }
```

### **Database Schema:**

```typescript
// User model (MongoDB)
{
  _id: ObjectId,
  name: string,
  email: string,          // Unique, from Google
  image: string,          // Profile picture URL
  emailVerified: Date,    // If email verified
  watchlist: string[],    // Resource IDs
  completedSteps: string[], // Roadmap step IDs
  preferences: {
    language: "en" | "ko",
    theme: "light" | "dark"
  },
  lastActive: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## ⚡ **Performance**

### **Sync is Fast:**

- 🚀 **Instant UI updates** - React state updates immediately
- ⏱️ **Background sync** - Database saves in background
- 📦 **Small payloads** - Only arrays of IDs
- 🔄 **Debounced** - Multiple changes batched together
- 💾 **localStorage fallback** - Works even if API fails

### **Optimizations:**

- Only syncs when authenticated
- Only syncs when data actually changes
- localStorage provides instant access
- Database provides persistence

---

## 🐛 **Troubleshooting**

### **Data Not Syncing?**

**Check authentication:**

```javascript
// In browser console
console.log(window.localStorage.getItem("korean-watchlist"));
// Should show your watchlist
```

**Check database:**

```bash
# In terminal
docker exec vynsera-mongodb-1 mongosh vynsera --eval "db.users.find().pretty()"
```

### **Lost Data After Login?**

This shouldn't happen! Both localStorage and database are checked.

If it does:

1. Check browser console for errors
2. Check MongoDB connection
3. Verify API endpoints return 200
4. Check .env.local has all variables

### **Different Data on Different Devices?**

Make sure:

- ✅ Signed in with same Google account
- ✅ Internet connection working
- ✅ No VPN blocking requests
- ✅ MongoDB is accessible

---

## 📝 **Best Practices**

### **For Users:**

1. **Sign in early** - Don't lose your progress!
2. **One Google account** - Use same account everywhere
3. **Stay signed in** - Session lasts 30 days
4. **Don't clear cookies** - Or you'll need to sign in again

### **For Developers:**

1. **Always check session status** before syncing
2. **Use localStorage as fallback** - App works offline
3. **Handle errors gracefully** - Network can fail
4. **Don't block UI** - Sync in background
5. **Test both states** - logged in and logged out

---

## 🎯 **Next Steps**

Now that sync is working, you can:

1. ✅ **Test it thoroughly** - Try all scenarios
2. ✅ **Deploy to production** - Same setup, different domain
3. ✅ **Add more features**:
   - User preferences (save theme/language choice)
   - Study streaks (track daily logins)
   - Activity history (what resources you've viewed)
   - Custom roadmaps (save personalized learning paths)
   - Study timer data (track time spent learning)

---

## 🌟 **The Magic:**

**Before:**

- One device, one browser
- Clear cookies = lose everything
- Can't switch devices easily

**After:**

- All devices, same data
- Sign in anywhere = instant access
- Never lose progress
- Seamless experience

---

**Your data, everywhere you need it!** ☁️✨
