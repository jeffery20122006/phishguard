export interface SearchResult {
  riskScore: "Safe" | "Suspicious" | "Dangerous";
  scoreValue: number;
  explanation: string;
  recommendations: string[];
  mode: "ai" | "local";
  analysis?: {
    domainAnalysis?: string;
    sslCheck?: string;
    suspiciousPatterns?: string[];
    indicatorsFound?: string[];
  };
  senderAssessment?: string;
  mismatchedDomains?: boolean;
  urgentLanguageDetected?: boolean;
  suspiciousLinksFound?: string[];
  highlights?: HighlightItem[];
  smishingCategory?: string;
  suspiciousElements?: string[];
  error?: string;
}

export interface HighlightItem {
  text: string;
  riskLevel: "high" | "medium" | "low";
  issueCategory: string;
  explanation: string;
}

export interface ReportedLink {
  id: string;
  url: string;
  type: "website" | "email" | "sms";
  reportedAt: string;
  source: string;
  status: "verified" | "pending";
  category: string;
  description: string;
}

export interface QuizQuestion {
  id: string;
  type: "email" | "sms" | "website";
  senderOrUrl: string;
  subject?: string;
  bodyPreview: string; // The full content representing the text
  isPhishing: boolean;
  explanation: string;
  riskHighlights: Array<{ text: string; label: string }>;
}

export interface EducationalModule {
  id: string;
  title: string;
  description: string;
  iconName: string;
  readTime: string;
  content: string[];
  recommendations: string[];
}
