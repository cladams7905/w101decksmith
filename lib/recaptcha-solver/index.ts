// TypeScript wrapper for our custom recaptcha solver
// eslint-disable-next-line @typescript-eslint/no-require-imports
const generateCaptchaTokensWithVisual = require("./generateCaptchaTokensWithVisual");

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface BeforeSolvingCallback {
  (page: unknown, credentials: LoginCredentials): Promise<boolean>;
}

export interface RecaptchaSolverConfig {
  eventEmitter: unknown;
  tokensToGenerate?: number;
  captchaUrl: string;
  existingPage: unknown; // The existing Puppeteer page instance
  gemini: {
    apiKey: string;
    model?: string;
  };
  logger?: {
    level: string;
  };
  beforeSolving?: BeforeSolvingCallback;
  loginCredentials?: LoginCredentials;
}

export async function generateTokensWithLogin(
  config: RecaptchaSolverConfig
): Promise<unknown> {
  return generateCaptchaTokensWithVisual(config);
}
