/**
 * @stackra/nestjs-logger
 *
 * Unified NestJS logging — wraps nestjs-pino for NestJS internals and
 * bridges into @stackra/ts-logger for application logging. One pino
 * instance, one config, one output format.
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

// ============================================================================
// NestJS Module
// ============================================================================
export { NestLoggerModule, type INestLoggerModuleOptions } from './nest-logger.module';

// ============================================================================
// Pino Reporter (bridge between nestjs-pino and @stackra/ts-logger)
// ============================================================================
export { PinoReporter } from './reporters';

// ============================================================================
// Re-export nestjs-pino's Logger for app.useLogger()
// ============================================================================
export {
  Logger as PinoLogger,
  InjectPinoLogger,
  PinoLogger as PinoLoggerService,
} from 'nestjs-pino';

// ============================================================================
// Re-export @stackra/ts-logger for application logging
// ============================================================================
export {
  Logger,
  LoggerModule,
  LoggerManager,
  Reporter,
  InjectLogger,
  InjectLoggerManager,
  ConsoleReporter,
  SilentReporter,
  StorageReporter,
  defineConfig,
} from '@stackra/ts-logger';
