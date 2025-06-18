/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs").promises;
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const createLogger = require("./logger");

// Try to import Sharp, but make it optional
let sharp = null;
try {
  sharp = require("sharp");
} catch {
  console.warn(
    "Sharp not available - screenshot enhancement will be disabled. Install with: npm install sharp"
  );
}

// Initialize with default level, will be updated when the main function is called
let logger = createLogger({ level: "info" });

// Setup puppeteer with stealth plugin
puppeteerExtra.use(StealthPlugin());

class ResultTracker {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.maxResults = 500;
    this.firstProcessingTime = null;
  }

  addResult(result) {
    if (!this.firstProcessingTime) {
      this.firstProcessingTime = Date.now();
    }

    this.results.push({
      success: result.token ? true : false, // Success is based on getting a token
      timestamp: Date.now()
    });

    if (this.results.length > this.maxResults) {
      this.results.shift();
    }

    // Automatically print stats after adding a result
    this.printStats();
  }

  getStats() {
    if (this.results.length === 0) return null;

    const successCount = this.results.filter((r) => r.success).length;
    const successRate = (successCount / this.results.length) * 100;

    let avgTimePerToken = 0;
    if (successCount > 0) {
      const totalElapsedSeconds = (Date.now() - this.startTime) / 1000;
      avgTimePerToken = totalElapsedSeconds / successCount;
    }

    return {
      successRate: successRate.toFixed(2),
      avgTimePerToken: avgTimePerToken.toFixed(2),
      totalAttempts: this.results.length,
      successfulTokens: successCount
    };
  }

  printStats() {
    const stats = this.getStats();
    if (!stats) return;
    logger.info(
      `Stats: Success Rate: ${stats.successRate}% | Avg Time/Token: ${stats.avgTimePerToken}s | Total Attempts: ${stats.totalAttempts} | Successful Tokens: ${stats.successfulTokens}`
    );
  }
}

// Update the main generateTokens function to use existing page
async function generateTokens(
  tokensToGenerate,
  eventEmitter,
  existingPage, // Accept existing page instead of browsers array
  captchaUrl,
  geminiConfig
) {
  const resultTracker = new ResultTracker();

  try {
    let tokensGenerated = 0;

    while (tokensGenerated < tokensToGenerate) {
      try {
        // Navigate to the captcha URL using the existing page (only if needed)
        if (captchaUrl !== "about:blank") {
          await existingPage.goto(captchaUrl, {
            waitUntil: "domcontentloaded",
            timeout: 120000
          });
          logger.info(`✅ Navigated to: ${captchaUrl}`);
        } else {
          logger.info(
            "ℹ️ Skipping navigation - using current page with recaptcha already loaded"
          );
        }

        const token = await solveScreenshotCaptcha(existingPage, geminiConfig);
        if (token) {
          eventEmitter.emit("tokenGenerated", { token });
          tokensGenerated++;
          resultTracker.addResult({ success: true, status: "ACTIVE" });
          break; // Exit after getting one token
        } else {
          resultTracker.addResult({ success: false, status: "ERROR" });
          break;
        }
      } catch (error) {
        logger.error("Error generating token:", error);
        eventEmitter.emit("tokenError", { error: error.message });
        resultTracker.addResult({ success: false, status: "ERROR" });
        break;
      }
    }
  } catch (error) {
    logger.error("Error in generateTokens:", error);
    eventEmitter.emit("tokenError", { error: error.message });
  }
}

// Update to match standard interface
async function generateCaptchaTokensWithVisual({
  // Core settings
  eventEmitter,
  tokensToGenerate = 1, // Default to 1 token
  captchaUrl = "https://www.google.com/recaptcha/api2/demo",
  // Existing page instance
  existingPage = null,
  // Gemini configuration
  gemini = {
    apiKey: null,
    model: "gemini-1.5-flash"
  },
  // Logger configuration
  logger: loggerConfig = {
    level: "info" // 'error' | 'warn' | 'info' | 'debug' | 'silent'
  },
  // Custom login handling
  beforeSolving = null
} = {}) {
  // Update the global logger with user config
  logger = createLogger({ level: loggerConfig.level });

  if (!eventEmitter) {
    throw new Error("eventEmitter is required");
  }

  if (!gemini.apiKey) {
    throw new Error("Gemini API key is required");
  }

  if (!existingPage) {
    throw new Error(
      "existingPage is required - pass your existing Puppeteer page instance"
    );
  }

  logger.info("\n=== Starting Visual Token Generation with Existing Page ===");
  logger.info(`Tokens to Generate: ${tokensToGenerate}`);
  logger.info(`Captcha URL: ${captchaUrl}`);
  logger.info("========================================================\n");

  return generateTokens(
    tokensToGenerate,
    eventEmitter,
    existingPage,
    captchaUrl,
    gemini,
    beforeSolving
  );
}

// New screenshot-based captcha solver with multiple challenge support
async function solveScreenshotCaptcha(page, geminiConfig) {
  logger.info("=== STARTING SCREENSHOT-BASED CAPTCHA SOLVING ===");

  const maxAttempts = 10; // Handle up to 10 sequential challenges
  let attempts = 0;

  try {
    while (attempts < maxAttempts) {
      attempts++;
      logger.info(`=== Challenge Attempt ${attempts}/${maxAttempts} ===`);

      // Find the captcha iframe container
      const captchaContainer = await findCaptchaContainer(page);
      if (!captchaContainer) {
        logger.error("Could not find captcha container");
        return null;
      }

      logger.info("Found captcha container, waiting before screenshot...");
      // Reduced delay for faster processing
      await new Promise((resolve) => setTimeout(resolve, 500)); // Reduced from 1000ms

      // Take screenshot of the captcha area
      logger.info("Taking captcha screenshot...");
      const screenshotPath = await takeFullCaptchaScreenshot(
        page,
        captchaContainer
      );
      if (!screenshotPath) {
        logger.error("Could not take captcha screenshot");
        return null;
      }

      logger.info("Screenshot taken successfully, waiting before analysis...");
      // Minimal delay after screenshot for faster processing
      await new Promise((resolve) => setTimeout(resolve, 300)); // Reduced from 500ms

      // Analyze with Gemini to get grid positions to click
      logger.info("Analyzing screenshot with Gemini...");
      const analysis = await analyzeScreenshotWithGemini(
        screenshotPath,
        geminiConfig
      );

      if (!analysis) {
        logger.error("Failed to analyze screenshot with Gemini");
        continue;
      }

      logger.info("Analysis complete, processing results...");

      const clickPositions = analysis.grid_positions || [];
      const actionType = analysis.action_type || "verify"; // Default to verify if not specified

      if (clickPositions.length === 0) {
        // No grid positions to click - handle based on action type
        if (actionType === "skip") {
          logger.info(
            "No positions to click and action type is 'skip' - clicking skip button immediately"
          );
          const verifyClicked = await clickVerifyButton(page, captchaContainer);
          if (verifyClicked) {
            logger.info("Clicked skip button, waiting for result...");
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const token = await checkForToken(page);
            if (token) {
              logger.info("Token found after skip - captcha completed!");
              return token;
            }
          } else {
            logger.info("No skip button found or clicked");
          }
        } else if (actionType === "verify") {
          logger.info(
            "No positions to click and action type is 'verify' - taking another screenshot to verify current state before clicking verify button"
          );

          // Wait for any changes to settle after clicking grid positions - increased wait time for image rendering
          await new Promise((resolve) => setTimeout(resolve, 6000)); // Increased from 4000ms to 6000ms for proper image loading

          // Take another screenshot to see the current state
          logger.info("Taking verification screenshot...");
          const verificationScreenshotPath = await takeFullCaptchaScreenshot(
            page,
            captchaContainer
          );

          if (verificationScreenshotPath) {
            // Analyze the verification screenshot
            logger.info("Analyzing verification screenshot with Gemini...");
            const verificationAnalysis = await analyzeScreenshotWithGemini(
              verificationScreenshotPath,
              geminiConfig
            );

            if (verificationAnalysis) {
              logger.info("Verification analysis results:");
              logger.info(
                `- Challenge text: ${
                  verificationAnalysis.challenge_text || "Not detected"
                }`
              );
              logger.info(
                `- Grid detected: ${verificationAnalysis.grid_detected}`
              );
              logger.info(
                `- Action type: ${
                  verificationAnalysis.action_type || "Not detected"
                }`
              );
              logger.info(
                `- Additional positions: ${
                  verificationAnalysis.grid_positions?.length || 0
                }`
              );

              // If there are additional positions to click, click them first
              if (
                verificationAnalysis.grid_positions &&
                verificationAnalysis.grid_positions.length > 0
              ) {
                logger.info(
                  `Found ${verificationAnalysis.grid_positions.length} additional positions to click before verifying`
                );
                await clickCaptchaPositions(
                  page,
                  captchaContainer,
                  verificationAnalysis.grid_positions,
                  verificationAnalysis.grid_size || 3
                );

                // Wait after clicking additional positions
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }

              // Check the final action type from verification analysis
              const finalActionType =
                verificationAnalysis.action_type || "verify";

              if (finalActionType === "next") {
                logger.info(
                  "Verification analysis shows 'next' - continuing to next round instead of verifying"
                );
                // Continue the loop for another round
                continue;
              } else if (finalActionType === "skip") {
                logger.info(
                  "Verification analysis shows 'skip' - clicking skip button"
                );
                const verifyClicked = await clickVerifyButton(
                  page,
                  captchaContainer
                );
                if (verifyClicked) {
                  logger.info("Clicked skip button after verification...");
                  await new Promise((resolve) => setTimeout(resolve, 1500));
                }
              } else {
                // Default to verify
                logger.info(
                  "Verification analysis confirms 'verify' action - clicking verify button"
                );
                const verifyClicked = await clickVerifyButton(
                  page,
                  captchaContainer
                );
                if (verifyClicked) {
                  logger.info(
                    "Clicked verify button after verification analysis..."
                  );
                  await new Promise((resolve) => setTimeout(resolve, 2000));

                  const token = await checkForToken(page);
                  if (token) {
                    logger.info(
                      "Token found after verify - captcha completed!"
                    );
                    return token;
                  }
                }
              }
            } else {
              logger.warn(
                "Verification analysis failed, proceeding with original verify action"
              );
              const verifyClicked = await clickVerifyButton(
                page,
                captchaContainer
              );
              if (verifyClicked) {
                logger.info(
                  "Clicked verify button (fallback after failed verification analysis)..."
                );
                await new Promise((resolve) => setTimeout(resolve, 2000));

                const token = await checkForToken(page);
                if (token) {
                  logger.info("Token found after verify - captcha completed!");
                  return token;
                }
              }
            }
          } else {
            logger.warn(
              "Could not take verification screenshot, proceeding with original verify action"
            );
            const verifyClicked = await clickVerifyButton(
              page,
              captchaContainer
            );
            if (verifyClicked) {
              logger.info(
                "Clicked verify button (fallback after failed verification screenshot)..."
              );
              await new Promise((resolve) => setTimeout(resolve, 2000));

              const token = await checkForToken(page);
              if (token) {
                logger.info("Token found after verify - captcha completed!");
                return token;
              }
            }
          }
        } else if (actionType === "next") {
          logger.info(
            "No positions to click but action type is 'next' - this indicates a dynamic challenge, continuing to next round"
          );
          // Don't click anything, just continue to next iteration for a new screenshot
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } else {
        // Click on the identified positions first
        logger.info(
          `Clicking ${analysis.grid_positions.length} identified grid positions...`
        );
        await clickCaptchaPositions(
          page,
          captchaContainer,
          analysis.grid_positions,
          analysis.grid_size || 3
        );

        // Wait briefly after clicking positions - reduced for faster processing
        logger.info("Waiting briefly after clicking positions...");
        await new Promise((resolve) => setTimeout(resolve, 800)); // Reduced from 1000ms

        // Handle action type after clicking positions
        if (actionType === "next") {
          logger.info("======NEXT=======");
          logger.info(
            "Grid positions clicked and action type is 'next' - clicking next button immediately to proceed to new images"
          );
          const nextClicked = await clickVerifyButton(page, captchaContainer);
          if (nextClicked) {
            logger.info(
              "Clicked next button, waiting for new images to load..."
            );
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for new images to load
          }
          // Continue the loop for new screenshot after clicking next
          continue; // Go back to start of loop for new screenshot and analysis
        } else if (actionType === "skip") {
          logger.info("======SKIP=======");
          logger.info(
            "Grid positions clicked and action type is 'skip' - clicking skip button"
          );
          const verifyClicked = await clickVerifyButton(page, captchaContainer);
          if (verifyClicked) {
            logger.info("Clicked skip button after selections...");
            await new Promise((resolve) => setTimeout(resolve, 1500)); // Reduced wait time for skip
          }
        } else if (actionType === "verify") {
          logger.info("======VERIFY=======");
          logger.info(
            "Grid positions clicked and action type is 'verify' - taking another screenshot to verify current state before clicking verify button"
          );

          // Wait for any changes to settle after clicking grid positions - increased wait time for image rendering
          await new Promise((resolve) => setTimeout(resolve, 6000));

          // Take another screenshot to see the current state
          logger.info("Taking verification screenshot...");
          const verificationScreenshotPath = await takeFullCaptchaScreenshot(
            page,
            captchaContainer
          );

          if (verificationScreenshotPath) {
            // Analyze the verification screenshot
            logger.info("Analyzing verification screenshot with Gemini...");
            const verificationAnalysis = await analyzeScreenshotWithGemini(
              verificationScreenshotPath,
              geminiConfig
            );

            if (verificationAnalysis) {
              logger.info("Verification analysis results:");
              logger.info(
                `- Challenge text: ${
                  verificationAnalysis.challenge_text || "Not detected"
                }`
              );
              logger.info(
                `- Grid detected: ${verificationAnalysis.grid_detected}`
              );
              logger.info(
                `- Action type: ${
                  verificationAnalysis.action_type || "Not detected"
                }`
              );
              logger.info(
                `- Additional positions: ${
                  verificationAnalysis.grid_positions?.length || 0
                }`
              );

              // If there are additional positions to click, click them first
              if (
                verificationAnalysis.grid_positions &&
                verificationAnalysis.grid_positions.length > 0
              ) {
                logger.info(
                  `Found ${verificationAnalysis.grid_positions.length} additional positions to click before verifying`
                );
                await clickCaptchaPositions(
                  page,
                  captchaContainer,
                  verificationAnalysis.grid_positions,
                  verificationAnalysis.grid_size || 3
                );

                // Wait after clicking additional positions
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }

              // Check the final action type from verification analysis
              const finalActionType =
                verificationAnalysis.action_type || "verify";

              if (finalActionType === "next") {
                logger.info(
                  "Verification analysis shows 'next' - continuing to next round instead of verifying"
                );
                // Continue the loop for another round
                continue;
              } else if (finalActionType === "skip") {
                logger.info(
                  "Verification analysis shows 'skip' - clicking skip button"
                );
                const verifyClicked = await clickVerifyButton(
                  page,
                  captchaContainer
                );
                if (verifyClicked) {
                  logger.info("Clicked skip button after verification...");
                  await new Promise((resolve) => setTimeout(resolve, 1500));
                }
              } else {
                // Default to verify
                logger.info(
                  "Verification analysis confirms 'verify' action - clicking verify button"
                );
                const verifyClicked = await clickVerifyButton(
                  page,
                  captchaContainer
                );
                if (verifyClicked) {
                  logger.info(
                    "Clicked verify button after verification analysis..."
                  );
                  await new Promise((resolve) => setTimeout(resolve, 2000));

                  const token = await checkForToken(page);
                  if (token) {
                    logger.info(
                      "Token found after verify - captcha completed!"
                    );
                    return token;
                  }
                }
              }
            } else {
              logger.warn(
                "Verification analysis failed, proceeding with original verify action"
              );
              const verifyClicked = await clickVerifyButton(
                page,
                captchaContainer
              );
              if (verifyClicked) {
                logger.info(
                  "Clicked verify button (fallback after failed verification analysis)..."
                );
                await new Promise((resolve) => setTimeout(resolve, 2000));

                const token = await checkForToken(page);
                if (token) {
                  logger.info("Token found after verify - captcha completed!");
                  return token;
                }
              }
            }
          } else {
            logger.warn(
              "Could not take verification screenshot, proceeding with original verify action"
            );
            const verifyClicked = await clickVerifyButton(
              page,
              captchaContainer
            );
            if (verifyClicked) {
              logger.info(
                "Clicked verify button (fallback after failed verification screenshot)..."
              );
              await new Promise((resolve) => setTimeout(resolve, 2000));

              const token = await checkForToken(page);
              if (token) {
                logger.info("Token found after verify - captcha completed!");
                return token;
              }
            }
          }
        }
      }

      // Wait for response and check for token (shorter wait for non-verify actions)
      logger.info("Waiting for challenge response...");
      const waitTime = actionType === "verify" ? 4000 : 800; // Shorter wait for next/skip
      await new Promise((resolve) => setTimeout(resolve, waitTime));

      const token = await checkForToken(page);
      if (token) {
        logger.info("Token found - captcha completed!");
        return token;
      }

      logger.info("No token yet, checking for next challenge...");

      // Reduced delay before next attempt for faster processing
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Reduced from 2000ms
    }

    logger.error("Max attempts reached, captcha solving failed");
    return null;
  } catch (error) {
    logger.error("Error in solveScreenshotCaptcha:", error);
    return null;
  }
}

async function findCaptchaContainer(page) {
  logger.info("Looking for captcha container...");

  // Try to find the popup iframe that contains the captcha
  const frames = await page.frames();
  const popupFrame = frames.find((frame) =>
    frame.url().includes("LoginWithCaptcha")
  );

  if (popupFrame) {
    logger.info("Found popup frame, looking for captcha elements inside");

    // Check if there's a captcha challenge visible in the popup
    const hasCaptchaChallenge = await popupFrame.evaluate(() => {
      // Look for common captcha challenge indicators
      const indicators = [
        'iframe[src*="recaptcha"]',
        ".recaptcha",
        '[class*="captcha"]',
        'img[src*="captcha"]',
        ".challenge",
        '[class*="challenge"]'
      ];

      for (const selector of indicators) {
        if (document.querySelector(selector)) {
          console.log("Found captcha indicator:", selector);
          return true;
        }
      }

      // Also check for image grids that look like captcha
      const images = document.querySelectorAll("img");
      if (images.length >= 9) {
        // Typical 3x3 grid
        console.log("Found potential image grid with", images.length, "images");
        return true;
      }

      return false;
    });

    if (hasCaptchaChallenge) {
      logger.info("Found captcha challenge in popup frame");
      return { type: "frame", frame: popupFrame };
    }
  }

  // Fallback: look for reCAPTCHA frames
  const recaptchaFrame = frames.find((frame) =>
    frame.url().includes("api2/bframe")
  );
  if (recaptchaFrame) {
    logger.info("Found reCAPTCHA bframe");
    return { type: "frame", frame: recaptchaFrame };
  }

  // Last resort: look for captcha elements in main page
  const mainPageCaptcha = await page.evaluate(() => {
    const captchaSelectors = [
      'iframe[src*="recaptcha"]',
      ".recaptcha",
      '[class*="captcha"]',
      ".g-recaptcha"
    ];

    for (const selector of captchaSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        return { selector, found: true };
      }
    }
    return null;
  });

  if (mainPageCaptcha) {
    logger.info("Found captcha in main page:", mainPageCaptcha.selector);
    return { type: "element", selector: mainPageCaptcha.selector };
  }

  return null;
}

async function takeFullCaptchaScreenshot(page, container) {
  const timestamp = Date.now();

  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(process.cwd(), "screenshots");
  try {
    await fs.mkdir(screenshotsDir, { recursive: true });
  } catch {
    // Directory might already exist, ignore error
  }

  const screenshotPath = path.join(
    screenshotsDir,
    `captcha_screenshot_${timestamp}.png`
  );
  logger.info(`📁 Screenshots will be saved to: ${screenshotsDir}`);

  try {
    logger.info("Starting screenshot process...");

    if (container.type === "frame") {
      logger.info("Taking screenshot of frame container");

      // For frames, we want to screenshot just the iframe area
      const iframeElement = await page.evaluate(() => {
        const frames = document.querySelectorAll("iframe");
        for (const frame of frames) {
          if (
            frame.src.includes("LoginWithCaptcha") ||
            frame.src.includes("recaptcha")
          ) {
            const rect = frame.getBoundingClientRect();
            console.log("Found iframe for screenshot:", {
              src: frame.src,
              width: rect.width,
              height: rect.height,
              x: rect.left,
              y: rect.top
            });
            return {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height
            };
          }
        }
        console.log("No suitable iframe found for screenshot");
        return null;
      });

      if (
        iframeElement &&
        iframeElement.width > 0 &&
        iframeElement.height > 0
      ) {
        logger.info(
          `Taking iframe screenshot: ${iframeElement.width}x${iframeElement.height} at (${iframeElement.x}, ${iframeElement.y})`
        );

        // Screenshot the specific iframe area
        await page.screenshot({
          path: screenshotPath,
          type: "png",
          clip: {
            x: iframeElement.x,
            y: iframeElement.y,
            width: iframeElement.width,
            height: iframeElement.height
          }
        });
        logger.info(
          `Iframe area screenshot saved: ${screenshotPath} (${iframeElement.width}x${iframeElement.height})`
        );
      } else {
        logger.warn("Iframe element not suitable, taking full page screenshot");
        // Fallback: full page screenshot
        await page.screenshot({
          path: screenshotPath,
          type: "png",
          fullPage: true
        });
        logger.info(`Full page screenshot saved: ${screenshotPath}`);
      }
    } else {
      logger.info("Taking screenshot of element container");
      // Screenshot specific element
      const element = await page.$(container.selector);
      if (element) {
        logger.info(
          `Taking element screenshot for selector: ${container.selector}`
        );
        await element.screenshot({
          path: screenshotPath,
          type: "png"
        });
        logger.info(`Element screenshot saved: ${screenshotPath}`);
      } else {
        logger.warn("Element not found, taking full page screenshot");
        await page.screenshot({
          path: screenshotPath,
          type: "png",
          fullPage: true
        });
        logger.info(`Fallback full page screenshot saved: ${screenshotPath}`);
      }
    }

    // Verify screenshot was created successfully
    const stats = await fs.stat(screenshotPath);
    if (stats.size > 0) {
      logger.info(`Screenshot verification: ${stats.size} bytes written`);
      logger.info(`📸 Original screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } else {
      logger.error("Screenshot file is empty");
      return null;
    }
  } catch (error) {
    logger.error("Error taking captcha screenshot:", error);
    return null;
  }
}

async function analyzeScreenshotWithGemini(screenshotPath, geminiConfig) {
  try {
    logger.info("Analyzing captcha screenshot with Gemini...");

    const genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
    const model = genAI.getGenerativeModel({
      model: geminiConfig.model || "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        topK: 40
      }
    });

    // Step 1: First analyze the original image to detect grid size
    logger.info("Step 1: Detecting grid size from original screenshot...");

    const originalImageData = await fs.readFile(screenshotPath);
    const originalImageBase64 = originalImageData.toString("base64");

    const gridDetectionPrompt = `Analyze this captcha screenshot and determine the grid size ONLY.

Look at the white borders/lines that separate the image squares. Count both horizontally and vertically.

Respond with ONLY a JSON object containing:
{
  "grid_size": 3 or 4,
  "confidence": 0-100,
  "reasoning": "Brief explanation of what you counted"
}

Count carefully - a 3x3 grid has 9 squares total, a 4x4 grid has 16 squares total.`;

    const gridDetectionResult = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/png",
          data: originalImageBase64
        }
      },
      gridDetectionPrompt
    ]);

    const gridResponse = gridDetectionResult.response.text();
    logger.info("=== GRID SIZE DETECTION RESPONSE ===");
    logger.info(gridResponse);
    logger.info("=== END GRID DETECTION ===");

    // Parse grid detection response
    let detectedGridSize = 3; // Default fallback
    try {
      let gridJsonStr = gridResponse;
      if (gridResponse.includes("```json")) {
        gridJsonStr = gridResponse.split("```json")[1].split("```")[0].trim();
      } else if (gridResponse.includes("```")) {
        gridJsonStr = gridResponse.split("```")[1].split("```")[0].trim();
      }

      const gridDetection = JSON.parse(gridJsonStr);
      detectedGridSize = gridDetection.grid_size || 3;
      logger.info(
        `🔍 Detected grid size: ${detectedGridSize}x${detectedGridSize}`
      );
      logger.info(`📊 Detection confidence: ${gridDetection.confidence}%`);
      logger.info(`💭 Reasoning: ${gridDetection.reasoning}`);
    } catch (parseError) {
      logger.warn(
        "Failed to parse grid detection response, using 3x3 default:",
        parseError
      );
    }

    // Step 2: Enhance screenshot with the correct grid size
    logger.info(
      `Step 2: Enhancing screenshot with detected ${detectedGridSize}x${detectedGridSize} grid...`
    );
    const enhancedScreenshotPath = await enhanceScreenshotWithGridBorders(
      screenshotPath,
      detectedGridSize
    );

    // Step 3: Analyze the enhanced screenshot for detailed analysis
    logger.info(
      "Step 3: Analyzing enhanced screenshot for positions and actions..."
    );

    const imageData = await fs.readFile(enhancedScreenshotPath);
    const imageBase64 = imageData.toString("base64");

    const prompt = `You are helping solve a visual captcha challenge. Look at this screenshot and:

IMPORTANT: This image has been enhanced with RED GRID LINES and COORDINATE LABELS to help you identify the grid structure more clearly. Use these red overlays to accurately determine the grid size and positions.

1. Identify if there's a captcha challenge visible (like "Select all images with cars", etc.)

2. FIRST, use the RED GRID LINES to count the grid size. The red lines divide the image grid into squares, and each square is labeled with its [row,col] coordinates in red text.

3. If there's a grid of images, identify which grid squares contain the requested objects. Use the red coordinate labels [row,col] to identify exact positions.

4. Return the grid positions (NOT pixel coordinates) that should be clicked. Use the red coordinate labels to determine the correct [row,col] positions.

IMPORTANT: If the object covers a large area, all neighboring squares with the object should be selected.

GRID SIZE VERIFICATION: The red grid overlay shows you the exact structure:
- Count the red grid lines to determine if it's 3x3 or 4x4
- Each square is labeled with red [row,col] coordinates 
- Use these labels to identify the exact positions to click

Analyze the image and respond with a JSON object containing:

- "challenge_text": The challenge instruction text (if visible)

- "grid_size": The size of the grid (3 for 3x3 or 4 for 4x4) - Use the red grid lines to count accurately

- "grid_verification": Describe what you see with the red grid overlay (e.g., "I can see red grid lines creating a 3x3 layout with coordinate labels from [0,0] to [2,2]")

- "action_type": The action to take next based on the text in the blue button on the bottom right corner. The text is always "Next", "Verify" or "Skip".

- "grid_positions": Array of [row, col] positions to click - use the red coordinate labels to identify these exactly

- "grid_detected": Boolean indicating if a grid pattern was detected

- "confidence": Your confidence level (0-100)

Grid coordinate system (shown in red labels on the image):
- For 3x3: [0,0] = top-left, [0,1] = top-center, [0,2] = top-right
- [1,0] = middle-left, [1,1] = middle-center, [1,2] = middle-right  
- [2,0] = bottom-left, [2,1] = bottom-center, [2,2] = bottom-right

For 4x4 grids, extend to [0,3], [1,3], [2,3], [3,0], [3,1], [3,2], [3,3].

Only select grid positions that clearly contain the requested object. Be conservative - it's better to miss some than to select incorrect ones.

Example response:
{
"challenge_text": "Select all images with traffic lights",
"grid_size": 4,
"grid_verification": "I can see red grid lines creating a 4x4 layout with coordinate labels from [0,0] to [3,3]",
"action_type": "next",
"grid_positions": [
[0, 1],
[1, 2],
[2, 0],
[3, 3]
],
"grid_detected": true,
"confidence": 85
}

If no captcha challenge is visible, set grid_positions to an empty array.

Respond only with the JSON object.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/png",
          data: imageBase64
        }
      },
      prompt
    ]);

    const response = result.response.text();
    logger.info("=== COMPLETE GEMINI JSON RESPONSE ===");
    logger.info(response);
    logger.info("=== END GEMINI RESPONSE ===");

    logger.debug("Gemini screenshot analysis response:", response);

    // Parse JSON response
    let jsonStr = response;
    if (response.includes("```json")) {
      jsonStr = response.split("```json")[1].split("```")[0].trim();
    } else if (response.includes("```")) {
      jsonStr = response.split("```")[1].split("```")[0].trim();
    }

    const analysis = JSON.parse(jsonStr);

    logger.info("Gemini analysis results:");
    logger.info(
      `- Challenge text: ${analysis.challenge_text || "Not detected"}`
    );
    logger.info(`- Grid detected: ${analysis.grid_detected}`);
    logger.info(`- Grid size: ${analysis.grid_size || "Unknown"}`);
    logger.info(
      `- Grid verification: ${analysis.grid_verification || "Not provided"}`
    );
    logger.info(`- Action type: ${analysis.action_type || "Not detected"}`);
    logger.info(`- Confidence: ${analysis.confidence}%`);
    logger.info(`- Grid positions: ${analysis.grid_positions?.length || 0}`);

    // Add detailed debug logging for grid analysis
    logger.debug("=== DETAILED GEMINI RESPONSE DEBUG ===");
    logger.debug(`Raw response length: ${response.length} characters`);
    logger.debug(`Parsed JSON string: ${jsonStr}`);
    logger.debug(`Full analysis object:`, JSON.stringify(analysis, null, 2));

    // Validate grid size makes sense
    if (analysis.grid_size && ![3, 4].includes(analysis.grid_size)) {
      logger.warn(
        `⚠️ Unusual grid size detected: ${analysis.grid_size} - expected 3 or 4`
      );
    }

    // Validate grid positions match grid size
    if (analysis.grid_positions && analysis.grid_positions.length > 0) {
      const maxExpectedPositions = analysis.grid_size === 3 ? 9 : 16;
      if (analysis.grid_positions.length > maxExpectedPositions) {
        logger.warn(
          `⚠️ Too many positions (${analysis.grid_positions.length}) for ${analysis.grid_size}x${analysis.grid_size} grid`
        );
      }

      // Check if any positions are out of bounds
      const invalidPositions = analysis.grid_positions.filter((pos) => {
        const [row, col] = pos;
        return (
          row < 0 ||
          col < 0 ||
          row >= analysis.grid_size ||
          col >= analysis.grid_size
        );
      });

      if (invalidPositions.length > 0) {
        logger.warn(
          `⚠️ Invalid positions detected for ${analysis.grid_size}x${analysis.grid_size} grid:`,
          invalidPositions
        );
      }
    }
    logger.debug("=== END DEBUG ===");

    // Add grid visualization if positions were found
    if (analysis.grid_positions && analysis.grid_positions.length > 0) {
      const gridInfo = visualizeGridSelections(
        analysis.grid_positions,
        analysis.grid_size || 3
      );
      if (gridInfo) {
        logger.info("=== GRID SELECTION ANALYSIS ===");
        logger.info(`Grid size: ${gridInfo.gridSize}x${gridInfo.gridSize}`);
        logger.info(
          `Selected positions: ${analysis.grid_positions
            .map((pos) => `[${pos[0]},${pos[1]}]`)
            .join(", ")}`
        );
        logger.info("Grid visualization:");
        gridInfo.gridVisualization.forEach((row, rowIndex) => {
          logger.info(`Row ${rowIndex}: ${row}`);
        });
        logger.info("=== END GRID ANALYSIS ===");
      }
    }

    return analysis;
  } catch (error) {
    logger.error("Error analyzing screenshot with Gemini:", error);
    return { grid_detected: false, confidence: 0 };
  }
}

// New function to visualize grid selections from grid positions
function visualizeGridSelections(gridPositions, gridSize) {
  try {
    if (!gridPositions || gridPositions.length === 0) {
      return null;
    }

    const size = gridSize || 3;
    const gridVisualization = [];

    // Initialize grid visualization
    for (let row = 0; row < size; row++) {
      gridVisualization[row] = "";
      for (let col = 0; col < size; col++) {
        gridVisualization[row] += "[ ]  ";
      }
    }

    // Mark selected positions
    gridPositions.forEach((pos) => {
      const [row, col] = pos;

      // Validate position is within grid bounds
      if (row >= 0 && row < size && col >= 0 && col < size) {
        const rowStr = gridVisualization[row];
        const cellStart = col * 5; // Each cell is "[ ]  " = 5 chars
        gridVisualization[row] =
          rowStr.substring(0, cellStart + 1) +
          "X" +
          rowStr.substring(cellStart + 2);
      } else {
        logger.warn(
          `Invalid grid position: [${row},${col}] for ${size}x${size} grid`
        );
      }
    });

    return {
      gridSize: size,
      gridVisualization,
      totalSelected: gridPositions.length
    };
  } catch (error) {
    logger.error("Error visualizing grid selections:", error);
    return null;
  }
}

async function clickCaptchaPositions(
  page,
  container,
  gridPositions,
  gridSize = 3
) {
  logger.info(`Clicking ${gridPositions.length} grid positions...`);

  if (gridPositions.length === 0) {
    return;
  }

  try {
    if (container.type === "frame") {
      // Get the iframe information including its actual size and position
      const iframeInfo = await page.evaluate(() => {
        const frames = document.querySelectorAll("iframe");
        for (const frame of frames) {
          if (
            frame.src.includes("LoginWithCaptcha") ||
            frame.src.includes("recaptcha")
          ) {
            const rect = frame.getBoundingClientRect();
            return {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height,
              scrollX: window.scrollX,
              scrollY: window.scrollY,
              devicePixelRatio: window.devicePixelRatio || 1
            };
          }
        }
        return null;
      });

      if (!iframeInfo) {
        logger.error("Could not find iframe information");
        return;
      }

      logger.info(`Iframe info: ${JSON.stringify(iframeInfo)}`);
      logger.info(
        `Converting grid positions to click coordinates for ${gridSize}x${gridSize} grid`
      );

      // Captcha dimensions are 400x580px (50% of the standard 800x1160px)
      // The captcha container is always 400px wide, centered in the iframe
      // Padding on each side = (Total iframe width - 400px) / 2
      // - 16px padding -> 8px padding (scaled down 50%) WITHIN the captcha container
      // - 250px hero -> 125px hero (scaled down 50%)
      // - 790px grid area -> 385px grid area (scaled down 50%)

      const captchaContainerWidth = 400; // Fixed width of the captcha container
      const captchaContainerPadding =
        (iframeInfo.width - captchaContainerWidth) / 2; // Dynamic padding
      const innerPadding = 8; // 16px scaled down 50% - padding within the captcha container
      const heroHeight = 125; // 250px scaled down 50%
      const gridSectionHeight = 385; // 790px scaled down 50%

      // Calculate grid area within the iframe
      // Grid starts after the captcha container padding AND inner padding
      const gridStartX = captchaContainerPadding + innerPadding;
      const gridStartY = heroHeight;
      const gridAreaWidth = captchaContainerWidth - innerPadding * 2; // Use fixed container width minus inner padding
      const gridAreaHeight = gridSectionHeight;

      let cellSize, cellMargin;

      if (gridSize === 3) {
        // 3x3 grid: 250px squares -> 125px squares (scaled down 50%)
        // 10px margin -> 5px margin (scaled down 50%)
        cellSize = 125;
        cellMargin = 5;
      } else if (gridSize === 4) {
        // 4x4 grid: 190px squares -> 95px squares (scaled down 50%)
        // 6px margin -> 3px margin (scaled down 50%)
        cellSize = 95;
        cellMargin = 3;
      } else {
        // Fallback for other grid sizes - calculate based on available space
        const totalMarginSpace = (gridSize - 1) * 5; // Use 5px margins
        cellSize =
          (Math.min(gridAreaWidth, gridAreaHeight) - totalMarginSpace) /
          gridSize;
        cellMargin = 5;
      }

      logger.info(
        `Captcha dimensions: 400x580px (scaled down from 800x1160px)`
      );
      logger.info(
        `Iframe width: ${iframeInfo.width}px, Captcha container width: ${captchaContainerWidth}px`
      );
      logger.info(
        `Calculated captcha container padding: ${captchaContainerPadding}px on each side`
      );
      logger.info(`Inner container padding: ${innerPadding}px`);
      logger.info(`Hero height: ${heroHeight}px`);
      logger.info(`Grid section height: ${gridSectionHeight}px`);
      logger.info(`Grid starts at: (${gridStartX}, ${gridStartY})`);
      logger.info(`Grid area: ${gridAreaWidth}x${gridAreaHeight} pixels`);
      logger.info(`Cell size: ${cellSize}px x ${cellSize}px`);
      logger.info(`Cell margin: ${cellMargin}px`);

      // Calculate iframe bounds for validation
      const iframeBounds = {
        left: iframeInfo.x + iframeInfo.scrollX,
        top: iframeInfo.y + iframeInfo.scrollY,
        right: iframeInfo.x + iframeInfo.width + iframeInfo.scrollX,
        bottom: iframeInfo.y + iframeInfo.height + iframeInfo.scrollY
      };

      logger.info(
        `Iframe bounds: left=${iframeBounds.left}, top=${iframeBounds.top}, right=${iframeBounds.right}, bottom=${iframeBounds.bottom}`
      );

      // Click each grid position
      for (let i = 0; i < gridPositions.length; i++) {
        const [row, col] = gridPositions[i];

        // Validate grid position
        if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
          logger.warn(
            `Invalid grid position [${row},${col}] for ${gridSize}x${gridSize} grid, skipping`
          );
          continue;
        }

        // Calculate the center of the grid cell
        // Account for margins between cells: each cell position includes the cell size plus margin
        const cellCenterX =
          gridStartX + col * (cellSize + cellMargin) + cellSize / 2;
        const cellCenterY =
          gridStartY + row * (cellSize + cellMargin) + cellSize / 2;

        // Convert to absolute screen coordinates
        let absoluteX = iframeInfo.x + cellCenterX + iframeInfo.scrollX;
        let absoluteY = iframeInfo.y + cellCenterY + iframeInfo.scrollY;

        // Constrain coordinates to iframe bounds with some margin
        const margin = 5; // 5px margin from edges
        absoluteX = Math.max(
          iframeBounds.left + margin,
          Math.min(absoluteX, iframeBounds.right - margin)
        );
        absoluteY = Math.max(
          iframeBounds.top + margin,
          Math.min(absoluteY, iframeBounds.bottom - margin)
        );

        logger.info(
          `Grid position [${row},${col}] -> Cell center(${cellCenterX.toFixed(
            1
          )}, ${cellCenterY.toFixed(1)}) -> Absolute(${absoluteX.toFixed(
            1
          )}, ${absoluteY.toFixed(1)})`
        );

        // Verify the final coordinates are within bounds
        if (
          absoluteX >= iframeBounds.left &&
          absoluteX <= iframeBounds.right &&
          absoluteY >= iframeBounds.top &&
          absoluteY <= iframeBounds.bottom
        ) {
          await page.mouse.click(absoluteX, absoluteY);
          logger.info(
            `✓ Clicked grid position [${row},${col}] at (${absoluteX.toFixed(
              1
            )}, ${absoluteY.toFixed(1)})`
          );

          // Add shorter delay between clicks for faster processing
          await new Promise(
            (resolve) => setTimeout(resolve, 400 + Math.random() * 200) // Reduced from 800 + 400
          );
        } else {
          logger.warn(
            `✗ Grid position [${row},${col}] coordinates out of bounds: (${absoluteX.toFixed(
              1
            )}, ${absoluteY.toFixed(1)})`
          );
        }
      }
    } else {
      // For direct elements, calculate relative to element position
      const element = await page.$(container.selector);
      if (!element) {
        logger.error("Could not find container element");
        return;
      }

      const elementRect = await element.boundingBox();
      if (!elementRect) {
        logger.error("Could not get element bounding box");
        return;
      }

      logger.info(`Element bounds: ${JSON.stringify(elementRect)}`);
      logger.info(
        `Converting grid positions to click coordinates for ${gridSize}x${gridSize} grid`
      );

      // Calculate grid dimensions within the element
      const gridMarginTop = elementRect.height * 0.1;
      const gridMarginBottom = elementRect.height * 0.15;
      const gridMarginSide = elementRect.width * 0.05;

      const gridWidth = elementRect.width - gridMarginSide * 2;
      const gridHeight = elementRect.height - gridMarginTop - gridMarginBottom;

      const cellWidth = gridWidth / gridSize;
      const cellHeight = gridHeight / gridSize;

      // Calculate element bounds for validation
      const elementBounds = {
        left: elementRect.x,
        top: elementRect.y,
        right: elementRect.x + elementRect.width,
        bottom: elementRect.y + elementRect.height
      };

      for (let i = 0; i < gridPositions.length; i++) {
        const [row, col] = gridPositions[i];

        // Validate grid position
        if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
          logger.warn(
            `Invalid grid position [${row},${col}] for ${gridSize}x${gridSize} grid, skipping`
          );
          continue;
        }

        // Calculate the center of the grid cell
        const cellCenterX = gridMarginSide + col * cellWidth + cellWidth / 2;
        const cellCenterY = gridMarginTop + row * cellHeight + cellHeight / 2;

        // Convert to absolute coordinates
        let absoluteX = elementRect.x + cellCenterX;
        let absoluteY = elementRect.y + cellCenterY;

        // Constrain coordinates to element bounds with margin
        const margin = 5;
        absoluteX = Math.max(
          elementBounds.left + margin,
          Math.min(absoluteX, elementBounds.right - margin)
        );
        absoluteY = Math.max(
          elementBounds.top + margin,
          Math.min(absoluteY, elementBounds.bottom - margin)
        );

        logger.info(
          `Grid position [${row},${col}] -> Absolute(${absoluteX.toFixed(
            1
          )}, ${absoluteY.toFixed(1)})`
        );

        await page.mouse.click(absoluteX, absoluteY);
        logger.info(
          `✓ Clicked grid position [${row},${col}] at (${absoluteX.toFixed(
            1
          )}, ${absoluteY.toFixed(1)})`
        );

        // Add shorter delay between clicks for faster processing
        await new Promise(
          (resolve) => setTimeout(resolve, 400 + Math.random() * 200) // Reduced from 800 + 400
        );
      }
    }
  } catch (error) {
    logger.error(`Error clicking captcha grid positions:`, error);
  }
}

async function checkForToken(page) {
  logger.info("Checking for reCAPTCHA token...");

  // Check main page
  let token = await page.evaluate(() => {
    const textarea = document.querySelector(
      'textarea[name="g-recaptcha-response"]'
    );
    return textarea ? textarea.value : null;
  });

  if (token) {
    logger.info("Token found in main page!");
    return token;
  }

  // Check all frames
  const frames = await page.frames();
  for (const frame of frames) {
    try {
      token = await frame.evaluate(() => {
        const textarea = document.querySelector(
          'textarea[name="g-recaptcha-response"]'
        );
        return textarea ? textarea.value : null;
      });

      if (token) {
        logger.info(`Token found in frame: ${frame.url()}`);
        return token;
      }
    } catch {
      // Ignore frame access errors
    }
  }

  return null;
}

async function clickVerifyButton(page, container) {
  logger.info("Looking for verify button...");

  try {
    if (container.type === "frame") {
      // Get iframe information for precise verify button positioning
      const frameInfo = await page.evaluate(() => {
        const frames = document.querySelectorAll("iframe");
        for (const frame of frames) {
          if (
            frame.src.includes("LoginWithCaptcha") ||
            frame.src.includes("recaptcha")
          ) {
            const rect = frame.getBoundingClientRect();
            if (rect.width > 100 && rect.height > 100) {
              return {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                src: frame.src
              };
            }
          }
        }
        return null;
      });

      if (frameInfo) {
        logger.info(
          `Frame info for verify click: ${JSON.stringify(frameInfo)}`
        );

        // Calculate verify button position based on bottom right grid item
        // Use the same grid calculations as in clickCaptchaPositions
        const captchaContainerWidth = 400;
        const captchaContainerPadding =
          (frameInfo.width - captchaContainerWidth) / 2;
        const innerPadding = 8;
        const heroHeight = 125;

        const gridStartX = captchaContainerPadding + innerPadding;
        const gridStartY = heroHeight;

        // Determine grid size and cell properties (assume 3x3 if not specified)
        const gridSize = 3; // Default to 3x3 for verify button calculation
        let cellSize, cellMargin;

        if (gridSize === 3) {
          cellSize = 125;
          cellMargin = 5;
        } else if (gridSize === 4) {
          cellSize = 95;
          cellMargin = 3;
        } else {
          cellSize = 125;
          cellMargin = 5;
        }

        // Calculate bottom right grid item center (position [2,2] for 3x3 or [3,3] for 4x4)
        const bottomRightRow = gridSize - 1;
        const bottomRightCol = gridSize - 1;

        const bottomRightCenterX =
          frameInfo.x +
          gridStartX +
          bottomRightCol * (cellSize + cellMargin) +
          cellSize / 2;
        const bottomRightBottomY =
          frameInfo.y +
          gridStartY +
          bottomRightRow * (cellSize + cellMargin) +
          cellSize; // Bottom edge, not center

        // Verify button is 40px down from the bottom edge of the bottom right grid item
        const verifyButtonX = bottomRightCenterX; // Keep X at center of bottom right cell
        const verifyButtonY = bottomRightBottomY + 40; // 40px down from bottom edge

        logger.info(`Bottom right grid item center X: ${bottomRightCenterX}`);
        logger.info(
          `Bottom right grid item bottom edge Y: ${bottomRightBottomY}`
        );
        logger.info(
          `Verify button position (40px down from bottom edge): (${verifyButtonX}, ${verifyButtonY})`
        );

        try {
          await page.mouse.click(verifyButtonX, verifyButtonY);
          logger.info(
            `✓ Clicked verify button at (${verifyButtonX}, ${verifyButtonY})`
          );

          // Wait a moment to see if click was successful
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Check if token appeared (indicating successful verify)
          const token = await checkForToken(page);
          if (token) {
            logger.info("Verify click successful - token found!");
            return true;
          }

          // Check if captcha state changed (new challenge or completion)
          const captchaChanged = await page.evaluate(() => {
            // Look for signs that verify was successful
            const indicators = [
              ".rc-imageselect-incorrect-response", // Error message
              ".rc-imageselect-error-select-more", // Select more message
              ".rc-imageselect-error-dynamic-more", // Dynamic error
              ".rc-imageselect-progress", // Progress indicator
              ".rc-imageselect-challenge" // New challenge appeared
            ];

            for (const selector of indicators) {
              if (document.querySelector(selector)) {
                console.log("Found captcha state change indicator:", selector);
                return true;
              }
            }

            // Also check if the verify button area has changed
            const frames = document.querySelectorAll("iframe");
            for (const frame of frames) {
              if (
                frame.src.includes("recaptcha") ||
                frame.src.includes("LoginWithCaptcha")
              ) {
                try {
                  const frameDoc =
                    frame.contentDocument || frame.contentWindow.document;
                  if (
                    frameDoc &&
                    frameDoc.querySelector(".rc-imageselect-challenge")
                  ) {
                    console.log("Found new challenge in frame");
                    return true;
                  }
                } catch {
                  // Cross-origin, continue
                }
              }
            }
            return false;
          });

          if (captchaChanged) {
            logger.info("Verify click caused captcha state change");
            return true;
          }

          logger.info("No immediate response from verify button click");
          return false;
        } catch (clickError) {
          logger.error("Error clicking verify button:", clickError.message);
          return false;
        }
      } else {
        logger.error("Could not get frame info for verify button clicking");
        return false;
      }
    } else {
      // For direct elements, look for verify button nearby
      logger.info("Looking for verify button in direct element");

      const element = await page.$(container.selector);
      if (element) {
        const verifyButton = await page.evaluate((elementSelector) => {
          const element = document.querySelector(elementSelector);
          if (!element) return false;

          const verifySelectors = [
            "#recaptcha-verify-button",
            ".rc-button-default",
            'button[type="submit"]',
            ".verify-button",
            'input[type="submit"]',
            'button:contains("Verify")',
            'button:contains("Submit")'
          ];

          // Look for verify button within or near the element
          const container =
            element.closest("form") || element.parentElement || document;

          for (const selector of verifySelectors) {
            const button = container.querySelector(selector);
            if (button && button.offsetParent !== null && !button.disabled) {
              button.click();
              console.log("Clicked verify button:", selector);
              return true;
            }
          }
          return false;
        }, container.selector);

        if (verifyButton) {
          logger.info("Verify button clicked in direct element");
          return true;
        }
      }
    }
  } catch (error) {
    logger.error("Error in verify button clicking:", error.message);
  }

  logger.info("No verify button found or clicked");
  return false;
}

// Function to enhance screenshot with red grid borders
async function enhanceScreenshotWithGridBorders(screenshotPath, gridSize = 3) {
  // Check if Sharp is available
  if (!sharp) {
    logger.warn(
      "Sharp not available - using original screenshot without enhancement"
    );
    return screenshotPath;
  }

  try {
    logger.info(
      `Enhancing screenshot with ${gridSize}x${gridSize} grid borders...`
    );

    const image = sharp(screenshotPath);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    logger.info(`Original image dimensions: ${width}x${height}`);

    // Calculate grid overlay based on the same logic used for clicking
    // These dimensions match the captcha layout from the clicking logic
    const captchaContainerWidth = 400;
    const captchaContainerPadding = Math.max(
      0,
      (width - captchaContainerWidth) / 2
    );
    const innerPadding = 8;
    const heroHeight = 125;

    const gridStartX = captchaContainerPadding + innerPadding;
    const gridStartY = heroHeight;
    const gridAreaWidth = captchaContainerWidth - innerPadding * 2;

    let cellSize, cellMargin;
    if (gridSize === 3) {
      cellSize = 125;
      cellMargin = 5;
    } else if (gridSize === 4) {
      cellSize = 95;
      cellMargin = 3;
    } else {
      // Fallback calculation
      const totalMarginSpace = (gridSize - 1) * 5;
      cellSize = (gridAreaWidth - totalMarginSpace) / gridSize;
      cellMargin = 5;
    }

    logger.info(
      `Grid overlay parameters: startX=${gridStartX}, startY=${gridStartY}, cellSize=${cellSize}, margin=${cellMargin}`
    );

    // Create SVG overlay with red grid borders
    const svgOverlay = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .grid-line { stroke: red; stroke-width: 2; fill: none; opacity: 0.8; }
            .grid-label { fill: red; font-family: Arial; font-size: 14px; font-weight: bold; }
          </style>
        </defs>
        ${Array.from({ length: gridSize + 1 }, (_, i) => {
          const x = gridStartX + i * (cellSize + cellMargin) - cellMargin / 2;
          return `<line class="grid-line" x1="${x}" y1="${gridStartY}" x2="${x}" y2="${
            gridStartY + gridSize * (cellSize + cellMargin) - cellMargin
          }" />`;
        }).join("")}
        ${Array.from({ length: gridSize + 1 }, (_, i) => {
          const y = gridStartY + i * (cellSize + cellMargin) - cellMargin / 2;
          return `<line class="grid-line" x1="${gridStartX}" y1="${y}" x2="${
            gridStartX + gridSize * (cellSize + cellMargin) - cellMargin
          }" y2="${y}" />`;
        }).join("")}
        ${Array.from({ length: gridSize }, (_, row) =>
          Array.from({ length: gridSize }, (_, col) => {
            const x =
              gridStartX + col * (cellSize + cellMargin) + cellSize / 2 - 8;
            const y = gridStartY + row * (cellSize + cellMargin) + 20;
            return `<text class="grid-label" x="${x}" y="${y}">[${row},${col}]</text>`;
          }).join("")
        ).join("")}
      </svg>
    `;

    // Apply the overlay to the image
    const enhancedImageBuffer = await image
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0
        }
      ])
      .png()
      .toBuffer();

    // Save enhanced image
    const enhancedPath = screenshotPath.replace(".png", "_enhanced.png");
    await fs.writeFile(enhancedPath, enhancedImageBuffer);

    logger.info(`Enhanced screenshot saved: ${enhancedPath}`);
    logger.info(`Original screenshot: ${screenshotPath}`);
    logger.info(`Screenshots saved in: ${path.dirname(screenshotPath)}`);
    return enhancedPath;
  } catch (error) {
    logger.error("Error enhancing screenshot:", error);
    return screenshotPath; // Return original if enhancement fails
  }
}

module.exports = generateCaptchaTokensWithVisual;
