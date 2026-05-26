'use strict';

var common = require('@nestjs/common');
var nestjsPino = require('nestjs-pino');
var tsLogger = require('@stackra/ts-logger');

var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (decorator(result)) || result;
  return result;
};
exports.PinoReporter = class PinoReporter {
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
exports.PinoReporter = __decorateClass([
  tsLogger.Reporter({ name: "pino" })
], exports.PinoReporter);

// src/nest-logger.module.ts
exports.NestLoggerModule = class NestLoggerModule {
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
    const pinoReporter = new exports.PinoReporter();
    return {
      module: exports.NestLoggerModule,
      global: isGlobal,
      imports: [
        // nestjs-pino handles NestJS LoggerService + request logging
        nestjsPino.LoggerModule.forRoot(resolvedPinoParams),
        // @stackra/ts-logger handles application-level logging
        tsLogger.LoggerModule.forRoot({
          default: channels[0] ?? "default",
          channels: channelConfig
        })
      ],
      providers: [{ provide: exports.PinoReporter, useValue: pinoReporter }],
      exports: [exports.PinoReporter]
    };
  }
};
exports.NestLoggerModule = __decorateClass([
  common.Module({})
], exports.NestLoggerModule);

Object.defineProperty(exports, "InjectPinoLogger", {
  enumerable: true,
  get: function () { return nestjsPino.InjectPinoLogger; }
});
Object.defineProperty(exports, "PinoLogger", {
  enumerable: true,
  get: function () { return nestjsPino.Logger; }
});
Object.defineProperty(exports, "PinoLoggerService", {
  enumerable: true,
  get: function () { return nestjsPino.PinoLogger; }
});
Object.defineProperty(exports, "ConsoleReporter", {
  enumerable: true,
  get: function () { return tsLogger.ConsoleReporter; }
});
Object.defineProperty(exports, "InjectLogger", {
  enumerable: true,
  get: function () { return tsLogger.InjectLogger; }
});
Object.defineProperty(exports, "InjectLoggerManager", {
  enumerable: true,
  get: function () { return tsLogger.InjectLoggerManager; }
});
Object.defineProperty(exports, "Logger", {
  enumerable: true,
  get: function () { return tsLogger.Logger; }
});
Object.defineProperty(exports, "LoggerManager", {
  enumerable: true,
  get: function () { return tsLogger.LoggerManager; }
});
Object.defineProperty(exports, "LoggerModule", {
  enumerable: true,
  get: function () { return tsLogger.LoggerModule; }
});
Object.defineProperty(exports, "Reporter", {
  enumerable: true,
  get: function () { return tsLogger.Reporter; }
});
Object.defineProperty(exports, "SilentReporter", {
  enumerable: true,
  get: function () { return tsLogger.SilentReporter; }
});
Object.defineProperty(exports, "StorageReporter", {
  enumerable: true,
  get: function () { return tsLogger.StorageReporter; }
});
Object.defineProperty(exports, "defineConfig", {
  enumerable: true,
  get: function () { return tsLogger.defineConfig; }
});
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map