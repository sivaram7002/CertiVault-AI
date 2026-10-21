# CertiVault AI 🛡️

**CertiVault AI** is a dark-themed, responsive Course & Internship Certificate Vault with AI-powered multimodal metadata extraction and forensic fraud detection powered by **Google Gemini 2.5 Flash** (`gemini-2.5-flash`).

🌐 **Live Public App:** **[https://sivaram7002.github.io/CertiVault-AI/](https://sivaram7002.github.io/CertiVault-AI/)**  
📦 **GitHub Repository:** **[https://github.com/sivaram7002/CertiVault-AI](https://github.com/sivaram7002/CertiVault-AI)**

---

## 🌟 Key Features

### 1. Certificate Upload & Zero-Setup Storage
- **Drag & Drop & Browse**: Supports `.pdf`, `.png`, `.jpg`, `.jpeg`, and `.svg` files.
- **External Verification URL**: Optional link to issuing portal or Google Drive.
- **Persistent IndexedDB Storage**: Stores documents and metadata persistently across sessions without 5MB `localStorage` limitations.
- **Vault Export & Import**: One-click JSON backup export and restore.

### 2. Automated AI Multimodal Metadata Extraction
Upon file selection, CertiVault AI extracts and auto-fills:
- **Student Name**: Full recipient name.
- **Platform / Issuing Organization**: NPTEL, Coursera, SkillRack, Udemy, edX, HackerRank, Microsoft, etc.
- **Course / Internship Title**: Program title.
- **Total Duration**: Weeks, hours, or calculated duration.
- **Completion / Issue Date**: Date of issuance.
- **Credential ID / Certificate Number**: Unique identifier or verification code.
- **Category Classification**: Auto-classified into *Course*, *Internship*, *Coding / Hackathon*, or *Workshop*.
- **Mastered Skills**: Array of 3–5 technical and domain skills inferred from the certificate.

### 3. AI Forensic Fraud & Authenticity Inspection
Each certificate undergoes a 4-point visual and structural forensic audit:
1. **Typography & Alignment**: Checks for mismatched fonts, irregular kerning, baseline shifts, and overlaid text.
2. **Logos, Seals & Signatures**: Evaluates issuer branding, official stamps, and signature acuity.
3. **Credential & Verification Markers**: Inspects certificate ID syntax, QR codes, and URL paths.
4. **Visual Integrity & Pixel Noise**: Detects compression halos, rectangular background noise around candidate names/dates, and digital manipulation.

**Authenticity Statuses & Trust Scores:**
- 🟢 **Verified Authentic** (`85 - 100`)
- 🟡 **Suspicious / Needs Review** (`60 - 84`)
- 🔴 **Potentially Fraudulent** (`0 - 59`)

### 4. Interactive Document Viewer & Split-Screen Inspection
- **Interactive Document Viewer**:
  - Zoom In / Zoom Out / Reset Zoom (up to 300%)
  - Rotate 90° Clockwise
  - **Forensic Invert Mode**: Inverts grayscale contrast to expose text box boundaries and raster tampering artifacts.
  - Open in New Tab & One-Click Download
  - Fullscreen viewing
- **Split-Screen Inspection Modal**:
  - Dynamic Trust Score radial gauge
  - Forensic Specialist Reasoning quote
  - 4-Point Forensic Checklist with Pass/Warning/Fail status pills
  - Static, tamper-proof audit metadata (read-only)
  - "Re-Scan with AI" button
  - Raw JSON Vision Output Inspector

### 5. Pre-Seeded Realistic Demo Certificates
Ready out of the box with 4 sample credentials:
1. **Coursera / DeepLearning.AI**: *Deep Learning Specialization* by Andrew Ng (Score: 98/100, Verified Authentic)
2. **NPTEL / IIT Madras**: *Cloud Computing & Distributed Systems* Elite Gold (Score: 96/100, Verified Authentic)
3. **Microsoft Future Ready**: *Azure Cloud Engineering & DevOps Virtual Internship* (Score: 94/100, Verified Authentic)
4. **Meta Tampered Demo**: *Meta Full-Stack Software Engineer Certificate* with altered student name, font mismatch, baseline tilt, and compression artifacts (Score: 32/100, Potentially Fraudulent)

### 6. Supabase Cloud Database Integration (Zero Database Knowledge Required!)
- **Cloud Persistence**: Store certificates, documents (PDFs & images), and forensic inspection audits in a free Supabase PostgreSQL database.
- **In-App 1-Click Setup**:
  - Click **Connect DB** in the top navigation bar.
  - Follow the 4-step walkthrough and copy the ready-to-run SQL schema into your Supabase SQL Editor.
  - Test connection and verify the `certificates` table directly inside the app with instant feedback.
- **Offline & Local Fallback**: If Supabase is not configured or offline, CertiVault AI continues running locally using IndexedDB.
- **1-Click Local to Cloud Sync**: Upload existing sample or local certificates to Supabase in a single click.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Supabase Cloud Database Configuration (Optional)
CertiVault AI operates out of the box using local storage. To save your uploaded certificates to a real cloud database with Supabase:
1. Create a free account at [supabase.com](https://supabase.com) and create a **New project**.
2. In your Supabase project, click **SQL Editor** on the left menu, click **New query**, paste the following SQL, and click **Run**:

```sql
-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  student_name TEXT,
  platform TEXT,
  course_title TEXT,
  total_duration TEXT,
  date_of_completion TEXT,
  issue_date TEXT,
  credential_id TEXT,
  verification_url TEXT,
  category TEXT DEFAULT 'Course',
  skills JSONB DEFAULT '[]'::jsonb,
  internship_details JSONB,
  qr_code_data JSONB,
  authenticity_status TEXT DEFAULT 'Verified Authentic',
  trust_score NUMERIC DEFAULT 95,
  forensic_summary TEXT,
  forensic_checklist JSONB,
  file_data TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & allow anonymous app access
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.certificates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.certificates FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.certificates FOR DELETE USING (true);
```

3. Go to **Project Settings > API**, copy your **Project URL** and **anon public key**.
4. In CertiVault AI, click the **Connect DB** button in the navbar, paste both values, and click **Save & Apply**! (Or add them to `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).

### 4. Gemini API Configuration (Optional)
- You can use the app immediately out of the box with the built-in **Intelligent Demo Simulation Engine**.
- To connect live to Google Gemini 2.5 Flash, click the **Key icon** in the top navigation bar, enter your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey), and click **Test Connection** & **Save Settings**.
- Alternatively, add your key to `.env`:
  ```env
  VITE_GEMINI_API_KEY=your_gemini_api_key_here
  ```

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite 6, Tailwind CSS 3
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti, Laser Scanning CSS
- **Database & Storage**: Supabase (PostgreSQL Cloud DB) with automatic IndexedDB & LocalStorage offline fallback
- **AI Model**: Google Gemini API (`gemini-2.5-flash` with Multimodal Vision & structured JSON `responseSchema`)
