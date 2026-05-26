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

import { Module, type DynamicModule } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { LoggerModule } from '@stackra/ts-logger';
import type { Params as NestjsPinoParams } from 'nestjs-pino';
import { PinoReporter } from './reporters';

/**
 * Options for NestLoggerModule.forRoot().
 */
export interface INestLoggerModuleOptions {
  /** Use pino-pretty for development output. @default auto-detected from NODE_ENV */
  pretty?: boolean;

  /** Log level. @default 'info' */
  level?: string;

  /** Whether to register as a global module. @default true */
  global?: boolean;

  /** Additional channel names for @stackra/ts-logger. @default ['default'] */
  channels?: string[];

  /** Custom nestjs-pino params (overrides pretty/level if provided). */
  pinoParams?: NestjsPinoParams;
}

/**
 * Unified NestJS logging module.
 */
@Module({})
export class NestLoggerModule {
  /**
   * Configure unified logging with pino.
   *
   * Sets up:
   * 1. `nestjs-pino` — NestJS LoggerService + request logging middleware
   * 2. `@stackra/ts-logger` LoggerModule — channel-based application logging
   * 3. PinoReporter bridge — connects ts-logger to the same pino instance
   */
  public static forRoot(options: INestLoggerModuleOptions = {}): DynamicModule {
    const {
      pretty,
      level = 'info',
      global: isGlobal = true,
      channels = ['default'],
      pinoParams,
    } = options;

    const isDev = typeof process !== 'undefined' ? process.env.NODE_ENV !== 'production' : false;

    const usePretty = pretty ?? isDev;

    // Build nestjs-pino params
    const resolvedPinoParams: NestjsPinoParams = pinoParams ?? {
      pinoHttp: {
        level,
        ...(usePretty
          ? {
              transport: {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'HH:MM:ss.l',
                  ignore: 'pid,hostname',
                },
              },
            }
          : {}),
      },
    };

    // Build ts-logger channel config
    const channelConfig: Record<string, object> = {};
    for (const name of channels) {
      channelConfig[name] = {};
    }

    const pinoReporter = new PinoReporter();

    return {
      module: NestLoggerModule,
      global: isGlobal,
      imports: [
        // nestjs-pino handles NestJS LoggerService + request logging
        PinoLoggerModule.forRoot(resolvedPinoParams),
        // @stackra/ts-logger handles application-level logging
        LoggerModule.forRoot({
          default: channels[0] ?? 'default',
          channels: channelConfig,
        }) as unknown as DynamicModule,
      ],
      providers: [{ provide: PinoReporter, useValue: pinoReporter }],
      exports: [PinoReporter],
    };
  }
}
