# CareerPurpose AI 🚀

### _Your AI career coach — available 24/7, completely free._

> Build resumes. Ace interviews. Close skill gaps. Land your dream job.  
> Powered by Groq AI (Llama 3.3) · Built for Filipino job seekers 🇵🇭

**[🌐 Try it Live →](https://careerpurpose-ai.vercel.app)**

---

## What is CareerPurpose AI?

Most job seekers don't fail because they're unqualified.  
They fail because they don't know how to **present themselves**.

CareerPurpose AI fixes that — by giving everyone access to the kind of career coaching that used to cost thousands of pesos.

---

## ✨ Features

| Tool                       | What it does                                                |
| -------------------------- | ----------------------------------------------------------- |
| 📄 **Resume Builder**      | AI writes your resume → download as PDF or Word             |
| 🔍 **Resume Analyzer**     | Upload your resume → get ATS score + honest feedback        |
| 🗺️ **Career Roadmap**      | Tell us your goal → get a step-by-step learning plan        |
| 🎤 **Interview Simulator** | Practice interviews → get AI feedback on your answers       |
| 📊 **Skill Gap Analysis**  | See exactly what skills you're missing for your target role |
| ✉️ **Cover Letter**        | One click → personalized professional cover letter          |
| 💼 **Job Tracker**         | Track applications, interviews, offers, and rejections      |
| 📚 **Learning Hub**        | Free learning plans for any skill — Excel, coding, anything |
| 🎯 **Productivity**        | Set daily goals and track your career progress              |

---

## 🛠️ Built With

```
React 18          → Frontend UI
Tailwind CSS 3    → Styling
Firebase Auth     → Google login
Firebase Firestore → Database
Groq API (Free)   → AI (Llama 3.3 70B)
jsPDF             → PDF export
docx + file-saver → Word export
pdfjs-dist        → PDF reading
mammoth           → Word reading
Vercel            → Deployment
```

---

## 🚀 Getting Started

**1. Clone the repo**

```bash
git clone https://github.com/JustineTesara/careerpurpose-ai.git
cd careerpurpose-ai
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up Firebase**

Create a `.env` file in the root:

```env
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
DISABLE_ESLINT_PLUGIN=true
CI=false
```

**4. Run locally**

```bash
npm start
```

**5. Get your free Groq API key**

Go to [console.groq.com](https://console.groq.com) → sign up free → create API key → paste it in the app sidebar.

---

## 📁 Project Structure

```
src/
├── components/
│   └── Sidebar.js          # Nav + mobile hamburger menu
├── context/
│   └── AuthContext.js      # Firebase auth state
├── lib/
│   └── gemini.js           # Groq AI API calls + caching
├── pages/
│   ├── Login.js            # Google login
│   ├── Dashboard.js        # Home dashboard
│   ├── ResumeBuilder.js    # AI resume → PDF/Word export
│   ├── ResumeAnalyzer.js   # Upload PDF/Word → AI analysis
│   ├── CareerRoadmap.js    # AI learning roadmap
│   ├── InterviewSim.js     # Mock interview + feedback
│   ├── SkillGap.js         # Skill gap analysis
│   ├── CoverLetter.js      # AI cover letter generator
│   ├── JobTracker.js       # Job application tracker
│   ├── LearningHub.js      # Free learning plan generator
│   └── Productivity.js     # Daily goal tracker
├── App.js
├── firebase.js
└── index.css
```

---

## 💸 100% Free Stack

| Service            | Free Limit                  |
| ------------------ | --------------------------- |
| Groq API           | 14,400 requests/day         |
| Firebase Auth      | 10,000 users/month          |
| Firebase Firestore | 1GB storage · 50k reads/day |
| Vercel Hosting     | Unlimited deployments       |

No credit card. No hidden fees. No catch.

---

## 🌐 Deploy Your Own

**One-click deploy on Vercel:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JustineTesara/careerpurpose-ai)

Or manually:

```bash
npm install -g vercel
vercel
```

---

## 🤝 Contributing

Found a bug? Have an idea? PRs are welcome!

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-idea`
3. Commit: `git commit -m "feat: your idea"`
4. Push: `git push origin feature/your-idea`
5. Open a Pull Request

---

## 📄 License

MIT — free to use, modify, and build on.

---

## 👩‍💻 Author

**Justine Tesara**  
Fresh IT Graduate · Polangui, Albay 🇵🇭  
GitHub: [@JustineTesara](https://github.com/JustineTesara)

---

<div align="center">

**If this helped you, give it a ⭐ on GitHub!**

_Built with ❤️ and too much coffee in the Philippines_ ☕

</div>
