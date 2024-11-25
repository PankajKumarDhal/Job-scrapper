const puppeteer = require('puppeteer');
const xlsx = require('xlsx');

const JOB_URL = 'https://www.timesjobs.com/candidate/job-search.html?searchType=Home_Search&from=submit&asKey=OFF&txtKeywords=&cboPresFuncArea=35';

const scrapeJobs = async () => {
  try {
    const browser = await puppeteer.launch({ headless: true }); // Set to 'false' to debug in browser
    const page = await browser.newPage();
    await page.goto(JOB_URL, { waitUntil: 'networkidle2' });

    // Wait for elements to load
    await page.waitForSelector('.job-bx');

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.job-bx');
      const jobData = [];

      jobElements.forEach((el) => {
        const jobTitle = el.querySelector('.joblist-comp-name')?.innerText.trim() || 'N/A'; // Updated selector
        const companyName = el.querySelector('.joblist-comp-name')?.innerText.trim() || 'N/A'; // Updated selector
        const location = el.querySelector('.srp-skills')?.innerText.trim() || 'N/A'; // Updated selector
        const postedDate = el.querySelector('.sim-posted')?.innerText.trim() || 'N/A'; // Updated selector
        const jobDescription = el.querySelector('.list-job-dtl > ul > li')?.innerText.trim() || 'N/A'; // Updated selector

        // Push data to array if jobTitle exists
        if (jobTitle !== 'N/A') {
          jobData.push({
            Job_Title: jobTitle,
            Company_Name: companyName,
            Location: location,
            Posted_Date: postedDate,
            Job_Description: jobDescription,
          });
        }
      });

      return jobData;
    });

    await browser.close();
    return jobs;
  } catch (error) {
    console.error('Error scraping job data:', error);
    return [];
  }
};

const saveToExcel = (jobs) => {
  try {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(jobs);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Jobs');

    const filePath = './jobs.xlsx';
    xlsx.writeFile(workbook, filePath);
    console.log(`Data saved to ${filePath}`);
  } catch (err) {
    console.error('Error saving data to Excel:', err);
  }
};

// Main Function
(async () => {
  const jobs = await scrapeJobs();
  if (jobs && jobs.length) {
    saveToExcel(jobs);
  } else {
    console.log('No jobs found.');
  }
})();
