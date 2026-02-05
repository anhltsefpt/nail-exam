/**
 * Crawler for NailJobsUSA.com nail exam questions
 *
 * Site structure:
 * - 13 categories, 106 total pages, ~20 questions per page
 * - Questions are in HTML with radio buttons (class="dap_an")
 * - Question IDs stored in data-check_dapan attribute
 * - Correct answers obtained via AJAX POST to ajax-data/trac-nghiem.php
 */

const cheerio = require('cheerio');

const BASE_URL = 'https://nailjobsusa.com';
const AJAX_URL = `${BASE_URL}/wp-content/themes/nailjobsusa/ajax-data/trac-nghiem.php`;
const EXAM_URL = `${BASE_URL}/trac-nghiem-nail/`;

const CAT_NAMES = {
  "1": "900 Cau Hoi Thi Nails",
  "2": "Manicurist Examination",
  "3": "Practice Nails Test",
  "4": "General Nail Test",
  "5": "Nails Other Examination",
  "6": "Mo tiem Nail",
  "7": "De thi cac tieu bang",
  "8": "Nail Design",
  "9": "Cham soc Nail",
  "10": "Nail Supply",
  "11": "400 Cau Hoi Thi Facial",
  "12": "1000 Cau Hoi Thi Nails 2022",
  "13": "700 Cau Hoi Thi Hair"
};

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Discover all page IDs by querying the category endpoint
async function discoverPages() {
  console.log('Discovering all page IDs...');
  const allPages = {};

  for (let catId = 1; catId <= 13; catId++) {
    try {
      const formData = new URLSearchParams();
      formData.append('type', 'load_danhmuccauhoi_id');
      formData.append('id_danhmuctracnghiem', catId.toString());

      const resp = await fetch(AJAX_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      const html = await resp.text();

      // Extract page IDs from the response HTML
      const matches = html.match(/\?id=(\d+)/g) || [];
      const ids = matches.map(m => parseInt(m.replace('?id=', '')));
      allPages[catId] = ids;
      console.log(`  Category ${catId} (${CAT_NAMES[catId]}): ${ids.length} pages - IDs: ${ids.join(', ')}`);
    } catch (err) {
      console.error(`  Error discovering category ${catId}: ${err.message}`);
      allPages[catId] = [];
    }
    await delay(200);
  }

  return allPages;
}

// Get correct answer for a question by its DB ID
async function getCorrectAnswer(questionDbId) {
  try {
    const formData = new URLSearchParams();
    formData.append('type', 'check_dapan');
    formData.append('id_cauhoi', questionDbId.toString());

    const resp = await fetch(AJAX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const text = await resp.text();
    return parseInt(text.trim());
  } catch (err) {
    return -1;
  }
}

// Extract questions from a page HTML
function extractQuestionsFromHTML(html, pageId) {
  const $ = cheerio.load(html);
  const questions = [];

  // Get page title
  const pageTitle = $('h2').first().text().trim() || '';

  // Get check_dapan elements (contain question DB IDs)
  const checkBtns = $('.check_dapan');

  // Get question texts
  const qTexts = $('.title-cauhoi');

  // Get radio inputs and group by question index
  const questionGroups = {};
  $('input.dap_an').each(function() {
    const idx = $(this).attr('data-id');
    if (!questionGroups[idx]) questionGroups[idx] = [];
    const li = $(this).closest('li');
    let text = li.text().trim().replace(/^[a-d]\.\s*/, '');
    questionGroups[idx].push(text);
  });

  const result = [];
  checkBtns.each(function(i) {
    const qDbId = $(this).attr('data-check_dapan');
    const qIdx = $(this).attr('data-thutu');
    const qTextEl = qTexts.eq(i);
    let qText = qTextEl.text().trim();
    qText = qText.replace(/^\d+\.\s*/, '').replace(/\s*View results\s*$/, '').trim();

    const options = questionGroups[qIdx] || [];

    result.push({
      questionDbId: parseInt(qDbId),
      questionText: qText,
      options: options,
      pageId: pageId,
      pageTitle: pageTitle
    });
  });

  return result;
}

// Crawl a single page
async function crawlPage(pageId, catId, catName) {
  const url = `${EXAM_URL}?id=${pageId}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      return { questions: [], error: `HTTP ${resp.status} for page ${pageId}` };
    }
    const html = await resp.text();
    const rawQuestions = extractQuestionsFromHTML(html, pageId);

    if (rawQuestions.length === 0) {
      return { questions: [], error: `No questions found on page ${pageId}` };
    }

    // Get correct answers for each question
    const questions = [];
    for (const q of rawQuestions) {
      const correctIdx = await getCorrectAnswer(q.questionDbId);
      await delay(50); // Small delay between answer checks

      const correctText = (correctIdx >= 0 && correctIdx < q.options.length)
        ? q.options[correctIdx]
        : '';

      // Detect language
      let lang = 'vi';
      if (/^[A-Za-z\s\d,.!?;:'"()\-\/%&@#+*=<>[\]{}|\\~`$^_]+$/.test(q.questionText)) {
        lang = 'en';
      }

      questions.push({
        source: 'nailjobsusa.com',
        sourceUrl: url,
        questionText: q.questionText,
        options: q.options,
        correctIndex: correctIdx,
        correctText: correctText,
        language: lang,
        category: catName,
        pageTitle: q.pageTitle,
        questionDbId: q.questionDbId
      });
    }

    return { questions, error: null };
  } catch (err) {
    return { questions: [], error: `Error crawling page ${pageId}: ${err.message}` };
  }
}

async function main() {
  console.log('=== NailJobsUSA.com Question Crawler ===\n');

  // Step 1: Discover all pages
  const allPages = await discoverPages();

  let totalPageCount = 0;
  for (const k in allPages) totalPageCount += allPages[k].length;
  console.log(`\nTotal pages to crawl: ${totalPageCount}\n`);

  // Step 2: Crawl all pages
  const allQuestions = [];
  const errors = [];
  let pagesProcessed = 0;

  for (const catId in allPages) {
    const catName = CAT_NAMES[catId];
    const pageIds = allPages[catId];

    console.log(`\nCrawling category ${catId}: ${catName} (${pageIds.length} pages)`);

    for (const pageId of pageIds) {
      const result = await crawlPage(pageId, parseInt(catId), catName);

      if (result.error) {
        errors.push(result.error);
        console.log(`  [ERROR] Page ${pageId}: ${result.error}`);
      }

      allQuestions.push(...result.questions);
      pagesProcessed++;

      if (pagesProcessed % 5 === 0 || result.questions.length > 0) {
        console.log(`  Page ${pageId}: ${result.questions.length} questions (Total: ${allQuestions.length}, Progress: ${pagesProcessed}/${totalPageCount})`);
      }

      await delay(300); // Rate limiting between pages
    }
  }

  // Step 3: Build the output
  const output = {
    source: 'nailjobsusa.com',
    crawledAt: new Date().toISOString(),
    totalQuestions: allQuestions.length,
    questions: allQuestions,
    errors: errors
  };

  // Step 4: Save to file
  const fs = require('fs');
  const outputPath = '/Users/david/Desktop/Do-my-own/nail-exam-ai/crawler/data/raw/nailjobsusa.json';
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`\n=== Crawl Complete ===`);
  console.log(`Total questions: ${allQuestions.length}`);
  console.log(`Total pages: ${pagesProcessed}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Saved to: ${outputPath}`);

  // Print category summary
  const catSummary = {};
  for (const q of allQuestions) {
    if (!catSummary[q.category]) catSummary[q.category] = 0;
    catSummary[q.category]++;
  }
  console.log('\nQuestions per category:');
  for (const cat in catSummary) {
    console.log(`  ${cat}: ${catSummary[cat]}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
