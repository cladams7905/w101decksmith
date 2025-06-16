import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

async function main() {
  // Check for required environment variables
  const username = process.env.WIZARD101_USERNAME;
  const password = process.env.WIZARD101_PASSWORD;

  if (!username || !password) {
    console.error(
      "Please set WIZARD101_USERNAME and WIZARD101_PASSWORD environment variables"
    );
    process.exit(1);
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: null
  });

  try {
    const page = await browser.newPage();

    // Go to main page
    console.log("Navigating to Wizard101...");
    await page.goto("https://www.wizard101.com/game", {
      waitUntil: "networkidle0"
    });

    // Click login button
    console.log("Clicking login button...");
    await page.click('a[href="/login"]');

    // Wait for login form and fill credentials
    console.log("Filling login credentials...");
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', username);
    await page.type('input[name="password"]', password);

    // Submit login form
    console.log("Submitting login form...");
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await page.waitForNavigation({
      waitUntil: "networkidle0"
    });

    // Click play trivia button
    console.log("Clicking play trivia button...");
    await page.click('a[href="/game/trivia"]');

    // Wait for trivia page to load
    await page.waitForNavigation({
      waitUntil: "networkidle0"
    });

    // Get page HTML
    const html = await page.content();

    // Save HTML to file
    const outputPath = path.join(__dirname, "trivia-page.html");
    fs.writeFileSync(outputPath, html);
    console.log(`HTML saved to ${outputPath}`);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Close browser
    await browser.close();
  }
}

main().catch(console.error);
