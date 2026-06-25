# 🛡️ PhishGuard

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![Machine Learning](https://img.shields.io/badge/Machine%20Learning-Scikit--Learn-orange)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-success)

**An intelligent Machine Learning-powered phishing URL detection system that identifies malicious websites using advanced URL, domain, security, and content-based features.**

</div>

---

## 📖 Overview

PhishGuard is a phishing detection system built to identify malicious URLs before users become victims of phishing attacks.

The application extracts multiple characteristics from a given website, processes them using machine learning models, and predicts whether the URL is **Legitimate** or **Phishing**.

This project was created to demonstrate practical applications of Machine Learning in Cybersecurity.

---

## ✨ Features

- 🔍 Real-time URL Analysis
- 🤖 Machine Learning Prediction
- 🌐 Domain Intelligence
- 🔒 SSL Certificate Verification
- 📄 HTML Content Analysis
- ⚡ Fast Predictions
- 📊 Probability Score
- 📈 Feature Extraction Pipeline
- 🛡️ Security Risk Assessment
- 💻 Simple User Interface

---

## 🧠 Detection Parameters

PhishGuard evaluates websites using multiple categories of features.

### URL-Based Features

- URL Length
- Number of Dots
- Presence of "@"
- Presence of "-"
- Number of Subdomains
- IP Address Usage
- URL Shorteners
- HTTPS Usage
- Special Characters
- Redirection Count

---

### Domain-Based Features

- Domain Age
- WHOIS Information
- DNS Records
- Registration Length
- Domain Expiration
- Domain Popularity

---

### Security Features

- SSL Certificate Status
- HTTPS Availability
- Certificate Validity
- Secure Connection Check

---

### Content-Based Features

- Login Forms
- External Resources
- Hidden Elements
- Suspicious JavaScript
- iframe Detection
- Redirect Scripts
- Pop-up Detection

---

## 🏗️ Project Structure

```
PhishGuard/
│
├── app.py
├── model/
│   ├── phishing_model.pkl
│   └── scaler.pkl
│
├── dataset/
│   ├── phishing.csv
│   └── legitimate.csv
│
├── templates/
│   └── index.html
│
├── static/
│   ├── css/
│   ├── js/
│   └── images/
│
├── utils/
│   ├── feature_extraction.py
│   ├── url_analyzer.py
│   ├── domain_checker.py
│   └── ssl_checker.py
│
├── requirements.txt
└── README.md
```

---

## ⚙️ Technologies Used

| Category | Technology |
|----------|------------|
| Language | Python |
| Machine Learning | Scikit-Learn |
| Data Analysis | Pandas, NumPy |
| Web Framework | Flask |
| Frontend | HTML, CSS, JavaScript |
| Feature Extraction | BeautifulSoup, Requests |
| Domain Lookup | WHOIS |
| Security | SSL |

---

## 🚀 Installation

### Clone the Repository

```bash
git clone https://github.com/jeffery20122006/phishguard.git
```

```bash
cd phishguard
```

---

### Create Virtual Environment

```bash
python -m venv venv
```

Windows

```bash
venv\Scripts\activate
```

Linux / macOS

```bash
source venv/bin/activate
```

---

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

### Run the Project

```bash
python app.py
```

Visit

```
http://127.0.0.1:5000
```

---

## 📊 Machine Learning Workflow

```
In
      │
      ▼
Feature Extraction
      │
      ▼
Data Preprocessing
      │
      ▼
ML Prediction
      │
      ▼
Probability Score
      │
      ▼
Legitimate / Phishing
```

---

## 📁 Dataset

The model is trained using phishing datasets collected from trusted cybersecurity sources including:

- PhishTank
- UCI Machine Learning Repository
- Kaggle Phishing Datasets

---

## 📈 Future Improvements

- Deep Learning Models
- Real-time Browser Extension
- Chrome & Edge Integration
- Mobile Application
- Email Phishing Detection
- QR Code Scam Detection
- API Deployment
- Threat Intelligence Integration
- Continuous Model Retraining

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Jeffery**

GitHub:
https://github.com/jeffery20122006

---

## ⭐ Support

If you found this project useful, consider giving it a **⭐ Star** on GitHub.

It helps others discover the project and motivates future improvements.

---

> **Disclaimer**
>
> PhishGuard is intended for educational and cybersecurity research purposes only. Predictions are generated using machine learning models and should not be considered a replacement for professional security solutions.
