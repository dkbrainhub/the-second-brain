---
title: Google OAuth Setup Guide
sidebar_position: 5
displayed_sidebar: technologySidebar
tags:
  - oauth
  - authentication
  - google
  - security
  - frontend
  - backend
description: Complete guide to implementing Google OAuth 2.0 authentication for web applications — both frontend-only and backend approaches with step-by-step setup.
---

# Google OAuth Setup Guide

Google OAuth is one of the easiest ways to add authentication to your app. Let users sign in with their Google account without you managing passwords! 🔐

> **The Core Idea:** Instead of you storing user passwords (risky), Google handles verification. You get a token proving the user is legitimate.

---

## 🎯 Quick Comparison: Frontend vs Backend OAuth

| Aspect | Frontend-Only 📱 | Backend 🖥️ |
|--------|------------------|-----------|
| **Complexity** | Simple ⭐ | Medium ⭐⭐⭐ |
| **Security** | Good for unprotected apps | Best for protected content |
| **User Data** | Browser localStorage | Server database |
| **Cost** | Free | Requires server |
| **Best For** | Public docs, analytics tracking | Protected sites, sensitive data |
| **Example Use Cases** | Docusaurus, public blogs | SaaS, private content |

---

## 🏗️ Architecture Analogy

### Frontend-Only (Like a Car Rental with Self-Service)
```
User → Google (gets verified) → User gets key (token) → 
Access your app (no server needed)
```
**Simple, but you trust the user to use the key properly.**

### Backend (Like a Car Rental with Attendant)
```
User → Google → Your Backend Server (verifies token) → 
Backend gives confirmed access → User accesses app
```
**Safer, because your server double-checks everything.**

---

# 🚀 QUICKSTART: Frontend-Only OAuth

Perfect for **Docusaurus sites, public docs, or apps where you just want to track who's reading**.

## Step 1️⃣: Set Up Google Cloud Project

### 1. Create a New Project
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Click **"Select a Project"** → **"NEW PROJECT"**
- Enter name: `second-brain` (or your app name)
- Click **Create** and wait

### 2. Enable Google+ API
- In the console, search for **"Google+ API"**
- Click on it and press **ENABLE**

### 3. Create OAuth 2.0 Credentials

**First, configure the consent screen:**
1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (if you want anyone to log in)
3. Fill in:
   - **App name:** "The Second Brain"
   - **User support email:** your@email.com
   - **Developer contact info:** your@email.com
4. Click **Save and Continue** → **Save and Continue** → **Back to Dashboard**

**Then, create your Client ID:**
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Name it: `Frontend App`
5. Add these **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://second-brain.dkbrainhub.com
   ```
6. Add these **Authorized redirect URIs:**
   ```
   http://localhost:3000
   https://second-brain.dkbrainhub.com
   ```
7. Click **Create** and **Copy your Client ID** (save it!)

### 🔑 Your Credentials:
```
CLIENT_ID = "YOUR_CLIENT_ID_ENDING_IN.apps.googleusercontent.com"
```

---

## Step 2️⃣: Install Dependencies

```bash
npm install @react-oauth/google
```

---

## Step 3️⃣: Add Google Provider to Your App

In **`docusaurus.config.ts`**, wrap your app with Google OAuth provider:

```typescript
// At the top
import { GoogleOAuthProvider } from '@react-oauth/google';

const config: Config = {
  // ... rest of config
};

// Wrap the app docs in your presets with GoogleOAuthProvider
// But for Docusaurus, we'll create a wrapper component instead
```

Better approach for **Docusaurus** - create a wrapper:

Create **`src/theme/Root.tsx`**:

```tsx
import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import RootComponent from '@theme-original/Root';
import type { Props } from '@theme/Root';

export default function Root(props: Props): JSX.Element {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <RootComponent {...props} />
    </GoogleOAuthProvider>
  );
}
```

---

## Step 4️⃣: Create Login Component

Create **`src/components/GoogleLogin.tsx`**:

```tsx
import React, { useState, useEffect } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import styles from './GoogleLogin.module.css';

interface User {
  name: string;
  email: string;
  picture: string;
}

const GoogleLoginComponent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleSuccess = (credentialResponse: any) => {
    try {
      // Decode the JWT token
      const decoded: any = jwtDecode(credentialResponse.credential);
      
      const userData: User = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      };

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('loginTime', new Date().toISOString());
      
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    setUser(null);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className={styles.loginContainer}>
        <h2>Welcome to The Second Brain 📚</h2>
        <p>Sign in to track your reading progress</p>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.error('Login failed')}
        />
        <hr />
        <button className={styles.guestBtn} onClick={() => {
          localStorage.setItem('isGuest', 'true');
          setIsLoggedIn(true);
        }}>
          Continue as Guest
        </button>
      </div>
    );
  }

  return (
    <div className={styles.userProfile}>
      {user && (
        <>
          <img src={user.picture} alt={user.name} className={styles.avatar} />
          <span>Welcome, {user.name}!</span>
        </>
      )}
      {localStorage.getItem('isGuest') && <span>Guest Mode</span>}
      <button onClick={handleLogout} className={styles.logoutBtn}>
        Logout
      </button>
    </div>
  );
};

export default GoogleLoginComponent;
```

---

## Step 5️⃣: Create Protected Route Wrapper

Create **`src/components/ProtectedDocs.tsx`**:

```tsx
import React, { useEffect, useState } from 'react';
import GoogleLoginComponent from './GoogleLogin';
import styles from './ProtectedDocs.module.css';

interface ProtectedDocsProps {
  children: React.ReactNode;
}

const ProtectedDocs: React.FC<ProtectedDocsProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    const isGuest = localStorage.getItem('isGuest');
    setIsAuthenticated(!!(user || isGuest));
  }, []);

  if (!isAuthenticated) {
    return (
      <div className={styles.gateContainer}>
        <GoogleLoginComponent />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedDocs;
```

---

## Step 6️⃣: Add Environment Variable

Create **`.env.example`**:
```
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

Create **`.env.local`** (ignored by git):
```
REACT_APP_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID
```

Update **`.gitignore`**:
```
.env.local
```

---

## Step 7️⃣: Track Reading Activity

Add to your **`ReadAloud.tsx`** component:

```tsx
// Track reading page
useEffect(() => {
  const user = localStorage.getItem('user');
  if (user) {
    const activity = {
      page: document.title,
      timestamp: new Date().toISOString(),
      timeSpent: elapsedTime,
    };
    
    // Save to localStorage
    const activities = JSON.parse(localStorage.getItem('readingActivity') || '[]');
    activities.push(activity);
    localStorage.setItem('readingActivity', JSON.stringify(activities));
  }
}, []);
```

---

# 🖥️ ADVANCED: Backend OAuth

Use this when you need:
- ✅ Protected content only authenticated users can see
- ✅ Server-side verification of tokens
- ✅ Persistent data storage
- ✅ Advanced analytics

## Backend Architecture

```
Frontend                    Backend Server
   |                             |
   | 1. User clicks "Login"      |
   | ────────────────────────►   |
   |                             | 2. Redirects to Google
   |                             | 3. Google redirects back with code
   |                             | 4. Backend exchanges code for token
   |                             | 5. Backend verifies token
   |                             | 6. Creates session
   | ◄────────────────────────   |
   | 7. User gets session        |
   |                             |
```

### Backend Setup (Node.js + Express)

**Install dependencies:**
```bash
npm install express express-session google-auth-library axios cors
```

**Create `pages/api/auth.ts`:**

```typescript
import { google } from 'googleapis';
import express from 'express';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

// Generate login URL
app.get('/api/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
  });
  res.redirect(authUrl);
});

// Handle callback
app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    // Store tokens and create session
    res.redirect('/'); // Redirect to home
  } catch (error) {
    res.status(400).json({ error: 'Authentication failed' });
  }
});
```

---

## 🎓 Key Concepts Explained

### **What's a JWT Token?**
A token is like a **sealed envelope** with user info inside.
- **Sealed by:** Google (their signature)
- **Contains:** User's name, email, picture
- **Verified by:** Your app (check the signature)
- **Valid for:** About 1 hour

### **ID Token vs Access Token?**
- **ID Token:** "This is who the user is" (for login)
- **Access Token:** "User gave me permission to access their data" (for API calls)

For simple login, you only need the **ID Token**.

### **What's Client Secret for (Backend)?**
The secret is like your **master key**. 
- Keep it **SECRET** (never share!)
- Only your backend should have it
- Used to exchange authorization code for tokens

---

## 🔒 Security Best Practices

| ✅ DO | ❌ DON'T |
|------|---------|
| Store tokens in secure cookies (httpOnly) | Put tokens in URL |
| Verify token signature server-side | Trust tokens without verification |
| Set short token expiration (1 hour) | Use long-lived tokens |
| Refresh tokens securely | Hardcode credentials in code |
| Use HTTPS in production | Send credentials over HTTP |
| Validate redirect URLs strictly | Allow any redirect URL |

---

## 🐛 Troubleshooting

### **"Invalid Client ID"**
- ✅ Check you copied the full Client ID (includes `.apps.googleusercontent.com`)
- ✅ Verify environment variable is loaded

### **"Redirect URI mismatch"**
- ✅ Ensure exact match in Google Cloud Console
- ✅ Include protocol (`http://` or `https://`)
- ✅ No trailing slashes unless you added them in Google

### **Token won't decode**
- ✅ Use `jwtDecode` library: `npm install jwt-decode`
- ✅ Token has 3 parts: `header.payload.signature`

### **User data not persisting**
- ✅ Check localStorage is enabled
- ✅ Browser isn't in private mode
- ✅ No quota exceeded

---

## 📚 Resources

- [Google OAuth Playground](https://developers.google.com/oauthplayground/)
- [Google Sign-In Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google Package](https://www.npmjs.com/package/@react-oauth/google)
- [JWT Decoder Online](https://jwt.io/)

---

## 🚀 Next Steps

1. ✅ Set up Google Cloud Project
2. ✅ Add Google OAuth to your app
3. ✅ Create login/logout UI
4. ✅ Track user activity in localStorage
5. ✅ (Optional) Move to backend for better security

**Ready to implement?** Start with Frontend OAuth — it's quick and works great for public sites! 🎯
