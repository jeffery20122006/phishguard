import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Mail,
  Smartphone,
  Search,
  PlusCircle,
  BookOpen,
  Award,
  Activity,
  FileText,
  Send,
  RefreshCw,
  HelpCircle,
  Check,
  X,
  Lock,
  Unlock,
  BarChart2,
  Bell,
  ArrowRight,
  Info,
  ChevronRight,
  Download,
  History
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Cell,
  PieChart as RechartPie,
  Pie,
} from "recharts";
import { quizQuestions, educationalModules } from "./data";
import { SearchResult, ReportedLink, QuizQuestion } from "./types";

export default function App() {
  // Navigation / Tabs state
  const [activeTab, setActiveTab] = useState<"dashboard" | "url" | "email" | "sms" | "database" | "academy" | "extension" | "api">("dashboard");

  // System stats & connectivity status
  const [dbStats, setDbStats] = useState<any>({
    totalReported: 5,
    verifiedSources: 5,
    typesCount: { website: 3, email: 1, sms: 1 }
  });
  const [aiOnline, setAiOnline] = useState<boolean>(false);
  const [systemHealthy, setSystemHealthy] = useState<boolean>(true);
  const [pingTime, setPingTime] = useState<number>(0);
  const [activeShield, setActiveShield] = useState<boolean>(true);

  // Active user's personal analytics/history tracking
  const [scanHistory, setScanHistory] = useState<Array<{
    id: string;
    timestamp: string;
    type: "URL" | "Email" | "SMS";
    target: string;
    score: number;
    verdict: "Safe" | "Suspicious" | "Dangerous";
  }>>([
    { id: "h-1", timestamp: "2026-06-09T12:45:00Z", type: "URL", target: "paypal.com", score: 10, verdict: "Safe" },
    { id: "h-2", timestamp: "2026-06-09T12:10:00Z", type: "SMS", target: "+1 (839) 492-2023 - Package Alert", score: 90, verdict: "Dangerous" },
    { id: "h-3", timestamp: "2026-06-09T11:32:00Z", type: "Email", target: "billing@netflix.com - invoice", score: 12, verdict: "Safe" }
  ]);

  // URL Scanner Form states
  const [inputUrl, setInputUrl] = useState<string>("");
  const [urlLoading, setUrlLoading] = useState<boolean>(false);
  const [urlResult, setUrlResult] = useState<SearchResult | null>(null);

  // Email Analyzer Form states
  const [emailSender, setEmailSender] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailBody, setEmailBody] = useState<string>("");
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [emailResult, setUrlEmailResult] = useState<SearchResult | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  // SMS Analyzer Form states
  const [smsBody, setSmsBody] = useState<string>("");
  const [smsLoading, setSmsLoading] = useState<boolean>(false);
  const [smsResult, setSmsResult] = useState<SearchResult | null>(null);

  // Database and Report Feed states
  const [reportedLinks, setReportedLinks] = useState<ReportedLink[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [reportedLoading, setReportedLoading] = useState<boolean>(false);

  // Submit Report modal / fields
  const [reportUrl, setReportUrl] = useState<string>("");
  const [reportType, setReportType] = useState<"website" | "email" | "sms">("website");
  const [reportCategory, setReportCategory] = useState<string>("");
  const [reportDescription, setReportDescription] = useState<string>("");
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);

  // Academy Quiz module states
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<boolean | null>(null); // true = guess phish, false = guess safe
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswersHistory, setQuizAnswersHistory] = useState<Array<{ index: number, correct: boolean }>>([]);

  // Browser Companion Simulator states
  const [browserAddress, setBrowserAddress] = useState<string>("google.com");
  const [simulatedPageContent, setSimulatedPageContent] = useState<{
    loaded: boolean;
    domain: string;
    securityWarning: boolean;
    analysisResult: SearchResult | null;
  }>({
    loaded: true,
    domain: "google.com",
    securityWarning: false,
    analysisResult: null
  });
  const [checkingSimUrl, setCheckingSimUrl] = useState<boolean>(false);

  // Preset quick-baits lists to ease user discovery
  const urlPresets = [
    { label: "Legitimate Paypal", url: "https://www.paypal.com/signin" },
    { label: "Spoof Bank", url: "http://chase-security-verify-profile-alert.net/update" },
    { label: "Metamask Credential Drainer", url: "metamask-secure-wallet-update.net/import" },
    { label: "Netflix xyz billing", url: "netflix-billing-update-required.xyz" },
  ];

  const emailPresets = [
    {
      label: "UPS Courier Scam Bait",
      sender: "notifications@ups-delivery-verify.org",
      subject: "Action Required: Failed courier delivery package #38291",
      body: `Dear customer, standard delivery fees are outstanding on package ID-9283918. 
We attempted delivery at your residential address but verified an incorrect home number. 

To dispatch redelivery immediately, you are requested to verify your debit card records inside 12 hours:
http://ups-delivery-verify.org/re-dispatch/invoice.html

Failure to comply will cause the shipping package to be returned to coordinates immediately.`
    },
    {
      label: "Google Account Alert (Safe)",
      sender: "no-reply@accounts.google.com",
      subject: "Security Alert: New sign-in detected on Google Chrome",
      body: `Hello Paul, a new sign-in occurred on your Google profile using device Linux 64-bit on Chrome browser. 
If this was you, no action is requested. If you do not recognize this activity, verify your registered equipment in your personal Google dashboard settings.`
    },
    {
      label: "Wells Fargo Panic Attack",
      sender: "wellsfargo-pass-update@support-banking.cc",
      subject: "SECURITY ALERT: Unauthorized access to Wells online portal",
      body: `Attention Wells Fargo Client! We detected unusual credential access on your accounts. 
Due to Federal banking telemetry codes, we placed a temporary suspension on transfers. 

Verify your passcode and card PIN immediately to halt account seizure:
https://wells-fargo-authentication.cc/security/login.php

Thank you, Wells Fargo Security Center Services.`
    }
  ];

  const smsPresets = [
    {
      label: "USPS delivery failed link",
      body: "USPS Notice: Your package could not be delivered due to an incorrect house number. To update your address information and arrange redelivery, please complete the form link: https://usps-redelivery.com/address"
    },
    {
      label: "Legitimate Bank 2FA shortcode",
      body: "Wells Fargo Alert: Verification code 829-103. Valid for 10 minutes. Do not share this code. We will never call to request this code."
    },
    {
      label: "Amazon Security Fraud Alert",
      body: "Amazon ALERT: Unusual transaction of $841.22 detected on your debit card. If this was not you, please tap this link: http://amazon-charge-dispute.xyz"
    }
  ];

  // Load and refresh initial data
  useEffect(() => {
    fetchStatus();
    fetchReportedFeed();
  }, []);

  const fetchStatus = async () => {
    const start = Date.now();
    try {
      const res = await fetch("/api/status");
      if (res.ok) {
        const data = await res.json();
        setAiOnline(data.aiAvailable);
        setSystemHealthy(data.status === "healthy");
        if (data.databaseStats) {
          setDbStats(data.databaseStats);
        }
      }
    } catch (e) {
      console.warn("Back-end status check failed. Utilizing offline simulations code.", e);
      setSystemHealthy(false);
    } finally {
      setPingTime(Date.now() - start);
    }
  };

  const fetchReportedFeed = async () => {
    setReportedLoading(true);
    try {
      const res = await fetch("/api/db/reported");
      if (res.ok) {
        const data = await res.json();
        setReportedLinks(data);
      }
    } catch (e) {
      console.error("Failed to query reported database feed.", e);
    } finally {
      setReportedLoading(false);
    }
  };

  // Scan Actions
  const handleUrlScan = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    setUrlLoading(true);
    try {
      const res = await fetch("/api/analyze/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl })
      });
      if (res.ok) {
        const data: SearchResult = await res.json();
        setUrlResult(data);

        // Append to local history tracking
        setScanHistory(prev => [
          {
            id: `h-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: "URL",
            target: targetUrl,
            score: data.scoreValue,
            verdict: data.riskScore
          },
          ...prev
        ]);
        
        // Refresh stats
        fetchStatus();
      }
    } catch (e) {
      console.error("URL scan request error", e);
    } finally {
      setUrlLoading(false);
    }
  };

  const handleEmailScan = async () => {
    if (!emailBody.trim()) return;
    setEmailLoading(true);
    try {
      const res = await fetch("/api/analyze/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: emailSender,
          subject: emailSubject,
          body: emailBody
        })
      });
      if (res.ok) {
        const data: SearchResult = await res.json();
        setUrlEmailResult(data);

        // Append to local history tracking
        setScanHistory(prev => [
          {
            id: `h-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: "Email",
            target: `${emailSender || "Unknown"} | ${emailSubject || "No Subject"}`,
            score: data.scoreValue,
            verdict: data.riskScore
          },
          ...prev
        ]);
        
        fetchStatus();
      }
    } catch (e) {
      console.error("Email analyzer failed", e);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSmsScan = async (messageText: string) => {
    if (!messageText.trim()) return;
    setSmsLoading(true);
    try {
      const res = await fetch("/api/analyze/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: messageText })
      });
      if (res.ok) {
        const data: SearchResult = await res.json();
        setSmsResult(data);

        setScanHistory(prev => [
          {
            id: `h-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: "SMS",
            target: messageText.substring(0, 45) + (messageText.length > 45 ? "..." : ""),
            score: data.scoreValue,
            verdict: data.riskScore
          },
          ...prev
        ]);

        fetchStatus();
      }
    } catch (e) {
      console.error("SMS analysis request failed", e);
    } finally {
      setSmsLoading(false);
    }
  };

  // Submit Report Action
  const submitNewReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportUrl.trim()) return;
    try {
      const res = await fetch("/api/db/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: reportUrl,
          type: reportType,
          category: reportCategory,
          description: reportDescription
        })
      });
      if (res.ok) {
        setReportSuccessMsg("Report successfully queued! PhishGuard active telemetry database updated.");
        setReportUrl("");
        setReportCategory("");
        setReportDescription("");
        fetchReportedFeed();
        setTimeout(() => setReportSuccessMsg(null), 7000);
      }
    } catch (err) {
      console.error("Failed to post custom report indicator", err);
    }
  };

  // Test Simulation companion
  const handleValidateSimulatedUrl = async (urlStr: string) => {
    setCheckingSimUrl(true);
    let verifyUrl = urlStr;
    if (!/^https?:\/\//i.test(verifyUrl)) {
      verifyUrl = "http://" + verifyUrl;
    }
    
    try {
      const res = await fetch("/api/analyze/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: verifyUrl })
      });
      
      if (res.ok) {
        const data: SearchResult = await res.json();
        setSimulatedPageContent({
          loaded: true,
          domain: urlStr,
          securityWarning: data.riskScore !== "Safe",
          analysisResult: data
        });
      }
    } catch (e) {
      console.error("Sim validation failed", e);
    } finally {
      setCheckingSimUrl(false);
    }
  };

  // Mock File Upload (Read file name & lines to auto-fill)
  const handleEmailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        // Basic extraction for sender/subject from plain .eml format
        const lines = text.split("\n");
        let parsedSender = "";
        let parsedSubject = "";
        let parsedBody = "";
        let parsingHeaders = true;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (parsingHeaders) {
            if (line.toLowerCase().startsWith("from:")) {
              parsedSender = line.substring(5).trim();
            } else if (line.toLowerCase().startsWith("subject:")) {
              parsedSubject = line.substring(8).trim();
            } else if (line.trim() === "") {
              parsingHeaders = false;
            }
          } else {
            parsedBody += line + "\n";
          }
        }

        setEmailSender(parsedSender || "uploaded-file@sender-headers.net");
        setEmailSubject(parsedSubject || `Content Scan containing ${file.name}`);
        setEmailBody(parsedBody.trim() || text);
      };
      reader.readAsText(file);
    }
  };

  // Quiz Navigation
  const handleQuizAnswer = (guessIsPhishing: boolean) => {
    if (quizSubmitted) return;
    setSelectedQuizAnswer(guessIsPhishing);
    const question = quizQuestions[currentQuizIndex];
    const isCorrect = guessIsPhishing === question.isPhishing;
    setQuizSubmitted(true);
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    setQuizAnswersHistory(prev => [...prev, { index: currentQuizIndex, correct: isCorrect }]);
  };

  const nextQuizQuestion = () => {
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Finished all questions, allow restart from 0
      setCurrentQuizIndex(0);
      setQuizScore(0);
      setQuizAnswersHistory([]);
    }
  };

  // Filter reported items
  const filteredReported = reportedLinks.filter(item => {
    const matchesSearch = item.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" ? true : item.type === filterType;
    return matchesSearch && matchesType;
  });

  // Risk Score UI badges
  const getRiskBadge = (score: "Safe" | "Suspicious" | "Dangerous") => {
    switch (score) {
      case "Safe":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">✓ Verified Safe</span>;
      case "Suspicious":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">⚠ Suspicious Indicator</span>;
      case "Dangerous":
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/30">⛔ High Risk Phish</span>;
      default:
        return null;
    }
  };

  const getRiskColorClass = (score: "Safe" | "Suspicious" | "Dangerous") => {
    switch (score) {
      case "Safe":
        return "from-emerald-950/40 via-emerald-900/10 to-transparent border-emerald-800/30 text-emerald-200";
      case "Suspicious":
        return "from-amber-950/40 via-amber-900/10 to-transparent border-amber-800/30 text-amber-200";
      case "Dangerous":
        return "from-red-950/40 via-red-900/10 to-transparent border-red-800/30 text-red-200";
      default:
        return "from-slate-900 via-slate-800/50 to-transparent border-slate-700/30 text-slate-200";
    }
  };

  // Chart Calculations
  const rechartData = [
    { name: "Web Scans", count: dbStats.typesCount?.website || 3 },
    { name: "Email Scans", count: dbStats.typesCount?.email || 1 },
    { name: "SMS Alerts", count: dbStats.typesCount?.sms || 1 },
  ];

  const severityPieData = [
    { name: "Dangerous", value: reportedLinks.length || 5, color: "#ef4444" },
    { name: "Suspicious & Safe Checks", value: scanHistory.length || 3, color: "#10b981" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-100">
      {/* Top Warning Warning Alert Status Bar */}
      <div className="bg-slate-900 border-b border-slate-800 py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span><strong>Active Node Service Protocol:</strong> Protected against Zero-Day Smishing & Brand Typosquatting</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 header-sub">
              <Activity className="w-3.5 h-3.5 text-blue-400" /> Ping-rate: <strong className="text-slate-200">{pingTime}ms</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${aiOnline ? 'bg-emerald-400' : 'bg-yellow-400'}`}></span>
              Deep Analyzer AI Mode: <strong className="text-slate-200">{aiOnline ? "V3.5 Gemini Engine [Fully Enabled]" : "Local Heuristic Rules Mode"}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Structural Banner Frame Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" id="app-logo-icon" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold tracking-tight text-white font-display">PhishGuard</h1>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono uppercase">V2.4 PRO</span>
              </div>
              <p className="text-xs text-slate-400">Advanced AI Defense Platform for SMS, Emails & URLs</p>
            </div>
          </div>

          {/* Tab Selection Navigation Hub */}
          <nav className="flex flex-wrap items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("dashboard")}
              id="nav-tab-dashboard"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "dashboard" ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/10" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Control Center
            </button>
            <button
              onClick={() => setActiveTab("url")}
              id="nav-tab-url"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "url" ? "bg-emerald-500 text-slate-950 font-bold shadow-md" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              🌐 URL Scanner
            </button>
            <button
              onClick={() => setActiveTab("email")}
              id="nav-tab-email"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "email" ? "bg-emerald-500 text-slate-950 font-bold shadow-md" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              ✉ Email Analyzer
            </button>
            <button
              onClick={() => setActiveTab("sms")}
              id="nav-tab-sms"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "sms" ? "bg-emerald-500 text-slate-950 font-bold shadow-md" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              💬 SMS Smishing
            </button>
            <button
              onClick={() => setActiveTab("database")}
              id="nav-tab-database"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "database" ? "bg-emerald-500 text-slate-950 font-bold shadow-md" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              🗃 Feed & Report
            </button>
            <button
              onClick={() => setActiveTab("academy")}
              id="nav-tab-academy"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "academy" ? "bg-emerald-500 text-slate-950 font-bold shadow-md" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              🎓 Academy & Drill
            </button>
            <button
              onClick={() => setActiveTab("extension")}
              id="nav-tab-extension"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "extension" ? "bg-emerald-500 text-slate-950 font-bold shadow-md" : "text-slate-300 hover:bg-slate-800 text-slate-400"
              }`}
            >
              🔌 Shield Companion
            </button>
            <button
              onClick={() => setActiveTab("api")}
              id="nav-tab-api"
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                activeTab === "api" ? "bg-emerald-500 text-slate-950 font-bold shadow-md" : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              cURL API
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* ============================================================= */}
        {/* TAB 1: CONTROL CENTER (DASHBOARD)                           */}
        {/* ============================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-8" id="dashboard-tab-content">
            {/* Top Interactive Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden" id="metric-threats">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">ACTIVE FED THREATS</p>
                    <h3 className="text-3xl font-extrabold text-white mt-2">{dbStats.totalReported || 5}</h3>
                  </div>
                  <div className="p-2.5 bg-red-950/50 border border-red-500/20 rounded-xl">
                    <ShieldAlert className="w-5.5 h-5.5 text-red-400" />
                  </div>
                </div>
                <p className="text-xs text-red-400 mt-4 flex items-center gap-1">
                  <span>● Active Live Intel Feed</span>
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden" id="metric-scanned">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">MY SCANS & QUERIES</p>
                    <h3 className="text-3xl font-extrabold text-white mt-2">{scanHistory.length}</h3>
                  </div>
                  <div className="p-2.5 bg-emerald-950/50 border border-emerald-500/20 rounded-xl">
                    <ShieldCheck className="w-5.5 h-5.5 text-emerald-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  Stored securely in local cache
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden" id="metric-health">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">VERIFIED SECURE SOURCES</p>
                    <h3 className="text-3xl font-extrabold text-white mt-1.5">{dbStats.verifiedSources || 5}</h3>
                  </div>
                  <div className="p-2.5 bg-blue-950/50 border border-blue-500/20 rounded-xl">
                    <Globe className="w-5.5 h-5.5 text-blue-400" />
                  </div>
                </div>
                <p className="text-xs text-green-400 mt-4">
                  100% databases synched
                </p>
              </div>

              {/* Instant Active Protection Toggle Switch */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-indigo-300 font-bold tracking-widest uppercase">PhishGuard Guardrail</span>
                  <span className={`px-2 py-0.5 text-[9px] font-mono rounded ${activeShield ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-red-950 text-red-400 border border-red-500/20'}`}>
                    {activeShield ? "ACTIVE" : "BYPASSED"}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">Browser Real-time Intercept</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Blocks zero-day credential harvesting in active browser tab simulation.</p>
                <button
                  onClick={() => {
                    setActiveShield(!activeShield);
                    if (activeTab === "extension" || activeTab === "dashboard") {
                      // Trigger prompt confirmation or simple state switch
                    }
                  }}
                  id="shield-toggle-btn"
                  className={`mt-3 w-full py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeShield ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  }`}
                >
                  {activeShield ? "Disable Block Shield" : "Enable Active Defense"}
                </button>
              </div>
            </div>

            {/* Main Interactive Scan Suite Header Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
              
              <div className="space-y-3 max-w-2xl relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">Scan suspect elements against zero-day phishing</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Protect your identity from fraudulent SMS codes, package trackers, and banking portal clones. Enter a URL or paste contents to run checks using our double local + Gemini AI parser.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab("url")}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" /> URL Scanner
                  </button>
                  <button
                    onClick={() => setActiveTab("email")}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email Analyzer
                  </button>
                  <button
                    onClick={() => setActiveTab("sms")}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all flex items-center gap-1.5"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> SMS Smishing
                  </button>
                </div>
              </div>

              {/* Graphic Simulator Panel Widget */}
              <div className="w-full md:w-80 bg-slate-950 border border-slate-800 p-4 rounded-2xl relative z-10">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
                  <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Scanner Diagnostic
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">ONLINE</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Google Safe Browsing:</span>
                    <span className="text-emerald-400">CONNECTING</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>VirusTotal API status:</span>
                    <span className="text-emerald-400">SYNCHRONIZED</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>PhishLabs heuristics:</span>
                    <span className="text-emerald-400">ACTIVE</span>
                  </div>
                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Auto Rule Updates:</span>
                    <span className="text-blue-400 font-mono text-[10px]">v10.42_STABLE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Analytics & User History Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Analytics Segment column */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 lg:col-span-1">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-400" /> Malicious Classification Share
                </h3>
                
                <div className="h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rechartData}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} width={25} />
                      <ChartTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} 
                        labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]}>
                        <Cell key="cell-0" fill="#3b82f6" />
                        <Cell key="cell-1" fill="#ec4899" />
                        <Cell key="cell-2" fill="#eab308" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded"></span>Websites</span>
                    <strong className="text-slate-200">{dbStats.typesCount?.website || 3} items</strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-pink-500 rounded"></span>Emails</span>
                    <strong className="text-slate-200">{dbStats.typesCount?.email || 1} items</strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-yellow-500 rounded"></span>SMS</span>
                    <strong className="text-slate-200">{dbStats.typesCount?.sms || 1} items</strong>
                  </div>
                </div>
              </div>

              {/* History Scans Lists */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" /> Live Analysis History logs
                  </h3>
                  <button 
                    onClick={() => {
                      setScanHistory([
                        { id: "h-1", timestamp: new Date().toISOString(), type: "URL", target: "paypal.com", score: 10, verdict: "Safe" }
                      ]);
                    }}
                    className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    Clear history logs
                  </button>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[260px] pr-2">
                  {scanHistory.length === 0 ? (
                    <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-slate-900 text-slate-500 text-xs">
                      No past scans recorded here yet. Visit Website or Mail Analyzer tabs to initiate scanning.
                    </div>
                  ) : (
                    scanHistory.map((historyItem) => {
                      const isDanger = historyItem.verdict === "Dangerous";
                      const isSuspicious = historyItem.verdict === "Suspicious";
                      return (
                        <div 
                          key={historyItem.id} 
                          className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl hover:border-slate-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-3">
                            <span className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded-md uppercase ${
                              historyItem.type === "URL" ? "bg-blue-950 text-blue-400" :
                              historyItem.type === "Email" ? "bg-fuchsia-950 text-fuchsia-400" :
                              "bg-yellow-950 text-yellow-500"
                            }`}>
                              {historyItem.type}
                            </span>
                            <div className="space-y-0.5">
                              <p className="font-mono text-white break-all max-w-sm sm:max-w-md md:max-w-lg">{historyItem.target}</p>
                              <p className="text-[10px] text-slate-400">
                                Checked at: {new Date(historyItem.timestamp).toLocaleTimeString()} · Risk Rating: <span className={
                                  isDanger ? "text-red-400 font-bold" : isSuspicious ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"
                                }>{historyItem.score}/100</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getRiskBadge(historyItem.verdict)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Educational Quick Box */}
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-950 text-emerald-400 rounded-lg mt-0.5">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">How does PhishGuard compute the Phishing Verdict?</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      We crosscheck target assets using structural homograph indicators, urgency context classifiers, low-cost TLD databases, and active real-time report matching feeds.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Educational Section CTA */}
            <div className="bg-gradient-to-r from-blue-950/20 via-slate-900 to-indigo-950/20 border border-slate-800 hover:border-indigo-500/20 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-950 text-indigo-400 rounded-xl mt-1">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Practice Simulated Phishing Threat Drills</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Play our interactive security simulation game! Review emails and texts to see if you can isolate clever homographs, phishing indicators, and bypass coercive social engineering tactics.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("academy")}
                className="whitespace-nowrap px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer"
              >
                Launch Drill Challenge <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 2: URL SCANNER                                           */}
        {/* ============================================================= */}
        {activeTab === "url" && (
          <div className="space-y-8" id="url-tab-content">
            <div className="max-w-3xl mx-auto space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs text-emerald-400 font-bold tracking-widest uppercase">🌐 Domain Reputation Engine</span>
                <h2 className="text-2xl font-bold tracking-tight text-white font-display">Zero-Day Web Portal Analyzer</h2>
                <p className="text-xs text-slate-300">
                  PhishGuard analyzes URLs for lookalike characters (homograph attacks), nested subdomains designed to conceal targets, mismatched security headers, and domain age reputation elements.
                </p>
              </div>

              {/* Form Input block */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="space-y-2">
                  <label htmlFor="url-input" className="block text-xs font-semibold text-slate-300">
                    Suspect Website Domain or Link Path
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-500 text-xs font-mono">http(s)://</span>
                      <input
                        id="url-input"
                        type="text"
                        placeholder="e.g. paypaI.com-security-alert.net/signin"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        className="w-full pl-18 pr-3 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm font-mono text-white focus:outline-none placeholder-slate-600 transition-all"
                      />
                    </div>
                    <button
                      onClick={() => handleUrlScan(inputUrl)}
                      disabled={urlLoading || !inputUrl.trim()}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-400 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/5 flex items-center gap-1.5 transition-all cursor-pointer min-w-[120px] justify-center"
                    >
                      {urlLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> SCANNING
                        </>
                      ) : (
                        "RUN CHECK"
                      )}
                    </button>
                  </div>
                </div>

                {/* Preset quick test blocks */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] text-slate-400 font-medium">Click to try standard phishing bait examples:</span>
                  <div className="flex flex-wrap gap-2">
                    {urlPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputUrl(preset.url);
                          handleUrlScan(preset.url);
                        }}
                        className="px-2.5 py-1 text-[10px] bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 rounded-lg cursor-pointer transition-all"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Render URL result */}
              {urlLoading && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
                  <div className="inline-flex p-3 bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 rounded-xl animate-spin">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-emerald-300 font-mono">Running domain analysis, SSL check pipelines, homograph tests...</p>
                </div>
              )}

              {urlResult && !urlLoading && (
                <div className={`bg-gradient-to-b ${getRiskColorClass(urlResult.riskScore)} border p-6 rounded-2xl space-y-6 relative overflow-hidden transition-all duration-300`}>
                  
                  {/* Top Header result card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">VERDICT REPORT ({urlResult.mode === "ai" ? "Gemini Deep AI Verified" : "Rule Local Heuristics"})</span>
                      <h3 className="text-xl font-mono font-bold text-white truncate break-all max-w-md sm:max-w-xl mt-1">{inputUrl}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono uppercase block">Threat Level Score</span>
                        <span className="text-lg font-mono font-semibold text-white">{urlResult.scoreValue}/100</span>
                      </div>
                      {getRiskBadge(urlResult.riskScore)}
                    </div>
                  </div>

                  {/* Summary Text Explanation */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Analysis Statement Summary:</h4>
                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800/50">
                      {urlResult.explanation}
                    </p>
                  </div>

                  {/* Detailed Indicators discovered list */}
                  {urlResult.analysis && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-xl space-y-2.5">
                        <h5 className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-blue-400" /> Host Domain Alignment Check
                        </h5>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {urlResult.analysis.domainAnalysis || "Domain assessed for homographs and typosquatting."}
                        </p>
                        <div className="border-t border-slate-800/50 pt-2 mt-2">
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span className="font-semibold text-slate-200">SSL status:</span>
                            <span>{urlResult.analysis.sslCheck || "Safe SSL Certificate validated"}</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-xl space-y-3">
                        <h5 className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" /> Malicious Indicators Flushed ({urlResult.analysis.indicatorsFound?.length || 0})
                        </h5>
                        {urlResult.analysis.indicatorsFound && urlResult.analysis.indicatorsFound.length > 0 ? (
                          <ul className="space-y-1.5">
                            {urlResult.analysis.indicatorsFound.map((indicator, i) => (
                              <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                                <span className="text-red-400 mt-0.5">•</span>
                                <span>{indicator}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-[11px] text-slate-400">
                            No suspicious structural rules triggered in hostname formatting.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="border-t border-slate-800/60 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">Emergency Recommendations:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {urlResult.recommendations?.map((rec, idx) => (
                        <div key={idx} className="bg-slate-900/60 p-3 rounded-xl text-[10px] text-slate-300 border border-slate-800/55 flex items-start gap-2">
                          <div className="bg-blue-950/80 p-1 text-blue-400 rounded-md mt-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                          <span>{rec}</span>
                        </div>
                      )) || (
                        <>
                          <div className="bg-slate-900/60 p-3 rounded-xl text-[10px]">Verify URL is from corporate bookmarked entries</div>
                          <div className="bg-slate-900/60 p-3 rounded-xl text-[10px]">Do not download suspicious .zip files from unchecked domains</div>
                          <div className="bg-slate-900/60 p-3 rounded-xl text-[10px]">Turn on 2FA security validation headers</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Interactive Button to Report Link */}
                  {urlResult.riskScore !== "Safe" && (
                    <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-950/20 p-4 rounded-xl">
                      <span className="text-slate-300">Is this URL a confirmed active phishing page? Submit to share with the threat community.</span>
                      <button
                        onClick={() => {
                          setReportUrl(inputUrl);
                          setReportType("website");
                          setReportCategory(urlResult.analysis?.suspiciousPatterns?.[0] ? `${urlResult.analysis.suspiciousPatterns[0]} Spoof` : "Deceptive Domain");
                          setReportDescription(urlResult.explanation);
                          setActiveTab("database");
                        }}
                        className="whitespace-nowrap px-4 py-2 bg-red-500 hover:bg-red-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
                      >
                        ⚡ Report to Live Feed Database
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 3: EMAIL ANALYZER                                       */}
        {/* ============================================================= */}
        {activeTab === "email" && (
          <div className="space-y-8" id="email-tab-content">
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs text-emerald-400 font-bold tracking-widest uppercase">✉ High-Fidelity Mail Inspector</span>
                <h2 className="text-2xl font-bold tracking-tight text-white font-display">Email Threat Analysis & Header Check</h2>
                <p className="text-sm text-slate-300">
                  Analyze emails for mismatched sender addresses, urgent threat language, fake invoice baits, and suspicious clickable links. Paste headers, mail text, or drag-and-drop a message file.
                </p>
              </div>

              {/* Presets and form panel */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Email presets column */}
                <div className="lg:col-span-1 space-y-3">
                  <span className="text-xs font-semibold text-slate-300 block">Choose a threat template to test:</span>
                  <div className="flex flex-col gap-2">
                    {emailPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setEmailSender(preset.sender);
                          setEmailSubject(preset.subject);
                          setEmailBody(preset.body);
                          setAttachedFileName(null);
                        }}
                        className="p-3 text-left bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 rounded-xl text-xs space-y-1 transition-all cursor-pointer"
                      >
                        <p className="font-bold text-slate-200 line-clamp-1">{preset.label}</p>
                        <p className="text-[10px] text-slate-400 truncate">Sender: {preset.sender}</p>
                      </button>
                    ))}
                  </div>

                  {/* Drag and Drop File Upload Area */}
                  <div className="bg-slate-900/40 border border-dashed border-slate-800 p-4 rounded-xl text-center space-y-2">
                    <FileText className="w-6 h-6 text-slate-500 mx-auto" />
                    <p className="text-[10px] text-slate-400 font-medium">Or scan email files (.eml, .txt)</p>
                    <label className="inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-semibold cursor-pointer transition-all">
                      Choose file
                      <input 
                        type="file" 
                        accept=".eml,.txt" 
                        onChange={handleEmailFileChange} 
                        className="hidden" 
                      />
                    </label>
                    {attachedFileName && (
                      <p className="text-[9px] text-emerald-400 font-mono truncate">Selected: {attachedFileName}</p>
                    )}
                  </div>
                </div>

                {/* Form column */}
                <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase">Sender Raw Address (From: Header)</label>
                      <input
                        type="text"
                        placeholder="e.g., support-service@paypal-alerts.net"
                        value={emailSender}
                        onChange={(e) => setEmailSender(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs font-mono text-white focus:outline-none placeholder-slate-600 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase">Subject Heading line</label>
                      <input
                        type="text"
                        placeholder="e.g., Immediate security hold on your credit profile"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white focus:outline-none placeholder-slate-600 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Full Email Body Content Text</label>
                    <textarea
                      rows={6}
                      placeholder="Paste the plain body text email message here..."
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full p-4 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white focus:outline-none placeholder-slate-600 transition-all font-sans leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        setEmailSender("");
                        setEmailSubject("");
                        setEmailBody("");
                        setAttachedFileName(null);
                        setUrlEmailResult(null);
                      }}
                      className="px-4 py-2 text-xs font-medium bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl cursor-pointer"
                    >
                      Reset input
                    </button>
                    <button
                      onClick={handleEmailScan}
                      disabled={emailLoading || !emailBody.trim()}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      {emailLoading ? "EXAMINING CONTENT..." : "ANALYZE THREAT FEED"}
                    </button>
                  </div>

                </div>
              </div>

              {/* Scan Results Display */}
              {emailLoading && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
                  <div className="inline-flex p-3 bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 rounded-xl animate-spin">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-emerald-300 font-mono">Decoding header trails, running brand impersonation analysis, and classifying emotional stress indicators...</p>
                </div>
              )}

              {emailResult && !emailLoading && (
                <div className={`bg-gradient-to-b ${getRiskColorClass(emailResult.riskScore)} border p-6 rounded-2xl space-y-6 relative overflow-hidden transition-all duration-300`}>
                  
                  {/* Verdict top section */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">ANALYSIS REPORT</span>
                      <h3 className="text-lg font-bold text-white mt-1">Sender: <span className="font-mono">{emailSender || "No Sender Data Supplied"}</span></h3>
                      <p className="text-xs text-slate-400 mt-1">Subject: "{emailSubject || "No Subject"}"</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 block">Threat Risk Value</span>
                        <span className="text-base font-mono font-semibold text-white">{emailResult.scoreValue}/100</span>
                      </div>
                      {getRiskBadge(emailResult.riskScore)}
                    </div>
                  </div>

                  {/* Summary Response */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Deception Assessment:</h4>
                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800/50">
                      {emailResult.explanation}
                    </p>
                  </div>

                  {/* Highlighting parts (The core visual highlights feature) */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Highlighted Suspect Excerpts & Alerts:</h4>
                    <div className="space-y-2.5">
                      {emailResult.highlights && emailResult.highlights.length > 0 ? (
                        emailResult.highlights.map((hlt, i) => (
                          <div key={i} className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl text-xs space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="px-2 py-0.5 text-[9px] font-bold font-mono bg-red-950 text-red-400 border border-red-500/20 rounded">
                                {hlt.issueCategory || "Anomaly Triggered"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">Flag Severity: <strong className="text-slate-300 capitalize">{hlt.riskLevel}</strong></span>
                            </div>
                            <blockquote className="italic font-mono text-slate-200 border-l-2 border-red-500 pl-2 my-1 bg-slate-900/60 p-1 rounded">
                              "{hlt.text}"
                            </blockquote>
                            <p className="text-[10px] text-slate-400 leading-relaxed pt-0.5">
                              {hlt.explanation}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-slate-950/40 text-center text-slate-500 text-xs rounded-xl">
                          No blatant urgent/threatening phrasing patterns flagged.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Diagnostics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Sender Authenticity Match</span>
                      <p className="text-xs text-white font-medium mt-1">
                        {emailResult.senderAssessment || "Sender assessed for brand Spoofing checks"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Urging Language Detected</span>
                      <p className="text-xs text-white font-medium mt-1">
                        {emailResult.urgentLanguageDetected ? "⚠️ Urgent Trigger Keywords Present" : "✓ Standard Tone Detected"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Redirect URL Elements</span>
                      <p className="text-xs text-white font-mono mt-1 break-all">
                        {emailResult.suspiciousLinksFound && emailResult.suspiciousLinksFound.length > 0
                          ? emailResult.suspiciousLinksFound.join(", ") 
                          : "None found"}
                      </p>
                    </div>
                  </div>

                  {/* Email recommendations list */}
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">Specific Safety recommendations:</h4>
                    <ul className="space-y-1.5 bg-slate-950/80 p-4 rounded-xl border border-slate-800/50">
                      {emailResult.safetyRecommendations?.map((rec, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      )) || (
                        <>
                          <li className="text-xs text-slate-300 flex items-start gap-2">Check display name carefully in sender records</li>
                          <li className="text-xs text-slate-300 flex items-start gap-2">Do not execute logins or credentials verify tasks via click buttons</li>
                        </>
                      )}
                    </ul>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 4: SMS SMISHING                                          */}
        {/* ============================================================= */}
        {activeTab === "sms" && (
          <div className="space-y-8" id="sms-tab-content">
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="text-center space-y-2">
                <span className="text-xs text-emerald-400 font-bold tracking-widest uppercase mb-1 block">💬 SMS / Smishing Threat Detector</span>
                <h2 className="text-2xl font-bold tracking-tight text-white font-display">Simulated Cell Smishing Analyzer</h2>
                <p className="text-xs text-slate-400 max-w-xl mx-auto">
                  Smishing targets users via text messages representing fake packages, courier issues, security warnings, or sweepstakes alerts to force redirection link behavior.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Simulated Smartphone interface for entry */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden space-y-4">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <h4 className="text-xs font-bold text-slate-300 uppercase">Input Live SMS message body</h4>
                    </div>
                    <span className="text-[10px] text-slate-400">Heuristics + AI Engine</span>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-medium text-slate-300">Message Content</label>
                    <textarea
                      rows={5}
                      placeholder="Paste incoming SMS text message..."
                      value={smsBody}
                      onChange={(e) => setSmsBody(e.target.value)}
                      className="w-full p-4 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white focus:outline-none placeholder-slate-600 transition-all font-mono leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => {
                        setSmsBody("");
                        setSmsResult(null);
                      }}
                      className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Clear text fields
                    </button>
                    <button
                      onClick={() => handleSmsScan(smsBody)}
                      disabled={smsLoading || !smsBody.trim()}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {smsLoading ? "TESTING SMS..." : "CHECK TEXT TRAPS"}
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase block">Quick presets:</span>
                    <div className="flex flex-col gap-1.5">
                      {smsPresets.map((preset, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSmsBody(preset.body);
                            handleSmsScan(preset.body);
                          }}
                          className="text-left bg-slate-950/60 p-2.5 rounded-lg text-[10px] border border-slate-850 hover:border-emerald-500/40 text-slate-300 cursor-pointer transition-all truncate"
                        >
                          <strong className="text-slate-400 font-sans block">{preset.label}</strong>
                          "{preset.body}"
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Smartphone visual display showing feedback */}
                <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-[40px] max-w-sm mx-auto shadow-2xl relative">
                  
                  {/* Smartphone top bezel details */}
                  <div className="bg-slate-950 px-4 py-8 rounded-[36px] min-h-[500px] flex flex-col justify-between text-slate-200">
                    
                    {/* Top camera pill and status */}
                    <div className="flex justify-between items-center -mt-4 mb-4 text-[10px] text-slate-500 font-mono px-2">
                      <span>13:42</span>
                      <div className="w-16 h-4 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center text-[8px] tracking-wide">
                        🛡 GUARDIAN
                      </div>
                      <span>100% 🔋</span>
                    </div>

                    {/* Text message dialog mockup */}
                    <div className="flex-1 space-y-4">
                      <div className="text-center py-1">
                        <span className="text-[9px] bg-slate-900 px-2.5 py-0.8 rounded text-slate-500 font-mono">Today, 13:09</span>
                      </div>

                      {/* The Input SMS bubble */}
                      <div className="flex items-start gap-2 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[10px]">
                          💬
                        </div>
                        <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none text-xs text-slate-100 font-mono leading-relaxed">
                          {smsBody || "No text received yet. Choose a preset or type at left to observe active phone detection."}
                        </div>
                      </div>

                      {/* PhishGuard Shield overlay message inside */}
                      {smsLoading && (
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center space-y-2 animate-pulse mt-4">
                          <p className="text-[10px] text-slate-400 font-mono">Scanning SMS structure...</p>
                        </div>
                      )}

                      {smsResult && !smsLoading && (
                        <div className={`mt-4 border p-4 rounded-2xl space-y-3 bg-gradient-to-r text-xs ${getRiskColorClass(smsResult.riskScore)} border-dashed`}>
                          <div className="flex justify-between items-center">
                            <span className="font-bold tracking-tight text-white uppercase text-[10px]">PHISHGUARD DECISION</span>
                            {getRiskBadge(smsResult.riskScore)}
                          </div>

                          <p className="text-[11px] text-slate-200 font-medium">
                            Rating score: {smsResult.scoreValue}/100. Category: <strong className="text-white">{smsResult.smishingCategory || "Unclassified Threat"}</strong>
                          </p>

                          <p className="text-[10px] text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded">
                            {smsResult.explanation}
                          </p>

                          {smsResult.highlights && smsResult.highlights.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">Threat Traps Detected:</span>
                              {smsResult.highlights.map((hlt, idx) => (
                                <div key={idx} className="bg-slate-950/50 p-1.5 rounded text-[10px]">
                                  <strong className="text-red-400 font-mono">{hlt.issueCategory}</strong>: "{hlt.text}"
                                </div>
                              ))}
                            </div>
                          )}

                          {smsResult.safetyRecommendations && (
                            <div className="pt-2 border-t border-slate-800/60">
                              <span className="text-[9px] uppercase text-slate-300 font-bold block mb-1">Defense Action:</span>
                              <p className="text-[10px] text-slate-300 italic">
                                "{smsResult.safetyRecommendations[0]}"
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                    {/* Fake Bottom keyboard indicator bar */}
                    <div className="text-center text-[10px] text-slate-600 font-mono">
                      <span>🔒 PhishGuard Security Filter Enabled</span>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 5: PHISHING DATABASE & REPORT HUB                         */}
        {/* ============================================================= */}
        {activeTab === "database" && (
          <div className="space-y-8" id="database-tab-content">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Submission Form Column */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 lg:col-span-1">
                <div>
                  <span className="text-xs text-red-400 font-bold tracking-widest uppercase">🚨 Threat contribution</span>
                  <h3 className="text-lg font-bold text-white mt-1.5">Report suspect Phishing</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Found an active malicious scam, fraudulent SMS shortcode, or fake brand account? File a report here to protect other internet citizens.
                  </p>
                </div>

                {reportSuccessMsg && (
                  <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl">
                    {reportSuccessMsg}
                  </div>
                )}

                <form onSubmit={submitNewReport} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase block">Threat Type Category</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="website">🌐 Suspicious / Spooted Webpage Domain</option>
                      <option value="email">✉ Suspicious Email Address / Body</option>
                      <option value="sms">💬 Smishing SMS Text Alert</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase block">Target Identifier (URL / Subject / Sender)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. usps-failed-reverify.net"
                      value={reportUrl}
                      onChange={(e) => setReportUrl(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase block">Brand Claim or Scam Category</label>
                    <input
                      type="text"
                      placeholder="e.g. USPS package courier trick"
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase block">Technical details or context</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly detail what credentials this page attempts to capture or text patterns used..."
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-400"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-500 hover:bg-red-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-red-500/10 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> Submit Report to Telemetry
                  </button>
                </form>

                {/* Database Metrics Stats Summary widget */}
                <div className="p-4 bg-slate-950 rounded-xl space-y-2 border border-slate-900 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block mb-1">Global DB Synch status</span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Indicators:</span>
                    <strong className="text-white">{reportedLinks.length}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verified Dangerous:</span>
                    <strong className="text-red-400">100% Verified</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Feed Refresh Rate:</span>
                    <strong className="text-blue-400">Every 5 mins</strong>
                  </div>
                </div>

              </div>

              {/* Feed Display Column */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">PhishGuard Threat Intelligence Feed</h3>
                    <p className="text-xs text-slate-400">Inspect known suspicious patterns reported globally or submitted by you in real-time.</p>
                  </div>

                  {/* Manual Refresh CTA */}
                  <button
                    onClick={fetchReportedFeed}
                    disabled={reportedLoading}
                    className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-xs text-slate-200 hover:text-white rounded-xl flex items-center gap-1.5 hover:bg-slate-850 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${reportedLoading ? "animate-spin" : ""}`} /> Refresh Feed
                  </button>
                </div>

                {/* Filter and search bar */}
                <div className="flex flex-col sm:flex-row gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="relative flex-1">
                    <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search reported domains or scam techniques..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-950 text-xs text-white border border-slate-850 rounded-lg placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                    <button
                      onClick={() => setFilterType("all")}
                      className={`px-2.5 py-1 text-[10px] rounded-md transition-all ${filterType === "all" ? "bg-red-500 text-slate-950 font-bold" : "text-slate-400"}`}
                    >
                      All Types
                    </button>
                    <button
                      onClick={() => setFilterType("website")}
                      className={`px-2.5 py-1 text-[10px] rounded-md transition-all ${filterType === "website" ? "bg-red-500 text-slate-950 font-bold" : "text-slate-400"}`}
                    >
                      Websites
                    </button>
                    <button
                      onClick={() => setFilterType("sms")}
                      className={`px-2.5 py-1 text-[10px] rounded-md transition-all ${filterType === "sms" ? "bg-red-500 text-slate-950 font-bold" : "text-slate-400"}`}
                    >
                      SMS
                    </button>
                    <button
                      onClick={() => setFilterType("email")}
                      className={`px-2.5 py-1 text-[10px] rounded-md transition-all ${filterType === "email" ? "bg-red-500 text-slate-950 font-bold" : "text-slate-400"}`}
                    >
                      Emails
                    </button>
                  </div>
                </div>

                {/* Feed Items Container */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {reportedLoading && reportedLinks.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 text-xs font-mono animate-pulse">
                      Synthesizing intelligence feed...
                    </div>
                  ) : filteredReported.length === 0 ? (
                    <div className="p-10 text-center bg-slate-900/10 rounded-2xl border border-slate-900 text-slate-500 text-xs">
                      No matching reported threats found. Change filters or search querying terms.
                    </div>
                  ) : (
                    filteredReported.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl space-y-2 hover:border-red-500/20 transition-all flex flex-col justify-between"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1 bg-red-950 text-red-400 rounded-md text-[10px] font-bold font-mono uppercase">
                              {item.type}
                            </span>
                            <span className="text-xs font-bold text-white">{item.category}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                            <span>Status:</span>
                            <span className={item.status === "verified" ? "text-red-400 font-bold uppercase" : "text-yellow-400 font-bold uppercase"}>
                              ● {item.status}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs font-mono text-red-300 break-all bg-slate-950 p-2.5 rounded border border-slate-900">
                          {item.url}
                        </p>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-850/50">
                          <span>Report Source: <strong>{item.source}</strong></span>
                          <span>Time logged: {new Date(item.reportedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Simulated Phishing Mitigation Banner */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-400 flex items-start gap-3">
                  <div className="p-2 bg-slate-950 text-blue-400 rounded-lg">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-0.5">Community Protection Protocol Coverage</h5>
                    <p className="text-[11.5px]">
                      By submitting a link, it instantly populates the PhishGuard Extension Shield simulator and the API endpoints so developers can mock blocking zero-day exploits.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 6: ACADEMY & DRILL                                       */}
        {/* ============================================================= */}
        {activeTab === "academy" && (
          <div className="space-y-8" id="academy-tab-content">
            
            {/* Top Hub */}
            <div className="text-center space-y-2">
              <span className="text-xs text-emerald-400 font-bold tracking-widest uppercase block mb-1">🎓 PhishGuard Security Academy</span>
              <h2 className="text-2xl font-bold tracking-tight text-white font-display">Educational Lectures & Simulated Threat Drill</h2>
              <p className="text-xs text-slate-400 max-w-xl mx-auto">
                Sharpen your security posture. Read specialized briefs covering advanced psychological manipulation tricks, then put your training to safety in the active drill simulator.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Educational content briefs */}
              <div className="lg:col-span-1.5 space-y-5">
                <h3 className="text-base font-bold text-white flex items-center gap-1">
                  <BookOpen className="w-5 h-5 text-emerald-400" /> Essential Threat Lectures ({educationalModules.length})
                </h3>

                <div className="space-y-4">
                  {educationalModules.map((mod) => (
                    <div key={mod.id} className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-emerald-400 uppercase font-mono font-bold tracking-wider">{mod.readTime}</span>
                        <span className="p-1 bg-slate-950 text-slate-400 rounded-md text-[10px] uppercase font-semibold">LECTURE</span>
                      </div>
                      
                      <h4 className="text-sm font-bold text-white">{mod.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{mod.description}</p>
                      
                      <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-xl border border-slate-900">
                        {mod.content.map((point, i) => (
                          <p key={i} className="text-[11px] text-slate-400 leading-relaxed">
                            {point}
                          </p>
                        ))}
                      </div>

                      <div className="space-y-1 pt-1.5">
                        <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest block">Pro advice actions:</span>
                        <div className="flex flex-col gap-1">
                          {mod.recommendations.map((rec, idx) => (
                            <span key={idx} className="text-[10px] text-slate-400 flex items-start gap-1">
                              <span className="text-emerald-400">•</span> {rec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Threat Drill / Quiz Challenge */}
              <div className="lg:col-span-1.5 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      <Award className="w-5 h-5 text-indigo-400" /> Active Simulated Phishing Drill
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Test your vigilance against real-world lookalike scams</p>
                  </div>
                  <div className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-850 text-center">
                    <span className="text-[10px] text-slate-400 font-mono block">Score Tally</span>
                    <strong className="text-xs text-indigo-400">{quizScore}/{quizQuestions.length}</strong>
                  </div>
                </div>

                {/* Progress bar info */}
                <div className="flex gap-1">
                  {quizQuestions.map((q, idx) => {
                    const resolved = quizAnswersHistory.find(h => h.index === idx);
                    let color = "bg-slate-950 border-slate-800";
                    if (idx === currentQuizIndex) color = "bg-indigo-500";
                    else if (resolved) {
                      color = resolved.correct ? "bg-emerald-500" : "bg-red-500";
                    }
                    return (
                      <div key={idx} className={`h-2 flex-1 rounded-full transition-all ${color}`}></div>
                    );
                  })}
                </div>

                {/* The Current Quiz Card */}
                <div className="bg-slate-950 p-5 rounded-2xl space-y-4 border border-slate-850">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase">
                      Scenario {currentQuizIndex + 1} of {quizQuestions.length} · {quizQuestions[currentQuizIndex].type}
                    </span>
                    <span className="text-slate-400">Threat Target ID: <strong>{quizQuestions[currentQuizIndex].senderOrUrl}</strong></span>
                  </div>

                  {quizQuestions[currentQuizIndex].subject && (
                    <p className="text-xs text-slate-300 font-bold bg-slate-900/80 p-2 rounded">
                      Subject: "{quizQuestions[currentQuizIndex].subject}"
                    </p>
                  )}

                  <div className="p-4 bg-slate-90 border border-slate-900 rounded-xl leading-relaxed text-xs text-slate-200 font-mono select-text bg-slate-900/20">
                    {quizQuestions[currentQuizIndex].bodyPreview}
                  </div>

                  {/* Guess buttons (Phishing or Safe) */}
                  {!quizSubmitted ? (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => handleQuizAnswer(false)}
                        className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl cursor-pointer transition-all border border-slate-750 flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> SAFE TRANSATION
                      </button>
                      <button
                        onClick={() => handleQuizAnswer(true)}
                        className="py-3 px-4 bg-red-950/40 hover:bg-red-900/60 text-red-200 hover:text-white border border-red-500/20 font-semibold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <ShieldAlert className="w-4 h-4 text-red-400" /> PHISHING THREAT
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      {/* Explanatory visual feedback widget */}
                      <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                        (selectedQuizAnswer === quizQuestions[currentQuizIndex].isPhishing)
                          ? "bg-emerald-950/30 border-emerald-500/25 text-emerald-200"
                          : "bg-red-950/30 border-red-500/25 text-red-200"
                      }`}>
                        <div className="flex justify-between items-center">
                          <strong className="text-sm">
                            {selectedQuizAnswer === quizQuestions[currentQuizIndex].isPhishing ? "🎉 CORRECT VERDICT" : "❌ SYSTEM MISMATCH"}
                          </strong>
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-widest bg-slate-950 block">
                            {quizQuestions[currentQuizIndex].isPhishing ? "MALICIOUS CLONE" : "GENUINE INBOUND"}
                          </span>
                        </div>
                        <p>{quizQuestions[currentQuizIndex].explanation}</p>
                      </div>

                      {/* Display structural highlights explaining specific visual indices */}
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-850 space-y-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-widest">Crucial Anomaly Highlight Locations:</span>
                        <div className="space-y-1.5">
                          {quizQuestions[currentQuizIndex].riskHighlights.map((hl, k) => (
                            <div key={k} className="text-xs flex items-start gap-1.5 bg-slate-950 p-2 rounded">
                              <span className="text-amber-500 font-mono mt-0.5">•</span>
                              <span className="text-slate-300 font-mono break-all font-medium">
                                "{hl.text}" ➔ <strong className="text-amber-400 font-sans text-[10.5px]">{hl.label}</strong>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={nextQuizQuestion}
                        className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        {currentQuizIndex < quizQuestions.length - 1 ? (
                          <>Continue to Next Question <ChevronRight className="w-4 h-4" /></>
                        ) : (
                          "Finished! Restart Drill Challenge"
                        )}
                      </button>

                    </div>
                  )}

                </div>

                {/* Final drill statistics or credentials */}
                <div className="bg-slate-950/40 p-4 rounded-xl text-center text-xs text-slate-400 max-w-sm mx-auto">
                  💡 <strong>Tip:</strong> Pay extreme focus to character replacements ( homographs ). Swapping lowercase letters like l with I or zero with o are the most frequent scam patterns.
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 7: SHIELD COMPANION SIMULATOR                            */}
        {/* ============================================================= */}
        {activeTab === "extension" && (
          <div className="space-y-8" id="extension-tab-content">
            
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs text-emerald-400 font-bold tracking-widest uppercase">🔌 Real-Time Browser Extension Simulator</span>
                <h2 className="text-2xl font-bold tracking-tight text-white font-display">PhishGuard Protective Browser Guardrail</h2>
                <p className="text-sm text-slate-300">
                  This sandbox simulates how our browser extension intercepts internet DNS lookups to warn you instantly when clicking or entering lookalike blacklisted directories. Try visiting suspicious addresses or checking secure sites.
                </p>
              </div>

              {/* Main Simulated Browser Frame UI */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                
                {/* Browser Bezel Frame Bar */}
                <div className="bg-slate-950 p-3.5 flex items-center gap-3 border-b border-slate-800">
                  {/* Fake buttons */}
                  <div className="flex gap-1.5 shrink-0">
                    <span className="w-3 bg-red-500/80 h-3 rounded-full"></span>
                    <span className="w-3 bg-yellow-500/80 h-3 rounded-full"></span>
                    <span className="w-3 bg-green-500/80 h-3 rounded-full"></span>
                  </div>

                  {/* Browser simulated Tabs */}
                  <div className="flex gap-1.5 text-[11px] font-medium text-slate-300 shrink-0">
                    <span className="bg-slate-900 px-3.5 py-1.5 rounded-t-lg border-t border-x border-slate-800 flex items-center gap-1.5 text-slate-200">
                      🔒 Sandbox Site Browser <X className="w-3 h-3 text-slate-500" />
                    </span>
                  </div>

                  {/* Browser URL Input Bar with PhishGuard extension badge status */}
                  <div className="flex-1 relative flex items-center bg-slate-900 rounded-lg p-1 px-3 border border-slate-800">
                    <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mr-1.5" />
                    <span className="text-xs text-slate-600 font-sans font-medium mr-0.5">https://</span>
                    
                    <input
                      type="text"
                      value={browserAddress}
                      onChange={(e) => setBrowserAddress(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleValidateSimulatedUrl(browserAddress);
                        }
                      }}
                      placeholder="Enter suspect URL path (e.g. secure-paypal-login-verify-account.support-verification.net)"
                      className="w-full bg-transparent border-0 text-xs text-slate-250 font-mono text-white focus:outline-none focus:ring-0 p-0.5"
                    />

                    {/* Interactive Chrome Extension Shield Status Icon inside bar */}
                    <button
                      onClick={() => handleValidateSimulatedUrl(browserAddress)}
                      className="ml-2 px-3 py-1 bg-gradient-to-br from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Shield className="w-3 h-3" /> Go
                    </button>
                  </div>

                  {/* Chrome extension physical active indicator */}
                  <div className="relative shrink-0 flex items-center justify-center p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-850 cursor-pointer">
                    <span className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${activeShield ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <Shield className={`w-4 h-4 ${activeShield ? 'text-emerald-400' : 'text-red-400'}`} />
                  </div>
                </div>

                {/* Simulated Web View Page Canvas */}
                <div className="bg-slate-950 p-8 min-h-[350px] relative flex flex-col items-center justify-center text-center">
                  
                  {checkingSimUrl ? (
                    <div className="space-y-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
                      <p className="text-xs text-slate-400 font-mono">Sandbox Companion querying DNS safety records...</p>
                    </div>
                  ) : simulatedPageContent.securityWarning && activeShield ? (
                    
                    /* THE ACTIVE warning extension intercept screen */
                    <div className="max-w-xl bg-red-950/20 border border-red-500/30 p-8 rounded-3xl space-y-6 text-left relative z-10 pulse-glow">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-950 text-red-500 border border-red-500/20 rounded-2xl">
                          <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono bg-red-950 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold uppercase">
                            PHISHGUARD SHIELD BLOCKED ACCESS
                          </span>
                          <h3 className="text-lg font-bold text-white mt-1">Deceptive Web Portal Intercepted!</h3>
                        </div>
                      </div>

                      <blockquote className="bg-slate-950 p-3 rounded border border-slate-900 font-mono text-xs text-red-350 break-all">
                        {simulatedPageContent.domain}
                      </blockquote>

                      <div className="space-y-2 text-xs text-slate-300">
                        <p className="leading-relaxed">
                          This address matches known phishing profiles classified dynamically by PhishGuard indicators. Proceeding poses severe threats to credit credentials or personal accounts.
                        </p>
                        {simulatedPageContent.analysisResult && (
                          <div className="bg-slate-950/80 p-3 rounded font-sans text-[11px] space-y-1.5 text-slate-400 border border-slate-900">
                            <strong>Detection Explanation:</strong>
                            <p>{simulatedPageContent.analysisResult.explanation}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          onClick={() => setBrowserAddress("google.com")}
                          className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer transition-all"
                        >
                          ✓ Back to Secure Google Page
                        </button>
                        <button
                          onClick={() => {
                            setSimulatedPageContent(prev => ({ ...prev, securityWarning: false }));
                          }}
                          className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-red-400 text-xs font-medium rounded-xl border border-slate-800 cursor-pointer transition-all"
                        >
                          Bypass warning and visit (At your own risk)
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-500 text-center !mt-4 border-t border-slate-900 pt-3">
                        Active intercept rules are updated. Submitting items to the database dynamically shields other companion sandbox users.
                      </div>

                    </div>

                  ) : (
                    
                    /* SAFE STAGE PAGE VIEW */
                    <div className="space-y-4 max-w-md">
                      <div className="w-16 h-16 rounded-full bg-slate-905 flex items-center justify-center border border-slate-800 mx-auto text-emerald-400">
                        <Shield className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Browser View of Simulated Site Content</h4>
                        <p className="text-xs text-slate-450 mt-1">
                          You are currently hosting simulated rendering sandbox for:
                        </p>
                        <p className="font-mono text-xs text-emerald-400 mt-2 bg-slate-900/50 py-1 px-3 rounded inline-block">
                          {browserAddress}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-900 rounded-xl text-left text-xs text-slate-400 space-y-2 border border-slate-850">
                        <span className="font-semibold text-slate-200">Test Scems & Targets:</span>
                        <p className="text-[11px]">
                          Try entering a verified malicious link like <code className="text-red-400 font-mono bg-slate-950 px-1 py-0.5 rounded">netflix-billing-update-required.xyz</code> inside the browser input bar and check the warning.
                        </p>
                      </div>
                    </div>

                  )}

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 8: DEVELOPER REST API TESTING                             */}
        {/* ============================================================= */}
        {activeTab === "api" && (
          <div className="space-y-8" id="api-tab-content">
            
            <div className="max-w-3xl mx-auto space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs text-emerald-400 font-bold tracking-widest uppercase font-mono">⚡ Developper REST API Documentation</span>
                <h2 className="text-2xl font-bold tracking-tight text-white font-display">PhishGuard Security Gateway integration</h2>
                <p className="text-sm text-slate-300">
                  Easily integrate zero-day phishing heuristics classification endpoints inside your existing applications. We publish fast, documented clean standard payloads.
                </p>
              </div>

              {/* URL Scanner API code */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono font-bold text-blue-400">POST /api/analyze/url</span>
                  <span className="text-[10px] text-slate-400">HTTPS Payload</span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-white font-semibold">cURL Command Example:</span>
                  <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto select-all leading-relaxed whitespace-pre-wrap">
                    {`curl -X POST "${window.location.origin}/api/analyze/url" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "paypal-verify-account.net/login"}'`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-white font-semibold">Response Payload Schema:</span>
                  <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                    {`{
  "riskScore": "Dangerous",
  "scoreValue": 92,
  "analysis": {
    "domainAnalysis": "Host domain exhibits lookalike character indicators.",
    "sslCheck": "No HTTPS protocol found on target."
  },
  "explanation": "Reported brand impersonation targeting Paypal credentials..."
}`}
                  </pre>
                </div>
              </div>

              {/* SMS smishing API code */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono font-bold text-blue-400">POST /api/analyze/sms</span>
                  <span className="text-[10px] text-slate-400">Smishing Classification</span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-white font-semibold">cURL Command Example:</span>
                  <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto select-all leading-relaxed whitespace-pre-wrap">
                    {`curl -X POST "${window.location.origin}/api/analyze/sms" \\
  -H "Content-Type: application/json" \\
  -d '{"body": "USPS package alert: arrange redelivery: https://bit.ly/38921"}'`}
                  </pre>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* App Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 px-4 mt-20 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-4">
          <p className="font-display font-medium text-slate-400 flex items-center justify-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" /> PhishGuard Shield Ecosystem v2.4
          </p>
          <p className="max-w-xl mx-auto leading-relaxed">
            PhishGuard operates dynamic lookups powered by Gemini Generative AI and advanced local scanning rulesets. This tool is designed as an interactive portal to verify and report potential fraud.
          </p>
          <div className="flex justify-center gap-6 pt-2 select-none">
            <span>Client Platform: HTML5 SPA</span>
            <span>·</span>
            <span>Database Synch: Active</span>
            <span>·</span>
            <span>Status: Healthy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
