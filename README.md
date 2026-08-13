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

### 💻 CLI Tool
- Install with a single command
- Works directly in developer workflow
- No setup required

```bash
pip install os3-security
```

*Note: CLI deployment to PyPI is planned for future release.*

## 🌐 Web Application

OS³ provides a **web-based interface** for interactive security analysis.

🔗 Live Demo: https://os3org.web.app  

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
✅ Web-based package scanning interface
✅ Real-time package analysis
✅ Dependency graph visualization
✅ Attack path identification
✅ Security scoring system
✅ AI chatbot for assistance
✅ Firebase real-time backend
✅ Live dashboard for insights

---

## 🏗 Architecture

OS3 uses a modern web application architecture:

```
Frontend (React + TypeScript)
         ↓
FastAPI Backend
         ↓
RAG Pipeline (FAISS)
         ↓
Ollama LLaMA3 (AI Assistant)
         ↓
Firebase (Real-time Database)
```

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **UI Framework** | Radix UI, Tailwind CSS |
| **Backend** | FastAPI, Python |
| **Vector Search** | FAISS |
| **AI/LLM** | LLaMA3 (via Ollama) |
| **Database** | Firebase Real-time Database |
| **CLI** | Python (PyPI package) |

---

## 📂 Project Structure

```
OS3/
├── backend/                 # Python FastAPI backend
│   ├── api/               # API endpoints
│   ├── services/          # RAG pipeline, Ollama client
│   ├── data/              # Vulnerability database
│   └── requirements.txt   # Python dependencies
├── os3-cli/               # CLI tool for PyPI
├── src/                   # React frontend
│   ├── pages/            # Dashboard pages
│   ├── components/       # Reusable UI components
│   └── services/         # API integration
├── public/               # Static assets
└── package.json          # Frontend dependencies
```

---

## 🧑‍💻 Getting Started

### Prerequisites

- **Python 3.9+**
- **Node.js 18+**
- **Ollama** (for AI chatbot)
- **Firebase account** (for real-time backend)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/KR0079384/OS3.git
cd OS3
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Frontend Setup

```bash
cd ..

# Install frontend dependencies
npm install
```

#### 4. Start Ollama (for AI Assistant)

```bash
# Install Ollama from https://ollama.ai
# Pull LLaMA3 model
ollama pull llama3:8b
```

### Running the Application

#### Start Backend Server

```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Start Frontend Development Server

```bash
# In a new terminal
cd OS3
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 🌐 CLI Usage

Install the CLI tool globally:

```bash
pip install os3-security
```

Scan packages:

```bash
os3 scan express
os3 scan react
os3 scan lodash
```

---

## 🤝 Contributions

Contributions are welcome!
Feel free to open issues or submit PRs for:

- New vulnerability detection features
- UI/UX improvements
- Additional language support
- Performance optimizations

---

## 📜 License

**MIT License**

Free to use, modify, and distribute.

---

## Author

**Mohamed Rafeeq Khan A**

- Portfolio: [https://portfolio-2027-five.vercel.app](https://portfolio-2027-five.vercel.app)
- GitHub: [https://github.com/Mohamedrxf](https://github.com/Mohamedrxf)


