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
    existingPage: unknown;
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
export declare function generateTokensWithLogin(config: RecaptchaSolverConfig): Promise<unknown>;
