# ⚡ AutoOps — Autonomous Meeting-to-Execution Engine

> *Stop managing tasks. Start executing them.*

---

## 🧠 What is AutoOps?

**AutoOps** is an AI-powered autonomous execution engine that converts meeting notes, voice inputs, and task descriptions into real actions — automatically.

No more copy-pasting tasks from Notion to Jira. No more *"did anyone action that?"* moments.
AutoOps listens, understands, and **executes**.

---

## ✨ Features

- 🎙️ **Meeting-to-Task Pipeline** — Extracts actionable items from meeting transcripts automatically
- 🤖 **5 Autonomous Agents** — Handle scheduling, delegation, follow-ups, reminders, and reporting
- 🔄 **n8n Workflow Integration** — Visual agentic workflows that trigger real-world actions
- 🔐 **Auth System** — Email/password + Google OAuth via Supabase
- 📅 **Background Scheduling** — APScheduler handles time-sensitive agent jobs
- 💾 **Dual Storage** — Supabase (cloud) with SQLite fallback for offline resilience
- ⚡ **Real-time UI** — React + Vite frontend with live task status updates

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.10+ |
| Auth & DB | Supabase (PostgreSQL) |
| Fallback DB | SQLite |
| Agentic Layer | n8n Workflows |
| Scheduler | APScheduler |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      AutoOps System                      │
│                                                          │
│   ┌──────────────┐   REST    ┌──────────────────────┐   │
│   │ React + Vite │ ◄───────► │   FastAPI Backend    │   │
│   │  (Port 5173) │           │    (Port 8000)       │   │
│   └──────────────┘           └──────────┬───────────┘   │
│                                         │               │
│          ┌──────────────────────────────┼─────────────┐ │
│          │                              │             │ │
│  ┌───────▼───────┐          ┌──────────▼──────┐ ┌───▼─┐ │
│  │   Supabase    │          │  n8n Workflows  │ │SQLi │ │
│  │  Auth + DB    │          │  Agentic Layer  │ │ te  │ │
│  └───────────────┘          └────────┬────────┘ └─────┘ │
│                                      │                  │
│                           ┌──────────▼──────────┐       │
│                           │      5 Agents        │      │
│                           │  Extractor│Scheduler │      │
│                           │  Delegator│Reminder  │      │
│                           │       Reporter       │      │
│                           └──────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

---

## 🤖 The 5 Agents

| Agent | Role |
|-------|------|
| 📋 **Extractor** | Parses meeting transcripts into structured tasks |
| 📅 **Scheduler** | Assigns deadlines and time slots automatically |
| 👥 **Delegator** | Routes tasks to the right team members |
| 🔔 **Reminder** | Sends follow-up nudges before deadlines |
| 📊 **Reporter** | Generates post-meeting summaries and status reports |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account
- n8n instance (cloud or self-hosted)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/autoops.git
cd autoops
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Fill in your keys
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup
```bash
cd auto-action-ui
npm install
cp .env.example .env            # Fill in your Supabase keys
npm run dev                     # http://localhost:5173
```



## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*If this saved you from another pointless follow-up meeting, drop a ⭐ — it means a lot!*

