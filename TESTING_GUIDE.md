# 🧪 PlagDetect v1.1 - Testing Guide

This guide covers testing all the new improvements implemented in this update.

---

## 📋 Summary of Improvements

| # | Feature | Type | Description |
|---|---------|------|-------------|
| 1 | **Context Menu Integration** | Extension | Right-click to check selected text |
| 2 | **Offline Pattern Analysis** | Extension | Works without server connection |
| 3 | **Quick Check (⚡)** | Extension | Instant local pattern detection |
| 4 | **Keyboard Shortcuts** | Extension | Ctrl+Shift+P for quick check |
| 5 | **Enhanced Keyword Extraction** | Backend | 12 keywords with TF-IDF scoring |
| 6 | **Better Search Results** | Backend | 8 results instead of 5 |
| 7 | **Document Fingerprinting** | Database | Cross-document similarity tracking |
| 8 | **Improved Toast Notifications** | Extension | Better visual feedback |

---

## 🧩 Chrome Extension Testing

### Prerequisites
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked" and select `plagiarism-extension` folder
4. **Important:** If extension was already loaded, click the 🔄 refresh button on the extension card

### Test 1: Context Menu - Quick Check (Offline)

**Steps:**
1. Go to any webpage (e.g., https://en.wikipedia.org/wiki/Albert_Einstein)
2. Select some text (the longer the better, at least 50 characters)
3. **Right-click** on the selected text
4. Click **"⚡ Quick Check (Offline)"**

**Expected Results:**
- Extension badge shows percentage score
- Toast notification appears in bottom-right
- Works even without internet connection

**Test Text (Copy to any page and select):**
```
According to recent studies, it is widely known that research has shown that 
climate change is a pressing issue. Furthermore, in conclusion, it is important 
to note that global warming is affecting ecosystems worldwide. Albert Einstein 
(born 1879) is a German theoretical physicist who developed the theory of relativity.
Studies have shown that experts believe we need immediate action.
```
**Expected Score:** ~70-85% (should detect academic phrases + wiki patterns)

---

### Test 2: Context Menu - Full Plagiarism Check

**Steps:**
1. Select text on any webpage
2. Right-click → **"🔍 Full Plagiarism Check"**
3. Wait for API response (server must be running)

**Expected Results:**
- Badge shows "..." while processing
- Badge shows percentage when done
- Toast shows match count and verdict

**Note:** This requires the backend server (`npm run dev` on localhost:3000 or the production Vercel server)

---

### Test 3: Context Menu - AI Detection

**Steps:**
1. Select text that looks AI-generated (uses phrases like "dive deep", "leverage", "synergy")
2. Right-click → **"🤖 Check for AI Content"**

**Expected Results:**
- Shows AI probability detection
- Badge color reflects AI content likelihood

---

### Test 4: Keyboard Shortcut

**Steps:**
1. Select text on any webpage
2. Press **Ctrl+Shift+P** (or Cmd+Shift+P on Mac)

**Expected Results:**
- Quick offline check runs automatically
- Badge updates with score

---

### Test 5: Code Check

**Steps:**
1. Go to GitHub or any site with code
2. Select a code snippet
3. Right-click → **"💻 Check Code Similarity"**

**Expected Results:**
- Code is analyzed for common algorithms
- AI patterns in code are detected
- Returns originality score

---

### Test 6: Popup - Check Selected Text

**Steps:**
1. Select text on a webpage
2. Click the PlagDetect extension icon
3. In the "Text" tab, click **"🔍 Check Selected Text"**

**Expected Results:**
- Shows originality score
- Displays match details
- Shows AI score if detected

---

### Test 7: Popup - Full Page Analysis

**Steps:**
1. Go to any content-heavy webpage
2. Click extension icon
3. Click **"📄 Analyze Full Page"**

**Expected Results:**
- Originality score for entire page
- SEO analysis (if applicable)
- AI content detection
- Plagiarism match count

---

## 🌐 Web Application Testing

### Prerequisites
- Run `npm run dev` in the project directory
- Open http://localhost:3000
- Sign in or create an account

### Test 1: Text Plagiarism Detection

**Steps:**
1. Go to Dashboard
2. Enter text in the Text Input tab
3. Click "Analyze Text"

**Test Text:**
```
According to recent studies, it is widely known that research has shown that 
climate change is affecting our planet. Albert Einstein (born 1879) developed 
the theory of relativity. In conclusion, it is important to note that we need 
to take action. Studies have shown that experts believe this is urgent.
Furthermore, as mentioned above, the situation requires immediate attention.
```

**Expected Results:**
- Score should be between 60-85% (not 100%)
- Should detect:
  - Academic template phrases (generic)
  - Wikipedia-style patterns (wiki)
  - Impersonal writing style (voice)
- Verdict: MOSTLY_ORIGINAL or SUSPICIOUS

---

### Test 2: Original Content

**Steps:**
1. Enter genuinely original text with personal voice

**Test Text:**
```
Yesterday, I went to the park near my house. The weather was beautiful with 
clear blue skies. I saw children playing on the swings while their parents 
watched from nearby benches. A small dog ran past me, chasing after a ball 
that its owner had thrown. I sat down on my favorite bench under the old 
oak tree and read my book for about an hour. It was a peaceful afternoon 
that I really needed after a busy week at work.
```

**Expected Results:**
- Score should be 90-100%
- Minimal or no pattern matches
- Verdict: ORIGINAL

---

### Test 3: Wikipedia-style Content

**Steps:**
1. Copy text from Wikipedia or write encyclopedia-style

**Test Text:**
```
Albert Einstein (born March 14, 1879) was a German-born theoretical physicist 
who is widely held to be one of the greatest scientists of all time. Einstein 
is best known for developing the theory of relativity, also known as the 
special and general theories of relativity. According to scientists, his work 
on the photoelectric effect earned him the Nobel Prize in Physics.
```

**Expected Results:**
- Score around 60-80%
- Should detect encyclopedia-style patterns
- Verdict: MOSTLY_ORIGINAL or SUSPICIOUS

---

## 🔧 Backend API Testing (Advanced)

### Test Enhanced Keyword Extraction

Use curl or Postman:

```bash
# PowerShell
$body = @{
    textContent = "Climate change and global warming are affecting our ecosystems worldwide. Scientists have conducted extensive research on temperature patterns and greenhouse gas emissions."
    html = "<html><body>Test</body></html>"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/analyze/page" -Method POST -ContentType "application/json" -Body $body
```

**Expected Results:**
- More relevant search keywords extracted
- Better match detection

---

## 📊 Database Testing

### Verify Schema Updates

```bash
npx prisma studio
```

**Check for new tables:**
- `DocumentFingerprint` - For n-gram shingles
- `SimilarDocument` - For cross-document matches

**Check updated fields in `PlagiarismReport`:**
- `webMatchCount`
- `patternMatchCount`
- `internalMatchCount`
- `processingTimeMs`
- `verdict`

---

## ✅ Checklist

### Extension Tests
- [ ] Quick Check (Offline) context menu works
- [ ] Full Plagiarism Check context menu works
- [ ] Code Check context menu works
- [ ] AI Detection context menu works
- [ ] Keyboard shortcut (Ctrl+Shift+P) works
- [ ] Toast notifications display correctly
- [ ] Badge updates with percentage
- [ ] Popup buttons work correctly
- [ ] Works in offline mode (shows pattern-based results)

### Web App Tests
- [ ] Dashboard text input works
- [ ] Pattern detection identifies generic phrases
- [ ] Wikipedia patterns are detected
- [ ] AI patterns are detected
- [ ] Originality score is not always 100%
- [ ] Matches are displayed in results
- [ ] Verdict is shown correctly

### Backend Tests
- [ ] API returns reasonable scores
- [ ] Search keywords are extracted (check console logs)
- [ ] Pattern analysis runs as fallback
- [ ] No 500 errors on requests

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Extension not loading | Refresh extension on chrome://extensions/ |
| Context menu missing | Remove and re-add extension |
| 100% originality always | Check if pattern analysis is running (server logs) |
| API errors | Ensure `npm run dev` is running |
| Badge not updating | Check browser permissions for notifications |
| Keyboard shortcut not working | Check chrome://extensions/shortcuts |

---

## 📝 Notes

- All pattern-based analysis can run offline in the extension
- Web search requires SERPER_API_KEY in .env
- Semantic analysis requires GEMINI_API_KEY in .env
- Production extension connects to https://cursors-2k26.vercel.app

---

**Last Updated:** February 2026  
**Version:** 1.1.0
