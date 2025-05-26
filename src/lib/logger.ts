export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5
}

interface LoggerConfig {
  level: LogLevel;
  enabledModules: string[];
  disabledModules: string[];
}

class Logger {
  private config: LoggerConfig;

  constructor() {
    // Default configuration - can be overridden
    this.config = {
      level: this.getLogLevelFromEnv(),
      enabledModules: [],
      disabledModules: []
    };
  }

  private getLogLevelFromEnv(): LogLevel {
    if (typeof window === "undefined") return LogLevel.WARN; // Server-side default

    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case "NONE":
        return LogLevel.NONE;
      case "ERROR":
        return LogLevel.ERROR;
      case "WARN":
        return LogLevel.WARN;
      case "INFO":
        return LogLevel.INFO;
      case "DEBUG":
        return LogLevel.DEBUG;
      case "TRACE":
        return LogLevel.TRACE;
      default:
        return LogLevel.WARN; // Default level
    }
  }

  setLevel(level: LogLevel) {
    this.config.level = level;
  }

  enableModule(module: string) {
    if (!this.config.enabledModules.includes(module)) {
      this.config.enabledModules.push(module);
    }
  }

  disableModule(module: string) {
    if (!this.config.disabledModules.includes(module)) {
      this.config.disabledModules.push(module);
    }
  }

  private shouldLog(level: LogLevel, module?: string): boolean {
    // Check log level
    if (level > this.config.level) return false;

    // Check module filters
    if (module) {
      if (this.config.disabledModules.includes(module)) return false;
      if (
        this.config.enabledModules.length > 0 &&
        !this.config.enabledModules.includes(module)
      )
        return false;
    }

    return true;
  }

  private formatMessage(
    level: string,
    module: string | undefined,
    message: string
  ): string {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    const moduleStr = module ? `[${module}]` : "";
    return `${timestamp} ${level} ${moduleStr} ${message}`;
  }

  error(message: string, ...args: unknown[]): void;
  error(module: string, message: string, ...args: unknown[]): void;
  error(
    moduleOrMessage: string,
    messageOrFirstArg?: string,
    ...args: unknown[]
  ): void {
    const { module, message, restArgs } = this.parseArgs(
      moduleOrMessage,
      messageOrFirstArg,
      args
    );
    if (this.shouldLog(LogLevel.ERROR, module)) {
      console.error(this.formatMessage("ERROR", module, message), ...restArgs);
    }
  }

  warn(message: string, ...args: unknown[]): void;
  warn(module: string, message: string, ...args: unknown[]): void;
  warn(
    moduleOrMessage: string,
    messageOrFirstArg?: string,
    ...args: unknown[]
  ): void {
    const { module, message, restArgs } = this.parseArgs(
      moduleOrMessage,
      messageOrFirstArg,
      args
    );
    if (this.shouldLog(LogLevel.WARN, module)) {
      console.warn(this.formatMessage("WARN", module, message), ...restArgs);
    }
  }

  info(message: string, ...args: unknown[]): void;
  info(module: string, message: string, ...args: unknown[]): void;
  info(
    moduleOrMessage: string,
    messageOrFirstArg?: string,
    ...args: unknown[]
  ): void {
    const { module, message, restArgs } = this.parseArgs(
      moduleOrMessage,
      messageOrFirstArg,
      args
    );
    if (this.shouldLog(LogLevel.INFO, module)) {
      console.info(this.formatMessage("INFO", module, message), ...restArgs);
    }
  }

  debug(message: string, ...args: unknown[]): void;
  debug(module: string, message: string, ...args: unknown[]): void;
  debug(
    moduleOrMessage: string,
    messageOrFirstArg?: string,
    ...args: unknown[]
  ): void {
    const { module, message, restArgs } = this.parseArgs(
      moduleOrMessage,
      messageOrFirstArg,
      args
    );
    if (this.shouldLog(LogLevel.DEBUG, module)) {
      console.debug(this.formatMessage("DEBUG", module, message), ...restArgs);
    }
  }

  trace(message: string, ...args: unknown[]): void;
  trace(module: string, message: string, ...args: unknown[]): void;
  trace(
    moduleOrMessage: string,
    messageOrFirstArg?: string,
    ...args: unknown[]
  ): void {
    const { module, message, restArgs } = this.parseArgs(
      moduleOrMessage,
      messageOrFirstArg,
      args
    );
    if (this.shouldLog(LogLevel.TRACE, module)) {
      console.trace(this.formatMessage("TRACE", module, message), ...restArgs);
    }
  }

  private parseArgs(
    moduleOrMessage: string,
    messageOrFirstArg?: string,
    args: unknown[] = []
  ) {
    if (messageOrFirstArg === undefined) {
      // Single argument - it's the message
      return { module: undefined, message: moduleOrMessage, restArgs: args };
    } else {
      // Two or more arguments - first is module, second is message
      return {
        module: moduleOrMessage,
        message: messageOrFirstArg,
        restArgs: args
      };
    }
  }

  // Utility methods for common logging patterns
  group(label: string, module?: string): void {
    if (this.shouldLog(LogLevel.DEBUG, module)) {
      console.group(this.formatMessage("GROUP", module, label));
    }
  }

  groupEnd(): void {
    if (this.config.level >= LogLevel.DEBUG) {
      console.groupEnd();
    }
  }

  table(data: unknown, module?: string): void {
    if (this.shouldLog(LogLevel.DEBUG, module)) {
      if (module) {
        console.log(this.formatMessage("TABLE", module, "Data:"));
      }
      console.table(data);
    }
  }
}

// Create singleton instance
export const logger = new Logger();

// Export convenience functions for common modules
export const deckLogger = {
  error: (message: string, ...args: unknown[]) =>
    logger.error("DECK", message, ...args),
  warn: (message: string, ...args: unknown[]) =>
    logger.warn("DECK", message, ...args),
  info: (message: string, ...args: unknown[]) =>
    logger.info("DECK", message, ...args),
  debug: (message: string, ...args: unknown[]) =>
    logger.debug("DECK", message, ...args),
  trace: (message: string, ...args: unknown[]) =>
    logger.trace("DECK", message, ...args),
  group: (label: string) => logger.group(label, "DECK"),
  groupEnd: () => logger.groupEnd(),
  table: (data: unknown) => logger.table(data, "DECK")
};

export const gridLogger = {
  error: (message: string, ...args: unknown[]) =>
    logger.error("GRID", message, ...args),
  warn: (message: string, ...args: unknown[]) =>
    logger.warn("GRID", message, ...args),
  info: (message: string, ...args: unknown[]) =>
    logger.info("GRID", message, ...args),
  debug: (message: string, ...args: unknown[]) =>
    logger.debug("GRID", message, ...args),
  trace: (message: string, ...args: unknown[]) =>
    logger.trace("GRID", message, ...args),
  group: (label: string) => logger.group(label, "GRID"),
  groupEnd: () => logger.groupEnd(),
  table: (data: unknown) => logger.table(data, "GRID")
};

export const uiLogger = {
  error: (message: string, ...args: unknown[]) =>
    logger.error("UI", message, ...args),
  warn: (message: string, ...args: unknown[]) =>
    logger.warn("UI", message, ...args),
  info: (message: string, ...args: unknown[]) =>
    logger.info("UI", message, ...args),
  debug: (message: string, ...args: unknown[]) =>
    logger.debug("UI", message, ...args),
  trace: (message: string, ...args: unknown[]) =>
    logger.trace("UI", message, ...args),
  group: (label: string) => logger.group(label, "UI"),
  groupEnd: () => logger.groupEnd(),
  table: (data: unknown) => logger.table(data, "UI")
};
