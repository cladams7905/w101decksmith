// Debug script to identify captcha structure
async function debugCaptchaStructure(page) {
  console.log("\n=== DEBUGGING CAPTCHA STRUCTURE ===");

  // Get all frames
  const frames = await page.frames();
  console.log(`Total frames found: ${frames.length}`);

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const url = frame.url();
    console.log(`\nFrame ${i}: ${url}`);

    try {
      // Check for Google reCAPTCHA elements
      const recaptchaCheckbox = await frame
        .$(".recaptcha-checkbox-border")
        .catch(() => null);
      const challengeArea = await frame
        .$(".rc-imageselect-challenge")
        .catch(() => null);
      const imageSelectTable = await frame
        .$(".rc-imageselect-table-33, .rc-imageselect-table-44")
        .catch(() => null);

      console.log(
        `  - reCAPTCHA checkbox: ${recaptchaCheckbox ? "FOUND" : "NOT FOUND"}`
      );
      console.log(
        `  - Challenge area: ${challengeArea ? "FOUND" : "NOT FOUND"}`
      );
      console.log(
        `  - Image select table: ${imageSelectTable ? "FOUND" : "NOT FOUND"}`
      );

      // Check for common captcha elements
      const images = await frame.$$("img").catch(() => []);
      const canvases = await frame.$$("canvas").catch(() => []);
      const iframes = await frame.$$("iframe").catch(() => []);

      console.log(`  - Images: ${images.length}`);
      console.log(`  - Canvases: ${canvases.length}`);
      console.log(`  - Nested iframes: ${iframes.length}`);

      // Try to get page title/content indicators
      const title = await frame.title().catch(() => "N/A");
      console.log(`  - Title: ${title}`);

      // Look for any captcha-related text
      const bodyText = await frame
        .$eval("body", (el) => el.textContent)
        .catch(() => "");
      const hasCaptchaText =
        bodyText.toLowerCase().includes("captcha") ||
        bodyText.toLowerCase().includes("verify") ||
        bodyText.toLowerCase().includes("robot");
      console.log(`  - Has captcha-related text: ${hasCaptchaText}`);

      if (hasCaptchaText) {
        console.log(`  - Text preview: ${bodyText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`  - Error inspecting frame: ${error.message}`);
    }
  }

  console.log("\n=== END DEBUGGING ===\n");
}

module.exports = debugCaptchaStructure;
