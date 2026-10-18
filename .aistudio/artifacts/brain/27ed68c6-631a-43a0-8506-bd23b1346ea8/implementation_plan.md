# Editorial Redesign & Advanced Quiz Suite (GeoPrep MOOC)

An elevated, Notion-style clean editorial overhaul of the Conservation Geography study platform. This redesign replaces the generic card layout with refined typographic hierarchy, tactile micro-interactions, an interactive 3D flashcard flip mode, one-click test selection with full randomization, and spaced-repetition weak area drills.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following directions were confirmed from your feedback and are locked into the blueprint:

- **Confirmed Aesthetic**: Modern Notion-style clean editorial with deep graphite/slate dark mode, warm subtle zinc surfaces, razor-sharp hairline borders (`border-white/[0.08]`), unboxed metadata with typographic dot separators (`·`), and distraction-free reading typography (`Plus Jakarta Sans` / `DM Sans`).
- **Confirmed Quiz Configuration**: One-click **"Select All 12 Weeks (120 Questions)"** master toggle, accompanied by independent instant toggles for **Question Randomizer (Shuffle)** and **Option Randomizer (A/B/C/D)**.
- **Confirmed Study Additions**:
  1. **Interactive 3D Flip Flashcard Mode**: Dedicated active-recall view with smooth card flip animations, confidence self-ratings ("Easy", "Good", "Hard"), and keyboard shortcuts (`Space` to flip, `1-3` to rate).
  2. **Spaced-Repetition Smart Drills**: Adaptive queue prioritizing questions with multiple previous errors and recent misses.

---

## 1. Overview & Core Concept

### What It Does
Transforms the application into a dual-engine academic workspace:
1. **Editorial Study Reader & Flashcard Hub**: High-legibility, distraction-free reading with collapsible explanations, instant term search, and an interactive 3D flip-card flashcard system for rapid memorization.
2. **Pro Quiz & Simulation Engine**: Flexible exam runner offering single-week drills, multi-module blends, or the complete 120-question course exam with randomized question and option sequencing, instant answer feedback, and spaced-repetition review.

### Target Audience & Persona
Students, researchers, and MOOC candidates preparing for Conservation Geography assignments and competitive certification exams who need rapid revision, active recall, and mistake remediation on both mobile phones and desktop displays.

### Key Value Delivered
- **Zero Clutter**: Eliminates heavy nested containers, oversized pill badges, and repetitive borders.
- **One-Touch Versatility**: Switch between reading 120 solutions, flipping active-recall flashcards, or taking a fully randomized 120-question mock exam in a single tap.
- **Mobile Ergonomics**: 44px+ touch targets, sticky thumb-zone navigation, and a bottom sheet layout that never exceeds 15% viewport height.

---

## 2. User Experience & Visual Design

### Visual Identity & Theme
- **Aesthetic Direction**: Notion/Linear-inspired minimalist academic workspace. Clean surfaces, high-contrast crisp text, subtle micro-borders, and tactile interaction states.
- **Color Palette**:
  - *Dominant Canvas (60%)*: Deep slate-graphite (`#090D16` / `bg-slate-950`).
  - *Structural Surfaces (30%)*: Muted zinc/slate cards (`#111827` / `#161F30`), hairline dividers (`border-slate-800/80` or `border-white/[0.07]`), and unboxed metadata.
  - *Semantic Accents (10%)*: Emerald green (`#10B981`) for correct answers and mastery indicators; Rose red (`#F43F5E`) for mistakes; Warm amber (`#F59E0B`) for bookmarks and review flags.
- **Typography & Hierarchy**:
  - *Headlines & Display*: Refined `Plus Jakarta Sans`, 600 weight, balanced line wrapping.
  - *Body Prose & Question Prompts*: Clean 15px–16px text with generous 1.6 line height for effortless long-session reading.
  - *Metadata & Keys*: Clean unboxed text (`Week 3 · Question 7 · Geomorphology`) with no static pill capsules.
  - *Numerals & Timers*: Monospace tabular figures (`tabular-nums font-mono`).

### Key Views & Component Upgrades

#### Top Navigation (3-Zone Strict Contract)
- **Zone 1 (Brand)**: Clean typographic wordmark `GeoPrep MOOC` with subtle course label `Conservation Geography`.
- **Zone 2 (Mode Switcher)**: Segmented pill-less tab strip: **Reader**, **Flashcards**, **Quiz Engine**, **Mistake Bank**, **Dashboard**.
- **Zone 3 (Actions)**: Minimalist `Upload PDFs` button + data sync icon.

#### View A: Notion-Style Study Reader
- Distraction-free single or multi-week scrollable paper feed.
- **Header Toolbar**:
  - One-click week selector dropdown (Weeks 1–12 or All Combined).
  - Search input with instantaneous highlight matching.
  - Smooth **Self-Test Mode Switch**: Blurs answers until tapped or hovered.
  - View switch: Toggle between **Scrollable Reader** and **Interactive Flashcards**.
- **Question Item Anatomy**:
  - Unboxed top header: `W03 · Q04 · Weathering` + Bookmark toggle.
  - Large, comfortable question text.
  - 4 clean options rendered with subtle hover states and clear letter indices (`A`, `B`, `C`, `D`).
  - Educational explanation callout with emerald key notation and clear physical science rationale.

#### View B: Interactive 3D Flashcard Mode (New)
- Centered tactile flashcard with smooth flip animation on click or `Spacebar`.
- **Front Side**: Week number, topic tag, question text, and 4 multiple-choice options.
- **Back Side**: Verified correct answer highlighted in emerald, complete detailed explanation, and concept breakdown.
- **Confidence Rating Actions**: Three quick buttons at the bottom:
  - `[1] Hard (Review soon)` (Amber)
  - `[2] Good (Repeat in session)` (Teal)
  - `[3] Easy (Mastered)` (Emerald)
- Progress indicator: `Card 14 of 120` with keyboard indicator hint.

#### View C: Redesigned Quiz Engine with Quick Select All & Randomizers
- **Pre-Quiz Configuration Sheet**:
  - **Quick Presets**:
    - `All 120 Questions (Complete Course Exam)` (1-Click button)
    - `Week 1-6 Midterm Sprint`
    - `Week 7-12 Finals Sprint`
    - `Weak Areas & Mistakes Drill`
  - **Week Selection Matrix**: Compact 12-week grid with a prominent **"Select All" / "Deselect All"** toggle.
  - **Randomization Panel**:
    - Toggle: `Shuffle Questions Order` (Randomize Q1-Q120)
    - Toggle: `Shuffle Options Order` (Randomize A/B/C/D choices)
  - **Mode Selection**: `Instant Feedback Practice` vs `Timed Exam (Simulated Test)`.
- **Active Quiz Interface**:
  - Compact header with progress bar, timer (`tabular-nums`), and question counter.
  - Question Navigator bar with numbered indicators showing answered, correct, wrong, and bookmarked questions.
  - Options with physical keycap shortcuts (`[A]`, `[B]`, `[C]`, `[D]` or `1`, `2`, `3`, `4`).
  - In Instant Feedback mode: dynamic emerald/rose highlight with instant explanation card animation.

#### View D: Spaced-Repetition Mistake Bank
- Tracks mistake frequency (`Failed 2x`, `Failed 1x`) and last attempt timestamp.
- **"Launch Spaced Drill"**: Automatically compiles all missed items and prioritizes the most frequently missed questions first.
- Filter by week and search by concept.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Notion-Style Minimalist Cards vs. Heavy Bordered Boxes
- **Chosen Approach**: Remove the chunky border boxes, nested chips, and bright backgrounds. Use quiet hairline borders (`border-white/[0.08]`), unboxed metadata, and generous whitespace.
- **Why**: Reduces cognitive fatigue during multi-hour revision sessions and makes the UI feel native, premium, and calm.

### Decision 2: 1-Click "Select All" with Pre-set Bundles
- **Chosen Approach**: Add dedicated 1-click buttons: "Select All 12 Weeks (120 Questions)" and "Select All Unlocked", plus instant switches for question and option shuffling.
- **Why**: Eliminates tedious manual clicking of 12 separate checkboxes when preparing for a full mock exam.

### Decision 3: Adding 3D Flip Flashcards as a First-Class View
- **Chosen Approach**: Provide a dedicated Flashcard view directly accessible from the main navigation and inside the Study Reader.
- **Why**: Active recall via flashcard flipping is scientifically proven to outperform passive re-reading for MCQ retention.

---

## 4. Technical Architecture & Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             GeoPrep MOOC App                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  Top Navigation (Brand · Mode Switcher · Upload Modal · Data Backup)        │
└──────┬──────────────────────┬────────────────────────┬──────────────────────┘
       │                      │                        │
       ▼                      ▼                        ▼
┌──────────────┐      ┌───────────────┐        ┌───────────────┐
│ Study Reader │      │ Flashcard Hub │        │  Quiz Engine  │
│  & Revision  │      │  (3D Flip)    │        │  (All / Rand) │
└──────┬───────┘      └───────┬───────┘        └───────┬───────┘
       │                      │                        │
       ▼                      ▼                        ▼
┌──────────────────────────────────────────────────────────────┐
│       Shared State & Persistence (localStorage Engine)       │
│  - 12 Weeks (120 MCQs with verified keys & rationales)       │
│  - Spaced Repetition Queue & Mistake Error Counts            │
│  - Bookmarks & Quiz Performance History                      │
└──────────────────────────────────────────────────────────────┘
```

### Component Breakdown
1. **`Navbar.tsx`**: Streamlined 3-zone header with 5 clean modes (Dashboard, Reader, Flashcards, Quiz, Mistakes).
2. **`StudyReaderView.tsx`**: Notion-style layout with unboxed metadata, instant search, and self-test blur toggle.
3. **`FlashcardView.tsx` (New)**: Interactive 3D flip card component with smooth CSS transforms (`perspective: 1000px`, `transform-style: preserve-3d`), keyboard navigation (`Space`, `ArrowLeft`, `ArrowRight`), and confidence rating buttons.
4. **`QuizEngineView.tsx`**: Upgraded with 1-click "Select All" toggle, question randomizer, option randomizer, and seamless mobile ergonomics.
5. **`MistakeBankView.tsx`**: Spaced-repetition priority queue and mistake drill launcher.
6. **`UploadPdfModal.tsx`**: Clean multimodal Gemini parser for custom assignment PDFs.

---

## 5. Verification & Test Plan

1. **Visual & Responsive Verification**:
   - Verify on mobile viewport (375px–430px) to ensure no cramped header, proper thumb reach, and clean single-line controls.
   - Verify desktop viewport (1440px) with comfortable reading margins.
2. **Quiz & Randomizer Testing**:
   - Verify clicking "Select All 120 Questions" instantly sets all 12 weeks.
   - Verify Question Randomizer properly shuffles questions without dropping IDs.
   - Verify Option Randomizer correctly remaps answer keys (`A`, `B`, `C`, `D`) so the true correct text is always validated accurately.
3. **Flashcard Testing**:
   - Verify spacebar flips card; left/right arrows advance cards; rating buttons update difficulty status.
4. **Build & Lint**:
   - Run `lint_applet` (`tsc --noEmit`) and `compile_applet` (`npm run build`) to ensure 0 errors.
