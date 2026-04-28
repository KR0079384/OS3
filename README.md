# 🔐 OS3 - Open Source Supply Chain Security Scanner

## 🚀 Overview
OS3 is a developer-first security tool designed to analyze open-source packages **before installation**.  
It helps developers identify vulnerabilities, detect fake packages, and understand attack paths in real time.

👉 Instead of reacting after installation, OS3 enables **proactive security decisions**.

---

## ❗ Problem Statement
Modern development relies heavily on open-source packages.  
However:

- Developers install packages without knowing their risks  
- Existing tools analyze vulnerabilities only after installation  
- Fake or malicious packages can easily enter the system  
- No visibility into how vulnerabilities propagate through dependencies  

---

## 💡 Solution
OS3 provides **pre-installation security analysis** through:

- 🔍 Dependency analysis  
- ⚠️ Vulnerability detection  
- 🛣️ Attack path identification  
- 🧠 Security scoring system  
- 🚫 Fake package detection  

---

## 🌟 Key Features

### 💻 CLI Tool (Global via PyPI)
- Install with a single command
- Works directly in developer workflow
- No setup required

```bash
pip install os3-security
```

## 🌐 Web Application

OS³ also provides a **web-based interface** for interactive security analysis.

🔗 Live App: https://os3org.web.app  

### 🔍 Features

- **Package Scanning**
  - Enter any open-source package name (e.g., `express`)
  - Performs real-time analysis

- **Dependency Graph Visualization**
  - Displays full dependency tree
  - Highlights **potential attack paths**
  - Helps identify vulnerable dependency chains

- **Attack Path Identification**
  - Shows how vulnerabilities propagate
  - Helps developers understand exploitation risks

- **🤖 AI Chatbot Assistant**
  - Answers security-related queries
  - Suggests safer alternatives
  - Explains vulnerabilities in simple terms

---

## 🐍 CLI Tool (PyPI)

OS³ is available as a **Python package** for direct developer usage.

⚙️ Usage
os3 --help
🚀 Example
os3 scan express

👉 With just a few commands, developers can:

Scan packages
Check security scores
Analyze dependencies
Get safer alternatives

✨ Features Implemented
✅ CLI-based package scanning
✅ PyPI deployment (os3-security)
✅ Web-based package scanning interface
✅ Real-time package analysis
✅ Dependency graph visualization
✅ Attack path identification
✅ Security scoring system
✅ AI chatbot for assistance
✅ Firebase real-time backend
✅ Live dashboard for insights


