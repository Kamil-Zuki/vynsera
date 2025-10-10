# Authentication Requirements

## 🔐 **Protected Features**

The following features are **only available to authenticated users**:

### **1. Roadmap** (`/roadmap`)

- ❌ **Not authenticated**: Shows sign-in required message
- ✅ **Authenticated**: Full access to roadmap with progress tracking

### **2. Watchlist** (`/watchlist`)

- ❌ **Not authenticated**: Shows sign-in required message
- ✅ **Authenticated**: Full access to saved resources

### **3. Bookmark Button**

- ❌ **Not authenticated**: Bookmark button hidden on resource cards
- ✅ **Authenticated**: Bookmark button visible and functional

---

## 🌐 **Public Features**

These features are **available to everyone** (no authentication required):

### **1. Home Page** (`/`)

- ✅ View welcome message
- ✅ See feature overview
- ✅ Browse stats

### **2. Search** (`/search`)

- ✅ Search all resources
- ✅ Filter by level, category, free/paid
- ✅ View resource details
- ❌ Cannot bookmark resources (need to sign in)

---

## 🎯 **User Experience**

### **Not Authenticated:**

**Navigation:**

```
┌────────────────────────────────────────────────┐
│  Vynsera    Home    Search         [Sign In]  │
└────────────────────────────────────────────────┘
```

- ✅ Can see: Home, Search
- ❌ Hidden: Roadmap, Watchlist

**When clicking protected pages:**

```
┌──────────────────────────────────────────┐
│            🔒                             │
│                                           │
│      Sign In Required                    │
│                                           │
│  Please sign in with your Google         │
│  account to access this feature.         │
│  Your data will be synced across         │
│  all devices.                            │
│                                           │
│      [Sign In with Google]               │
└──────────────────────────────────────────┘
```

**On resource cards:**

```
┌────────────────────────────────────────┐
│  Resource Title                    [↗] │
│  Category · Level · Free               │
│                                        │
│  Description of the resource...        │
│                                        │
│  #tag1  #tag2  #tag3                   │
└────────────────────────────────────────┘
```

- ❌ No bookmark button
- ✅ Can still click to visit resource

---

### **Authenticated:**

**Navigation:**

```
┌─────────────────────────────────────────────────────────┐
│  Vynsera  Home  Roadmap  Search  Watchlist(3)  [👤]    │
└─────────────────────────────────────────────────────────┘
```

- ✅ All features visible
- ✅ Watchlist shows count
- ✅ Profile menu with sign out

**On resource cards:**

```
┌────────────────────────────────────────┐
│  Resource Title              [🔖] [↗] │
│  Category · Level · Free               │
│                                        │
│  Description of the resource...        │
│                                        │
│  #tag1  #tag2  #tag3                   │
└────────────────────────────────────────┘
```

- ✅ Bookmark button visible
- ✅ Click to add/remove from watchlist
- ✅ Syncs to MongoDB

**Full access to:**

- ✅ Complete roadmap with visual flowchart
- ✅ Progress tracking (synced to cloud)
- ✅ Watchlist (synced to cloud)
- ✅ All data accessible from any device

---

## 📱 **Implementation Details**

### **1. Page-Level Guards**

**Roadmap Page:**

```typescript
// src/app/roadmap/RoadmapPageClient.tsx
const { data: session, status } = useSession();

if (status === "loading") {
  return <LoadingSpinner />;
}

if (status === "unauthenticated") {
  return <SignInRequired />;
}

// Render roadmap for authenticated users
```

**Watchlist Page:**

```typescript
// src/app/watchlist/WatchlistPageClient.tsx
const { data: session, status } = useSession();

if (status === "loading") {
  return <LoadingSpinner />;
}

if (status === "unauthenticated") {
  return <SignInRequired />;
}

// Render watchlist for authenticated users
```

### **2. Navigation Filtering**

```typescript
// src/components/Navigation.tsx
const allNavigationItems = [
  { label: "Home", href: "/", requiresAuth: false },
  { label: "Roadmap", href: "/roadmap", requiresAuth: true },
  { label: "Search", href: "/search", requiresAuth: false },
  { label: "Watchlist", href: "/watchlist", requiresAuth: true },
];

// Only show items user has access to
const navigationItems = allNavigationItems.filter(
  (item) => !item.requiresAuth || status === "authenticated"
);
```

### **3. Component-Level Guards**

```typescript
// src/components/ResourceCard.tsx
const { status } = useSession();
const isAuthenticated = status === "authenticated";

{
  isAuthenticated && (
    <button onClick={handleWatchlistClick}>
      <Bookmark />
    </button>
  );
}
```

---

## 🔄 **Data Flow**

### **Anonymous User:**

```
Browse → Search resources → View details
                           ↓
                    [Cannot bookmark]
                           ↓
                    Click "Roadmap"
                           ↓
                    Redirected to sign in
```

### **Authenticated User:**

```
Sign in → Browse → Search resources
                           ↓
                    Bookmark resources
                           ↓
                    Synced to MongoDB
                           ↓
        Available on all devices
```

---

## ✅ **Benefits**

### **For Users:**

1. **Clear expectations** - Know what requires sign in
2. **No data loss** - Can't use features that need sync without account
3. **Seamless onboarding** - Can explore public features first
4. **Value proposition** - See why signing in is beneficial

### **For Platform:**

1. **User accounts** - Know who's using the platform
2. **Data persistence** - All user data safely stored
3. **Engagement** - Users invest in their progress
4. **Quality control** - Prevent abuse of features

---

## 🎨 **User Journey**

### **Discovery → Sign Up → Active User**

**Step 1: Discovery (No Auth)**

```
Visitor lands on homepage
     ↓
Explores search page
     ↓
Finds useful resources
     ↓
Clicks external links
     ↓
Tries to bookmark → "Sign in required"
     ↓
Sees value in creating account
```

**Step 2: Sign Up**

```
Clicks "Sign In"
     ↓
Authenticates with Google (quick!)
     ↓
Returns to homepage
     ↓
Sees new nav items: Roadmap, Watchlist
```

**Step 3: Active User**

```
Bookmarks resources
     ↓
Tracks progress on roadmap
     ↓
Data syncs to cloud
     ↓
Accesses from phone, tablet, desktop
     ↓
Never loses progress ✅
```

---

## 🔒 **Security Benefits**

By requiring authentication:

1. **Prevents spam** - Can't abuse bookmark/progress features
2. **Rate limiting** - Can track usage per user
3. **Data integrity** - Each user's data isolated
4. **Accountability** - Know who created what data
5. **Terms of Service** - Users agree to ToS when signing in

---

## 📊 **What's Protected vs Public**

| Feature                | Public              | Authenticated       |
| ---------------------- | ------------------- | ------------------- |
| **Homepage**           | ✅ View             | ✅ View             |
| **Search**             | ✅ Search & View    | ✅ Search & View    |
| **Resource Details**   | ✅ View             | ✅ View             |
| **External Links**     | ✅ Click            | ✅ Click            |
| **Bookmark Resources** | ❌ No               | ✅ Yes + Cloud Sync |
| **Watchlist Page**     | ❌ Sign In Required | ✅ Full Access      |
| **Roadmap**            | ❌ Sign In Required | ✅ Full Access      |
| **Progress Tracking**  | ❌ No               | ✅ Yes + Cloud Sync |
| **Multi-Device Sync**  | ❌ No               | ✅ Yes              |

---

## 🎯 **Summary**

**Before (Not Authenticated):**

- Can explore and search
- Can read resource descriptions
- Can visit external links
- **Cannot** save or track progress

**After (Authenticated):**

- Everything from before
- **Plus** bookmark resources
- **Plus** access roadmap
- **Plus** track progress
- **Plus** cloud sync across devices

**Sign in unlocks the full learning experience!** 🚀
