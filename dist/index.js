import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
export { InjectPinoLogger, Logger as PinoLogger, PinoLogger as PinoLoggerService } from 'nestjs-pino';
import { Reporter, LoggerModule as LoggerModule$1 } from '@stackra/ts-logger';
export { ConsoleReporter, InjectLogger, InjectLoggerManager, Logger, LoggerManager, LoggerModule, Reporter, SilentReporter, StorageReporter, defineConfig } from '@stackra/ts-logger';

var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (decorator(result)) || result;
  return result;
};
var PinoReporter = class {
  name = "pino";
  _level = 0;
  // LogLevel.Debug
  _pino = null;
  /**
   * Set the shared pino instance (called by NestLoggerModule after nestjs-pino initializes).
   */
  setPino(pino) {
    this._pino = pino;
  }
  /**
   * Get the underlying pino instance.
   */
  getPino() {
    return this._pino;
  }
  /** Deliver a log entry to pino. */
  report(entry) {
    if (!this._pino) return;
    if (entry.level < this._level) return;
    const obj = { timestamp: entry.timestamp, ...entry.context };
    switch (entry.level) {
      case 4:
        this._pino.fatal(obj, entry.message);
        break;
      case 3:
        this._pino.error(obj, entry.message);
        break;
      case 2:
        this._pino.warn(obj, entry.message);
        break;
      case 1:
        this._pino.info(obj, entry.message);
        break;
      case 0:
        this._pino.debug(obj, entry.message);
        break;
      default:
        this._pino.info(obj, entry.message);
    }
  }
  /** Flush pino buffers. */
  flush() {
    this._pino?.flush();
  }
  getLevel() {
    return this._level;
  }
  setLevel(level) {
    this._level = level;
  }
};
PinoReporter = __decorateClass([
  Reporter({ name: "pino" })
], PinoReporter);

// src/nest-logger.module.ts
var NestLoggerModule = class {
  /**
   * Configure unified logging with pino.
   *
   * Sets up:
   * 1. `nestjs-pino` — NestJS LoggerService + request logging middleware
   * 2. `@stackra/ts-logger` LoggerModule — channel-based application logging
   * 3. PinoReporter bridge — connects ts-logger to the same pino instance
   */
  static forRoot(options = {}) {
    const {
      pretty,
      level = "info",
      global: isGlobal = true,
      channels = ["default"],
      pinoParams
    } = options;
    const isDev = typeof process !== "undefined" ? process.env.NODE_ENV !== "production" : false;
    const usePretty = pretty ?? isDev;
    const resolvedPinoParams = pinoParams ?? {
      pinoHttp: {
        level,
        ...usePretty ? {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss.l",
              ignore: "pid,hostname"
            }
          }
        } : {}
      }
    };
    const channelConfig = {};
    for (const name of channels) {
      channelConfig[name] = {};
    }
    const pinoReporter = new PinoReporter();
    return {
      module: NestLoggerModule,
      global: isGlobal,
      imports: [
        // nestjs-pino handles NestJS LoggerService + request logging
        LoggerModule.forRoot(resolvedPinoParams),
        // @stackra/ts-logger handles application-level logging
        LoggerModule$1.forRoot({
          default: channels[0] ?? "default",
          channels: channelConfig
        })
      ],
      providers: [{ provide: PinoReporter, useValue: pinoReporter }],
      exports: [PinoReporter]
    };
  }
};
NestLoggerModule = __decorateClass([
  Module({})
], NestLoggerModule);

export { NestLoggerModule, PinoReporter };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map