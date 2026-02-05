/**
 * Crawler for nailjobsusa.com (formerly tittac.com) nail exam questions.
 *
 * Usage: node crawl-tittac.js
 *
 * This script:
 * 1. Fetches each survey page by ID
 * 2. Parses questions from the HTML
 * 3. Calls the check_dapan API to get correct answers
 * 4. Writes combined results to tittac.json
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://nailjobsusa.com';
const API_URL = 'https://nailjobsusa.com/wp-content/themes/nailjobsusa/ajax-data/trac-nghiem.php';
const OUTPUT_FILE = path.join(__dirname, 'data', 'raw', 'tittac.json');

// All nail-related survey IDs with metadata
const SURVEYS = [
  // 900 Cau Hoi Thi Nails
  {id: 1, title: '900 Cau Hoi Thi Nails (Phan 1)', category: '900-cau-hoi-thi-nails', lang: 'vi'},
  {id: 2, title: '900 Cau Hoi Thi Nails (Phan 2)', category: '900-cau-hoi-thi-nails', lang: 'vi'},
  {id: 4, title: '900 Cau Hoi Thi Nails (Phan 3)', category: '900-cau-hoi-thi-nails', lang: 'vi'},
  {id: 5, title: '900 Cau Hoi Thi Nails (Phan 4)', category: '900-cau-hoi-thi-nails', lang: 'vi'},
  {id: 6, title: '900 Cau Hoi Thi Nails (Phan 5)', category: '900-cau-hoi-thi-nails', lang: 'vi'},
  {id: 7, title: '900 Cau Hoi Thi Nails (Phan 6)', category: '900-cau-hoi-thi-nails', lang: 'vi'},
  {id: 8, title: '900 Cau Hoi Thi Nails (Phan 7)', category: '900-cau-hoi-thi-nails', lang: 'vi'},
  {id: 9, title: '900 Cau Hoi Thi Nails (Phan 8)', category: '900-cau-hoi-thi-nails', lang: 'vi'},
  {id: 10, title: '900 Cau Hoi Thi Nails (Phan 9)', category: '900-cau-hoi-thi-nails', lang: 'vi'},
  // Manicurist Examination (English)
  {id: 11, title: 'Manicurist Examination 1', category: 'manicurist-examination', lang: 'en'},
  {id: 12, title: 'Manicurist Examination 2', category: 'manicurist-examination', lang: 'en'},
  {id: 13, title: 'Manicurist Examination 3', category: 'manicurist-examination', lang: 'en'},
  {id: 14, title: 'Manicurist Examination 4', category: 'manicurist-examination', lang: 'en'},
  {id: 15, title: 'Manicurist Examination 5', category: 'manicurist-examination', lang: 'en'},
  {id: 16, title: 'Manicurist Examination 6', category: 'manicurist-examination', lang: 'en'},
  {id: 17, title: 'Manicurist Examination 7', category: 'manicurist-examination', lang: 'en'},
  {id: 18, title: 'Manicurist Examination 8', category: 'manicurist-examination', lang: 'en'},
  {id: 19, title: 'Manicurist Examination 9', category: 'manicurist-examination', lang: 'en'},
  // Practice Nails Test (English)
  {id: 20, title: 'Practice Nails Test 1', category: 'practice-nails-test', lang: 'en'},
  {id: 21, title: 'Practice Nails Test 2', category: 'practice-nails-test', lang: 'en'},
  {id: 22, title: 'Practice Nails Test 3', category: 'practice-nails-test', lang: 'en'},
  // General Nail Test (English)
  {id: 23, title: 'General Nail Test 1', category: 'general-nail-test', lang: 'en'},
  {id: 24, title: 'General Nail Test 2', category: 'general-nail-test', lang: 'en'},
  {id: 25, title: 'General Nail Test 3', category: 'general-nail-test', lang: 'en'},
  // Nails Other Examination - English topics
  {id: 26, title: 'Product Chemistry Simplified', category: 'nail-other-exam', lang: 'en'},
  {id: 28, title: 'Bacteria And Other Infectious Agents', category: 'nail-other-exam', lang: 'en'},
  {id: 29, title: 'Sanitation And Disinfection', category: 'nail-other-exam', lang: 'en'},
  {id: 30, title: 'Anatomy And Physiology', category: 'nail-other-exam', lang: 'en'},
  {id: 31, title: 'Safety In The Salon', category: 'nail-other-exam', lang: 'en'},
  {id: 32, title: 'The Nail And Its Disorders', category: 'nail-other-exam', lang: 'en'},
  {id: 33, title: 'The Skin And Its Disorders', category: 'nail-other-exam', lang: 'en'},
  {id: 37, title: 'Nail Tips', category: 'nail-other-exam', lang: 'en'},
  {id: 38, title: 'Nail Wraps', category: 'nail-other-exam', lang: 'en'},
  {id: 39, title: 'Acrylic Nails', category: 'nail-other-exam', lang: 'en'},
  // Nails Other Examination - Vietnamese topics
  {id: 45, title: 'Vi Khuan Va Cac Tac Nhan Lay Nhiem Khac', category: 'nail-other-exam', lang: 'vi'},
  {id: 46, title: 'Lam Ve Sinh Va Tay Ue Cac Mui Giua', category: 'nail-other-exam', lang: 'vi'},
  {id: 47, title: 'An Toan Trong Tham My Vien', category: 'nail-other-exam', lang: 'vi'},
  {id: 48, title: 'Hoa Hoc San Pham Mong Gian Don', category: 'nail-other-exam', lang: 'vi'},
  {id: 49, title: 'Giai Phau Hoc Va Sinh Li Hoc', category: 'nail-other-exam', lang: 'vi'},
  {id: 50, title: 'Mong Va Cac Roi Loan Cua No', category: 'nail-other-exam', lang: 'vi'},
  {id: 51, title: 'Bai Kiem Tra II', category: 'nail-other-exam', lang: 'vi'},
  {id: 52, title: 'Bai Kiem Tra I', category: 'nail-other-exam', lang: 'vi'},
  {id: 53, title: 'Da Va Cac Roi Loan Cua No', category: 'nail-other-exam', lang: 'vi'},
  {id: 58, title: 'Phep Tri Lieu Bang Huong Lieu', category: 'nail-other-exam', lang: 'vi'},
  {id: 59, title: 'Cac Mong Tip', category: 'nail-other-exam', lang: 'vi'},
  {id: 60, title: 'Cac Mong Boc', category: 'nail-other-exam', lang: 'vi'},
  {id: 61, title: 'Cac Mong Acrylic (mong Bot)', category: 'nail-other-exam', lang: 'vi'},
  {id: 62, title: 'Cac Mong Gel', category: 'nail-other-exam', lang: 'vi'},
  {id: 69, title: 'Cau Hoi Thi Nails Tieng Viet Moi Nhat Phan 1', category: 'nail-other-exam', lang: 'vi'},
  // Nail Care
  {id: 35, title: 'Manicuring', category: 'nail-care', lang: 'en'},
  {id: 36, title: 'Pedicuring', category: 'nail-care', lang: 'en'},
  {id: 55, title: 'Cham Soc Ban Va Mong Tay', category: 'nail-care', lang: 'vi'},
  {id: 56, title: 'Cham Soc Ban Va Mong Chan', category: 'nail-care', lang: 'vi'},
  // Nail Supply
  {id: 40, title: 'Gels', category: 'nail-supply', lang: 'en'},
  {id: 57, title: 'Giua Dien', category: 'nail-supply', lang: 'vi'},
  // Nail Design
  {id: 41, title: 'The Creative Touch', category: 'nail-design', lang: 'en'},
  {id: 63, title: 'Phong Cach Sang Tao', category: 'nail-design', lang: 'vi'},
  // Mo tiem Nail (Business)
  {id: 27, title: 'Your Professional Image', category: 'mo-tiem-nail', lang: 'en'},
  {id: 34, title: 'Client Consultation', category: 'mo-tiem-nail', lang: 'en'},
  {id: 42, title: 'Salon Business', category: 'mo-tiem-nail', lang: 'en'},
  {id: 43, title: 'Selling Nail Products And Services', category: 'mo-tiem-nail', lang: 'en'},
  {id: 44, title: 'Hinh Anh Chuyen Nghiep Cua Ban', category: 'mo-tiem-nail', lang: 'vi'},
  {id: 54, title: 'Tu Van Khach Hang', category: 'mo-tiem-nail', lang: 'vi'},
  {id: 64, title: 'Viec Kinh Doanh Cua Tham My Vien', category: 'mo-tiem-nail', lang: 'vi'},
  {id: 65, title: 'Ban Cac San Pham Va Dich Vu Mong', category: 'mo-tiem-nail', lang: 'vi'},
  // State Exams
  {id: 66, title: 'Illinois Nail Technician Examination', category: 'state-exam', lang: 'en'},
  {id: 67, title: 'California National Nail Test Technology', category: 'state-exam', lang: 'en'},
  {id: 68, title: 'Alabama National Nail Test Technology', category: 'state-exam', lang: 'en'},
  {id: 107, title: 'De Thi Nail Cali (Phan 1)', category: 'state-exam', lang: 'vi'},
  {id: 108, title: 'De Thi Nail Cali (Phan 2)', category: 'state-exam', lang: 'vi'},
  // 1000 Cau Hoi Thi Nails 2022
  {id: 78, title: '1000 Cau Hoi Thi Nail (Phan 1)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 79, title: '1000 Cau Hoi Thi Nail (Phan 2)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 80, title: '1000 Cau Hoi Thi Nail (Phan 3)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 81, title: '1000 Cau Hoi Thi Nail (Phan 4)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 82, title: '1000 Cau Hoi Thi Nail (Phan 5)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 83, title: '1000 Cau Hoi Thi Nail (Phan 6)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 84, title: '1000 Cau Hoi Thi Nail (Phan 7)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 85, title: '1000 Cau Hoi Thi Nail (Phan 8)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 86, title: '1000 Cau Hoi Thi Nail (Phan 9)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 87, title: '1000 Cau Hoi Thi Nail (Phan 10)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 88, title: '1000 Cau Hoi Thi Nail (Phan 11)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 89, title: '1000 Cau Hoi Thi Nail (Phan 12)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 90, title: '1000 Cau Hoi Thi Nail (Phan 13)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 91, title: '1000 Cau Hoi Thi Nail (Phan 14)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 92, title: '1000 Cau Hoi Thi Nail (Phan 15)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 93, title: '1000 Cau Hoi Thi Nail (Phan 16)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
  {id: 94, title: '1000 Cau Hoi Thi Nail (Phan 17)', category: '1000-cau-hoi-thi-nails', lang: 'vi'},
];

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://nailjobsusa.com/trac-nghiem-nail/',
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (m, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (m, code) => String.fromCharCode(parseInt(code, 16)));
}

function parseQuestions(html) {
  const questions = [];

  // Find all question blocks using the title-cauhoi pattern
  // Pattern: <p class="title-cauhoi" id="title-cauhoi-N">
  //   N. Question text
  //   <a ... class="check_dapan" data-thutu="N" data-check_dapan="ID">
  const titleRegex = /<p\s+class="title-cauhoi"\s+id="title-cauhoi-(\d+)"[^>]*>([\s\S]*?)<\/p>/gi;
  let titleMatch;

  while ((titleMatch = titleRegex.exec(html)) !== null) {
    const thutu = titleMatch[1];
    const titleBlock = titleMatch[2];

    // Extract question text (text before the <a> tag)
    let questionText = titleBlock.replace(/<a[\s\S]*?<\/a>/g, '')
      .replace(/<span[\s\S]*?<\/span>/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/^\s*\d+\.\s*/, '')
      .trim();
    questionText = decodeHtmlEntities(questionText);

    // Extract question ID from data-check_dapan
    const idMatch = titleBlock.match(/data-check_dapan="(\d+)"/);
    const questionId = idMatch ? idMatch[1] : null;

    // Extract options using cautraloi_N_M pattern
    const options = [];
    let optIdx = 0;
    const optRegex = new RegExp(`id="cautraloi_${thutu}_(\\d+)"[^>]*>([\\s\\S]*?)<\\/span>`, 'gi');
    let optMatch;

    // Need to search in the broader HTML for options
    const optionPattern = new RegExp(`<span\\s+class="cautraloi"\\s+id="cautraloi_${thutu}_(\\d+)"[^>]*>([\\s\\S]*?)<\\/span>`, 'gi');
    while ((optMatch = optionPattern.exec(html)) !== null) {
      let optText = optMatch[2].replace(/<[^>]+>/g, '').trim();
      optText = decodeHtmlEntities(optText);
      options.push(optText);
    }

    if (questionText && questionId && options.length > 0) {
      questions.push({
        questionId,
        thutu,
        questionText,
        options
      });
    }
  }

  return questions;
}

async function getCorrectAnswer(questionId) {
  try {
    const body = `type=check_dapan&id_cauhoi=${questionId}`;
    const response = await httpsPost(API_URL, body);
    const trimmed = response.trim();
    const idx = parseInt(trimmed);
    if (!isNaN(idx) && trimmed.length < 5) {
      return idx;
    }
    return -1;
  } catch (e) {
    return -1;
  }
}

async function crawlSurvey(survey) {
  const url = `${BASE_URL}/trac-nghiem-nail/?id=${survey.id}`;
  console.log(`  Fetching survey ${survey.id}: ${survey.title}...`);

  try {
    const html = await httpsGet(url);
    const questions = parseQuestions(html);
    console.log(`    Found ${questions.length} questions`);

    if (questions.length === 0) {
      return { questions: [], error: `No questions found for survey ${survey.id}` };
    }

    // Get correct answers for each question
    const results = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const correctIndex = await getCorrectAnswer(q.questionId);

      // Detect language from question text
      const lang = survey.lang;

      results.push({
        source: 'tittac.com',
        sourceUrl: url,
        questionText: q.questionText,
        options: q.options,
        correctIndex: correctIndex,
        correctText: (correctIndex >= 0 && correctIndex < q.options.length) ? q.options[correctIndex] : '',
        language: lang,
        category: survey.category,
        surveyId: survey.id,
        surveyTitle: survey.title,
        questionDbId: q.questionId
      });

      // Small delay to be nice to the server
      if (i % 10 === 9) {
        await sleep(200);
      }
    }

    return { questions: results, error: null };
  } catch (e) {
    console.error(`    Error: ${e.message}`);
    return { questions: [], error: `Error fetching survey ${survey.id}: ${e.message}` };
  }
}

async function main() {
  console.log(`Starting crawl of ${SURVEYS.length} surveys from nailjobsusa.com (tittac.com)...`);
  console.log(`Output: ${OUTPUT_FILE}`);
  console.log('');

  const allQuestions = [];
  const errors = [];

  for (let i = 0; i < SURVEYS.length; i++) {
    const survey = SURVEYS[i];
    console.log(`[${i + 1}/${SURVEYS.length}] Processing survey ${survey.id}...`);

    const result = await crawlSurvey(survey);
    allQuestions.push(...result.questions);
    if (result.error) {
      errors.push(result.error);
    }

    // Delay between surveys
    await sleep(500);
  }

  // Deduplicate by questionDbId
  const seen = new Set();
  const uniqueQuestions = [];
  for (const q of allQuestions) {
    const key = q.questionDbId;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueQuestions.push(q);
    }
  }

  console.log('');
  console.log(`Total questions extracted: ${allQuestions.length}`);
  console.log(`Unique questions (after dedup): ${uniqueQuestions.length}`);
  console.log(`Errors: ${errors.length}`);

  const crawlResult = {
    source: 'tittac.com',
    crawledAt: new Date().toISOString(),
    totalQuestions: uniqueQuestions.length,
    questions: uniqueQuestions,
    errors: errors
  };

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(crawlResult, null, 2), 'utf8');
  console.log(`\nResults written to ${OUTPUT_FILE}`);
  console.log(`File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB`);
}

main().catch(console.error);
