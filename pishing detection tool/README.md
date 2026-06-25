# PhishGuard - Phishing Detection Tool

A comprehensive web-based phishing detection platform that analyzes URLs, emails, and SMS messages for potential phishing threats using both local heuristics and AI-powered analysis.

## Features

✅ **URL Scanner** - Analyzes domains for typosquatting, homograph attacks, and suspicious patterns  
✅ **Email Analyzer** - Detects phishing emails with sender verification and content analysis  
✅ **SMS Smishing Detector** - Identifies malicious text messages and fake delivery alerts  
✅ **Threat Database** - Community-driven phishing threat intelligence feed  
✅ **Interactive Academy** - Educational modules and phishing simulation drills  
✅ **Browser Shield Extension Simulator** - Real-time threat interception simulation  
✅ **API Endpoints** - RESTful API for programmatic access  

## Project Structure

```
pishing detection tool/
├── App.tsx              # Main React application component
├── main.tsx             # React entry point
├── index.html           # HTML template
├── index.css            # Tailwind CSS styling
├── data.ts              # Quiz questions and educational modules
├── types.ts             # TypeScript type definitions
├── servers.ts           # Express server backend
├── vite.config.ts       # Vite build configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies and scripts
└── .env                 # Environment variables
```

## Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### Steps

1. **Navigate to the project directory:**
   ```bash
   cd "pishing detection tool"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Gemini API (Optional):**
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add it to the `.env` file:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run lint` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts

## API Endpoints

### URL Analysis
```bash
POST /api/analyze/url
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Email Analysis
```bash
POST /api/analyze/email
Content-Type: application/json

{
  "sender": "sender@example.com",
  "subject": "Email Subject",
  "body": "Email content..."
}
```

### SMS Analysis
```bash
POST /api/analyze/sms
Content-Type: application/json

{
  "body": "SMS message text..."
}
```

### Report Threat
```bash
POST /api/db/report
Content-Type: application/json

{
  "url": "malicious-domain.com",
  "type": "website",
  "category": "Brand Impersonation",
  "description": "Details about the threat..."
}
```

### Get Status
```bash
GET /api/status
```

## Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite
- **Backend:** Express.js, Node.js
- **AI Integration:** Google Gemini API
- **Icons:** Lucide React
- **Charts:** Recharts
- **Styling:** Tailwind CSS v4 with ViteCSS

## Features in Detail

### 1. **Dashboard**
- Real-time threat statistics
- Scan history and analytics
- System health monitoring
- Quick access to all scanning tools

### 2. **URL Scanner**
- Domain reputation analysis
- SSL certificate verification
- Homograph attack detection
- Suspicious pattern identification
- Recommended security actions

### 3. **Email Analyzer**
- Sender authenticity verification
- Urgent language detection
- Malicious link identification
- Header analysis
- File upload support (.eml, .txt)

### 4. **SMS Smishing Detector**
- Text message threat classification
- Package delivery scam detection
- Bank alert spoofing identification
- Mobile device visualization

### 5. **Threat Database**
- Global threat intelligence feed
- User-submitted reports
- Real-time threat tracking
- Searchable threat library
- Verified/Pending status tracking

### 6. **Academy & Training**
- Educational security modules
- Interactive phishing simulation drills
- Risk indicator highlights
- Score tracking and progress
- Pro security recommendations

### 7. **Browser Extension Simulator**
- Real-time threat interception
- Safe browsing recommendations
- Extension status monitoring
- Live security warnings

## Local Heuristics Analysis

The tool performs multi-layer phishing detection:

1. **IP Address Detection** - Flags direct IP-based URLs
2. **Suspicious Keywords** - Identifies brand impersonation attempts
3. **Subdomain Analysis** - Detects excessive subdomain flooding
4. **Low-Reputation TLDs** - Flags high-risk domain extensions
5. **Non-Standard Ports** - Identifies unusual port configurations
6. **Database Matching** - Checks against known phishing URLs

## Security Features

🔒 **Local Processing** - All analysis can run locally without cloud dependencies  
🔐 **No Data Storage** - User data is never saved or shared  
🛡️ **Real-time Updates** - Fresh threat intelligence  
⚡ **Fast Analysis** - Instant results for URL, email, and SMS scanning  
🎯 **Accurate Detection** - AI-powered + heuristic-based verification  

## Configuration

Edit `.env` file to customize:

```env
GEMINI_API_KEY=your_key_here
PORT=8080
HOST=localhost
```

## Development

### Adding New Quiz Questions
Edit `data.ts` to add questions to the `quizQuestions` array:

```typescript
{
  id: "q-unique",
  type: "email",
  senderOrUrl: "sender@domain.com",
  subject: "Subject line",
  bodyPreview: "Email content",
  isPhishing: true,
  explanation: "Why this is phishing...",
  riskHighlights: [
    { text: "suspicious text", label: "Issue Type" }
  ]
}
```

### Customizing Presets
Modify preset URLs, emails, and SMS in `App.tsx`:

```typescript
const urlPresets = [
  { label: "Test Name", url: "https://example.com" }
];
```

## Known Limitations

- Requires Node.js 18+ for full functionality
- Some advanced features require Gemini API key
- Browser extension is a simulator, not a real browser extension
- Real-time database sync requires backend server

## Support

For issues and feature requests, review the local heuristics implementation in `servers.ts`.

## License

Educational tool for phishing awareness training.

---

**⚠️ Disclaimer:** This tool is for educational and defensive purposes only. Always verify suspicious messages through official channels and enable two-factor authentication on important accounts.
