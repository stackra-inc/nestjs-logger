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

import type { Logger as PinoLogger } from 'pino';
import { Reporter } from '@stackra/ts-logger';

/**
 * ILogReporter-compatible reporter that delegates to a shared pino instance.
 *
 * The pino instance is injected after module init (set by NestLoggerModule).
 */
@Reporter({ name: 'pino' })
export class PinoReporter {
  public readonly name = 'pino';
  private _level = 0; // LogLevel.Debug
  private _pino: PinoLogger | null = null;

  /**
   * Set the shared pino instance (called by NestLoggerModule after nestjs-pino initializes).
   */
  public setPino(pino: PinoLogger): void {
    this._pino = pino;
  }

  /**
   * Get the underlying pino instance.
   */
  public getPino(): PinoLogger | null {
    return this._pino;
  }

  /** Deliver a log entry to pino. */
  public report(entry: {
    level: number;
    message: string;
    context?: Record<string, unknown>;
    timestamp: string;
  }): void {
    if (!this._pino) return;
    if (entry.level < this._level) return;

    const obj = { timestamp: entry.timestamp, ...entry.context };

    switch (entry.level) {
      case 4: // Fatal
        this._pino.fatal(obj, entry.message);
        break;
      case 3: // Error
        this._pino.error(obj, entry.message);
        break;
      case 2: // Warn
        this._pino.warn(obj, entry.message);
        break;
      case 1: // Info
        this._pino.info(obj, entry.message);
        break;
      case 0: // Debug
        this._pino.debug(obj, entry.message);
        break;
      default:
        this._pino.info(obj, entry.message);
    }
  }

  /** Flush pino buffers. */
  public flush(): void {
    this._pino?.flush();
  }

  public getLevel(): number {
    return this._level;
  }

  public setLevel(level: number): void {
    this._level = level;
  }
}
