import { QuizQuestion, EducationalModule } from "./types";

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q-1",
    type: "email",
    senderOrUrl: "no-reply@chase-secure-profile.com",
    subject: "URGENT: Temporary hold placed on your Chase Account",
    bodyPreview: "Dear customer, we detected unusual security logins from a foreign device on your profile. To avoid account termination, you must verify your identity immediately by clicking here: http://chase-secure-profile.com/update/",
    isPhishing: true,
    explanation: "This is a dangerous PHISHING attempt! The sender domain 'chase-secure-profile.com' is NOT Chase's official website ('chase.com'). It uses artificial urgency ('immediately', 'account termination') and leads to a non-secure HTTP link ('http://...') designed to harvest your credentials.",
    riskHighlights: [
      { text: "no-reply@chase-secure-profile.com", label: "Spoofing Sender Domain" },
      { text: "Dear customer", label: "Generic Unpersonalized Greeting" },
      { text: "avoid account termination", label: "Urgent Coercive Threat" },
      { text: "http://chase-secure-profile.com/update/", label: "Malicious HTTP Redirect link" }
    ]
  },
  {
    id: "q-2",
    type: "sms",
    senderOrUrl: "+1 (839) 492-2023",
    bodyPreview: "USPS Notice: Your package could not be delivered due to an incorrect house number. To update your address information and arrange redelivery, please complete the form: https://usps-redelivery.com/address",
    isPhishing: true,
    explanation: "This is an active SMISHING (SMS Phishing) scam! Major postal agencies like the USPS or FedEx do not send unsolicited billing or address alerts from random consumer numbers, nor do they route you to custom domains like 'usps-redelivery.com' (the true domain is 'usps.com').",
    riskHighlights: [
      { text: "USPS Notice:", label: "Federal Authority Impersonation" },
      { text: "+1 (839) 492-2023", label: "Random Unofficial Mobile Sender" },
      { text: "https://usps-redelivery.com/address", label: "Spoofed Domain" }
    ]
  },
  {
    id: "q-3",
    type: "website",
    senderOrUrl: "https://paypaI.com-security-alert.net/login",
    bodyPreview: "A login dashboard displaying the identical logo, font styling, and warning statements of a standard PayPal login console, requesting your full social security number and debit PIN code to troubleshoot an error.",
    isPhishing: true,
    explanation: "This is a malicious website CLONE! First, take a close look at the domain name: the lowercase 'L' in 'paypal' has been swapped with a capital 'I' ('paypaI.com') - a classic homograph/typosquatting hack. Additionally, PayPal will never ask for your card PIN or Full SSN directly inside a public profile login prompt.",
    riskHighlights: [
      { text: "https://paypaI.com", label: "Homograph Typosquatting (Capital I instead of l)" },
      { text: "social security number and debit PIN", label: "Excessive Credential Requests" }
    ]
  },
  {
    id: "q-4",
    type: "email",
    senderOrUrl: "billing@netflix.com",
    subject: "Your Subscription Invoice #829392",
    bodyPreview: "Hello John, thank you for your payment of $15.49 for your Netflix Premium stream. The invoice details are updated in your regular profile settings. Read more details in your official membership center.",
    isPhishing: false,
    explanation: "This is a SAFE transactional message. It correctly originates from Netflix's official sender domain, addresses the user by their actual name 'John' (instead of 'Dear Customer'), details a regular subscription payment with no threatening language or urgent calls to action, and directs you to check your account settings normally.",
    riskHighlights: [
      { text: "billing@netflix.com", label: "Legitimate company domain" },
      { text: "Hello John", label: "Personalized Customer Salute" }
    ]
  },
  {
    id: "q-5",
    type: "sms",
    senderOrUrl: "554-21 (Wells Fargo Secure)",
    bodyPreview: "Wells Fargo Security: Did you spend $385.00 on Amazon? Reply 'YES' to confirm or 'NO' to halt. If you reply NO, a safety agent will immediately dial your phone number to check account telemetry.",
    isPhishing: false,
    explanation: "This represents a generic legitimate two-way interactive bank fraud verification text. While it contains alarming figures, it is sent from a verified 5-digit bank shortcode ('554-21') rather than an 10-digit mobile number, only asks for a simple 'YES' or 'NO' confirmation response, and explicitly redirects you to expect a voice verification call instead of pushing external clickable redirection hyperlinks.",
    riskHighlights: [
      { text: "554-21", label: "Official Shortcode Identifier" },
      { text: "Reply 'YES' or 'NO'", label: "Standard Interactive Response" }
    ]
  }
];

export const educationalModules: EducationalModule[] = [
  {
    id: "m-1",
    title: "Typosquatting & Homograph Hacks",
    description: "Learn how malicious actors mimic brand domains using tricky letter swaps, subdomains, or special character scripts.",
    iconName: "Globe",
    readTime: "3 min read",
    content: [
      "Typosquatting is a tactic where malicious actors register domains that are common typos of popular sites (e.g., 'g00gle.com' or 'amzon.com').",
      "Homograph attacks are more sinister: they use different characters that look identical to genuine letters. For example, replacing Latin 'o' with Cyrillic 'о', or a lowercase letter 'l' with an uppercase 'I' (like 'paypaI.com').",
      "Attackers also rely on subdomain nesting to push the real, hostile domain off the visible parts of the address bar: 'chase.com.security-verification.online/login.html' is actually hosted on 'security-verification.online', NOT chase.com!"
    ],
    recommendations: [
      "Always inspect the characters before copying or entering credit details.",
      "Check address bar SSL symbols or security cert providers.",
      "Bookmark major portals or use dedicated apps rather than clicking external web references."
    ]
  },
  {
    id: "m-2",
    title: "Stress Indicators & Urgent Psychology",
    description: "Discover why phishing relies on artificial panic triggers, extreme urgency deadlines, and authority coercion.",
    iconName: "AlertTriangle",
    readTime: "4 min read",
    content: [
      "Phishing utilizes prompt psychological manipulation to override logical skepticism. Fear, greed, and authority are the most frequent levers.",
      "By stating 'Your banking profile is locked' or 'You have a pending IRS warrant,' scammers trigger instant panic. They augment this threat with tight timetables ('within 12 hours' or 'immediately') so you take action before reasoning through the logic.",
      "No legitimate security bureau or corporate office will threaten immediate, irreversible account deletion via a generic, unauthenticated text message."
    ],
    recommendations: [
      "Take a deep breath. Scammers want you to act instantly from emotional panic.",
      "Independently verify. Contact the sender organization through their verified, listed helpline.",
      "Report immediately. Block the caller and upload threat indicators to safety portals."
    ]
  },
  {
    id: "m-3",
    title: "SMS Smishing & Package Scam Surge",
    description: "Master the patterns of deceptive SMS alerts, package delivery notifications, and interactive verification text.",
    iconName: "Smartphone",
    readTime: "3 min read",
    content: [
      "SMS-based phishing, or Smishing, has grown rapidly because SMS text does not carry the sophisticated automated phishing filters common in email systems.",
      "The most widespread smishing strategy is the 'Failed Package Delivery' bait. Claiming to represent USPS, UPS, or DHL, these describe a package held due to an incorrect fee, and lead to an identical tracking site designed for card-skimming.",
      "Legitimate courier systems never send unsolicited SMS demanding credit card details for package correction without detailed order references."
    ],
    recommendations: [
      "Do not tap shortened delivery links (e.g., bit.ly, tiny.cc) on incoming texts.",
      "Compare the sender source format: shortcodes are often much more secure than obscure 10-digit consumer cell numbers.",
      "Call the carrier directly with order numbers obtained from your original purchase receipt."
    ]
  }
];
