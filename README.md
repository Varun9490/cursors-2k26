# 🔍 PlagDetect - AI-Powered Academic Integrity Platform

An all-in-one plagiarism detection platform that checks **text**, **code**, and **images** for AI-generated content and plagiarism.

![PlagDetect](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Gemini](https://img.shields.io/badge/Gemini-2.0-blue?style=for-the-badge&logo=google)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📝 **Text Plagiarism** | Semantic search across web sources |
| 💻 **Code Plagiarism** | AST-based analysis + AI pattern detection |
| 🤖 **AI Detection** | Identifies ChatGPT, Claude, Gemini patterns |
| 🖼️ **Image Analysis** | Detects Midjourney, DALL-E, Stable Diffusion |
| 📊 **SEO Analysis** | Shows AI content impact on rankings |
| 🧩 **Chrome Extension** | Check any content with 1 click |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Gemini API key
- Serper API key (for web search)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/plagiarism-detector.git
cd plagiarism-detector
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/plagdetect"
GEMINI_API_KEY="your-gemini-api-key"
SERPER_API_KEY="your-serper-api-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open the app**
Visit [http://localhost:3000](http://localhost:3000)

---

## 🧩 Chrome Extension Setup

The extension allows you to check plagiarism directly from any webpage, including:
- ✅ Selected text on any website
- ✅ Code snippets from GitHub, StackOverflow, etc.
- ✅ **Full website content analysis** (checks entire page for AI content & SEO)
- ✅ Uploaded images for AI detection

### 📥 Installation Steps (Step-by-Step)

#### Step 1: Open Chrome Extensions Page
- Open Google Chrome browser
- Type `chrome://extensions/` in the address bar and press Enter
- **OR** click the 3-dot menu (⋮) → More Tools → Extensions

#### Step 2: Enable Developer Mode
- Look at the **top-right corner** of the Extensions page
- You'll see a toggle switch labeled "Developer mode"
- **Turn it ON** (toggle should be blue)

#### Step 3: Load the Extension
- After enabling Developer mode, you'll see new buttons appear
- Click the **"Load unpacked"** button (top-left area)
- A file browser will open
- Navigate to your project folder: `plagiarism-detector/plagiarism-extension/`
- Select the `plagiarism-extension` folder and click "Select Folder"

#### Step 4: Verify Installation
- You should see "PlagDetect - AI Plagiarism Checker" in your extensions list
- If there are any errors, they will be shown in red - check the troubleshooting section below

#### Step 5: Pin the Extension (Recommended)
- Click the **puzzle piece icon** (🧩) in Chrome's toolbar (top-right)
- Find "PlagDetect - AI Plagiarism Checker" in the list
- Click the **pin icon** (📌) next to it
- The extension icon will now always be visible in your toolbar

### ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Extension not loading | Make sure you selected the `plagiarism-extension` folder, not the root `plagiarism-detector` folder |
| "Service worker registration failed" | Refresh the extension (click the refresh icon on the extension card) |
| "Cannot access this page" | Some pages (chrome://, extension pages) are restricted. Try on a regular website |
| "Connection Failed" | Make sure the backend server is running (`npm run dev` on port 3000) |
| Icons not showing | The icons folder may be missing. Check that `plagiarism-extension/icons/` exists |

### ✅ Quick Test

1. Make sure backend is running: `npm run dev`
2. Go to any website (e.g., https://google.com)
3. Click the PlagDetect extension icon
4. Click "📄 Analyze Full Page"
5. You should see analysis results within a few seconds

### Using the Extension

#### 📝 Text Plagiarism Check
1. Select any text on a webpage
2. Click the PlagDetect extension icon
3. Make sure "Text" tab is active
4. Click "🔍 Check Selected Text"
5. View the originality score and analysis

#### 🌐 Full Website Plagiarism Check
1. Navigate to any website you want to analyze
2. Click the PlagDetect extension icon
3. In the "Text" tab, click "📄 Analyze Full Page"
4. The extension will scan the entire website for:
   - **AI-generated content** (ChatGPT, Claude patterns)
   - **SEO score** (meta tags, headings, structure)
   - **Content quality** (thin content, generic phrases)
5. View comprehensive analysis with recommendations

#### 💻 Code Plagiarism Check
1. Select code on any webpage (GitHub, StackOverflow, etc.)
2. Click the extension icon
3. Switch to "Code" tab
4. Choose language (or Auto-detect)
5. Click "🔍 Check Code Plagiarism"
6. See originality %, AI patterns, and algorithm matches

#### 🖼️ AI Image Detection
1. Click the extension icon
2. Switch to "Image" tab
3. Drag & drop an image OR click to upload
4. View AI detection results

### Extension Features

| Tab | Function | Output |
|-----|----------|--------|
| **Text** | Check selected text for plagiarism | Originality %, matches |
| **Code** | Analyze code for AI patterns | Originality %, algorithm matches |
| **Image** | Detect AI-generated images | AI probability %, artifacts |

### Color Coding

| Score | Color | Meaning |
|-------|-------|---------|
| 80%+ | 🟢 Green | Original content |
| 50-79% | 🟡 Amber | Some similarity detected |
| <50% | 🔴 Red | Likely copied/AI-generated |

### Requirements

- **Server must be running**: The extension connects to `localhost:3000`
- Make sure to run `npm run dev` before using the extension

---

## 📁 Project Structure

```
plagiarism-detector/
├── app/                        # Next.js App Router
│   ├── api/                    # API endpoints
│   │   ├── plagiarism/         # Plagiarism detection APIs
│   │   │   ├── code/           # Code analysis
│   │   │   └── semantic/       # Text analysis
│   │   ├── analyze/            # Analysis APIs
│   │   │   ├── page/           # Full page analysis
│   │   │   └── image/          # AI image detection
│   │   └── verify/             # Code verification
│   ├── dashboard/              # User dashboard
│   └── (marketing)/            # Landing pages
├── components/                 # Reusable UI components
├── lib/                        # Core business logic
│   ├── aiDetection.js          # AI content detection
│   ├── codePlagiarism.js       # AST-based code analysis
│   ├── verifier.js             # Gemini integration
│   └── plagiarismUtils.js      # Utility functions
├── prisma/                     # Database schema
├── plagiarism-extension/       # Chrome extension
│   ├── manifest.json           # Extension config
│   ├── popup.html              # Extension UI
│   ├── popup.js                # Extension logic
│   ├── background.js           # Service worker
│   └── content.js              # Content scripts
└── presentation.html           # Pitch deck
```

---

## 🔌 API Endpoints

### Text Plagiarism
```http
POST /api/plagiarism/semantic
Content-Type: application/json

{
  "text": "Your text to check...",
  "threshold": 0.5
}
```

### Code Plagiarism
```http
POST /api/plagiarism/code
Content-Type: application/json

{
  "code": "def hello(): print('world')",
  "language": "python"
}
```

### Full Page Analysis
```http
POST /api/analyze/page
Content-Type: application/json

{
  "html": "<html>...</html>",
  "textContent": "Page text...",
  "sourceCode": "JavaScript code..."
}
```

### AI Image Detection
```http
POST /api/analyze/image
Content-Type: multipart/form-data

image: [file]
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Database** | PostgreSQL |
| **AI/ML** | Google Gemini 2.0, Babel Parser |
| **Auth** | NextAuth.js (Google OAuth) |
| **Extension** | Chrome Manifest V3 |

---

## 📊 Evaluation Criteria Scores

| Criteria | Points | Highlights |
|----------|--------|------------|
| **Functionality & Stability** | 20 | Full-featured, error handling |
| **Vibe Coding Practice** | 20 | Clean architecture, DRY |
| **Innovation & Creativity** | 20 | AST analysis, AI detection |
| **Impact & Feasibility** | 15 | Real-world use cases |
| **Pitching & Storytelling** | 10 | Clear problem-solution |
| **UI/UX Design** | 15 | Modern, responsive, accessible |

---

## 🎬 Presentation

Open the pitch deck:
```bash
start presentation.html
```

Or view `PRESENTATION.md` for detailed talking points.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Google Gemini API for AI analysis
- Babel for AST parsing
- Next.js team for the amazing framework

---

**Built with ❤️ for the AI Era**
