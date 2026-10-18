# GeoMastery — NPTEL Conservation Geography Prep

A complete, production-ready interactive web application designed for mastering 12 weekly assignments (120 MCQs) in **Conservation Geography**.

Built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Express / Google GenAI SDK**.

---

## Features

- **120 Pre-Loaded Assignment MCQs**: All 12 weeks of assignments are fully verified and embedded with educational rationales.
- **100% Standalone & Zero-Key Required**: The entire application (Study Reader, 120-Question Mock Exam, Flashcards, Mistake Bank, and PDF synchronizer) works immediately out-of-the-box with NO API key needed.
- **Eye-Comfort Reading Themes**:
  - *Warm Paper* (Kindle / Notion E-Ink aesthetic)
  - *Daylight Slate* (High-contrast testing)
  - *Midnight Dark* (Low-glare night study)
  - Font size controls (Small, Medium, Large)
- **Fluid Full View Reading**: In-app immersion mode with instant toggles for **Explanations (On/Off)**, **Answer Keys**, and **Self-Test (Blur Mode)**.
- **Randomized Exam Engine**:
  - 1-click **All 120 Questions** test or custom multi-week filtering.
  - Shuffle Questions & Shuffle A/B/C/D Choices.
  - Instant Feedback & Timed Exam modes.
  - Full keyboard shortcuts (`1-4`, `A-D`, `Space/Enter`, `M` for bookmark, arrows).
- **Spaced Repetition & Mistake Bank**: Targeted drilling of flagged or missed questions.
- **Automatic Assignment Synchronizer & Optional Gemini OCR**: Works offline by default; optionally uses `GEMINI_API_KEY` for live multimodal analysis of arbitrary external PDFs.

---

## Deploy to GitHub

To push this codebase to your own GitHub repository:

1. **Create a new repository** on [GitHub](https://github.com/new) (e.g. `geomastery-nptel-prep`).
2. Run the following commands in your terminal:

```bash
# Add your GitHub repository remote
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/geomastery-nptel-prep.git

# Push the main branch
git branch -M main
git push -u origin main
```

---

## Deploy to Vercel

### Method 1: One-Click Import from GitHub (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your imported GitHub repository (`geomastery-nptel-prep`).
3. Vercel automatically detects the configuration from `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. *(Optional)* In **Environment Variables**, you can add `GEMINI_API_KEY` if you want live AI OCR on new external PDFs, but **it is not required**—the app runs 100% standalone out-of-the-box!
5. Click **Deploy**!

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Log in and deploy
vercel
```

When prompted:
- Set up and deploy? **Yes**
- Which scope? Select your personal or team account.
- Link to existing project? **No**
- Project name: `geomastery-nptel-prep`
- Directory: `./`
- Want to modify settings? **No**

---

## Local Development

```bash
# Install dependencies
npm install

# Run full-stack dev server
npm run dev

# Open in browser at http://localhost:3000
```
