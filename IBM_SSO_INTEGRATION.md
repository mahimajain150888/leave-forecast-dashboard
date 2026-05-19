# IBM SSO Integration Guide

This document provides step-by-step instructions for integrating IBM Single Sign-On (SSO) authentication into the Vacation Forecast Dashboard application.

## Overview

Adding IBM SSO will:
- ✅ Secure the leave submission form
- ✅ Auto-populate user information (name, email)
- ✅ Eliminate manual email entry in "My Leaves"
- ✅ Provide audit trail of who submitted/modified leaves
- ✅ Ensure only authorized IBM employees can access the system

---

## Prerequisites

Before starting, gather the following from your IBM IAM team:

### Required Information

1. **SSO Entry Point URL** - Where users are redirected to log in
   - Example: `https://w3id.sso.ibm.com/auth/sps/samlidp/saml20/logininitial`

2. **Entity ID / Issuer** - Unique identifier for IBM's SSO system
   - Example: `https://w3id.sso.ibm.com`

3. **X.509 Certificate** - Public key for validating SAML responses
   - Provided as a `.cer` file or PEM-encoded string

4. **SAML Attributes** - User profile fields in the SAML assertion
   - Common attributes: `displayName`, `email`, `employeeNumber`

5. **Callback URL** - Register with IBM IAM team
   - Development: `http://localhost:3001/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

---

## Implementation Steps

### Step 1: Install Required Packages

```bash
cd monday-dashboard/backend
npm install passport passport-saml express-session connect-redis
```

**Package Purposes:**
- `passport` - Authentication middleware
- `passport-saml` - SAML 2.0 strategy for IBM SSO
- `express-session` - Session management
- `connect-redis` - (Optional) Session store for production

---

### Step 2: Configure Environment Variables

Add to `backend/.env`:

```env
# IBM SSO Configuration
SSO_ENTRY_POINT=https://w3id.sso.ibm.com/auth/sps/samlidp/saml20/logininitial
SSO_ISSUER=https://w3id.sso.ibm.com
SSO_CALLBACK_URL=http://localhost:3001/auth/callback
SSO_LOGOUT_URL=https://w3id.sso.ibm.com/auth/sps/samlidp/saml20/slo
SSO_CERT=-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL0UG+mRKSzMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
... (your certificate content) ...
-----END CERTIFICATE-----

# Session Configuration
SESSION_SECRET=your-secure-random-secret-here-change-in-production
SESSION_MAX_AGE=86400000

# SAML Attribute Mapping
SAML_NAME_ATTRIBUTE=displayName
SAML_EMAIL_ATTRIBUTE=email
SAML_EMPLOYEE_ID_ATTRIBUTE=employeeNumber
```

---

### Step 3: Create SSO Configuration File

Create `backend/src/config/sso.js`:

```javascript
const SamlStrategy = require('passport-saml').Strategy;

const samlConfig = {
  entryPoint: process.env.SSO_ENTRY_POINT,
  issuer: process.env.SSO_ISSUER,
  callbackUrl: process.env.SSO_CALLBACK_URL,
  cert: process.env.SSO_CERT,
  identifierFormat: null,
  signatureAlgorithm: 'sha256',
  
  // Attribute mapping
  attributeConsumingServiceIndex: false,
  disableRequestedAuthnContext: true,
  
  // Logout configuration (optional)
  logoutUrl: process.env.SSO_LOGOUT_URL,
  logoutCallbackUrl: `${process.env.SSO_CALLBACK_URL}/logout/callback`
};

const samlStrategy = new SamlStrategy(
  samlConfig,
  (profile, done) => {
    // Extract user information from SAML profile
    const user = {
      id: profile[process.env.SAML_EMPLOYEE_ID_ATTRIBUTE] || profile.nameID,
      name: profile[process.env.SAML_NAME_ATTRIBUTE] || profile.displayName,
      email: profile[process.env.SAML_EMAIL_ATTRIBUTE] || profile.email,
      employeeId: profile[process.env.SAML_EMPLOYEE_ID_ATTRIBUTE],
      raw: profile
    };
    
    return done(null, user);
  }
);

module.exports = { samlStrategy, samlConfig };
```

---

### Step 4: Create Authentication Middleware

Create `backend/src/middleware/ssoAuth.js`:

```javascript
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    success: false,
    error: 'Authentication required',
    loginUrl: '/auth/login'
  });
};

const attachUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
};

module.exports = { ensureAuthenticated, attachUser };
```

---

### Step 5: Create Authentication Routes

Create `backend/src/routes/ssoRoutes.js`:

```javascript
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Initiate SSO login
router.get('/login', 
  passport.authenticate('saml', { 
    failureRedirect: '/auth/login/fail' 
  })
);

// SSO callback
router.post('/callback',
  passport.authenticate('saml', { 
    failureRedirect: '/auth/login/fail' 
  }),
  (req, res) => {
    // Successful authentication
    res.redirect('/');
  }
);

// Login failure
router.get('/login/fail', (req, res) => {
  res.status(401).json({
    success: false,
    error: 'Authentication failed'
  });
});

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect('/');
  });
});

// Get current user
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      user: req.user
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Not authenticated'
    });
  }
});

module.exports = router;
```

---

### Step 6: Update server.js

Modify `backend/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const dashboardRoutes = require('./src/routes/dashboardRoutes');
const ssoRoutes = require('./src/routes/ssoRoutes');
const { samlStrategy } = require('./src/config/sso');
const { attachUser } = require('./src/middleware/ssoAuth');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000
  }
}));

// Passport initialization
passport.use('saml', samlStrategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());
app.use(attachUser);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use('/api/', limiter);

// Routes
app.use('/auth', ssoRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Monday.com Dashboard API',
    authenticated: req.isAuthenticated(),
    user: req.user || null
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Monday.com Dashboard API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}`);
  console.log(`🔐 SSO Authentication: ${process.env.SSO_ENTRY_POINT ? 'Enabled' : 'Disabled'}`);
});
```

---

### Step 7: Protect API Routes

Update `backend/src/routes/dashboardRoutes.js`:

```javascript
const { ensureAuthenticated } = require('../middleware/ssoAuth');

// Protect leave submission routes
router.post('/submit', ensureAuthenticated, (req, res) => 
  dashboardController.submitLeave(req, res)
);

router.put('/leave/:id', ensureAuthenticated, (req, res) => 
  dashboardController.updateLeave(req, res)
);

router.delete('/leave/:id', ensureAuthenticated, (req, res) => 
  dashboardController.deleteLeave(req, res)
);

router.get('/my-leaves', ensureAuthenticated, (req, res) => 
  dashboardController.getUserLeaves(req, res)
);
```

---

### Step 8: Update Frontend - Add Auth Context

Create `frontend/src/context/AuthContext.jsx`:

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/auth/user', { withCredentials: true });
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = '/auth/login';
  };

  const logout = async () => {
    try {
      await axios.get('/auth/logout', { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

### Step 9: Update Frontend Components

**Update `LeaveForm.jsx`** to auto-populate from SSO:

```javascript
import { useAuth } from '../context/AuthContext';

function LeaveForm({ onSuccess }) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    startDate: '',
    endDate: '',
    description: ''
  });
  
  // Disable name/email fields if user is authenticated
  const isAuthenticated = !!user;
  
  // ... rest of component
}
```

**Update `MyLeaves.jsx`** to use authenticated user's email:

```javascript
import { useAuth } from '../context/AuthContext';

function MyLeaves({ onUpdate }) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      fetchLeaves();
    }
  }, [user]);
  
  // ... rest of component
}
```

---

## Testing

### 1. Test SSO Login Flow

```bash
# Start the application
cd backend && npm run dev
cd frontend && npm run dev

# Navigate to http://localhost:3000
# Click "Submit Leave" or "My Leaves"
# Should redirect to IBM SSO login
# After login, should return to the application
```

### 2. Test Protected Routes

```bash
# Without authentication
curl http://localhost:3001/api/dashboard/submit
# Should return 401 Unauthorized

# With authentication (after SSO login)
curl -b cookies.txt http://localhost:3001/api/dashboard/submit
# Should work
```

---

## Troubleshooting

### Issue: "SAML assertion validation failed"
**Solution:** Verify the certificate in `.env` matches the one from IBM IAM team

### Issue: "Callback URL mismatch"
**Solution:** Ensure the callback URL registered with IBM matches your `.env` configuration

### Issue: "Session not persisting"
**Solution:** Check that `credentials: true` is set in CORS configuration and frontend axios requests

### Issue: "User attributes not found"
**Solution:** Verify SAML attribute names in `.env` match what IBM sends in the assertion

---

## Security Best Practices

1. **Use HTTPS in production** - SSO requires secure connections
2. **Rotate session secrets** - Change `SESSION_SECRET` regularly
3. **Implement CSRF protection** - Add `csurf` middleware
4. **Set secure cookie flags** - Enable in production
5. **Monitor failed login attempts** - Add logging and alerting
6. **Regular security audits** - Review SSO configuration quarterly

---

## Production Deployment

### Environment Variables

Update for production:

```env
NODE_ENV=production
SSO_CALLBACK_URL=https://your-domain.com/auth/callback
SESSION_SECRET=<strong-random-secret>
ALLOWED_ORIGINS=https://your-domain.com
```

### Session Store

Use Redis for production sessions:

```javascript
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  // ... other options
}));
```

---

## Support

For IBM SSO-specific issues:
- Contact your IBM IAM team
- Reference: [IBM W3ID Documentation](https://w3.ibm.com/tools/sso/)

For application issues:
- Check application logs
- Review this documentation
- Test with SSO disabled first to isolate issues

---

## Made with Bob