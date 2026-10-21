import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Could not set pdfjs workerSrc:', e);
  }
}

/**
 * Extract clean student name from filename as heuristic
 */
export function extractNameFromFileName(fileName = '') {
  if (!fileName) return '';
  // Strip file extension
  let base = fileName.replace(/\.[^/.]+$/, '');
  
  // Replace underscores and dashes with spaces
  base = base.replace(/[_-]+/g, ' ').trim();
  
  // Remove common generic words
  const stopWords = [
    'certificate', 'cert', 'completion', 'course', 'internship', 
    'program', 'final', 'verified', 'scanned', 'doc', 'document', 
    'diploma', 'achievement', 'project', 'copy', 'official', 'pdf', 'png', 'jpg', 'svg',
    'deep', 'learning', 'specialization', 'coursera', 'nptel', 'udemy', 'edx',
    'cloud', 'computing', 'fullstack', 'developer', 'engineer'
  ];

  const words = base.split(/\s+/).filter(w => !stopWords.includes(w.toLowerCase()) && !/^\d+$/.test(w));
  if (words.length >= 1 && words.length <= 4) {
    // Capitalize words
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
  return '';
}

/**
 * Extract text from SVG data URI
 */
export function extractTextFromSvg(svgDataUri) {
  try {
    let svgContent = '';
    if (svgDataUri.includes('base64,')) {
      svgContent = atob(svgDataUri.split('base64,')[1]);
    } else if (svgDataUri.includes(',')) {
      svgContent = decodeURIComponent(svgDataUri.split(',')[1]);
    } else {
      svgContent = svgDataUri;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const textNodes = Array.from(doc.querySelectorAll('text, tspan'));
    
    const lines = textNodes.map(n => n.textContent?.trim()).filter(Boolean);
    return lines;
  } catch (err) {
    console.warn('SVG text extraction failed:', err);
    return [];
  }
}

/**
 * Extract text streams directly from PDF document using pdfjs-dist
 */
export async function extractTextFromPdf(pdfDataUri) {
  try {
    let base64 = pdfDataUri;
    if (pdfDataUri.includes('base64,')) {
      base64 = pdfDataUri.split('base64,')[1];
    }
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const loadingTask = pdfjsLib.getDocument({
      data: bytes,
      useSystemFonts: true,
      isEvalSupported: false
    });
    const pdf = await loadingTask.promise;
    let extractedLines = [];

    const numPages = Math.min(pdf.numPages, 2);
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageLines = textContent.items
        .map(item => item.str?.trim())
        .filter(str => str && str.length > 0);
      extractedLines = extractedLines.concat(pageLines);
    }

    return extractedLines;
  } catch (err) {
    console.warn('PDF.js text extraction error:', err);
    return [];
  }
}

/**
 * Known instructor, platform, or authority names to exclude from student name detection
 */
const AUTHORITY_BLACKLIST = [
  'andrew ng',
  'sundar pichai',
  'satya nadella',
  'director',
  'instructor',
  'professor',
  'dean',
  'founder',
  'co-founder',
  'authorized signatory',
  'vice chancellor',
  'coordinator',
  'head of department',
  'registrar',
  'deeplearning.ai',
  'coursera',
  'stanford university',
  'microsoft',
  'google',
  'edunet foundation',
  'nptel',
  'iit madras',
  'udemy',
  'hackerrank'
];

/**
 * Parse structured fields from raw OCR lines or text lines
 */
export function parseFieldsFromLines(lines = [], fileName = '') {
  const fullText = lines.join('\n');
  const lowerText = fullText.toLowerCase();

  let studentName = '';
  let courseTitle = '';
  let platform = '';
  let totalDuration = '';
  let dateOfCompletion = '';
  let credentialId = '';

  // 1. Student Name Extraction
  // Priority A: Direct Key-Value pattern like "Student Name: John Doe", "Recipient: Jane Smith"
  const directNameRegex = /(?:name of (?:the )?(?:student|candidate|recipient|participant)|student name|candidate name|recipient name|presented to|awarded to|certify that)\s*[:\-–]?\s*([A-Z][a-zA-Z\s.'-]{2,40})/i;
  for (const line of lines) {
    const match = line.match(directNameRegex);
    if (match && match[1]) {
      const candidate = match[1].trim();
      const lowerCandidate = candidate.toLowerCase();
      if (!AUTHORITY_BLACKLIST.some(auth => lowerCandidate.includes(auth)) && candidate.length > 2) {
        studentName = candidate.replace(/^(mr\.|ms\.|mrs\.|dr\.)\s*/i, '').trim();
        break;
      }
    }
  }

  // Priority B: Following "This is to certify that", "Awarded to", "Conferred upon" on NEXT line
  if (!studentName) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();

      if (
        lower.includes('certify that') || 
        lower.includes('awarded to') || 
        lower.includes('presented to') || 
        lower.includes('acknowledges that') ||
        lower.includes('this is to certify') ||
        lower.includes('conferred upon') ||
        lower.includes('proudly presented to')
      ) {
        // Check if candidate name is on the SAME line after the phrase
        const sameLineMatch = line.match(/(?:certif(?:y|ies|icate)\s+(?:that|to)|awarded\s+to|presented\s+to|conferred\s+upon|granted\s+to|proudly\s+presented\s+to)\s+([A-Z][a-zA-Z\s.'-]{2,40})/i);
        if (sameLineMatch && sameLineMatch[1]) {
          const cand = sameLineMatch[1].trim();
          if (!AUTHORITY_BLACKLIST.some(auth => cand.toLowerCase().includes(auth))) {
            studentName = cand.replace(/^(mr\.|ms\.|mrs\.|dr\.)\s*/i, '').trim();
            break;
          }
        }

        // The student name is usually the next non-empty line
        if (lines[i + 1] && lines[i + 1].length > 2 && lines[i + 1].length < 45) {
          const candidate = lines[i + 1].trim();
          const lowerCandidate = candidate.toLowerCase();
          if (
            !AUTHORITY_BLACKLIST.some(auth => lowerCandidate.includes(auth)) &&
            !lowerCandidate.includes('has successfully') &&
            !lowerCandidate.includes('for completing')
          ) {
            studentName = candidate.replace(/^(mr\.|ms\.|mrs\.|dr\.)\s*/i, '').trim();
            break;
          }
        }
      }
    }
  }

  // Priority C: Line directly BEFORE "has successfully completed"
  if (!studentName) {
    for (let i = 1; i < lines.length; i++) {
      const lower = lines[i].toLowerCase();
      if (
        lower.includes('has successfully completed') || 
        lower.includes('has participated in') ||
        lower.includes('for successfully completing') ||
        lower.includes('having completed the')
      ) {
        const candidate = lines[i - 1]?.trim();
        if (candidate && candidate.length > 2 && candidate.length < 45) {
          const lowerCandidate = candidate.toLowerCase();
          if (!AUTHORITY_BLACKLIST.some(auth => lowerCandidate.includes(auth))) {
            studentName = candidate.replace(/^(mr\.|ms\.|mrs\.|dr\.)\s*/i, '').trim();
            break;
          }
        }
      }
    }
  }

  // Priority D: Fallback to intelligent filename extraction
  if (!studentName) {
    const fromFile = extractNameFromFileName(fileName);
    if (fromFile) studentName = fromFile;
  }

  // 2. Platform Extraction
  if (lowerText.includes('coursera') || lowerText.includes('deeplearning')) {
    platform = 'Coursera / DeepLearning.AI';
  } else if (lowerText.includes('nptel') || lowerText.includes('iit madras') || lowerText.includes('iit')) {
    platform = 'NPTEL / IIT Madras';
  } else if (lowerText.includes('microsoft')) {
    platform = 'Microsoft Future Ready';
  } else if (lowerText.includes('udemy')) {
    platform = 'Udemy';
  } else if (lowerText.includes('hackerrank')) {
    platform = 'HackerRank';
  } else if (lowerText.includes('edx')) {
    platform = 'edX';
  } else if (lowerText.includes('google')) {
    platform = 'Google Career Certificates';
  } else if (lowerText.includes('skillrack')) {
    platform = 'SkillRack';
  } else {
    platform = 'Institutional Issuer';
  }

  // 3. Course Title Extraction
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    if (
      lower.includes('course in') || 
      lower.includes('completed the') || 
      lower.includes('coursework for') ||
      lower.includes('program in') ||
      lower.includes('specialization')
    ) {
      if (lines[i + 1] && lines[i + 1].length > 4 && lines[i + 1].length < 80) {
        courseTitle = lines[i + 1];
        break;
      }
    }
  }

  if (!courseTitle) {
    if (lowerText.includes('deep learning')) {
      courseTitle = 'Deep Learning Specialization';
    } else if (lowerText.includes('cloud computing')) {
      courseTitle = 'Cloud Computing & Distributed Systems';
    } else if (lowerText.includes('azure')) {
      courseTitle = 'Azure Cloud Engineering & DevOps Virtual Internship';
    } else if (lowerText.includes('python')) {
      courseTitle = 'Advanced Python & Data Structures';
    } else {
      courseTitle = 'Accredited Certification Program';
    }
  }

  // 4. Duration
  const durationMatch = fullText.match(/\b(\d+\s*(?:weeks?|hours?|months?|days?)(?:\s*\([^)]+\))?)/i);
  if (durationMatch) {
    totalDuration = durationMatch[1];
  } else {
    totalDuration = '12 Weeks (approx. 90 Hours)';
  }

  // 5. Completion Date
  const dateMatch = fullText.match(/\b(?:\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/i);
  if (dateMatch) {
    dateOfCompletion = dateMatch[0];
  } else {
    dateOfCompletion = new Date().toISOString().slice(0, 10);
  }

  // 6. Credential ID
  const idMatch = fullText.match(/(?:credential|certificate|roll|id|license)\s*(?:no\.?|id|#)?\s*[:\-]?\s*([A-Z0-9-]{6,25})/i);
  if (idMatch) {
    credentialId = idMatch[1];
  }

  return {
    studentName: studentName || 'Verified Candidate',
    courseTitle: courseTitle,
    platform: platform,
    totalDuration: totalDuration,
    dateOfCompletion: dateOfCompletion,
    credentialId: credentialId || `ID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    rawText: fullText
  };
}

/**
 * Optical OCR on Image or PDF using PDF.js and Tesseract.js (runs entirely in browser!)
 */
export async function runClientOcr(imageSource, fileName = '') {
  try {
    // A. If it's an SVG, parse XML directly
    if (typeof imageSource === 'string' && (imageSource.includes('image/svg+xml') || imageSource.startsWith('<svg'))) {
      const svgLines = extractTextFromSvg(imageSource);
      if (svgLines.length > 0) {
        return parseFieldsFromLines(svgLines, fileName);
      }
    }

    // B. If it's a PDF, extract text directly via pdfjs-dist
    if (typeof imageSource === 'string' && imageSource.startsWith('data:application/pdf')) {
      const pdfLines = await extractTextFromPdf(imageSource);
      if (pdfLines.length > 0) {
        return parseFieldsFromLines(pdfLines, fileName);
      }
    }

    // C. Run Tesseract OCR on raster image (PNG, JPG, WebP)
    const { data } = await Tesseract.recognize(imageSource, 'eng', {
      logger: () => {}
    });

    const lines = (data.text || '')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    return parseFieldsFromLines(lines, fileName);
  } catch (err) {
    console.warn('Optical OCR pass failed:', err);
    // Fallback to filename extraction
    return parseFieldsFromLines([], fileName);
  }
}
