---
title: API Authentication Techniques
sidebar_position: 4
displayed_sidebar: technologySidebar
tags:
  - api
  - authentication
  - security
  - oauth
  - jwt
description: Complete guide to API authentication methods with simple analogies — API Keys, OAuth 2.0, JWT, Basic Auth, and more explained for quick understanding.
---

# API Authentication Techniques

Understanding API authentication doesn't have to be complicated! 🔐 This guide explains each method with real-world analogies so you can quickly grasp the concepts and know when to use each one.

> **What is API Authentication?** It's how an API verifies "who you are" before letting you access data or perform actions — like showing your ID before entering a secure building.

---

## 🎯 Quick Comparison Table

| Method | Security Level | Best For | Analogy |
|--------|---------------|----------|---------|
| **API Key** | ⭐⭐ Basic | Simple apps, internal services | Library card |
| **Basic Auth** | ⭐ Low | Quick prototypes, internal tools | Username/password at a gate |
| **Bearer Token** | ⭐⭐⭐ Good | Stateless authentication | Movie ticket |
| **JWT** | ⭐⭐⭐⭐ High | Modern web/mobile apps | Sealed envelope with ID |
| **OAuth 2.0** | ⭐⭐⭐⭐⭐ Highest | Third-party access, social login | Valet parking key |
| **mTLS** | ⭐⭐⭐⭐⭐ Highest | Service-to-service, banking | Two-way ID verification |

---

## 🔑 API Key Authentication

### The Analogy: Library Card 📚

**Think of it like a library card.** You get a unique card (API key) when you sign up. Every time you want to borrow books (access API), you show your card. The library doesn't verify WHO you are each time — they just check if the card is valid.

### How It Works

```
Client                              Server
  |                                   |
  |  Request + API Key in header      |
  |  ─────────────────────────────►   |
  |                                   |
  |  "Is this key valid?"             |
  |                                   |
  |  ◄─────────────────────────────   |
  |  Response (if key valid)          |
```

### Implementation

```bash
# In HTTP Header (most common)
GET /api/users HTTP/1.1
Host: api.example.com
X-API-Key: abc123def456ghi789

# In Query Parameter (less secure)
GET /api/users?api_key=abc123def456ghi789

# In Request Body
POST /api/users
Content-Type: application/json
{
  "api_key": "abc123def456ghi789",
  "data": { ... }
}
```

### Pros & Cons

| ✅ Pros | ❌ Cons |
|---------|---------|
| Simple to implement | No user-level permissions |
| Easy to rotate/revoke | If stolen, full access granted |
| Low overhead | No expiration by default |
| Great for server-to-server | Can't identify individual users |

### When to Use

- ✅ Internal microservices communication
- ✅ Public APIs with rate limiting
- ✅ Simple third-party integrations
- ❌ User-specific data access
- ❌ Mobile apps (keys can be extracted)

---

## 👤 Basic Authentication

### The Analogy: Username & Password at a Gate 🚪

**Like telling your name and password to a security guard every time you enter.** Simple, but you're repeating sensitive info with every request. The guard checks a list each time — no memory of previous visits.

### How It Works

```
Credentials: username:password
Base64 encoded: dXNlcm5hbWU6cGFzc3dvcmQ=

Client                              Server
  |                                   |
  |  Authorization: Basic [base64]    |
  |  ─────────────────────────────►   |
  |                                   |
  |  Decode → Verify credentials      |
  |                                   |
  |  ◄─────────────────────────────   |
  |  Response                         |
```

### Implementation

```bash
# HTTP Header
GET /api/users HTTP/1.1
Host: api.example.com
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=

# Using curl
curl -u username:password https://api.example.com/users

# In JavaScript
const credentials = btoa('username:password');
fetch('/api/users', {
  headers: {
    'Authorization': `Basic ${credentials}`
  }
});
```

### Pros & Cons

| ✅ Pros | ❌ Cons |
|---------|---------|
| Very simple | Credentials sent every request |
| Widely supported | Base64 is NOT encryption |
| No state management | Must use HTTPS (critical!) |
| Built into HTTP spec | No token expiration |

### When to Use

- ✅ Quick prototypes
- ✅ Internal tools behind VPN
- ✅ Simple scripts and automation
- ❌ Production public APIs
- ❌ Mobile/web applications

> ⚠️ **Warning:** Base64 is encoding, NOT encryption! Anyone can decode it. Always use HTTPS!

---

## 🎫 Bearer Token Authentication

### The Analogy: Movie Ticket 🎬

**Like a movie ticket.** You buy it once (login), and then show it to get into the theater (access API). The ticket doesn't have your photo — whoever holds it can use it. It has an expiration (show time), after which it's useless.

### How It Works

```
Client                              Server
  |                                   |
  |  Login (username/password)        |
  |  ─────────────────────────────►   |
  |                                   |
  |  ◄─────────────────────────────   |
  |  Here's your token!               |
  |                                   |
  |  Request + Bearer Token           |
  |  ─────────────────────────────►   |
  |                                   |
  |  ◄─────────────────────────────   |
  |  Response                         |
```

### Implementation

```bash
# HTTP Header
GET /api/users HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# Using curl
curl -H "Authorization: Bearer <token>" https://api.example.com/users

# In JavaScript
fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Pros & Cons

| ✅ Pros | ❌ Cons |
|---------|---------|
| Credentials sent only once | Token theft = account access |
| Can have expiration | Server must store/validate tokens |
| Supports token refresh | Extra step to get token first |
| Better than Basic Auth | Stateful (server must track tokens) |

---

## 🎟️ JWT (JSON Web Token)

### The Analogy: Sealed Envelope with Your ID 📧

**Imagine a sealed, tamper-proof envelope containing your ID card.** The envelope is sealed with a special stamp (signature) that only the issuer can create. Anyone can read the ID through the envelope, but no one can change it without breaking the seal. The ID has an expiration date printed on it.

### Structure of a JWT

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.    ← Header (envelope type)
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikp...  ← Payload (your ID info)
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature (seal)

[HEADER].[PAYLOAD].[SIGNATURE]
```

### Parts Explained

```javascript
// Header - Algorithm & Token Type
{
  "alg": "HS256",    // Signing algorithm
  "typ": "JWT"       // Token type
}

// Payload - Claims (the actual data)
{
  "sub": "1234567890",      // Subject (user ID)
  "name": "John Doe",       // Custom claim
  "email": "john@example.com",
  "role": "admin",          // Custom claim
  "iat": 1708099200,        // Issued at
  "exp": 1708185600         // Expiration time
}

// Signature - Verification
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### How It Works

```
Client                              Server
  |                                   |
  |  Login Request                    |
  |  ─────────────────────────────►   |
  |                                   |
  |  Create JWT, sign with secret     |
  |                                   |
  |  ◄─────────────────────────────   |
  |  JWT Token                        |
  |                                   |
  |  Request + JWT in header          |
  |  ─────────────────────────────►   |
  |                                   |
  |  Verify signature, check expiry   |
  |  Read claims from payload         |
  |                                   |
  |  ◄─────────────────────────────   |
  |  Response                         |
```

### Implementation

```javascript
// Server: Creating JWT (Node.js with jsonwebtoken)
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { 
    userId: '123',
    email: 'user@example.com',
    role: 'admin'
  },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Server: Verifying JWT
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decoded.userId); // '123'
} catch (err) {
  console.log('Invalid token');
}

// Client: Using JWT
fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Access Token + Refresh Token Pattern

```
┌─────────────────────────────────────────────────────┐
│                   TOKEN LIFECYCLE                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Login → Access Token (15 min) + Refresh Token (7d) │
│                        │                             │
│                        ▼                             │
│              Use Access Token for API calls          │
│                        │                             │
│                        ▼                             │
│              Access Token Expires                    │
│                        │                             │
│                        ▼                             │
│     Use Refresh Token → Get New Access Token         │
│                        │                             │
│                        ▼                             │
│              Refresh Token Expires                   │
│                        │                             │
│                        ▼                             │
│                  User must login again               │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Pros & Cons

| ✅ Pros | ❌ Cons |
|---------|---------|
| Stateless (no server storage) | Can't revoke before expiration |
| Self-contained (has all info) | Payload is visible (not encrypted) |
| Works across services | Token size can be large |
| Built-in expiration | Must handle refresh logic |
| Scalable | Secret key compromise = disaster |

### When to Use

- ✅ Modern web/mobile applications
- ✅ Microservices architecture
- ✅ Single Sign-On (SSO)
- ✅ Stateless REST APIs
- ❌ Sensitive data in payload (use encryption)
- ❌ When you need instant revocation

---

## 🔐 OAuth 2.0

### The Analogy: Valet Parking Key 🚗

**Think of OAuth like valet parking.** You give the valet a special key (token) that can only start and park your car — it can't open the trunk or glove box. You're not giving them your master key (password). You can revoke the valet key anytime without changing your master key.

### Key Concepts

| Term | What It Is | Analogy |
|------|-----------|---------|
| **Resource Owner** | You (the user) | Car owner |
| **Client** | The app wanting access | Valet service |
| **Authorization Server** | Issues tokens | Valet key machine |
| **Resource Server** | Has the protected data | Your car |
| **Access Token** | Permission to access | Valet key |
| **Refresh Token** | Get new access tokens | Valet key renewal card |
| **Scope** | What can be accessed | "parking only" restriction |

### OAuth 2.0 Flows

#### 1. Authorization Code Flow (Most Secure)

**Best for:** Web apps with backend servers

```
┌──────────┐                              ┌──────────────────┐
│   User   │                              │  Authorization   │
│ (Browser)│                              │     Server       │
└────┬─────┘                              └────────┬─────────┘
     │                                             │
     │  1. Click "Login with Google"               │
     │  ─────────────────────────────────────────► │
     │                                             │
     │  2. Redirect to Google login page           │
     │  ◄───────────────────────────────────────── │
     │                                             │
     │  3. User logs in, grants permission         │
     │  ─────────────────────────────────────────► │
     │                                             │
     │  4. Redirect back with authorization code   │
     │  ◄───────────────────────────────────────── │
     │         │                                   │
     │         ▼                                   │
     │  ┌─────────────┐                            │
     │  │   Your      │  5. Exchange code          │
     │  │   Backend   │     for tokens             │
     │  │   Server    │  ─────────────────────────►│
     │  │             │                            │
     │  │             │  6. Access + Refresh Token │
     │  │             │  ◄─────────────────────────│
     │  └─────────────┘                            │
     │                                             │
```

#### 2. PKCE Flow (For Mobile/SPA)

**Best for:** Mobile apps, Single Page Applications

```
Client generates:
- code_verifier: random string
- code_challenge: SHA256(code_verifier)

1. Auth request includes code_challenge
2. Auth server stores code_challenge
3. Token request includes code_verifier
4. Server verifies: SHA256(code_verifier) === code_challenge
```

#### 3. Client Credentials Flow

**Best for:** Machine-to-machine communication

```
Client (Server)                    Authorization Server
     │                                     │
     │  client_id + client_secret          │
     │  ──────────────────────────────────►│
     │                                     │
     │  Access Token                       │
     │  ◄──────────────────────────────────│
     │                                     │
```

### OAuth 2.0 in Practice

```javascript
// 1. Redirect user to authorization
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
  client_id=${CLIENT_ID}&
  redirect_uri=${REDIRECT_URI}&
  response_type=code&
  scope=email profile&
  state=${randomState}`;

// 2. Exchange code for tokens (backend)
const response = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  body: new URLSearchParams({
    code: authorizationCode,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  })
});

const { access_token, refresh_token, expires_in } = await response.json();

// 3. Use access token to get user info
const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

### Common Scopes

| Provider | Common Scopes |
|----------|---------------|
| **Google** | `email`, `profile`, `openid`, `drive.readonly` |
| **GitHub** | `user`, `repo`, `read:org`, `gist` |
| **Facebook** | `email`, `public_profile`, `user_friends` |
| **Microsoft** | `openid`, `profile`, `email`, `offline_access` |

### Pros & Cons

| ✅ Pros | ❌ Cons |
|---------|---------|
| Doesn't expose user password | Complex to implement |
| Granular permissions (scopes) | Multiple redirects |
| Can revoke access anytime | Requires secure token storage |
| Industry standard | Many flows to understand |
| Works with third-party apps | Depends on auth server uptime |

---

## 🔒 mTLS (Mutual TLS)

### The Analogy: Two-Way ID Verification 🪪

**Like a secure government building where BOTH parties show ID.** Normally, only the server proves its identity (HTTPS). With mTLS, the client also proves its identity with a certificate. It's like both people showing driver's licenses to each other before talking.

### How It Works

```
Regular TLS (HTTPS):
Client → Verifies Server Certificate → "You are who you say you are"
Server → Does NOT verify client → Just accepts connection

Mutual TLS:
Client → Verifies Server Certificate → "You are who you say you are"
Server → Verifies Client Certificate → "You are who you say you are"
```

```
Client                              Server
  │                                   │
  │  1. Client Hello                  │
  │  ─────────────────────────────►   │
  │                                   │
  │  2. Server Hello + Server Cert    │
  │  ◄─────────────────────────────   │
  │                                   │
  │  3. Verify server certificate     │
  │                                   │
  │  4. Client Certificate            │
  │  ─────────────────────────────►   │
  │                                   │
  │  5. Verify client certificate     │
  │                                   │
  │  6. Encrypted connection          │
  │  ◄────────────────────────────►   │
```

### Pros & Cons

| ✅ Pros | ❌ Cons |
|---------|---------|
| Extremely secure | Complex certificate management |
| No tokens/passwords over wire | Certificate expiration handling |
| Works at transport layer | Hard to implement in browsers |
| Ideal for service-to-service | Requires PKI infrastructure |

### When to Use

- ✅ Service-to-service communication
- ✅ Banking/financial systems
- ✅ Healthcare (HIPAA compliance)
- ✅ Zero-trust architecture
- ❌ Public web applications
- ❌ Mobile apps (certificate distribution hard)

---

## 🆔 OpenID Connect (OIDC)

### The Analogy: OAuth + ID Card 🪪

**OAuth tells you "this app has permission to access your photos." OIDC also tells you "and by the way, here's who the user actually is."** It's OAuth 2.0 + identity layer.

### What OIDC Adds to OAuth 2.0

| OAuth 2.0 | OIDC Adds |
|-----------|-----------|
| Access Token | **ID Token** (JWT with user info) |
| Authorization | **Authentication** |
| "What can I access?" | "Who is this user?" |

### ID Token Example

```javascript
// ID Token payload (decoded)
{
  "iss": "https://accounts.google.com",  // Issuer
  "sub": "110169484474386276334",         // User ID
  "aud": "your-client-id",                // Your app
  "exp": 1708185600,                      // Expiration
  "iat": 1708099200,                      // Issued at
  "email": "user@gmail.com",              // User email
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://..."
}
```

---

## ⚡ Quick Decision Guide

```
┌─────────────────────────────────────────────────────────────┐
│                  WHICH AUTH METHOD?                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Internal service-to-service?                                │
│  ├─ High security needed → mTLS                              │
│  └─ Simple is fine → API Key                                 │
│                                                              │
│  User authentication needed?                                 │
│  ├─ Third-party login (Google, etc.) → OAuth 2.0 + OIDC      │
│  ├─ Custom login, stateless → JWT                            │
│  └─ Simple internal tool → Basic Auth (with HTTPS!)          │
│                                                              │
│  Mobile/SPA app?                                             │
│  └─ OAuth 2.0 with PKCE + JWT                                │
│                                                              │
│  Public API for developers?                                  │
│  ├─ Simple access → API Keys                                 │
│  └─ User data access → OAuth 2.0                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Quick Re-Revisit Cheatsheet

### 🔑 API Key
> **Library Card** — Simple, one key for all access, no user identity

```http
X-API-Key: your-api-key-here
```

### 👤 Basic Auth
> **Guard with a List** — Send credentials every time, use HTTPS!

```http
Authorization: Basic base64(username:password)
```

### 🎫 Bearer Token
> **Movie Ticket** — Get once, show every time, expires

```http
Authorization: Bearer your-token-here
```

### 🎟️ JWT
> **Sealed Envelope** — Self-contained, stateless, has user info

```
[Header].[Payload].[Signature]
```
- Contains user claims
- Signed but NOT encrypted
- Use with refresh tokens

### 🔐 OAuth 2.0
> **Valet Key** — Delegated access, scoped permissions

Key players: Resource Owner → Client → Auth Server → Resource Server

Flows:
- **Auth Code** → Web apps
- **PKCE** → Mobile/SPA
- **Client Credentials** → Machine-to-machine

### 🔒 mTLS
> **Two-Way ID Check** — Both client and server verify certificates

Best for: Service-to-service, banking, healthcare

### 🆔 OIDC
> **OAuth + ID Card** — OAuth 2.0 + identity information

Adds: ID Token with user info (who they are)

---

## 🛡️ Security Best Practices

| Practice | Why |
|----------|-----|
| Always use HTTPS | Prevents token/credential interception |
| Short token expiration | Limits damage if token stolen |
| Use refresh tokens | Better UX without compromising security |
| Store secrets securely | Use environment variables, secret managers |
| Validate all tokens | Check signature, expiration, issuer |
| Use secure random generators | For tokens, secrets, state parameters |
| Implement rate limiting | Prevent brute force attacks |
| Log authentication events | Detect suspicious activity |
| Rotate secrets regularly | Limit exposure from leaks |
| Use PKCE for public clients | Prevents authorization code interception |

---

## 📚 Useful References & Links

| Resource | Description |
|----------|-------------|
| [OAuth 2.0 Simplified](https://www.oauth.com/) | Excellent book/site explaining OAuth clearly |
| [JWT.io](https://jwt.io/) | Decode, verify, and generate JWTs |
| [OWASP Authentication Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) | Security best practices |
| [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) | Test OAuth flows with Google |
| [RFC 6749 - OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749) | Official OAuth 2.0 specification |
| [RFC 7519 - JWT](https://datatracker.ietf.org/doc/html/rfc7519) | Official JWT specification |
| [OpenID Connect](https://openid.net/connect/) | OIDC specification and resources |
| [Auth0 Docs](https://auth0.com/docs/) | Comprehensive auth documentation |
| [Okta Developer](https://developer.okta.com/) | Identity platform with great tutorials |
| [Postman Auth Guide](https://learning.postman.com/docs/sending-requests/authorization/) | Testing API authentication |

### Popular Libraries

| Language | Libraries |
|----------|-----------|
| **Node.js** | `jsonwebtoken`, `passport`, `express-oauth2-jwt-bearer` |
| **Python** | `PyJWT`, `Authlib`, `python-jose` |
| **Java** | `Spring Security`, `JJWT`, `Nimbus JOSE` |
| **Go** | `golang-jwt/jwt`, `oauth2`, `go-oidc` |
| **.NET** | `System.IdentityModel.Tokens.Jwt`, `IdentityServer` |

---

*Authentication is your first line of defense. Choose wisely, implement carefully, and always stay updated on security best practices!* 🔐

*Last updated: February 2026*