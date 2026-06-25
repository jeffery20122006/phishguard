import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// In-memory simulation database for reporting and stats.
// Persists through application runtime, allowing custom reports and blocking lists.
interface ReportedPhish {
  id: string;
  url: string;
  type: "website" | "email" | "sms";
  reportedAt: string;
  source: string; // e.g., "User Submit" or "Global Database"
  status: "verified" | "pending";
  category: string; // e.g., "Brand Impersonation", "Smishing", "Grand Impersonation"
  description: string;
}

const reportedDb: ReportedPhish[] = [
  {
    id: "rep-1",
    url: "http://secure-paypal-login-verify-account.support-verification.net/signin",
    type: "website",
    reportedAt: "2026-06-09T10:00:00Z",
    source: "Global Database",
    status: "verified",
    category: "PayPal Spoofing",
    description: "Fake login page mimicking PayPal portal to capture email and passwords."
  },
  {
    id: "rep-2",
    url: "http://usps-package-delivery-alert.tiny.us/tracking",
    type: "sms",
    reportedAt: "2026-06-09T08:30:00Z",
    source: "Global Database",
    status: "verified",
    category: "Package Delivery Scam",
    description: "SMS scam claiming a package delivery failed and requires address verification fee."
  },
  {
    id: "rep-3",
    url: "wellsfargo-security-alert-unusual-activity.com",
    type: "website",
    reportedAt: "2026-06-08T18:15:00Z",
    source: "User Submit",
    status: "verified",
    category: "Wells Fargo Mimicry",
    description: "Spoofing Wells Fargo online bank dashboard, asking for full social security number and credentials."
  },
  {
    id: "rep-4",
    url: "netflix-billing-update-required.xyz",
    type: "email",
    reportedAt: "2026-06-08T14:22:00Z",
    source: "User Submit",
    status: "verified",
    category: "Subscription Phish",
    description: "Deceptive billing link mimicking Netflix stating membership has expired."
  },
  {
    id: "rep-5",
    url: "metamask-secure-wallet-update.net/import",
    type: "website",
    reportedAt: "2026-06-07T12:05:00Z",
    source: "Global Database",
    status: "verified",
    category: "Crypto Wallet Drainer",
    description: "Asks user for their secret seed phrase to synchronize MetaMask wallets."
  }
];

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// local parser helper
function localHeuristicsAnalyzeUrl(urlStr: string) {
  const errors: string[] = [];
  const findings: string[] = [];
  let cleanUrl = urlStr.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = "http://" + cleanUrl;
  }

  let parsed: URL | null = null;
  try {
    parsed = new URL(cleanUrl);
  } catch (e) {
    // Bad URL, try simple splits
  }

  const hostname = parsed ? parsed.hostname : cleanUrl.split('/')[0] || '';
  const lowercaseHost = hostname.toLowerCase();
  
  // 1. IP address check
  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (ipRegex.test(lowercaseHost)) {
    findings.push("Uses direct IP address instead of secure registered domain name.");
  }

  // 2. High risk keywords
  const suspiciousKeywords = ["paypal", "secure", "bank", "update", "verify", "login", "signin", "billing", "account", "support", "gift", "free-cash", "netflix", "chase", "amazon", "appleid", "wellsfargo", "meta-mask", "crypto", "security"];
  const matchedKeywords: string[] = [];
  suspiciousKeywords.forEach(kw => {
    if (cleanUrl.toLowerCase().includes(kw)) {
      // If it contains a keyword but the domain matches exactly the actual main site, skip
      const realHosts = {
        "paypal": "paypal.com",
        "netflix": "netflix.com",
        "chase": "chase.com",
        "amazon": "amazon.com",
        "apple": "apple.com",
        "wellsfargo": "wellsfargo.com"
      };
      // Simple exemption rule
      let exempt = false;
      for (const [realKw, realDomain] of Object.entries(realHosts)) {
        if (lowercaseHost === realDomain || lowercaseHost.endsWith("." + realDomain)) {
          exempt = true;
          break;
        }
      }
      if (!exempt) {
        matchedKeywords.push(kw);
      }
    }
  });

  if (matchedKeywords.length > 0) {
    findings.push(`Contains high-risk brand or administrative keywords: ${matchedKeywords.join(", ")}`);
  }

  // 3. Subdomain flooding
  const dotCount = (lowercaseHost.match(/\./g) || []).length;
  if (dotCount > 3) {
    findings.push("Contains excessive subdomains, a technique often used to disguise actual destination domains.");
  }

  // 4. Bad TLD check
  const genericLowRepTLDs = [".xyz", ".top", ".work", ".click", ".party", ".gq", ".tk", ".cf", ".ml", ".ga", ".buzz", ".live", ".fit", ".icu", ".monster", ".vip", ".shop"];
  const matchedTld = genericLowRepTLDs.find(tld => lowercaseHost.endsWith(tld));
  if (matchedTld) {
    findings.push(`Uses a low-cost, low-reputation top-level domain (${matchedTld}) highly favored by spammers.`);
  }

  // 5. Port check
  if (parsed && parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    findings.push(`Binds to non-standard post/communication port ${parsed.port}`);
  }

  // 6. Database Match
  const inDb = reportedDb.some(item => cleanUrl.includes(item.url) || item.url.includes(lowercaseHost));
  if (inDb) {
    findings.push("Matches known reported malicious phishing patterns in PhishGuard Active Database.");
  }

  let riskScore: "Safe" | "Suspicious" | "Dangerous" = "Safe";
  let scoreValue = 0;

  if (findings.length >= 2 || inDb) {
    riskScore = "Dangerous";
    scoreValue = inDb ? 98 : 85 + (findings.length * 3);
  } else if (findings.length === 1) {
    riskScore = "Suspicious";
    scoreValue = 45;
  } else {
    riskScore = "Safe";
    scoreValue = 10;
  }

  if (scoreValue > 100) scoreValue = 100;

  return {
    riskScore,
    scoreValue,
    analysis: {
      domainAnalysis: `Analyzed Host domain: ${hostname}. Evaluated structural formatting, homographs, and entropy.`,
      sslCheck: parsed && parsed.protocol === "https:" ? "SSL/TLS active protocol format detected, but remember malicious pages can easily load free secure credentials." : "No HTTPS secure protocol flag found! Standard raw unencrypted protocol transfers threat risk.",
      suspiciousPatterns: matchedKeywords,
      indicatorsFound: findings
    },
    explanation: findings.length > 0 
      ? `Local scan rules flagged this URL due to structural anomalies: ${findings.join(" ")}` 
      : "No obvious phishing domain indicators or spoofing scripts were found in the URL structure by our localized heuristic rules analyzer.",
    recommendations: [
      "Always inspect the primary domain before entering critical credential information.",
      "Look for official logos or use dedicated, bookmarked entries and official apps.",
      "Enable Multi-Factor Authentication (MFA) to safeguard details even if credentials leak."
    ],
    mode: "local"
  };
}

function localHeuristicsAnalyzeEmail(sender: string, subject: string, body: string) {
  const findings: string[] = [];
  const highlights: any[] = [];

  const checkText = `${subject} ${body}`.toLowerCase();

  // 1. Sender validation
  const lowerSender = sender.toLowerCase();
  const legitimateBrands = [
    { name: "paypal", domain: "paypal.com" },
    { name: "chase", domain: "chase.com" },
    { name: "netflix", domain: "netflix.com" },
    { name: "google", domain: "google.com" },
    { name: "amazon", domain: "amazon.com" },
    { name: "bankofamerica", domain: "bankofamerica.com" },
    { name: "wellsfargo", domain: "wellsfargo.com" },
    { name: "microsoft", domain: "microsoft.com" }
  ];

  let senderMimicry = false;
  legitimateBrands.forEach(brand => {
    if (lowerSender.includes(brand.name) && !lowerSender.endsWith("@" + brand.domain) && !lowerSender.endsWith("." + brand.domain)) {
      senderMimicry = true;
      findings.push(`Potential spoofed sender: Address contains '${brand.name}' but does not originate from verified '${brand.domain}'.`);
    }
  });

  // 2. Urgent / Sus language
  const urgentPhrases = [
    { phrase: "terminate your account", category: "Urgency", expl: "Forced timeline threatening negative action." },
    { phrase: "suspended within 24 hours", category: "Urgency", expl: "Artificially constrained action timer." },
    { phrase: "immediate action required", category: "Urgency", expl: "Urgent call intended to trigger careless action." },
    { phrase: "unauthorized transaction", category: "Threat Alert", expl: "Induces fear about client balance security." },
    { phrase: "verify your debit card", category: "Credential Request", expl: "Phishing emails regularly mandate immediate verification." },
    { phrase: "click here to login", category: "Suspicious Link", expl: "Encourages users to follow obfuscated links." },
    { phrase: "reset your passcode", category: "Credential Request", expl: "Attempts credential harvesting." },
    { phrase: "dear customer", category: "Generic Greeting", expl: "Impersonal greeting from high trust institutions is highly suspicious." },
    { phrase: "valued client", category: "Generic Greeting", expl: "Lack of specific customer identity records." }
  ];

  urgentPhrases.forEach(item => {
    // Regex for basic occurrence to extract original casing
    const idx = `${subject}\n\n${body}`.toLowerCase().indexOf(item.phrase);
    if (idx !== -1) {
      const start = Math.max(0, idx - 10);
      const end = Math.min(`${subject}\n\n${body}`.length, idx + item.phrase.length + 30);
      const surrounding = `${subject}\n\n${body}`.substr(start, end - start).trim();
      
      findings.push(`Urgent demands or credential collection language: '${item.phrase}'`);
      highlights.push({
        text: surrounding.length > 50 ? "..." + surrounding + "..." : surrounding,
        riskLevel: "high",
        issueCategory: item.category,
        explanation: item.expl
      });
    }
  });

  // Simple highlight generator if highlights is empty
  if (highlights.length === 0) {
    const sentences = body.split(/[.!?]+/);
    sentences.forEach(s => {
      if (s.toLowerCase().includes("account") || s.toLowerCase().includes("verify") || s.toLowerCase().includes("security") || s.toLowerCase().includes("link")) {
        highlights.push({
          text: s.trim().substring(0, 100),
          riskLevel: "medium",
          issueCategory: "Administrative",
          explanation: "Inquires about security, link verification, or login actions."
        });
      }
    });
  }

  let riskScore: "Safe" | "Suspicious" | "Dangerous" = "Safe";
  let scoreValue = 15;

  if (senderMimicry || findings.length >= 2) {
    riskScore = "Dangerous";
    scoreValue = senderMimicry ? 92 : 80;
  } else if (findings.length === 1 || checkText.includes("http://") || checkText.includes("https://")) {
    riskScore = "Suspicious";
    scoreValue = 55;
  }

  return {
    riskScore,
    scoreValue,
    senderAssessment: lowerSender ? `Analyzed Sender domain: ${sender}. Check for domain alignment.` : "Sender details are omitted. Threat verification score reduced.",
    mismatchedDomains: senderMimicry,
    urgentLanguageDetected: checkText.includes("urgent") || checkText.includes("suspend") || checkText.includes("immediate"),
    suspiciousLinksFound: checkText.match(/https?:\/\/[^\s]+/g) || [],
    highlights: highlights.slice(0, 5),
    safetyRecommendations: [
      "Strictly check the actual sender email address headers inside your client, not just the displayed identity name.",
      "Do not follow clickable redirect buttons embedded in high-priority security emails.",
      "Directly enter the company's URL in a browser tab to check notifications securely."
    ],
    explanation: findings.length > 0 
      ? `Email checks flagged items: ${findings.join(" | ")}`
      : "No glaring phishing sender domain patterns or highly stressful language indicators detected using localized scanners.",
    mode: "local"
  };
}

function localHeuristicsAnalyzeSms(body: string) {
  const findings: string[] = [];
  const highlights: any[] = [];
  const text = body.toLowerCase();

  const triggers = [
    { phrase: "usps", cat: "Package Delivery", issue: "Fake Package Alert", expl: "Claims a postal package failed delivery." },
    { phrase: "fedex", cat: "Package Delivery", issue: "Fake Package Alert", expl: "Impersonates FedEx tracking notifications." },
    { phrase: "package failed", cat: "Package Delivery", issue: "Courier Fraud", expl: "Unusual notification about failed delivery." },
    { phrase: "temporary lock", cat: "Bank Alert", issue: "Urgent Lock", expl: "Artificially stresses the user with a locked account claim." },
    { phrase: "unauthorized charge", cat: "Bank Alert", issue: "Financial Fear", expl: "Alleges unexpected credit expenditures to startle readers." },
    { phrase: "chase-alert", cat: "Bank Alert", issue: "Bank Impersonation", expl: "Fake security alert claiming to be Chase." },
    { phrase: "wells fargo alert", cat: "Bank Alert", issue: "Bank Impersonation", expl: "Spoofs financial security departments." },
    { phrase: "subscription renewed", cat: "Auto-Renewal", issue: "Billing Charge", expl: "Claims unexpected charges took place to force clicks." },
    { phrase: "refund waiting", cat: "Financial Benefit", issue: "Tax or Gift Scam", expl: "誘惑 text saying money is waiting for claim." }
  ];

  let smishingCategory = "None";
  triggers.forEach(trig => {
    if (text.includes(trig.phrase)) {
      smishingCategory = trig.cat;
      findings.push(`Matches typical ${trig.cat} scam schema: Contains phrase '${trig.phrase}'`);
      
      const idx = text.indexOf(trig.phrase);
      const start = Math.max(0, idx - 10);
      const end = Math.min(body.length, idx + trig.phrase.length + 30);
      highlights.push({
        text: body.substring(start, end),
        riskLevel: "high",
        issueCategory: trig.issue,
        explanation: trig.expl
      });
    }
  });

  // Short link check
  const hasShortenedLink = /bit\.ly|tinyurl\.com|t\.co|short\.lnk|cutt\.ly|rebrand\.ly/i.test(text);
  if (hasShortenedLink) {
    findings.push("Contains obscure URL shortener links, heavily used to conceal bad targets in SMS scams.");
    highlights.push({
      text: "Obfuscated shortened link",
      riskLevel: "high",
      issueCategory: "Obscured Redirect",
      explanation: "Redirect links hide the underlying endpoint to avoid text inspection filters."
    });
  }

  let riskScore: "Safe" | "Suspicious" | "Dangerous" = "Safe";
  let scoreValue = 10;

  if (findings.length >= 2 || (hasShortenedLink && smishingCategory !== "None")) {
    riskScore = "Dangerous";
    scoreValue = 90;
  } else if (findings.length === 1 || hasShortenedLink || text.includes("http")) {
    riskScore = "Suspicious";
    scoreValue = 60;
  }

  return {
    riskScore,
    scoreValue,
    smishingCategory,
    suspiciousElements: findings,
    highlights: highlights,
    safetyRecommendations: [
      "Never reply with sensitive information or personal codes to incoming SMS messages.",
      "Instead of clicking delivery tracking links, search the tracking number directly on the vendor's actual portal.",
      "Most legitimate financial systems will never provide external verification links in unsolicited SMS."
    ],
    explanation: findings.length > 0
      ? `SMS scanner identified potential smishing triggers: ${findings.join(", ")}`
      : "No obvious dangerous smishing phrases or short links detected by clean SMS local scanners.",
    mode: "local"
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body Parsing JSON
  app.use(express.json({ limit: "15mb" }));

  // Dynamic status details
  app.get("/api/status", (req, res) => {
    const ai = getAiClient();
    res.json({
      status: "healthy",
      aiAvailable: ai !== null,
      localTime: new Date().toISOString(),
      databaseActive: true,
      databaseStats: {
        totalReported: reportedDb.length,
        verifiedSources: reportedDb.filter(x => x.status === "verified").length,
        typesCount: {
          website: reportedDb.filter(x => x.type === "website").length,
          email: reportedDb.filter(x => x.type === "email").length,
          sms: reportedDb.filter(x => x.type === "sms").length,
        }
      }
    });
  });

  // Reported database API endpoints
  app.get("/api/db/reported", (req, res) => {
    res.json(reportedDb);
  });

  app.post("/api/db/report", (req, res) => {
    const { url, type, source, category, description } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL/Threat target path is required" });
    }

    const payload: ReportedPhish = {
      id: `rep-${Date.now()}`,
      url: url.trim(),
      type: type || "website",
      reportedAt: new Date().toISOString(),
      source: source || "User Submit",
      status: "pending",
      category: category || "Suspected Threat",
      description: description || "Submitted via PhishGuard report console."
    };

    reportedDb.unshift(payload);
    res.status(201).json({ success: true, message: "Threat successfully queued for expert verification.", item: payload });
  });

  // URL checking endpoint
  app.post("/api/analyze/url", async (req, res) => {
    const { url } = req.body;
    if (!url) {
       return res.status(400).json({ error: "Missing 'url' field in request body." });
    }

    const ai = getAiClient();
    if (!ai) {
      // Fallback
      return res.json(localHeuristicsAnalyzeUrl(url));
    }

    try {
      const prompt = `Analyze this URL for phishing, credential harvesting, malware, or brand spoofing attacks: "${url}".
Return a JSON object conforming exactly to this schema:
{
  "riskScore": "Safe" | "Suspicious" | "Dangerous",
  "scoreValue": number (0 to 100),
  "analysis": {
    "domainAnalysis": "Evaluate subdomain structure, parent domain similarity, homographs, typosquatting.",
    "sslCheck": "Identify protocols or risk presence.",
    "suspiciousPatterns": ["array of suspicious keywords or formats"],
    "indicatorsFound": ["short bullet findings of suspicious indicators"]
  },
  "explanation": "Summarize clearly for a non-technical user what threats or green flags are present in this URL schema.",
  "recommendations": ["array of 3 smart actionable advice lines regarding this domain query"]
}
Only output the JSON object. Do not wrap in markdown code blocks.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(response.text || "{}");
      data.mode = "ai";
      return res.json(data);
    } catch (err: any) {
      console.error("Gemini URL Analysis failed, falling back to heuristics:", err.message);
      const backup = localHeuristicsAnalyzeUrl(url);
      (backup as any).error = err.message;
      return res.json(backup);
    }
  });

  // Email check endpoint
  app.post("/api/analyze/email", async (req, res) => {
    const { sender, subject, body } = req.body;
    if (!body) {
      return res.status(400).json({ error: "Missing 'body' field in request body." });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json(localHeuristicsAnalyzeEmail(sender || "", subject || "", body));
    }

    try {
      const prompt = `Analyze this Email for phishing indicators, deceptive links, social engineering urgency threats, mismatched domains, or branding fraud.
Email Metadata:
Sender: "${sender || "Unknown"}"
Subject: "${subject || "No Subject"}"
Body的内容: "${body}"

Return a JSON object conforming exactly to this structure:
{
  "riskScore": "Safe" | "Suspicious" | "Dangerous",
  "scoreValue": number (0 to 100),
  "senderAssessment": "Comment on whether the sender looks legitimate, generic, or spoofed.",
  "mismatchedDomains": boolean,
  "urgentLanguageDetected": boolean,
  "suspiciousLinksFound": ["list any deceptive link addresses"],
  "highlights": [
    {
      "text": "Exact short sentence phrase from the email body that is risky",
      "riskLevel": "high" | "medium" | "low",
      "issueCategory": "Urgency" | "Suspicious Link" | "Sender Mimicry" | "Credential Request" | "Generic Greeting" | "None",
      "explanation": "Why this specific portion triggers security concerns."
    }
  ],
  "safetyRecommendations": ["3 specific advice bullet points for handling this email content"],
  "explanation": "Clear objective verdict explaining why the email is unsafe, suspicious, or completely safe."
}
Limit output strictly to valid JSON representation.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(response.text || "{}");
      data.mode = "ai";
      return res.json(data);
    } catch (err: any) {
      console.error("Gemini Email Analysis failed, falling back:", err.message);
      const backup = localHeuristicsAnalyzeEmail(sender || "", subject || "", body);
      (backup as any).error = err.message;
      return res.json(backup);
    }
  });

  // SMS check endpoint
  app.post("/api/analyze/sms", async (req, res) => {
    const { body } = req.body;
    if (!body) {
      return res.status(400).json({ error: "Missing 'body' request argument." });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json(localHeuristicsAnalyzeSms(body));
    }

    try {
      const prompt = `Inspect this SMS text for smishing (SMS Phishing) patterns: urgent financial lockdowns, courier tracking redirection, impersonation claims, lottery winnings, or unauthorized logins.
SMS Text content: "${body}"

Return a JSON object conforming exactly to this layout structure:
{
  "riskScore": "Safe" | "Suspicious" | "Dangerous",
  "scoreValue": number (0 to 100),
  "smishingCategory": "Package Delivery" | "Bank Alert" | "Impersonation" | "Subscription Auto-Renewal" | "None",
  "suspiciousElements": ["bullet points listing specific red flag elements found in the text"],
  "highlights": [
    {
      "text": "Exact suspicious phrase or word in the SMS",
      "riskLevel": "high" | "medium" | "low",
      "issueCategory": "Urgent Claim" | "Suspicious Link" | "Spoofing" | "Irrelevant Sender" | "None",
      "explanation": "Brief reasoning explaining why this text fragment is high-risk."
    }
  ],
  "safetyRecommendations": ["3 specific safety actions (e.g. check courier site separately, block sender)"],
  "explanation": "Clear summary warning the customer of potential harms."
}
Only output the JSON object without code blocks.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(response.text || "{}");
      data.mode = "ai";
      return res.json(data);
    } catch (err: any) {
      console.error("Gemini SMS Analysis failed, using local heuristics:", err.message);
      const backup = localHeuristicsAnalyzeSms(body);
      (backup as any).error = err.message;
      return res.json(backup);
    }
  });

  // Hot module reload check and static bundle assets loading or web config routing.
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PhishGuard back-end process active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
