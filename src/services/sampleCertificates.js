function createSvgDataUri(svgString) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

// Generate realistic SVG certificate for Coursera / DeepLearning.AI
function generateCourseraDeepLearningSvg() {
  return createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b1329" />
      <stop offset="100%" stop-color="#050a18" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
    </pattern>
  </defs>

  <rect width="1000" height="700" fill="url(#bgGrad)" />
  <rect width="1000" height="700" fill="url(#gridPattern)" />

  <rect x="25" y="25" width="950" height="650" fill="none" stroke="url(#goldGrad)" stroke-width="2" rx="12" opacity="0.6" />
  <rect x="35" y="35" width="930" height="630" fill="none" stroke="#1e293b" stroke-width="1" rx="8" />

  <g transform="translate(80, 75)">
    <rect x="0" y="0" width="36" height="36" rx="8" fill="#0056D2" />
    <text x="18" y="25" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="20" text-anchor="middle">c</text>
    <text x="46" y="25" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="22" letter-spacing="-0.5">coursera</text>
    <text x="210" y="25" fill="#64748b" font-family="sans-serif" font-size="20">|</text>
    <rect x="235" y="0" width="36" height="36" rx="8" fill="#ea580c" />
    <text x="253" y="24" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="14" text-anchor="middle">AI</text>
    <text x="280" y="25" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="20">DeepLearning.AI</text>
  </g>

  <g transform="translate(810, 75)">
    <rect x="0" y="0" width="110" height="32" rx="16" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="1.5" />
    <circle cx="18" cy="16" r="6" fill="#10b981" />
    <text x="32" y="21" fill="#34d399" font-family="sans-serif" font-weight="700" font-size="11" letter-spacing="1">AUTHENTIC</text>
  </g>

  <text x="500" y="200" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="600" letter-spacing="4" text-anchor="middle">SPECIALIZATION CERTIFICATE</text>
  <text x="500" y="235" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-size="28" font-weight="800" text-anchor="middle">This is to certify that</text>

  <text x="500" y="300" fill="url(#goldGrad)" font-family="'Plus Jakarta Sans', Georgia, serif" font-size="42" font-weight="800" text-anchor="middle" letter-spacing="1">Aditya Sharma</text>
  <line x1="300" y1="320" x2="700" y2="320" stroke="#334155" stroke-width="1.5" />

  <text x="500" y="360" fill="#cbd5e1" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" text-anchor="middle">has successfully completed all 5 courses in the online, non-credit Specialization</text>
  <text x="500" y="405" fill="#38bdf8" font-family="'Plus Jakarta Sans', sans-serif" font-size="28" font-weight="700" text-anchor="middle">Deep Learning Specialization</text>
  <text x="500" y="438" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" text-anchor="middle">Duration: 16 Weeks (approx. 120 Hours) | Completed with Honors</text>

  <g transform="translate(160, 500)">
    <path d="M 0 35 Q 30 10, 60 25 T 120 20 T 170 35" fill="none" stroke="#38bdf8" stroke-width="2.5" />
    <line x1="0" y1="55" x2="200" y2="55" stroke="#334155" stroke-width="1" />
    <text x="100" y="75" fill="#e2e8f0" font-family="sans-serif" font-size="14" font-weight="700" text-anchor="middle">Andrew Ng</text>
    <text x="100" y="93" fill="#64748b" font-family="sans-serif" font-size="12" text-anchor="middle">Founder, DeepLearning.AI</text>
    <text x="100" y="108" fill="#64748b" font-family="sans-serif" font-size="11" text-anchor="middle">Adjunct Professor, Stanford University</text>
  </g>

  <g transform="translate(480, 545)">
    <circle cx="0" cy="0" r="42" fill="#0f172a" stroke="url(#goldGrad)" stroke-width="2" />
    <circle cx="0" cy="0" r="36" fill="none" stroke="#f59e0b" stroke-dasharray="3,3" stroke-width="1" />
    <polygon points="0,-22 6,-8 21,-8 9,2 14,17 0,8 -14,17 -9,2 -21,-8 -6,-8" fill="url(#goldGrad)" />
    <text x="0" y="30" fill="#94a3b8" font-family="monospace" font-size="8" text-anchor="middle">VERIFIED SEAL</text>
  </g>

  <!-- Embedded Authentic QR Code Block -->
  <g transform="translate(680, 485)">
    <rect x="135" y="0" width="80" height="80" fill="#ffffff" rx="6" />
    <g transform="translate(140, 5) scale(2.4)">
      <path stroke="#000000" stroke-width="1" d="M0 0.5h7m3 0h1m1 0h1m2 0h2m1 0h3m1 0h7M0 1.5h1m5 0h1m3 0h1m1 0h1m9 0h1m5 0h1M0 2.5h1m1 0h3m1 0h1m1 0h2m1 0h1m2 0h1m1 0h1m2 0h2m1 0h1m1 0h3m1 0h1M0 3.5h1m1 0h3m1 0h1m1 0h2m1 0h2m4 0h1m2 0h1m1 0h1m1 0h3m1 0h1M0 4.5h1m1 0h3m1 0h1m1 0h2m1 0h5m3 0h2m1 0h1m1 0h3m1 0h1M0 5.5h1m5 0h1m1 0h1m1 0h2m1 0h3m1 0h2m1 0h1m1 0h1m5 0h1M0 6.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7" />
      <path fill="#000000" d="M2 2h3v3H2zM24 2h3v3h-3zM2 24h3v3H2z" />
    </g>
    
    <text x="120" y="25" fill="#94a3b8" font-family="sans-serif" font-size="11" text-anchor="end">Credential ID:</text>
    <text x="120" y="42" fill="#f8fafc" font-family="monospace" font-size="11" font-weight="600" text-anchor="end">COURSERA-DL-98234-AX</text>
    <text x="120" y="60" fill="#64748b" font-family="sans-serif" font-size="11" text-anchor="end">Date: Aug 14, 2024</text>
    <text x="120" y="75" fill="#38bdf8" font-family="sans-serif" font-size="10" text-anchor="end">coursera.org/verify/98234AX</text>
  </g>
</svg>
`);
}

// Generate realistic SVG certificate for NPTEL / IIT Madras
function generateNptelSvg() {
  return createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <defs>
    <linearGradient id="nptelBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="goldBanner" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b45309" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
  </defs>

  <rect width="1000" height="700" fill="url(#nptelBg)" />
  <rect x="30" y="30" width="940" height="640" fill="none" stroke="#334155" stroke-width="3" rx="8" />
  <rect x="42" y="42" width="916" height="616" fill="none" stroke="url(#goldBanner)" stroke-width="1.5" rx="6" />

  <g transform="translate(70, 70)">
    <circle cx="35" cy="35" r="35" fill="#f8fafc" />
    <path d="M 20 40 L 35 18 L 50 40 Z" fill="#b91c1c" />
    <text x="35" y="52" fill="#0f172a" font-family="sans-serif" font-size="9" font-weight="800" text-anchor="middle">IIT MADRAS</text>
    <text x="90" y="30" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="22">NPTEL Online Certification</text>
    <text x="90" y="50" fill="#94a3b8" font-family="sans-serif" font-size="13">(Funded by the MoE, Govt. of India)</text>
  </g>

  <g transform="translate(770, 65)">
    <polygon points="50,0 100,0 85,75 50,60 15,75 0,0" fill="url(#goldBanner)" />
    <text x="50" y="24" fill="#0f172a" font-family="sans-serif" font-weight="900" font-size="12" text-anchor="middle">ELITE</text>
    <text x="50" y="42" fill="#78350f" font-family="sans-serif" font-weight="800" font-size="10" text-anchor="middle">GOLD (94%)</text>
  </g>

  <text x="500" y="210" fill="#cbd5e1" font-family="sans-serif" font-size="15" text-anchor="middle" letter-spacing="2">THIS CERTIFICATE IS AWARDED TO</text>
  <text x="500" y="275" fill="#f8fafc" font-family="'Plus Jakarta Sans', serif" font-size="38" font-weight="800" text-anchor="middle">Priya Venkatesh</text>
  <line x1="280" y1="295" x2="720" y2="295" stroke="#f59e0b" stroke-width="2" />

  <text x="500" y="340" fill="#94a3b8" font-family="sans-serif" font-size="15" text-anchor="middle">for successfully completing the 12-week course</text>
  <text x="500" y="380" fill="#38bdf8" font-family="'Plus Jakarta Sans', sans-serif" font-size="28" font-weight="800" text-anchor="middle">Cloud Computing &amp; Distributed Systems</text>
  <text x="500" y="415" fill="#cbd5e1" font-family="sans-serif" font-size="15" text-anchor="middle">with a consolidated score of <tspan fill="#fbbf24" font-weight="bold">94%</tspan> (Top 1% Topper)</text>

  <g transform="translate(150, 465)">
    <rect x="0" y="0" width="700" height="45" fill="rgba(255,255,255,0.03)" rx="6" stroke="#334155" stroke-width="1" />
    <text x="120" y="28" fill="#94a3b8" font-family="sans-serif" font-size="13">Duration: <tspan fill="#f8fafc" font-weight="600">12 Weeks (Jul-Oct 2024)</tspan></text>
    <text x="360" y="28" fill="#94a3b8" font-family="sans-serif" font-size="13">Roll No: <tspan fill="#f8fafc" font-weight="600">NPTEL24CS78S2490123</tspan></text>
    <text x="580" y="28" fill="#94a3b8" font-family="sans-serif" font-size="13">Credits: <tspan fill="#10b981" font-weight="600">3 AICTE</tspan></text>
  </g>

  <!-- Signatures & Authentic QR -->
  <g transform="translate(180, 560)">
    <path d="M 10 20 Q 40 5, 80 18 T 130 15" stroke="#94a3b8" stroke-width="2" fill="none" />
    <line x1="0" y1="35" x2="160" y2="35" stroke="#475569" stroke-width="1" />
    <text x="80" y="52" fill="#cbd5e1" font-family="sans-serif" font-size="12" font-weight="600" text-anchor="middle">Prof. Andrew Thangaraj</text>
    <text x="80" y="68" fill="#64748b" font-family="sans-serif" font-size="10" text-anchor="middle">NPTEL Coordinator, IIT Madras</text>
  </g>

  <!-- Center QR Matrix -->
  <g transform="translate(460, 535)">
    <rect x="0" y="0" width="80" height="80" fill="#ffffff" rx="6" />
    <g transform="translate(5, 5) scale(2.4)">
      <path stroke="#000000" stroke-width="1" d="M0 0.5h7m3 0h1m1 0h1m2 0h2m1 0h3m1 0h7M0 1.5h1m5 0h1m3 0h1m1 0h1m9 0h1m5 0h1M0 2.5h1m1 0h3m1 0h1m1 0h2m1 0h1m2 0h1m1 0h1m2 0h2m1 0h1m1 0h3m1 0h1" />
      <path fill="#000000" d="M2 2h3v3H2zM24 2h3v3h-3zM2 24h3v3H2z" />
    </g>
    <text x="40" y="93" fill="#94a3b8" font-family="monospace" font-size="8" text-anchor="middle">nptel.ac.in/verify</text>
  </g>

  <g transform="translate(680, 560)">
    <path d="M 10 15 Q 50 30, 90 10 T 140 22" stroke="#94a3b8" stroke-width="2" fill="none" />
    <line x1="0" y1="35" x2="160" y2="35" stroke="#475569" stroke-width="1" />
    <text x="80" y="52" fill="#cbd5e1" font-family="sans-serif" font-size="12" font-weight="600" text-anchor="middle">Prof. Devendra Jalihal</text>
    <text x="80" y="68" fill="#64748b" font-family="sans-serif" font-size="10" text-anchor="middle">Chairman, CCE, IIT Madras</text>
  </g>
</svg>
`);
}

// Generate realistic SVG certificate for Microsoft Azure Internship (with compatible internship essentials)
function generateMicrosoftInternshipSvg() {
  return createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <defs>
    <linearGradient id="msftBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>

  <rect width="1000" height="700" fill="url(#msftBg)" />
  <rect x="25" y="25" width="950" height="650" fill="none" stroke="#2563eb" stroke-width="1.5" rx="10" opacity="0.6" />

  <g transform="translate(80, 70)">
    <rect x="0" y="0" width="18" height="18" fill="#f25022" />
    <rect x="22" y="0" width="18" height="18" fill="#7fba00" />
    <rect x="0" y="22" width="18" height="18" fill="#00a4ef" />
    <rect x="22" y="22" width="18" height="18" fill="#ffb900" />
    <text x="52" y="28" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="24">Microsoft</text>
    <text x="175" y="28" fill="#0ea5e9" font-family="sans-serif" font-size="20">| Future Ready Talent Program</text>
  </g>

  <g transform="translate(810, 70)">
    <rect x="0" y="0" width="125" height="34" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1" />
    <text x="62" y="22" fill="#38bdf8" font-family="sans-serif" font-weight="700" font-size="12" text-anchor="middle">INTERNSHIP VERIFIED</text>
  </g>

  <text x="500" y="195" fill="#38bdf8" font-family="sans-serif" font-weight="700" font-size="14" letter-spacing="3" text-anchor="middle">CERTIFICATE OF INTERNSHIP COMPLETION</text>
  <text x="500" y="235" fill="#94a3b8" font-family="sans-serif" font-size="16" text-anchor="middle">This acknowledges that</text>

  <text x="500" y="295" fill="#f8fafc" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="38" text-anchor="middle">Rohan Kulkarni</text>
  <line x1="320" y1="315" x2="680" y2="315" stroke="#38bdf8" stroke-width="2" />

  <text x="500" y="360" fill="#cbd5e1" font-family="sans-serif" font-size="16" text-anchor="middle">has successfully completed the 8-Week Virtual Industry Internship Program as</text>
  <text x="500" y="400" fill="#60a5fa" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="26" text-anchor="middle">Azure Cloud Engineering &amp; DevOps Virtual Intern</text>
  <text x="500" y="435" fill="#94a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">Duration: 8 Weeks (01 Jun 2024 - 26 Jul 2024) | Enterprise Capstone Microservices Approved</text>

  <!-- Internship Essentials Box in Document -->
  <g transform="translate(100, 520)">
    <text x="0" y="0" fill="#64748b" font-family="sans-serif" font-size="11">Credential ID:</text>
    <text x="0" y="18" fill="#e2e8f0" font-family="monospace" font-size="12" font-weight="600">MSFT-INT-2024-DEV892</text>
    <text x="0" y="38" fill="#64748b" font-family="sans-serif" font-size="11">Completion Date: Jul 30, 2024</text>
    <text x="0" y="55" fill="#38bdf8" font-family="sans-serif" font-size="10">futurereadytalent.in/verify</text>
  </g>

  <!-- Authentic QR Code in Internship document -->
  <g transform="translate(460, 510)">
    <rect x="0" y="0" width="75" height="75" fill="#ffffff" rx="6" />
    <g transform="translate(5, 5) scale(2.2)">
      <path stroke="#000000" stroke-width="1" d="M0 0.5h7m3 0h1m1 0h1m2 0h2m1 0h3m1 0h7M0 1.5h1m5 0h1m3 0h1m1 0h1m9 0h1m5 0h1M0 2.5h1m1 0h3m1 0h1m1 0h2m1 0h1m2 0h1m1 0h1m2 0h2m1 0h1m1 0h3m1 0h1" />
      <path fill="#000000" d="M2 2h3v3H2zM24 2h3v3h-3zM2 24h3v3H2z" />
    </g>
    <text x="37" y="88" fill="#64748b" font-family="monospace" font-size="8" text-anchor="middle">QR AUTHENTIC</text>
  </g>

  <g transform="translate(680, 520)">
    <path d="M 20 20 Q 60 5, 90 25 T 140 15" stroke="#38bdf8" stroke-width="2" fill="none" />
    <line x1="0" y1="35" x2="180" y2="35" stroke="#475569" stroke-width="1" />
    <text x="90" y="55" fill="#f8fafc" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="middle">Director, Edunet &amp; Microsoft</text>
    <text x="90" y="72" fill="#64748b" font-family="sans-serif" font-size="11" text-anchor="middle">Future Ready Talent Program</text>
  </g>
</svg>
`);
}

// Generate SUSPICIOUS / TAMPERED SVG certificate
function generateSuspiciousTamperedSvg() {
  return createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <rect width="1000" height="700" fill="#0d1117" />
  <rect x="25" y="25" width="950" height="650" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,4" rx="8" />

  <g transform="translate(780, 45)">
    <rect x="0" y="0" width="165" height="30" rx="4" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" stroke-width="1" />
    <text x="82" y="20" fill="#f87171" font-family="sans-serif" font-weight="700" font-size="11" text-anchor="middle">TAMPER EVIDENCE</text>
  </g>

  <g transform="translate(80, 70)">
    <text x="0" y="30" fill="#1877f2" font-family="Arial, sans-serif" font-weight="900" font-size="32" letter-spacing="-1">meta</text>
    <text x="95" y="28" fill="#64748b" font-family="sans-serif" font-size="18">Professional Certificate</text>
  </g>

  <text x="500" y="190" fill="#94a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">CERTIFICATE OF COMPLETION</text>
  <text x="500" y="230" fill="#cbd5e1" font-family="sans-serif" font-size="16" text-anchor="middle">This is proudly presented to</text>

  <g transform="translate(250, 255)">
    <rect x="-10" y="0" width="520" height="60" fill="#141c2e" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" opacity="0.8" />
    <text x="250" y="42" fill="#ffffff" font-family="'Comic Sans MS', Arial, sans-serif" font-size="34" font-weight="bold" text-anchor="middle" transform="rotate(-0.8 250 42)">Vikram Malhotra</text>
    <text x="520" y="35" fill="#f87171" font-family="monospace" font-size="10">← Font Mismatch &amp; Color Box</text>
  </g>

  <text x="500" y="375" fill="#94a3b8" font-family="sans-serif" font-size="15" text-anchor="middle">for successfully completing the coursework for</text>
  <text x="500" y="415" fill="#38bdf8" font-family="Arial, sans-serif" font-size="25" font-weight="bold" text-anchor="middle">Meta Full-Stack Software Engineer Professional Certificate</text>
  
  <g transform="translate(350, 440)">
    <rect x="0" y="0" width="300" height="30" fill="#141c2e" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2,2" />
    <text x="150" y="20" fill="#fbbf24" font-family="monospace" font-size="13" text-anchor="middle">Duration: 6 Months (Modified Field)</text>
  </g>

  <g transform="translate(100, 560)">
    <text x="0" y="0" fill="#64748b" font-family="sans-serif" font-size="12">Credential ID:</text>
    <text x="0" y="20" fill="#ef4444" font-family="monospace" font-size="13" font-weight="bold">META-FAKE-99214-ERR (Invalid Format)</text>
    <text x="0" y="38" fill="#64748b" font-family="sans-serif" font-size="11">Completion Date: Sep 12, 2024</text>
  </g>

  <!-- Distorted / Missing QR code placeholder -->
  <g transform="translate(500, 530)">
    <rect x="-35" y="0" width="70" height="70" fill="#1e1b2e" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
    <text x="0" y="38" fill="#f87171" font-family="monospace" font-size="9" text-anchor="middle">NO VALID QR</text>
  </g>

  <g transform="translate(680, 540)">
    <path d="M 10 15 Q 50 35, 90 10 T 150 20" stroke="#f87171" stroke-width="3" fill="none" opacity="0.6" />
    <line x1="0" y1="35" x2="180" y2="35" stroke="#ef4444" stroke-width="1" />
    <text x="90" y="52" fill="#f87171" font-family="sans-serif" font-size="11" text-anchor="middle">Low Res Signature / Unverified</text>
  </g>
</svg>
`);
}

export const INITIAL_SAMPLE_CERTIFICATES = [
  {
    id: "cert-coursera-deeplearning-01",
    studentName: "Aditya Sharma",
    platform: "Coursera / DeepLearning.AI",
    courseTitle: "Deep Learning Specialization",
    totalDuration: "16 Weeks (approx. 120 Hours)",
    dateOfCompletion: "2024-08-14",
    issueDate: "2024-08-14",
    credentialId: "COURSERA-DL-98234-AX",
    verificationUrl: "https://coursera.org/verify/98234AX",
    category: "Course",
    skills: ["Deep Learning", "Convolutional Neural Networks", "TensorFlow", "Hyperparameter Tuning", "Python"],
    internshipDetails: null,
    qrCodeData: {
      detected: true,
      payload: "https://coursera.org/verify/98234AX",
      domainMatch: true,
      verificationDomain: "coursera.org"
    },
    authenticityStatus: "Verified Authentic",
    trustScore: 98,
    forensicSummary: "High visual fidelity matching official Coursera & DeepLearning.AI vectorized typography standards. Authorized digital signature by Andrew Ng verified with crisp resolution. Valid alphanumeric credential ID and verification QR matrix present.",
    forensicChecklist: {
      typographyAlignment: {
        status: "Pass",
        details: "Consistent typography, precise letter-spacing and uniform baseline alignment across all dynamic text fields."
      },
      logosSignatures: {
        status: "Pass",
        details: "Original Coursera and DeepLearning.AI vector emblems; authentic signature from instructor Andrew Ng."
      },
      credentialMarkers: {
        status: "Pass",
        details: "Valid credential ID format 'COURSERA-DL-98234-AX' and verifiable secure URL."
      },
      visualIntegrity: {
        status: "Pass",
        details: "Zero compression anomalies or background color clipping boxes around candidate name and dates."
      }
    },
    fileData: generateCourseraDeepLearningSvg(),
    fileName: "Deep_Learning_Specialization_Aditya_Sharma.svg",
    fileType: "image/svg+xml",
    fileSize: 4820,
    uploadedAt: "2024-08-15T10:30:00.000Z"
  },
  {
    id: "cert-nptel-cloud-02",
    studentName: "Priya Venkatesh",
    platform: "NPTEL / IIT Madras",
    courseTitle: "Cloud Computing & Distributed Systems",
    totalDuration: "12 Weeks (Jul - Oct 2024)",
    dateOfCompletion: "2024-10-28",
    issueDate: "2024-10-28",
    credentialId: "NPTEL24CS78S2490123",
    verificationUrl: "https://nptel.ac.in/noc/Ecertificate/?q=NPTEL24CS78S2490123",
    category: "Course",
    skills: ["Cloud Computing", "Distributed Systems", "Virtualization", "MapReduce", "AWS Architecture"],
    internshipDetails: null,
    qrCodeData: {
      detected: true,
      payload: "https://nptel.ac.in/noc/Ecertificate/?q=NPTEL24CS78S2490123",
      domainMatch: true,
      verificationDomain: "nptel.ac.in"
    },
    authenticityStatus: "Verified Authentic",
    trustScore: 96,
    forensicSummary: "Official NPTEL Elite Gold emblem with authentic IIT Madras seal and roll number formatting. Bi-color anti-fraud guilloche border intact with zero digital tampering artifacts.",
    forensicChecklist: {
      typographyAlignment: {
        status: "Pass",
        details: "Standard NPTEL font glyphs and exact coordinate baseline alignment."
      },
      logosSignatures: {
        status: "Pass",
        details: "Dual official stamps: National Programme on Technology Enhanced Learning & IIT Madras Dean."
      },
      credentialMarkers: {
        status: "Pass",
        details: "16-digit alphanumeric roll/certificate ID with verified course code match."
      },
      visualIntegrity: {
        status: "Pass",
        details: "Uniform paper texture, clear vector text rendering without edge blurring."
      }
    },
    fileData: generateNptelSvg(),
    fileName: "NPTEL_Cloud_Computing_Priya_Venkatesh.svg",
    fileType: "image/svg+xml",
    fileSize: 5210,
    uploadedAt: "2024-10-29T14:15:00.000Z"
  },
  {
    id: "cert-msft-internship-03",
    studentName: "Rohan Kulkarni",
    platform: "Microsoft Future Ready",
    courseTitle: "Azure Cloud Engineering & DevOps Virtual Internship",
    totalDuration: "8 Weeks (01 Jun - 26 Jul 2024)",
    dateOfCompletion: "2024-07-30",
    issueDate: "2024-07-30",
    credentialId: "MSFT-INT-2024-DEV892",
    verificationUrl: "https://futurereadytalent.in/verify/MSFT-INT-2024-DEV892",
    category: "Internship",
    skills: ["Azure DevOps", "CI/CD Pipelines", "ARM Templates", "Docker", "Kubernetes"],
    internshipDetails: {
      isInternship: true,
      company: "Microsoft & Edunet Foundation",
      role: "Azure Cloud Engineering & DevOps Virtual Intern",
      mentorOrSupervisor: "Director, Microsoft & Future Ready Talent Program",
      projectDeliverable: "Enterprise Multi-Tier Microservices Deployment on Azure Kubernetes Service",
      workMode: "Virtual Industry Internship (AICTE Approved)"
    },
    qrCodeData: {
      detected: true,
      payload: "https://futurereadytalent.in/verify/MSFT-INT-2024-DEV892",
      domainMatch: true,
      verificationDomain: "futurereadytalent.in"
    },
    authenticityStatus: "Verified Authentic",
    trustScore: 94,
    forensicSummary: "Verifiable enterprise internship completion document. Microsoft corporate branding geometry, partner seals, and valid project mentor credentials confirmed.",
    forensicChecklist: {
      typographyAlignment: {
        status: "Pass",
        details: "Segoe UI typography with standard enterprise line-height and alignment."
      },
      logosSignatures: {
        status: "Pass",
        details: "Official Microsoft Partner & Edunet authorized signature present."
      },
      credentialMarkers: {
        status: "Pass",
        details: "Unique enterprise verification code and corporate portal verification link."
      },
      visualIntegrity: {
        status: "Pass",
        details: "Clean digital export with crisp vector graphic overlays."
      }
    },
    fileData: generateMicrosoftInternshipSvg(),
    fileName: "Microsoft_Azure_Internship_Rohan_Kulkarni.svg",
    fileType: "image/svg+xml",
    fileSize: 4540,
    uploadedAt: "2024-08-01T09:00:00.000Z"
  },
  {
    id: "cert-tampered-meta-04",
    studentName: "Vikram Malhotra",
    platform: "Meta / Coursera",
    courseTitle: "Meta Full-Stack Software Engineer Professional Certificate",
    totalDuration: "6 Months",
    dateOfCompletion: "2024-09-12",
    issueDate: "2024-09-12",
    credentialId: "META-FAKE-99214-ERR",
    verificationUrl: "",
    category: "Course",
    skills: ["React", "JavaScript", "Django", "REST APIs", "SQL"],
    internshipDetails: null,
    qrCodeData: {
      detected: false,
      payload: "",
      domainMatch: false,
      verificationDomain: "Unverified / Missing QR Code"
    },
    authenticityStatus: "Potentially Fraudulent",
    trustScore: 32,
    forensicSummary: "CRITICAL FORENSIC IRREGULARITIES DETECTED: The candidate name 'Vikram Malhotra' displays severe baseline misalignment and uses an inconsistent font overlaid onto the template. Noticeable pixel compression bounding box artifact around the name field indicative of digital image manipulation. Invalid credential ID format and missing QR verification matrix.",
    forensicChecklist: {
      typographyAlignment: {
        status: "Fail",
        details: "Severe font mismatch: Name is rendered in non-standard Arial while template uses Gilroy. Baseline is tilted by -0.8 degrees."
      },
      logosSignatures: {
        status: "Warning",
        details: "Meta logo has irregular aspect ratio stretching and signature shows pixel blurring."
      },
      credentialMarkers: {
        status: "Fail",
        details: "Credential ID format 'META-FAKE-99214-ERR' is invalid and does not resolve to an official registry."
      },
      visualIntegrity: {
        status: "Fail",
        details: "Clear compression artifact bounding box detected around student name and duration fields, indicating raster text insertion."
      }
    },
    fileData: generateSuspiciousTamperedSvg(),
    fileName: "Tampered_Meta_Certificate_Vikram_Malhotra.svg",
    fileType: "image/svg+xml",
    fileSize: 4980,
    uploadedAt: "2024-09-15T18:45:00.000Z"
  }
];
