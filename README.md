# CareerPurpose AI 🚀

An AI-powered career platform for students, fresh graduates, freelancers, and job seekers in the Philippines. Built with React, Firebase, Tailwind CSS, and Groq AI (free).

![CareerPurpose AI](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Free_Tier-orange?style=flat-square&logo=firebase)
![Groq AI](https://img.shields.io/badge/Groq_AI-Free-green?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?style=flat-square&logo=tailwindcss)

---

## ✨ Features

| Feature                   | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| 📄 AI Resume Builder      | Generate ATS-friendly resumes and export to PDF        |
| 🔍 AI Resume Analyzer     | Upload PDF resume and get ATS score + feedback         |
| 🗺️ AI Career Roadmap      | Personalized step-by-step learning roadmap             |
| 🎤 AI Interview Simulator | Mock interviews with AI feedback and scoring           |
| 📊 Skill Gap Analysis     | Compare your skills vs target job requirements         |
| ✉️ AI Cover Letter        | Generate personalized cover letters instantly          |
| 💼 Job Tracker            | Track applications, interviews, offers, and rejections |
| 📚 Learning Hub           | Free personalized learning plans for any skill         |
| 🎯 Productivity           | Daily goal tracker with progress analytics             |

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Tailwind CSS 3
- **Authentication:** Firebase Auth (Google Sign-In)
- **Database:** Firebase Firestore
- **AI:** Groq API (free tier — Llama 3.3 70B)
- **PDF Export:** jsPDF
- **PDF Reading:** pdfjs-dist
- **Deployment:** Vercel (free)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Firebase account (free)
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/careerpurpose-ai.git
cd careerpurpose-ai
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up Firebase**

Create a `.env` file in the root folder:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

**4. Run the app**

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**5. Get your free Groq API key**

Go to [console.groq.com](https://console.groq.com), sign up for free, and paste your key in the sidebar of the app.

---

## 📁 Project Structure

```
careerpurpose-ai/
├── public/
├── src/
│   ├── components/
│   │   └── Sidebar.js          # Navigation sidebar
│   ├── context/
│   │   └── AuthContext.js      # Firebase auth context
│   ├── lib/
│   │   └── gemini.js           # Groq AI API calls
│   ├── pages/
│   │   ├── Login.js            # Google login page
│   │   ├── Dashboard.js        # Main dashboard
│   │   ├── ResumeBuilder.js    # AI resume builder + PDF
│   │   ├── ResumeAnalyzer.js   # Resume analyzer + PDF upload
│   │   ├── CareerRoadmap.js    # AI career roadmap
│   │   ├── InterviewSim.js     # Mock interview simulator
│   │   ├── SkillGap.js         # Skill gap analysis
│   │   ├── CoverLetter.js      # Cover letter generator
│   │   ├── JobTracker.js       # Job application tracker
│   │   ├── LearningHub.js      # Learning plan generator
│   │   └── Productivity.js     # Daily goal tracker
│   ├── App.js                  # Main app + routing
│   ├── firebase.js             # Firebase config
│   └── index.css               # Tailwind CSS imports
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 🔑 Environment Variables

| Variable                                 | Description                  |
| ---------------------------------------- | ---------------------------- |
| `REACT_APP_FIREBASE_API_KEY`             | Firebase API key             |
| `REACT_APP_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain         |
| `REACT_APP_FIREBASE_PROJECT_ID`          | Firebase project ID          |
| `REACT_APP_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket      |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `REACT_APP_FIREBASE_APP_ID`              | Firebase app ID              |

> ⚠️ Never commit your `.env` file to GitHub. It's already in `.gitignore` by default.

---

## 🌐 Deployment

This app is deployed on **Vercel** for free.

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Or connect your GitHub repo directly at [vercel.com](https://vercel.com) for automatic deployments.

---

## 💡 Free Services Used

| Service            | Free Tier                  |
| ------------------ | -------------------------- |
| Firebase Auth      | 10,000 users/month         |
| Firebase Firestore | 1GB storage, 50k reads/day |
| Groq API           | 14,400 requests/day        |
| Vercel             | Unlimited deployments      |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

MIT License — feel free to use this project for your own portfolio or startup.

---

## 👨‍💻 Author

**Justine Tesara**

- GitHub: [@JustineTesara](https://github.com/JustineTesara)
- Location: Polangui, Albay, Philippines

---

## ⭐ Support

If this project helped you, please give it a ⭐ on GitHub!

> Built with ❤️ in the Philippines 🇵🇭
