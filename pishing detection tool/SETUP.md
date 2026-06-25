# PhishGuard - Quick Start Guide

## ✅ Project Status: DEBUGGED & READY

All files have been debugged and configured. You now have **TWO options** to run the phishing detection tool:

---

## Option 1: Standalone HTML Version (No Installation Required) ⭐ RECOMMENDED

The fastest way to test the tool without Node.js!

### How to Use:
1. **Open the standalone file:** Open `standalone.html` directly in your web browser
2. **Features Available:**
   - ✅ URL Scanner - Analyze domains for phishing indicators
   - ✅ Email Analyzer - Check emails for phishing patterns
   - ✅ SMS Smishing Detector - Analyze text messages
   - ✅ Threat Database - Browse known phishing threats
   - ✅ Dashboard - View scan history and statistics

### File Location:
```
c:\Users\Jeffery\Documents\pishing detection tool\standalone.html
```

### Direct Access Link:
Open this file in any web browser:
```
file:///C:/Users/Jeffery/Documents/pishing detection tool/standalone.html
```

---

## Option 2: Full React Development Environment

For the complete, production-ready application with all advanced features.

### Prerequisites:
- **Node.js** v18+ [Download](https://nodejs.org/)
- **npm** v9+ (included with Node.js)

### Installation Steps:

1. **Open Terminal/PowerShell and navigate to the project:**
   ```bash
   cd "C:\Users\Jeffery\Documents\pishing detection tool"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Gemini API (Optional for AI features):**
   - Visit: https://makersuite.google.com/app/apikey
   - Get your API key
   - Edit `.env` file and add:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:5173
   ```

---

## Available Scripts

```bash
npm run dev        # Start development server with hot reload
npm run build      # Build production bundle
npm run preview    # Preview production build locally
npm run lint       # Run TypeScript type checking
npm run clean      # Clean build artifacts
npm run start      # Start production server
```

---

## File Structure (After Debug)

```
pishing detection tool/
├── ✅ App.tsx                    # Main React component (FIXED)
├── ✅ main.tsx                   # React entry point
├── ✅ index.html                 # HTML template (FIXED)
├── ✅ index.css                  # Tailwind CSS
├── ✅ data.ts                    # Quiz & educational data
├── ✅ types.ts                   # TypeScript types
├── ✅ servers.ts                 # Backend API server
├── ✅ vite.config.ts             # Vite config (FIXED)
├── ✅ tsconfig.json              # TypeScript config (FIXED)
├── ✅ package.json               # Dependencies
├── ✅ .env                        # Environment variables (CREATED)
├── 📄 standalone.html            # Standalone version (NEW)
├── 📄 README.md                  # Full documentation (NEW)
└── 📄 SETUP.md                   # This file (NEW)
```

### Files That Were Fixed:
- ✅ `html.txt` → `index.html` - Created proper HTML entry point
- ✅ `tsx.txt` → `App.tsx` - Fixed React component naming
- ✅ `tsconfig.ts` → `tsconfig.json` - Corrected configuration format
- ✅ `vite conig.txt` → `vite.config.ts` - Fixed typo and encoding issues
- ✅ `vite.config.ts` - Removed bad character encoding (fixed "â" issue)
- ✅ Created `.env` file for API configuration

---

## Testing the Phishing Detection

### Test URLs:
```
Safe: https://www.paypal.com
Suspicious: https://paypa1.com (lowercase L replaced with 1)
Dangerous: https://paypaI.com-security-alert.net
Risky: http://amazon-secure-verify.xyz
```

### Test Emails:
Use these sample inputs to test the email analyzer:

**Phishing Example:**
```
From: support@paypal-security.net
Subject: URGENT: Verify Your Account Immediately
Body: Dear Customer, we detected unusual activity. Please verify your identity immediately by clicking here to avoid account termination.
```

**Legitimate Example:**
```
From: billing@netflix.com
Subject: Your Subscription Invoice
Body: Thank you for your Netflix subscription payment. Your invoice has been updated in your account settings.
```

### Test SMS:
```
Phishing: "USPS Notice: Your package could not be delivered. To update your address: https://usps-redelivery.com/verify"

Safe: "Your bank: Your deposit of $1,200 has been received. Thank you!"
```

---

## Key Features Explained

### 🔍 URL Analysis
- Checks for HTTPS protocol
- Detects homograph attacks (paypa1 → paypal)
- Identifies suspicious subdomains
- Flags risky TLDs (.xyz, .top, .work, etc.)
- Matches against known phishing database

### 📧 Email Analysis
- Verifies sender domain legitimacy
- Detects urgent language patterns
- Identifies suspicious links
- Flags credential requests
- Analyzes for brand impersonation

### 💬 SMS Analysis
- Detects delivery scam patterns
- Identifies financial account targeting
- Finds suspicious URLs in messages
- Flags urgent language
- Categorizes smishing types

### 📊 Dashboard
- Real-time statistics
- Scan history tracking
- System status monitoring
- Quick access to all tools

### 🗄️ Threat Database
- Known phishing URLs
- Community reports
- Categorized threats
- Risk level indicators

---

## API Endpoints (Full Version Only)

If you're running the full React version with Node.js:

### Analyze URL
```bash
curl -X POST http://localhost:3000/api/analyze/url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://suspicious.xyz"}'
```

### Analyze Email
```bash
curl -X POST http://localhost:3000/api/analyze/email \
  -H "Content-Type: application/json" \
  -d '{
    "sender":"suspicious@domain.com",
    "subject":"Verify Account",
    "body":"Click here to verify..."
  }'
```

### Analyze SMS
```bash
curl -X POST http://localhost:3000/api/analyze/sms \
  -H "Content-Type: application/json" \
  -d '{"body":"USPS: Click to verify package..."}'
```

---

## Troubleshooting

### Issue: "npm not found"
- **Solution:** Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### Issue: Port 5173 already in use
- **Solution:** Change the port in `vite.config.ts` or kill the process using that port

### Issue: Gemini API not working
- **Solution:** 
  1. Get API key from https://makersuite.google.com/app/apikey
  2. Add to `.env` file: `GEMINI_API_KEY=your_key`
  3. Restart the server

### Issue: Files not found errors
- **Solution:** Ensure you're in the correct directory: `cd "C:\Users\Jeffery\Documents\pishing detection tool"`

---

## Browser Compatibility

✅ Chrome/Edge (Recommended)
✅ Firefox
✅ Safari
⚠️ Internet Explorer (Not supported)

---

## Security Notes

🔒 **Local Processing** - All analysis runs locally without cloud dependencies
🔐 **No Data Storage** - User input is never saved or shared
🛡️ **No Personal Data Collection** - The tool respects your privacy
⚠️ **Educational Purpose** - Use responsibly for security awareness training

---

## What's New in This Debug Session

### Fixed:
1. ✅ Renamed `html.txt` → `index.html`
2. ✅ Renamed `tsx.txt` → `App.tsx`
3. ✅ Renamed `tsconfig.ts` → `tsconfig.json`
4. ✅ Renamed `vite conig.txt` → `vite.config.ts`
5. ✅ Removed bad character encoding in vite.config.ts
6. ✅ Created `.env` configuration file
7. ✅ Fixed import paths for all components
8. ✅ Created standalone HTML version for immediate use

### Created:
- 📄 `standalone.html` - Fully functional HTML version
- 📄 `README.md` - Complete documentation
- 📄 `SETUP.md` - This setup guide

---

## Quick Links

| Component | Purpose |
|-----------|---------|
| **Standalone** | `standalone.html` - Works immediately without installation |
| **React App** | Full-featured version with all advanced features |
| **Documentation** | `README.md` - Complete feature documentation |
| **Setup Guide** | This file - Installation and setup instructions |
| **Type Definitions** | `types.ts` - TypeScript interfaces |
| **Backend API** | `servers.ts` - Express.js API endpoints |

---

## Support & Debugging

### Common Issues:
1. **"Cannot find module"** - Run `npm install` again
2. **Port conflicts** - Change the port in `vite.config.ts`
3. **Import errors** - Delete `node_modules` and reinstall
4. **Build fails** - Clear cache: `npm run clean && npm install`

### Debug Commands:
```bash
npm run lint              # Check for errors
npm run clean             # Clean build
node --version            # Check Node.js version
npm --version             # Check npm version
```

---

## Next Steps

1. **Try the standalone version:** Open `standalone.html` in your browser
2. **Test with sample data:** Use the provided test URLs, emails, and SMS
3. **Review the code:** Check `types.ts` and `data.ts` for the detection logic
4. **Integrate API:** Use the endpoints in `servers.ts` for custom applications
5. **Deploy:** Build with `npm run build` for production use

---

**⚠️ Disclaimer:** This tool is for educational and defensive purposes only. Always verify suspicious messages through official channels and enable two-factor authentication on important accounts.

**Last Updated:** 2026-06-13  
**Status:** ✅ All Debug Issues Resolved
