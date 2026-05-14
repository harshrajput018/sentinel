# 🛡️ Sentinel — AI-Powered Code Reviewer & Security Auditor

> A MERN developer tool where teams paste code or connect a GitHub repo for an AI-driven security audit, performance analysis, and refactoring suggestions.

![Stack](https://img.shields.io/badge/Stack-MERN-00f5ff?style=flat-square)
![AI](https://img.shields.io/badge/AI-Groq%20%2F%20LLaMA%203.3-00ff88?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square)

---

## ✨ Features

- **🔍 AI Security Auditing** — OWASP Top 10, CWE classification, real attack vector analysis
- **⚡ Performance Analysis** — Algorithm complexity, N+1 queries, blocking I/O detection
- **📝 Monaco Editor** — VS Code's engine in-browser for professional code UX
- **🔀 One-Click Refactor Diff** — Side-by-side diff viewer of AI-fixed code
- **🐙 GitHub Integration** — Browse repos, select files, run audits directly
- **📊 Dashboard & Analytics** — Score trends, language breakdowns, issue history
- **🐳 Docker-Ready** — Full `docker-compose up` for dev and production parity

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- [Groq API Key](https://console.groq.com) (free tier available)

### 1. Clone & Install
```bash
git clone <your-repo>
cd sentinel
npm run install:all
```

### 2. Configure Environment
```bash
cp .env.example server/.env
# Edit server/.env with your values
```

Required environment variables:
| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Free at https://console.groq.com |
| `JWT_SECRET` | Any random string (e.g. `openssl rand -hex 32`) |
| `MONGO_URI` | MongoDB connection string |
| `GITHUB_CLIENT_ID` | Optional: GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | Optional: GitHub OAuth App |

### 3. Run in Development
```bash
npm run dev
# Client: http://localhost:3000
# Server: http://localhost:5000
```

### 4. Run with Docker
```bash
# Copy env to root
cp .env.example .env
# Fill in values, then:
docker-compose up --build
```

---

## 📁 Project Structure

```
sentinel/
├── client/                    # React frontend
│   ├── public/
│   └── src/
│       ├── components/        # Reusable UI (Navbar, ScoreRing, IssueCard)
│       ├── context/           # AuthContext (JWT auth state)
│       ├── pages/             # Landing, Login, Register, Dashboard, Reviewer, History, ReviewDetail
│       └── utils/
├── server/                    # Node.js/Express backend
│   ├── config/                # DB connection, Groq client
│   ├── controllers/           # authController, reviewController, historyController, githubController
│   ├── middleware/            # JWT auth middleware
│   ├── models/                # User.js, Review.js (Mongoose)
│   ├── routes/                # auth, review, history, github
│   └── utils/
│       └── systemPrompts.js   # 🔑 Specialized security-focused LLM system prompts
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🧠 Specialized System Prompt Architecture

The core differentiator. `server/utils/systemPrompts.js` contains the `SECURITY_AUDIT_PROMPT` that guides LLaMA 3.3 to:

1. **Trace data flows** from user input to sinks
2. **Identify trust boundary crossings** and missing validation
3. **Consider adversarial inputs** — null bytes, Unicode tricks, path traversal
4. **Apply CWE classification** to every security finding
5. **Evaluate cryptographic implementations** against current standards

This is not surface-level syntax checking — the model reasons about *why* something is exploitable.

---

## 🔑 Getting Your Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for free
3. Create an API key
4. Add it to `server/.env` as `GROQ_API_KEY=gsk_...`

The free tier supports ~100,000 tokens/day — plenty for development and team use.

---

## 🐳 Docker Architecture

```
┌─────────────────────────────────────────┐
│  docker-compose                         │
│  ┌─────────┐  ┌─────────┐  ┌────────┐ │
│  │  React  │  │  Node   │  │ Mongo  │ │
│  │  :3000  │→ │  :5000  │→ │ :27017 │ │
│  │  nginx  │  │ Express │  │        │ │
│  └─────────┘  └─────────┘  └────────┘ │
└─────────────────────────────────────────┘
```

---

## 🛣️ API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/review/analyze` | Yes | Analyze code |
| GET | `/api/review/:id` | Yes | Get review result |
| GET | `/api/history` | Yes | Paginated history |
| GET | `/api/history/stats/overview` | Yes | Aggregate stats |
| DELETE | `/api/history/:id` | Yes | Delete review |
| GET | `/api/github/repos` | Yes | List GitHub repos |
| GET | `/api/github/tree/:owner/:repo/:path` | Yes | File tree |
| POST | `/api/github/analyze` | Yes | Analyze GitHub file |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| Diff View | `react-diff-viewer-continued` |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI | Groq API (LLaMA 3.3 70B) |
| Auth | JWT + bcryptjs |
| Container | Docker + Docker Compose |
| Fonts | Syne (display), Space Mono (code), Inter (body) |

---

## 📜 License

MIT
