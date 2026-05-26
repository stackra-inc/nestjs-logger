import { DynamicModule } from '@nestjs/common';
import { Params } from 'nestjs-pino';
export { InjectPinoLogger, Logger as PinoLogger, PinoLogger as PinoLoggerService } from 'nestjs-pino';
import { Logger } from 'pino';
export { ConsoleReporter, InjectLogger, InjectLoggerManager, Logger, LoggerManager, LoggerModule, Reporter, SilentReporter, StorageReporter, defineConfig } from '@stackra/ts-logger';

/**
 * NestLoggerModule — unified logging for NestJS applications.
 *
 * Wraps `nestjs-pino` (for NestJS LoggerService + request logging) and
 * bridges the same pino instance into `@stackra/ts-logger` via PinoReporter.
 *
 * Result: one pino config, one output format for BOTH:
 * - NestJS internal logs (bootstrap, route registration, errors)
 * - Application logs via `new Logger('Context')` from @stackra/ts-logger
 *
 * @module @stackra/nestjs-logger
 *
 * @example
 * ```typescript
 * import { NestFactory } from '@nestjs/core';
 * import { Logger } from 'nestjs-pino';
 * import { NestLoggerModule } from '@stackra/nestjs-logger';
 *
 * @Module({
 *   imports: [NestLoggerModule.forRoot({ pretty: true })],
 * })
 * class AppModule {}
 *
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule, { bufferLogs: true });
 *   app.useLogger(app.get(Logger));
 *   await app.listen(3000);
 * }
 * ```
 */

/**
 * Options for NestLoggerModule.forRoot().
 */
interface INestLoggerModuleOptions {
    /** Use pino-pretty for development output. @default auto-detected from NODE_ENV */
    pretty?: boolean;
    /** Log level. @default 'info' */
    level?: string;
    /** Whether to register as a global module. @default true */
    global?: boolean;
    /** Additional channel names for @stackra/ts-logger. @default ['default'] */
    channels?: string[];
    /** Custom nestjs-pino params (overrides pretty/level if provided). */
    pinoParams?: Params;
}
/**
 * Unified NestJS logging module.
 */
declare class NestLoggerModule {
    /**
     * Configure unified logging with pino.
     *
     * Sets up:
     * 1. `nestjs-pino` — NestJS LoggerService + request logging middleware
     * 2. `@stackra/ts-logger` LoggerModule — channel-based application logging
     * 3. PinoReporter bridge — connects ts-logger to the same pino instance
     */
    static forRoot(options?: INestLoggerModuleOptions): DynamicModule;
}

/**
 * PinoReporter — bridges nestjs-pino's pino instance into @stackra/ts-logger.
 *
 * Takes the pino Logger instance created by nestjs-pino and uses it
 * as the transport for @stackra/ts-logger entries. This means both
 * NestJS internal logs AND application logs (via `new Logger('Context')`)
 * go through the same pino instance with the same config.
 *
 * @module @stackra/nestjs-logger/reporters
 */

/**
 * ILogReporter-compatible reporter that delegates to a shared pino instance.
 *
 * The pino instance is injected after module init (set by NestLoggerModule).
 */
declare class PinoReporter {
    readonly name = "pino";
    private _level;
    private _pino;
    /**
     * Set the shared pino instance (called by NestLoggerModule after nestjs-pino initializes).
     */
    setPino(pino: Logger): void;
    /**
     * Get the underlying pino instance.
     */
    getPino(): Logger | null;
    /** Deliver a log entry to pino. */
    report(entry: {
        level: number;
        message: string;
        context?: Record<string, unknown>;
        timestamp: string;
    }): void;
    /** Flush pino buffers. */
    flush(): void;
    getLevel(): number;
    setLevel(level: number): void;
}

export { type INestLoggerModuleOptions, NestLoggerModule, PinoReporter };
