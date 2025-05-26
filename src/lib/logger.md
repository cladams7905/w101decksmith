# Logger System

This project includes a configurable logging system that allows you to control log levels and filter by modules.

## Configuration

### Environment Variable

Set the log level using the `NEXT_PUBLIC_LOG_LEVEL` environment variable in your `.env.local` file:

```bash
# Set log level (NONE, ERROR, WARN, INFO, DEBUG, TRACE)
NEXT_PUBLIC_LOG_LEVEL=DEBUG
```

### Log Levels

- `NONE` (0): No logging
- `ERROR` (1): Only errors
- `WARN` (2): Warnings and errors
- `INFO` (3): Info, warnings, and errors
- `DEBUG` (4): Debug, info, warnings, and errors
- `TRACE` (5): All logging including traces

## Usage

### Basic Logging

```typescript
import { logger } from "@/lib/logger";

logger.error("Something went wrong");
logger.warn("This is a warning");
logger.info("Information message");
logger.debug("Debug information");
logger.trace("Trace information");
```

### Module-Specific Logging

```typescript
import { deckLogger, gridLogger, uiLogger } from "@/lib/logger";

// These automatically include the module name in logs
deckLogger.debug("Deck operation completed");
gridLogger.info("Grid state updated");
uiLogger.warn("UI component warning");
```

### Advanced Features

```typescript
// Grouped logging
logger.group("Operation Name");
logger.debug("Step 1");
logger.debug("Step 2");
logger.groupEnd();

// Table logging for data structures
logger.table(someDataArray);
```

### Runtime Configuration

```typescript
import { logger, LogLevel } from "@/lib/logger";

// Change log level at runtime
logger.setLevel(LogLevel.DEBUG);

// Enable specific modules only
logger.enableModule("DECK");
logger.enableModule("GRID");

// Disable specific modules
logger.disableModule("UI");
```

## Current Modules

- `DECK`: Deck operations and state management
- `GRID`: Grid operations and multi-slot handling
- `UI`: User interface components and interactions

## Examples

### Development (see all logs)

```bash
NEXT_PUBLIC_LOG_LEVEL=DEBUG
```

### Production (errors only)

```bash
NEXT_PUBLIC_LOG_LEVEL=ERROR
```

### Debugging specific issues

```bash
NEXT_PUBLIC_LOG_LEVEL=TRACE
```

The logger automatically formats messages with timestamps and module names for easy debugging.
