import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    userDataDir: '/tmp/puppeteer_user_data',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--disable-crash-reporter',
      '--no-crash-upload',
      '--disable-features=Crashpad',
      '--single-process',
      '--no-zygote'
    ]
  });

  const page = await browser.newPage();
  await page.setContent('<h1>Hello PDF</h1>');
  await page.pdf({ path: 'test.pdf', format: 'A4' });
  await browser.close();
})();
