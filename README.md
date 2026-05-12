# 🔍 PlagDetect - AI-Powered Academic Integrity Platform

An all-in-one plagiarism detection platform that checks **text**, **code**, and **images** for AI-generated content and plagiarism.

![PlagDetect](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Gemini](https://img.shields.io/badge/Gemini-2.0-blue?style=for-the-badge&logo=google)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

<div align="center">

## 🎥 Demo Video

[![Watch Demo](https://cdn.loom.com/sessions/thumbnails/7a37c3b614f94bd4aa4b7ad98badfdf2-00001.gif)](https://www.loom.com/share/7a37c3b614f94bd4aa4b7ad98badfdf2)
</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📝 **Text Plagiarism** | Semantic search across web sources |
| 💻 **Code Plagiarism** | AST-based analysis + AI pattern detection |
| 🤖 **AI Detection** | Identifies ChatGPT, Claude, Gemini patterns |
| 🖼️ **Image Analysis** | Detects Midjourney, DALL-E, Stable Diffusion |
| 📊 **SEO Analysis** | Shows AI content impact on rankings |
| 🧩 **Chrome Extension** | Check any content with 1 click |
| 🌐 **Full Website Analysis** | Analyze complete webpages for AI content |
| ⚡ **Fast Results** | Real-time AI-powered detection |

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Gemini API key
- Serper API key

---

# 📦 Installation

## 1. Clone the repository

```bash
git clone https://github.com/yourusername/plagiarism-detector.git
cd plagiarism-detector
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/plagdetect"
GEMINI_API_KEY="your-gemini-api-key"
SERPER_API_KEY="your-serper-api-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 4. Set up database

```bash
npx prisma generate
npx prisma db push
```

---

## 5. Run development server

```bash
npm run dev
```

---

## 6. Open application

```bash
http://localhost:3000
```

---

# 🧩 Chrome Extension Setup

The extension allows plagiarism and AI-content detection directly from any webpage.

## Features

- ✅ Selected text analysis
- ✅ Code plagiarism checking
- ✅ AI-generated content detection
- ✅ Full website analysis
- ✅ AI image detection
- ✅ SEO quality analysis

---

# 📥 Installation Steps

## Step 1: Open Extensions Page

Open Chrome and visit:

```bash
chrome://extensions/
```

Or:

- Chrome Menu → More Tools → Extensions

---

## Step 2: Enable Developer Mode

Enable the toggle at the top-right corner.

---

## Step 3: Load Extension

Click:

```bash
Load unpacked
```

Select:

```bash
plagiarism-extension/
```

---

## Step 4: Verify Installation

You should now see:

```bash
PlagDetect - AI Plagiarism Checker
```

---

## Step 5: Pin Extension

- Click the puzzle icon 🧩
- Pin the extension 📌

---

# ⚠️ Troubleshooting

| Issue | Solution |
|------|----------|
| Extension not loading | Select correct extension folder |
| Service worker failed | Refresh extension |
| Cannot access page | Use normal websites |
| Backend connection failed | Run `npm run dev` |
| Missing icons | Verify icons folder |

---

# ✅ Quick Test

1. Start backend:

```bash
npm run dev
```

2. Open any website

3. Click extension icon

4. Click:

```bash
📄 Analyze Full Page
```

5. View AI and plagiarism analysis

---

# 📝 Using the Extension

## Text Plagiarism

1. Select text
2. Open extension
3. Click:

```bash
🔍 Check Selected Text
```

---

## 🌐 Full Website Analysis

Analyze:
- AI-generated content
- SEO score
- Generic AI phrases
- Content quality

---

## 💻 Code Plagiarism

Supports:
- JavaScript
- Python
- Java
- C++
- TypeScript

Checks:
- AST similarity
- AI-generated patterns
- Algorithm cloning

---

## 🖼️ AI Image Detection

Upload an image to detect:
- Midjourney
- DALL-E
- Stable Diffusion
- AI artifacts

---

# 🎯 Extension Features

| Tab | Function |
|-----|----------|
| Text | Plagiarism detection |
| Code | Code originality |
| Image | AI image detection |

---

# 🎨 Score Indicators

| Score | Meaning |
|------|---------|
| 🟢 80%+ | Original |
| 🟡 50-79% | Partial similarity |
| 🔴 Below 50% | Likely copied/AI-generated |

---

# 📁 Project Structure

```bash
plagiarism-detector/
├── app/
│   ├── api/
│   │   ├── plagiarism/
│   │   ├── analyze/
│   │   └── verify/
│   ├── dashboard/
│   └── (marketing)/
├── components/
├── lib/
│   ├── aiDetection.js
│   ├── codePlagiarism.js
│   ├── verifier.js
│   └── plagiarismUtils.js
├── prisma/
├── plagiarism-extension/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── background.js
│   └── content.js
└── presentation.html
```

---

# 🔌 API Endpoints

## Text Plagiarism

```http
POST /api/plagiarism/semantic
```

```json
{
  "text": "Your text here",
  "threshold": 0.5
}
```

---

## Code Plagiarism

```http
POST /api/plagiarism/code
```

```json
{
  "code": "print('hello')",
  "language": "python"
}
```

---

## Full Website Analysis

```http
POST /api/analyze/page
```

```json
{
  "html": "<html>...</html>",
  "textContent": "Page content",
  "sourceCode": "JavaScript"
}
```

---

## AI Image Detection

```http
POST /api/analyze/image
```

---

# 🛠️ Tech Stack

| Layer | Technology |
|------|-------------|
| Frontend | Next.js 16, React 19 |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL |
| ORM | Prisma |
| AI | Google Gemini 2.0 |
| Parser | Babel AST |
| Auth | NextAuth.js |
| Extension | Chrome Manifest V3 |

---

# 📊 Evaluation Highlights

| Criteria | Highlights |
|----------|------------|
| Functionality | Full-stack stable architecture |
| Innovation | AST + AI detection |
| UI/UX | Responsive modern design |
| Scalability | Modular APIs |
| Creativity | Multi-modal detection |

---

# 🎬 Presentation

Open pitch deck:

```bash
start presentation.html
```

---

# 🤝 Contributing

1. Fork repository

2. Create feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit changes

```bash
git commit -m "Add amazing feature"
```

4. Push branch

```bash
git push origin feature/amazing-feature
```

5. Open Pull Request

---

# 📝 License

Licensed under the MIT License.

---

# 🙏 Acknowledgments

- Google Gemini API
- Babel Parser
- Prisma
- Next.js Team
- Open Source Community

---

# ⭐ Support

If you found this project useful:

- Star the repository
- Share the project
- Contribute improvements

---

# 💡 Future Roadmap

- AI watermark detection
- Multi-language support
- Enterprise dashboards
- LMS integrations
- VSCode extension
- PDF/DOCX analysis
- Semantic vector search

---

Built with ❤️ for the AI Era
