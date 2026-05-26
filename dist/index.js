import { Module as Module$1 } from '@nestjs/common';
import { LoggerModule as LoggerModule$1 } from 'nestjs-pino';
export { InjectPinoLogger, Logger as PinoLogger, PinoLogger as PinoLoggerService } from 'nestjs-pino';
import { createContext } from 'react';
import { defineMetadata, getMetadata, updateMetadata } from '@vivtel/metadata';

var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (decorator(result)) || result;
  return result;
};

// node_modules/.pnpm/consola@3.4.2/node_modules/consola/dist/core.mjs
var LogLevels = {
  fatal: 0,
  error: 0,
  warn: 1,
  log: 2,
  info: 3,
  success: 3,
  fail: 3,
  debug: 4,
  trace: 5,
  verbose: Number.POSITIVE_INFINITY
};
var LogTypes = {
  // Silent
  silent: {
    level: -1
  },
  // Level 0
  fatal: {
    level: LogLevels.fatal
  },
  error: {
    level: LogLevels.error
  },
  // Level 1
  warn: {
    level: LogLevels.warn
  },
  // Level 2
  log: {
    level: LogLevels.log
  },
  // Level 3
  info: {
    level: LogLevels.info
  },
  success: {
    level: LogLevels.success
  },
  fail: {
    level: LogLevels.fail
  },
  ready: {
    level: LogLevels.info
  },
  start: {
    level: LogLevels.info
  },
  box: {
    level: LogLevels.info
  },
  // Level 4
  debug: {
    level: LogLevels.debug
  },
  // Level 5
  trace: {
    level: LogLevels.trace
  },
  // Verbose
  verbose: {
    level: LogLevels.verbose
  }
};
function isPlainObject$1(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}
function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject$1(defaults)) {
    return _defu(baseObject, {}, namespace);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject$1(value) && isPlainObject$1(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString());
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, ""), {})
  );
}
var defu = createDefu();
function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}
function isLogObj(arg) {
  if (!isPlainObject(arg)) {
    return false;
  }
  if (!arg.message && !arg.args) {
    return false;
  }
  if (arg.stack) {
    return false;
  }
  return true;
}
var paused = false;
var queue = [];
var Consola = class _Consola {
  options;
  _lastLog;
  _mockFn;
  /**
   * Creates an instance of Consola with specified options or defaults.
   *
   * @param {Partial<ConsolaOptions>} [options={}] - Configuration options for the Consola instance.
   */
  constructor(options = {}) {
    const types = options.types || LogTypes;
    this.options = defu(
      {
        ...options,
        defaults: { ...options.defaults },
        level: _normalizeLogLevel(options.level, types),
        reporters: [...options.reporters || []]
      },
      {
        types: LogTypes,
        throttle: 1e3,
        throttleMin: 5,
        formatOptions: {
          date: true,
          colors: false,
          compact: true
        }
      }
    );
    for (const type in types) {
      const defaults = {
        type,
        ...this.options.defaults,
        ...types[type]
      };
      this[type] = this._wrapLogFn(defaults);
      this[type].raw = this._wrapLogFn(
        defaults,
        true
      );
    }
    if (this.options.mockFn) {
      this.mockTypes();
    }
    this._lastLog = {};
  }
  /**
   * Gets the current log level of the Consola instance.
   *
   * @returns {number} The current log level.
   */
  get level() {
    return this.options.level;
  }
  /**
   * Sets the minimum log level that will be output by the instance.
   *
   * @param {number} level - The new log level to set.
   */
  set level(level) {
    this.options.level = _normalizeLogLevel(
      level,
      this.options.types,
      this.options.level
    );
  }
  /**
   * Displays a prompt to the user and returns the response.
   * Throw an error if `prompt` is not supported by the current configuration.
   *
   * @template T
   * @param {string} message - The message to display in the prompt.
   * @param {T} [opts] - Optional options for the prompt. See {@link PromptOptions}.
   * @returns {promise<T>} A promise that infer with the prompt options. See {@link PromptOptions}.
   */
  prompt(message, opts) {
    if (!this.options.prompt) {
      throw new Error("prompt is not supported!");
    }
    return this.options.prompt(message, opts);
  }
  /**
   * Creates a new instance of Consola, inheriting options from the current instance, with possible overrides.
   *
   * @param {Partial<ConsolaOptions>} options - Optional overrides for the new instance. See {@link ConsolaOptions}.
   * @returns {ConsolaInstance} A new Consola instance. See {@link ConsolaInstance}.
   */
  create(options) {
    const instance = new _Consola({
      ...this.options,
      ...options
    });
    if (this._mockFn) {
      instance.mockTypes(this._mockFn);
    }
    return instance;
  }
  /**
   * Creates a new Consola instance with the specified default log object properties.
   *
   * @param {InputLogObject} defaults - Default properties to include in any log from the new instance. See {@link InputLogObject}.
   * @returns {ConsolaInstance} A new Consola instance. See {@link ConsolaInstance}.
   */
  withDefaults(defaults) {
    return this.create({
      ...this.options,
      defaults: {
        ...this.options.defaults,
        ...defaults
      }
    });
  }
  /**
   * Creates a new Consola instance with a specified tag, which will be included in every log.
   *
   * @param {string} tag - The tag to include in each log of the new instance.
   * @returns {ConsolaInstance} A new Consola instance. See {@link ConsolaInstance}.
   */
  withTag(tag) {
    return this.withDefaults({
      tag: this.options.defaults.tag ? this.options.defaults.tag + ":" + tag : tag
    });
  }
  /**
   * Adds a custom reporter to the Consola instance.
   * Reporters will be called for each log message, depending on their implementation and log level.
   *
   * @param {ConsolaReporter} reporter - The reporter to add. See {@link ConsolaReporter}.
   * @returns {Consola} The current Consola instance.
   */
  addReporter(reporter) {
    this.options.reporters.push(reporter);
    return this;
  }
  /**
   * Removes a custom reporter from the Consola instance.
   * If no reporter is specified, all reporters will be removed.
   *
   * @param {ConsolaReporter} reporter - The reporter to remove. See {@link ConsolaReporter}.
   * @returns {Consola} The current Consola instance.
   */
  removeReporter(reporter) {
    if (reporter) {
      const i = this.options.reporters.indexOf(reporter);
      if (i !== -1) {
        return this.options.reporters.splice(i, 1);
      }
    } else {
      this.options.reporters.splice(0);
    }
    return this;
  }
  /**
   * Replaces all reporters of the Consola instance with the specified array of reporters.
   *
   * @param {ConsolaReporter[]} reporters - The new reporters to set. See {@link ConsolaReporter}.
   * @returns {Consola} The current Consola instance.
   */
  setReporters(reporters) {
    this.options.reporters = Array.isArray(reporters) ? reporters : [reporters];
    return this;
  }
  wrapAll() {
    this.wrapConsole();
    this.wrapStd();
  }
  restoreAll() {
    this.restoreConsole();
    this.restoreStd();
  }
  /**
   * Overrides console methods with Consola logging methods for consistent logging.
   */
  wrapConsole() {
    for (const type in this.options.types) {
      if (!console["__" + type]) {
        console["__" + type] = console[type];
      }
      console[type] = this[type].raw;
    }
  }
  /**
   * Restores the original console methods, removing Consola overrides.
   */
  restoreConsole() {
    for (const type in this.options.types) {
      if (console["__" + type]) {
        console[type] = console["__" + type];
        delete console["__" + type];
      }
    }
  }
  /**
   * Overrides standard output and error streams to redirect them through Consola.
   */
  wrapStd() {
    this._wrapStream(this.options.stdout, "log");
    this._wrapStream(this.options.stderr, "log");
  }
  _wrapStream(stream, type) {
    if (!stream) {
      return;
    }
    if (!stream.__write) {
      stream.__write = stream.write;
    }
    stream.write = (data) => {
      this[type].raw(String(data).trim());
    };
  }
  /**
   * Restores the original standard output and error streams, removing the Consola redirection.
   */
  restoreStd() {
    this._restoreStream(this.options.stdout);
    this._restoreStream(this.options.stderr);
  }
  _restoreStream(stream) {
    if (!stream) {
      return;
    }
    if (stream.__write) {
      stream.write = stream.__write;
      delete stream.__write;
    }
  }
  /**
   * Pauses logging, queues incoming logs until resumed.
   */
  pauseLogs() {
    paused = true;
  }
  /**
   * Resumes logging, processing any queued logs.
   */
  resumeLogs() {
    paused = false;
    const _queue = queue.splice(0);
    for (const item of _queue) {
      item[0]._logFn(item[1], item[2]);
    }
  }
  /**
   * Replaces logging methods with mocks if a mock function is provided.
   *
   * @param {ConsolaOptions["mockFn"]} mockFn - The function to use for mocking logging methods. See {@link ConsolaOptions["mockFn"]}.
   */
  mockTypes(mockFn) {
    const _mockFn = mockFn || this.options.mockFn;
    this._mockFn = _mockFn;
    if (typeof _mockFn !== "function") {
      return;
    }
    for (const type in this.options.types) {
      this[type] = _mockFn(type, this.options.types[type]) || this[type];
      this[type].raw = this[type];
    }
  }
  _wrapLogFn(defaults, isRaw) {
    return (...args) => {
      if (paused) {
        queue.push([this, defaults, args, isRaw]);
        return;
      }
      return this._logFn(defaults, args, isRaw);
    };
  }
  _logFn(defaults, args, isRaw) {
    if ((defaults.level || 0) > this.level) {
      return false;
    }
    const logObj = {
      date: /* @__PURE__ */ new Date(),
      args: [],
      ...defaults,
      level: _normalizeLogLevel(defaults.level, this.options.types)
    };
    if (!isRaw && args.length === 1 && isLogObj(args[0])) {
      Object.assign(logObj, args[0]);
    } else {
      logObj.args = [...args];
    }
    if (logObj.message) {
      logObj.args.unshift(logObj.message);
      delete logObj.message;
    }
    if (logObj.additional) {
      if (!Array.isArray(logObj.additional)) {
        logObj.additional = logObj.additional.split("\n");
      }
      logObj.args.push("\n" + logObj.additional.join("\n"));
      delete logObj.additional;
    }
    logObj.type = typeof logObj.type === "string" ? logObj.type.toLowerCase() : "log";
    logObj.tag = typeof logObj.tag === "string" ? logObj.tag : "";
    const resolveLog = (newLog = false) => {
      const repeated = (this._lastLog.count || 0) - this.options.throttleMin;
      if (this._lastLog.object && repeated > 0) {
        const args2 = [...this._lastLog.object.args];
        if (repeated > 1) {
          args2.push(`(repeated ${repeated} times)`);
        }
        this._log({ ...this._lastLog.object, args: args2 });
        this._lastLog.count = 1;
      }
      if (newLog) {
        this._lastLog.object = logObj;
        this._log(logObj);
      }
    };
    clearTimeout(this._lastLog.timeout);
    const diffTime = this._lastLog.time && logObj.date ? logObj.date.getTime() - this._lastLog.time.getTime() : 0;
    this._lastLog.time = logObj.date;
    if (diffTime < this.options.throttle) {
      try {
        const serializedLog = JSON.stringify([
          logObj.type,
          logObj.tag,
          logObj.args
        ]);
        const isSameLog = this._lastLog.serialized === serializedLog;
        this._lastLog.serialized = serializedLog;
        if (isSameLog) {
          this._lastLog.count = (this._lastLog.count || 0) + 1;
          if (this._lastLog.count > this.options.throttleMin) {
            this._lastLog.timeout = setTimeout(
              resolveLog,
              this.options.throttle
            );
            return;
          }
        }
      } catch {
      }
    }
    resolveLog(true);
  }
  _log(logObj) {
    for (const reporter of this.options.reporters) {
      reporter.log(logObj, {
        options: this.options
      });
    }
  }
};
function _normalizeLogLevel(input, types = {}, defaultLevel = 3) {
  if (input === void 0) {
    return defaultLevel;
  }
  if (typeof input === "number") {
    return input;
  }
  if (types[input] && types[input].level !== void 0) {
    return types[input].level;
  }
  return defaultLevel;
}
Consola.prototype.add = Consola.prototype.addReporter;
Consola.prototype.remove = Consola.prototype.removeReporter;
Consola.prototype.clear = Consola.prototype.removeReporter;
Consola.prototype.withScope = Consola.prototype.withTag;
Consola.prototype.mock = Consola.prototype.mockTypes;
Consola.prototype.pause = Consola.prototype.pauseLogs;
Consola.prototype.resume = Consola.prototype.resumeLogs;
function createConsola(options = {}) {
  return new Consola(options);
}

// node_modules/.pnpm/consola@3.4.2/node_modules/consola/dist/browser.mjs
var BrowserReporter = class {
  options;
  defaultColor;
  levelColorMap;
  typeColorMap;
  constructor(options) {
    this.options = { ...options };
    this.defaultColor = "#7f8c8d";
    this.levelColorMap = {
      0: "#c0392b",
      // Red
      1: "#f39c12",
      // Yellow
      3: "#00BCD4"
      // Cyan
    };
    this.typeColorMap = {
      success: "#2ecc71"
      // Green
    };
  }
  _getLogFn(level) {
    if (level < 1) {
      return console.__error || console.error;
    }
    if (level === 1) {
      return console.__warn || console.warn;
    }
    return console.__log || console.log;
  }
  log(logObj) {
    const consoleLogFn = this._getLogFn(logObj.level);
    const type = logObj.type === "log" ? "" : logObj.type;
    const tag = logObj.tag || "";
    const color = this.typeColorMap[logObj.type] || this.levelColorMap[logObj.level] || this.defaultColor;
    const style = `
      background: ${color};
      border-radius: 0.5em;
      color: white;
      font-weight: bold;
      padding: 2px 0.5em;
    `;
    const badge = `%c${[tag, type].filter(Boolean).join(":")}`;
    if (typeof logObj.args[0] === "string") {
      consoleLogFn(
        `${badge}%c ${logObj.args[0]}`,
        style,
        // Empty string as style resets to default console style
        "",
        ...logObj.args.slice(1)
      );
    } else {
      consoleLogFn(badge, style, ...logObj.args);
    }
  }
};
function createConsola2(options = {}) {
  const consola2 = createConsola({
    reporters: options.reporters || [new BrowserReporter({})],
    prompt(message, options2 = {}) {
      if (options2.type === "confirm") {
        return Promise.resolve(confirm(message));
      }
      return Promise.resolve(prompt(message));
    },
    ...options
  });
  return consola2;
}
createConsola2();

// node_modules/.pnpm/@stackra+ts-logger@https+++codeload.github.com+stackra-inc+ts-logger+tar.gz+7f5afb74800_f40100f1234150dc536a7316a0410e8b/node_modules/@stackra/ts-logger/dist/index.js
var __create = Object.create;
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp2(target, "default", { value: mod, enumerable: true }),
  mod
));
var __decorateClass2 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc2(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = decorator(result) || result;
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
var require_Reflect = __commonJS({
  "node_modules/.pnpm/reflect-metadata@0.2.2/node_modules/reflect-metadata/Reflect.js"() {
    var Reflect2;
    (function(Reflect3) {
      (function(factory) {
        var root = typeof globalThis === "object" ? globalThis : typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : sloppyModeThis();
        var exporter = makeExporter(Reflect3);
        if (typeof root.Reflect !== "undefined") {
          exporter = makeExporter(root.Reflect, exporter);
        }
        factory(exporter, root);
        if (typeof root.Reflect === "undefined") {
          root.Reflect = Reflect3;
        }
        function makeExporter(target, previous) {
          return function(key, value) {
            Object.defineProperty(target, key, { configurable: true, writable: true, value });
            if (previous)
              previous(key, value);
          };
        }
        function functionThis() {
          try {
            return Function("return this;")();
          } catch (_) {
          }
        }
        function indirectEvalThis() {
          try {
            return (void 0, eval)("(function() { return this; })()");
          } catch (_) {
          }
        }
        function sloppyModeThis() {
          return functionThis() || indirectEvalThis();
        }
      })(function(exporter, root) {
        var hasOwn = Object.prototype.hasOwnProperty;
        var supportsSymbol = typeof Symbol === "function";
        var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
        var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
        var supportsCreate = typeof Object.create === "function";
        var supportsProto = { __proto__: [] } instanceof Array;
        var downLevel = !supportsCreate && !supportsProto;
        var HashMap = {
          // create an object in dictionary mode (a.k.a. "slow" mode in v8)
          create: supportsCreate ? function() {
            return MakeDictionary(/* @__PURE__ */ Object.create(null));
          } : supportsProto ? function() {
            return MakeDictionary({ __proto__: null });
          } : function() {
            return MakeDictionary({});
          },
          has: downLevel ? function(map, key) {
            return hasOwn.call(map, key);
          } : function(map, key) {
            return key in map;
          },
          get: downLevel ? function(map, key) {
            return hasOwn.call(map, key) ? map[key] : void 0;
          } : function(map, key) {
            return map[key];
          }
        };
        var functionPrototype = Object.getPrototypeOf(Function);
        var _Map = typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
        var _Set = typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
        var _WeakMap = typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
        var registrySymbol = supportsSymbol ? /* @__PURE__ */ Symbol.for("@reflect-metadata:registry") : void 0;
        var metadataRegistry = GetOrCreateMetadataRegistry();
        var metadataProvider = CreateMetadataProvider(metadataRegistry);
        function decorate(decorators, target, propertyKey, attributes) {
          if (!IsUndefined(propertyKey)) {
            if (!IsArray(decorators))
              throw new TypeError();
            if (!IsObject(target))
              throw new TypeError();
            if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
              throw new TypeError();
            if (IsNull(attributes))
              attributes = void 0;
            propertyKey = ToPropertyKey(propertyKey);
            return DecorateProperty(decorators, target, propertyKey, attributes);
          } else {
            if (!IsArray(decorators))
              throw new TypeError();
            if (!IsConstructor(target))
              throw new TypeError();
            return DecorateConstructor(decorators, target);
          }
        }
        exporter("decorate", decorate);
        function metadata(metadataKey, metadataValue) {
          function decorator(target, propertyKey) {
            if (!IsObject(target))
              throw new TypeError();
            if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
              throw new TypeError();
            OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
          }
          return decorator;
        }
        exporter("metadata", metadata);
        function defineMetadata4(metadataKey, metadataValue, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        exporter("defineMetadata", defineMetadata4);
        function hasMetadata(metadataKey, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryHasMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasMetadata", hasMetadata);
        function hasOwnMetadata2(metadataKey, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasOwnMetadata", hasOwnMetadata2);
        function getMetadata4(metadataKey, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryGetMetadata(metadataKey, target, propertyKey);
        }
        exporter("getMetadata", getMetadata4);
        function getOwnMetadata(metadataKey, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("getOwnMetadata", getOwnMetadata);
        function getMetadataKeys(target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryMetadataKeys(target, propertyKey);
        }
        exporter("getMetadataKeys", getMetadataKeys);
        function getOwnMetadataKeys(target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          return OrdinaryOwnMetadataKeys(target, propertyKey);
        }
        exporter("getOwnMetadataKeys", getOwnMetadataKeys);
        function deleteMetadata(metadataKey, target, propertyKey) {
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          if (!IsObject(target))
            throw new TypeError();
          if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
          var provider = GetMetadataProvider(
            target,
            propertyKey,
            /*Create*/
            false
          );
          if (IsUndefined(provider))
            return false;
          return provider.OrdinaryDeleteMetadata(metadataKey, target, propertyKey);
        }
        exporter("deleteMetadata", deleteMetadata);
        function DecorateConstructor(decorators, target) {
          for (var i = decorators.length - 1; i >= 0; --i) {
            var decorator = decorators[i];
            var decorated = decorator(target);
            if (!IsUndefined(decorated) && !IsNull(decorated)) {
              if (!IsConstructor(decorated))
                throw new TypeError();
              target = decorated;
            }
          }
          return target;
        }
        function DecorateProperty(decorators, target, propertyKey, descriptor) {
          for (var i = decorators.length - 1; i >= 0; --i) {
            var decorator = decorators[i];
            var decorated = decorator(target, propertyKey, descriptor);
            if (!IsUndefined(decorated) && !IsNull(decorated)) {
              if (!IsObject(decorated))
                throw new TypeError();
              descriptor = decorated;
            }
          }
          return descriptor;
        }
        function OrdinaryHasMetadata(MetadataKey, O, P) {
          var hasOwn2 = OrdinaryHasOwnMetadata(MetadataKey, O, P);
          if (hasOwn2)
            return true;
          var parent = OrdinaryGetPrototypeOf(O);
          if (!IsNull(parent))
            return OrdinaryHasMetadata(MetadataKey, parent, P);
          return false;
        }
        function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
          var provider = GetMetadataProvider(
            O,
            P,
            /*Create*/
            false
          );
          if (IsUndefined(provider))
            return false;
          return ToBoolean(provider.OrdinaryHasOwnMetadata(MetadataKey, O, P));
        }
        function OrdinaryGetMetadata(MetadataKey, O, P) {
          var hasOwn2 = OrdinaryHasOwnMetadata(MetadataKey, O, P);
          if (hasOwn2)
            return OrdinaryGetOwnMetadata(MetadataKey, O, P);
          var parent = OrdinaryGetPrototypeOf(O);
          if (!IsNull(parent))
            return OrdinaryGetMetadata(MetadataKey, parent, P);
          return void 0;
        }
        function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
          var provider = GetMetadataProvider(
            O,
            P,
            /*Create*/
            false
          );
          if (IsUndefined(provider))
            return;
          return provider.OrdinaryGetOwnMetadata(MetadataKey, O, P);
        }
        function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
          var provider = GetMetadataProvider(
            O,
            P,
            /*Create*/
            true
          );
          provider.OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P);
        }
        function OrdinaryMetadataKeys(O, P) {
          var ownKeys = OrdinaryOwnMetadataKeys(O, P);
          var parent = OrdinaryGetPrototypeOf(O);
          if (parent === null)
            return ownKeys;
          var parentKeys = OrdinaryMetadataKeys(parent, P);
          if (parentKeys.length <= 0)
            return ownKeys;
          if (ownKeys.length <= 0)
            return parentKeys;
          var set = new _Set();
          var keys = [];
          for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
            var key = ownKeys_1[_i];
            var hasKey = set.has(key);
            if (!hasKey) {
              set.add(key);
              keys.push(key);
            }
          }
          for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
            var key = parentKeys_1[_a];
            var hasKey = set.has(key);
            if (!hasKey) {
              set.add(key);
              keys.push(key);
            }
          }
          return keys;
        }
        function OrdinaryOwnMetadataKeys(O, P) {
          var provider = GetMetadataProvider(
            O,
            P,
            /*create*/
            false
          );
          if (!provider) {
            return [];
          }
          return provider.OrdinaryOwnMetadataKeys(O, P);
        }
        function Type(x) {
          if (x === null)
            return 1;
          switch (typeof x) {
            case "undefined":
              return 0;
            case "boolean":
              return 2;
            case "string":
              return 3;
            case "symbol":
              return 4;
            case "number":
              return 5;
            case "object":
              return x === null ? 1 : 6;
            default:
              return 6;
          }
        }
        function IsUndefined(x) {
          return x === void 0;
        }
        function IsNull(x) {
          return x === null;
        }
        function IsSymbol(x) {
          return typeof x === "symbol";
        }
        function IsObject(x) {
          return typeof x === "object" ? x !== null : typeof x === "function";
        }
        function ToPrimitive(input, PreferredType) {
          switch (Type(input)) {
            case 0:
              return input;
            case 1:
              return input;
            case 2:
              return input;
            case 3:
              return input;
            case 4:
              return input;
            case 5:
              return input;
          }
          var hint = "string";
          var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
          if (exoticToPrim !== void 0) {
            var result = exoticToPrim.call(input, hint);
            if (IsObject(result))
              throw new TypeError();
            return result;
          }
          return OrdinaryToPrimitive(input);
        }
        function OrdinaryToPrimitive(O, hint) {
          var valueOf, result;
          {
            var toString_1 = O.toString;
            if (IsCallable(toString_1)) {
              var result = toString_1.call(O);
              if (!IsObject(result))
                return result;
            }
            var valueOf = O.valueOf;
            if (IsCallable(valueOf)) {
              var result = valueOf.call(O);
              if (!IsObject(result))
                return result;
            }
          }
          throw new TypeError();
        }
        function ToBoolean(argument) {
          return !!argument;
        }
        function ToString(argument) {
          return "" + argument;
        }
        function ToPropertyKey(argument) {
          var key = ToPrimitive(
            argument
          );
          if (IsSymbol(key))
            return key;
          return ToString(key);
        }
        function IsArray(argument) {
          return Array.isArray ? Array.isArray(argument) : argument instanceof Object ? argument instanceof Array : Object.prototype.toString.call(argument) === "[object Array]";
        }
        function IsCallable(argument) {
          return typeof argument === "function";
        }
        function IsConstructor(argument) {
          return typeof argument === "function";
        }
        function IsPropertyKey(argument) {
          switch (Type(argument)) {
            case 3:
              return true;
            case 4:
              return true;
            default:
              return false;
          }
        }
        function SameValueZero(x, y) {
          return x === y || x !== x && y !== y;
        }
        function GetMethod(V, P) {
          var func = V[P];
          if (func === void 0 || func === null)
            return void 0;
          if (!IsCallable(func))
            throw new TypeError();
          return func;
        }
        function GetIterator(obj) {
          var method = GetMethod(obj, iteratorSymbol);
          if (!IsCallable(method))
            throw new TypeError();
          var iterator = method.call(obj);
          if (!IsObject(iterator))
            throw new TypeError();
          return iterator;
        }
        function IteratorValue(iterResult) {
          return iterResult.value;
        }
        function IteratorStep(iterator) {
          var result = iterator.next();
          return result.done ? false : result;
        }
        function IteratorClose(iterator) {
          var f = iterator["return"];
          if (f)
            f.call(iterator);
        }
        function OrdinaryGetPrototypeOf(O) {
          var proto = Object.getPrototypeOf(O);
          if (typeof O !== "function" || O === functionPrototype)
            return proto;
          if (proto !== functionPrototype)
            return proto;
          var prototype = O.prototype;
          var prototypeProto = prototype && Object.getPrototypeOf(prototype);
          if (prototypeProto == null || prototypeProto === Object.prototype)
            return proto;
          var constructor = prototypeProto.constructor;
          if (typeof constructor !== "function")
            return proto;
          if (constructor === O)
            return proto;
          return constructor;
        }
        function CreateMetadataRegistry() {
          var fallback;
          if (!IsUndefined(registrySymbol) && typeof root.Reflect !== "undefined" && !(registrySymbol in root.Reflect) && typeof root.Reflect.defineMetadata === "function") {
            fallback = CreateFallbackProvider(root.Reflect);
          }
          var first;
          var second;
          var rest;
          var targetProviderMap = new _WeakMap();
          var registry = {
            registerProvider,
            getProvider,
            setProvider
          };
          return registry;
          function registerProvider(provider) {
            if (!Object.isExtensible(registry)) {
              throw new Error("Cannot add provider to a frozen registry.");
            }
            switch (true) {
              case fallback === provider:
                break;
              case IsUndefined(first):
                first = provider;
                break;
              case first === provider:
                break;
              case IsUndefined(second):
                second = provider;
                break;
              case second === provider:
                break;
              default:
                if (rest === void 0)
                  rest = new _Set();
                rest.add(provider);
                break;
            }
          }
          function getProviderNoCache(O, P) {
            if (!IsUndefined(first)) {
              if (first.isProviderFor(O, P))
                return first;
              if (!IsUndefined(second)) {
                if (second.isProviderFor(O, P))
                  return first;
                if (!IsUndefined(rest)) {
                  var iterator = GetIterator(rest);
                  while (true) {
                    var next = IteratorStep(iterator);
                    if (!next) {
                      return void 0;
                    }
                    var provider = IteratorValue(next);
                    if (provider.isProviderFor(O, P)) {
                      IteratorClose(iterator);
                      return provider;
                    }
                  }
                }
              }
            }
            if (!IsUndefined(fallback) && fallback.isProviderFor(O, P)) {
              return fallback;
            }
            return void 0;
          }
          function getProvider(O, P) {
            var providerMap = targetProviderMap.get(O);
            var provider;
            if (!IsUndefined(providerMap)) {
              provider = providerMap.get(P);
            }
            if (!IsUndefined(provider)) {
              return provider;
            }
            provider = getProviderNoCache(O, P);
            if (!IsUndefined(provider)) {
              if (IsUndefined(providerMap)) {
                providerMap = new _Map();
                targetProviderMap.set(O, providerMap);
              }
              providerMap.set(P, provider);
            }
            return provider;
          }
          function hasProvider(provider) {
            if (IsUndefined(provider))
              throw new TypeError();
            return first === provider || second === provider || !IsUndefined(rest) && rest.has(provider);
          }
          function setProvider(O, P, provider) {
            if (!hasProvider(provider)) {
              throw new Error("Metadata provider not registered.");
            }
            var existingProvider = getProvider(O, P);
            if (existingProvider !== provider) {
              if (!IsUndefined(existingProvider)) {
                return false;
              }
              var providerMap = targetProviderMap.get(O);
              if (IsUndefined(providerMap)) {
                providerMap = new _Map();
                targetProviderMap.set(O, providerMap);
              }
              providerMap.set(P, provider);
            }
            return true;
          }
        }
        function GetOrCreateMetadataRegistry() {
          var metadataRegistry2;
          if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
            metadataRegistry2 = root.Reflect[registrySymbol];
          }
          if (IsUndefined(metadataRegistry2)) {
            metadataRegistry2 = CreateMetadataRegistry();
          }
          if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
            Object.defineProperty(root.Reflect, registrySymbol, {
              enumerable: false,
              configurable: false,
              writable: false,
              value: metadataRegistry2
            });
          }
          return metadataRegistry2;
        }
        function CreateMetadataProvider(registry) {
          var metadata2 = new _WeakMap();
          var provider = {
            isProviderFor: function(O, P) {
              var targetMetadata = metadata2.get(O);
              if (IsUndefined(targetMetadata))
                return false;
              return targetMetadata.has(P);
            },
            OrdinaryDefineOwnMetadata: OrdinaryDefineOwnMetadata2,
            OrdinaryHasOwnMetadata: OrdinaryHasOwnMetadata2,
            OrdinaryGetOwnMetadata: OrdinaryGetOwnMetadata2,
            OrdinaryOwnMetadataKeys: OrdinaryOwnMetadataKeys2,
            OrdinaryDeleteMetadata
          };
          metadataRegistry.registerProvider(provider);
          return provider;
          function GetOrCreateMetadataMap(O, P, Create) {
            var targetMetadata = metadata2.get(O);
            var createdTargetMetadata = false;
            if (IsUndefined(targetMetadata)) {
              if (!Create)
                return void 0;
              targetMetadata = new _Map();
              metadata2.set(O, targetMetadata);
              createdTargetMetadata = true;
            }
            var metadataMap = targetMetadata.get(P);
            if (IsUndefined(metadataMap)) {
              if (!Create)
                return void 0;
              metadataMap = new _Map();
              targetMetadata.set(P, metadataMap);
              if (!registry.setProvider(O, P, provider)) {
                targetMetadata.delete(P);
                if (createdTargetMetadata) {
                  metadata2.delete(O);
                }
                throw new Error("Wrong provider for target.");
              }
            }
            return metadataMap;
          }
          function OrdinaryHasOwnMetadata2(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(
              O,
              P,
              /*Create*/
              false
            );
            if (IsUndefined(metadataMap))
              return false;
            return ToBoolean(metadataMap.has(MetadataKey));
          }
          function OrdinaryGetOwnMetadata2(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(
              O,
              P,
              /*Create*/
              false
            );
            if (IsUndefined(metadataMap))
              return void 0;
            return metadataMap.get(MetadataKey);
          }
          function OrdinaryDefineOwnMetadata2(MetadataKey, MetadataValue, O, P) {
            var metadataMap = GetOrCreateMetadataMap(
              O,
              P,
              /*Create*/
              true
            );
            metadataMap.set(MetadataKey, MetadataValue);
          }
          function OrdinaryOwnMetadataKeys2(O, P) {
            var keys = [];
            var metadataMap = GetOrCreateMetadataMap(
              O,
              P,
              /*Create*/
              false
            );
            if (IsUndefined(metadataMap))
              return keys;
            var keysObj = metadataMap.keys();
            var iterator = GetIterator(keysObj);
            var k = 0;
            while (true) {
              var next = IteratorStep(iterator);
              if (!next) {
                keys.length = k;
                return keys;
              }
              var nextValue = IteratorValue(next);
              try {
                keys[k] = nextValue;
              } catch (e) {
                try {
                  IteratorClose(iterator);
                } finally {
                  throw e;
                }
              }
              k++;
            }
          }
          function OrdinaryDeleteMetadata(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(
              O,
              P,
              /*Create*/
              false
            );
            if (IsUndefined(metadataMap))
              return false;
            if (!metadataMap.delete(MetadataKey))
              return false;
            if (metadataMap.size === 0) {
              var targetMetadata = metadata2.get(O);
              if (!IsUndefined(targetMetadata)) {
                targetMetadata.delete(P);
                if (targetMetadata.size === 0) {
                  metadata2.delete(targetMetadata);
                }
              }
            }
            return true;
          }
        }
        function CreateFallbackProvider(reflect) {
          var defineMetadata5 = reflect.defineMetadata, hasOwnMetadata3 = reflect.hasOwnMetadata, getOwnMetadata2 = reflect.getOwnMetadata, getOwnMetadataKeys2 = reflect.getOwnMetadataKeys, deleteMetadata2 = reflect.deleteMetadata;
          var metadataOwner = new _WeakMap();
          var provider = {
            isProviderFor: function(O, P) {
              var metadataPropertySet = metadataOwner.get(O);
              if (!IsUndefined(metadataPropertySet) && metadataPropertySet.has(P)) {
                return true;
              }
              if (getOwnMetadataKeys2(O, P).length) {
                if (IsUndefined(metadataPropertySet)) {
                  metadataPropertySet = new _Set();
                  metadataOwner.set(O, metadataPropertySet);
                }
                metadataPropertySet.add(P);
                return true;
              }
              return false;
            },
            OrdinaryDefineOwnMetadata: defineMetadata5,
            OrdinaryHasOwnMetadata: hasOwnMetadata3,
            OrdinaryGetOwnMetadata: getOwnMetadata2,
            OrdinaryOwnMetadataKeys: getOwnMetadataKeys2,
            OrdinaryDeleteMetadata: deleteMetadata2
          };
          return provider;
        }
        function GetMetadataProvider(O, P, Create) {
          var registeredProvider = metadataRegistry.getProvider(O, P);
          if (!IsUndefined(registeredProvider)) {
            return registeredProvider;
          }
          if (Create) {
            if (metadataRegistry.setProvider(O, P, metadataProvider)) {
              return metadataProvider;
            }
            throw new Error("Illegal state.");
          }
          return void 0;
        }
        function CreateMapPolyfill() {
          var cacheSentinel = {};
          var arraySentinel = [];
          var MapIterator = (
            /** @class */
            (function() {
              function MapIterator2(keys, values, selector) {
                this._index = 0;
                this._keys = keys;
                this._values = values;
                this._selector = selector;
              }
              MapIterator2.prototype["@@iterator"] = function() {
                return this;
              };
              MapIterator2.prototype[iteratorSymbol] = function() {
                return this;
              };
              MapIterator2.prototype.next = function() {
                var index = this._index;
                if (index >= 0 && index < this._keys.length) {
                  var result = this._selector(this._keys[index], this._values[index]);
                  if (index + 1 >= this._keys.length) {
                    this._index = -1;
                    this._keys = arraySentinel;
                    this._values = arraySentinel;
                  } else {
                    this._index++;
                  }
                  return { value: result, done: false };
                }
                return { value: void 0, done: true };
              };
              MapIterator2.prototype.throw = function(error) {
                if (this._index >= 0) {
                  this._index = -1;
                  this._keys = arraySentinel;
                  this._values = arraySentinel;
                }
                throw error;
              };
              MapIterator2.prototype.return = function(value) {
                if (this._index >= 0) {
                  this._index = -1;
                  this._keys = arraySentinel;
                  this._values = arraySentinel;
                }
                return { value, done: true };
              };
              return MapIterator2;
            })()
          );
          var Map2 = (
            /** @class */
            (function() {
              function Map3() {
                this._keys = [];
                this._values = [];
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
              }
              Object.defineProperty(Map3.prototype, "size", {
                get: function() {
                  return this._keys.length;
                },
                enumerable: true,
                configurable: true
              });
              Map3.prototype.has = function(key) {
                return this._find(
                  key,
                  /*insert*/
                  false
                ) >= 0;
              };
              Map3.prototype.get = function(key) {
                var index = this._find(
                  key,
                  /*insert*/
                  false
                );
                return index >= 0 ? this._values[index] : void 0;
              };
              Map3.prototype.set = function(key, value) {
                var index = this._find(
                  key,
                  /*insert*/
                  true
                );
                this._values[index] = value;
                return this;
              };
              Map3.prototype.delete = function(key) {
                var index = this._find(
                  key,
                  /*insert*/
                  false
                );
                if (index >= 0) {
                  var size = this._keys.length;
                  for (var i = index + 1; i < size; i++) {
                    this._keys[i - 1] = this._keys[i];
                    this._values[i - 1] = this._values[i];
                  }
                  this._keys.length--;
                  this._values.length--;
                  if (SameValueZero(key, this._cacheKey)) {
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                  }
                  return true;
                }
                return false;
              };
              Map3.prototype.clear = function() {
                this._keys.length = 0;
                this._values.length = 0;
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
              };
              Map3.prototype.keys = function() {
                return new MapIterator(this._keys, this._values, getKey);
              };
              Map3.prototype.values = function() {
                return new MapIterator(this._keys, this._values, getValue);
              };
              Map3.prototype.entries = function() {
                return new MapIterator(this._keys, this._values, getEntry);
              };
              Map3.prototype["@@iterator"] = function() {
                return this.entries();
              };
              Map3.prototype[iteratorSymbol] = function() {
                return this.entries();
              };
              Map3.prototype._find = function(key, insert) {
                if (!SameValueZero(this._cacheKey, key)) {
                  this._cacheIndex = -1;
                  for (var i = 0; i < this._keys.length; i++) {
                    if (SameValueZero(this._keys[i], key)) {
                      this._cacheIndex = i;
                      break;
                    }
                  }
                }
                if (this._cacheIndex < 0 && insert) {
                  this._cacheIndex = this._keys.length;
                  this._keys.push(key);
                  this._values.push(void 0);
                }
                return this._cacheIndex;
              };
              return Map3;
            })()
          );
          return Map2;
          function getKey(key, _) {
            return key;
          }
          function getValue(_, value) {
            return value;
          }
          function getEntry(key, value) {
            return [key, value];
          }
        }
        function CreateSetPolyfill() {
          var Set2 = (
            /** @class */
            (function() {
              function Set3() {
                this._map = new _Map();
              }
              Object.defineProperty(Set3.prototype, "size", {
                get: function() {
                  return this._map.size;
                },
                enumerable: true,
                configurable: true
              });
              Set3.prototype.has = function(value) {
                return this._map.has(value);
              };
              Set3.prototype.add = function(value) {
                return this._map.set(value, value), this;
              };
              Set3.prototype.delete = function(value) {
                return this._map.delete(value);
              };
              Set3.prototype.clear = function() {
                this._map.clear();
              };
              Set3.prototype.keys = function() {
                return this._map.keys();
              };
              Set3.prototype.values = function() {
                return this._map.keys();
              };
              Set3.prototype.entries = function() {
                return this._map.entries();
              };
              Set3.prototype["@@iterator"] = function() {
                return this.keys();
              };
              Set3.prototype[iteratorSymbol] = function() {
                return this.keys();
              };
              return Set3;
            })()
          );
          return Set2;
        }
        function CreateWeakMapPolyfill() {
          var UUID_SIZE = 16;
          var keys = HashMap.create();
          var rootKey = CreateUniqueKey();
          return (
            /** @class */
            (function() {
              function WeakMap2() {
                this._key = CreateUniqueKey();
              }
              WeakMap2.prototype.has = function(target) {
                var table = GetOrCreateWeakMapTable(
                  target,
                  /*create*/
                  false
                );
                return table !== void 0 ? HashMap.has(table, this._key) : false;
              };
              WeakMap2.prototype.get = function(target) {
                var table = GetOrCreateWeakMapTable(
                  target,
                  /*create*/
                  false
                );
                return table !== void 0 ? HashMap.get(table, this._key) : void 0;
              };
              WeakMap2.prototype.set = function(target, value) {
                var table = GetOrCreateWeakMapTable(
                  target,
                  /*create*/
                  true
                );
                table[this._key] = value;
                return this;
              };
              WeakMap2.prototype.delete = function(target) {
                var table = GetOrCreateWeakMapTable(
                  target,
                  /*create*/
                  false
                );
                return table !== void 0 ? delete table[this._key] : false;
              };
              WeakMap2.prototype.clear = function() {
                this._key = CreateUniqueKey();
              };
              return WeakMap2;
            })()
          );
          function CreateUniqueKey() {
            var key;
            do
              key = "@@WeakMap@@" + CreateUUID();
            while (HashMap.has(keys, key));
            keys[key] = true;
            return key;
          }
          function GetOrCreateWeakMapTable(target, create) {
            if (!hasOwn.call(target, rootKey)) {
              if (!create)
                return void 0;
              Object.defineProperty(target, rootKey, { value: HashMap.create() });
            }
            return target[rootKey];
          }
          function FillRandomBytes(buffer, size) {
            for (var i = 0; i < size; ++i)
              buffer[i] = Math.random() * 255 | 0;
            return buffer;
          }
          function GenRandomBytes(size) {
            if (typeof Uint8Array === "function") {
              var array = new Uint8Array(size);
              if (typeof crypto !== "undefined") {
                crypto.getRandomValues(array);
              } else if (typeof msCrypto !== "undefined") {
                msCrypto.getRandomValues(array);
              } else {
                FillRandomBytes(array, size);
              }
              return array;
            }
            return FillRandomBytes(new Array(size), size);
          }
          function CreateUUID() {
            var data = GenRandomBytes(UUID_SIZE);
            data[6] = data[6] & 79 | 64;
            data[8] = data[8] & 191 | 128;
            var result = "";
            for (var offset = 0; offset < UUID_SIZE; ++offset) {
              var byte = data[offset];
              if (offset === 4 || offset === 6 || offset === 8)
                result += "-";
              if (byte < 16)
                result += "0";
              result += byte.toString(16).toLowerCase();
            }
            return result;
          }
        }
        function MakeDictionary(obj) {
          obj.__ = void 0;
          delete obj.__;
          return obj;
        }
      });
    })(Reflect2 || (Reflect2 = {}));
  }
});
var require_symbol_iterator = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/symbol.iterator.js"(exports, module) {
    module.exports = function SymbolIterator() {
      var _this = this;
      var index = -1;
      return {
        next: function next() {
          index += 1;
          return {
            value: _this.items[index],
            done: index >= _this.items.length
          };
        }
      };
    };
  }
});
var require_all = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/all.js"(exports, module) {
    module.exports = function all() {
      return this.items;
    };
  }
});
var require_is = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/helpers/is.js"(exports, module) {
    function _typeof(obj) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
        return typeof obj2;
      } : function(obj2) {
        return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      }, _typeof(obj);
    }
    module.exports = {
      /**
       * @returns {boolean}
       */
      isArray: function isArray(item) {
        return Array.isArray(item);
      },
      /**
       * @returns {boolean}
       */
      isObject: function isObject(item) {
        return _typeof(item) === "object" && Array.isArray(item) === false && item !== null;
      },
      /**
       * @returns {boolean}
       */
      isFunction: function isFunction(item) {
        return typeof item === "function";
      }
    };
  }
});
var require_average = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/average.js"(exports, module) {
    var _require = require_is();
    var isFunction = _require.isFunction;
    module.exports = function average(key) {
      if (key === void 0) {
        return this.sum() / this.items.length;
      }
      if (isFunction(key)) {
        return new this.constructor(this.items).sum(key) / this.items.length;
      }
      return new this.constructor(this.items).pluck(key).sum() / this.items.length;
    };
  }
});
var require_avg = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/avg.js"(exports, module) {
    var average = require_average();
    module.exports = average;
  }
});
var require_chunk = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/chunk.js"(exports, module) {
    function _typeof(obj) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
        return typeof obj2;
      } : function(obj2) {
        return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      }, _typeof(obj);
    }
    module.exports = function chunk(size) {
      var _this = this;
      var chunks = [];
      var index = 0;
      if (Array.isArray(this.items)) {
        do {
          var items = this.items.slice(index, index + size);
          var collection = new this.constructor(items);
          chunks.push(collection);
          index += size;
        } while (index < this.items.length);
      } else if (_typeof(this.items) === "object") {
        var keys = Object.keys(this.items);
        var _loop = function _loop2() {
          var keysOfChunk = keys.slice(index, index + size);
          var collection2 = new _this.constructor({});
          keysOfChunk.forEach(function(key) {
            return collection2.put(key, _this.items[key]);
          });
          chunks.push(collection2);
          index += size;
        };
        do {
          _loop();
        } while (index < keys.length);
      } else {
        chunks.push(new this.constructor([this.items]));
      }
      return new this.constructor(chunks);
    };
  }
});
var require_collapse = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/collapse.js"(exports, module) {
    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }
    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
    }
    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) return _arrayLikeToArray(arr);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
    module.exports = function collapse() {
      var _ref;
      return new this.constructor((_ref = []).concat.apply(_ref, _toConsumableArray(this.items)));
    };
  }
});
var require_combine = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/combine.js"(exports, module) {
    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;
      var _s, _e;
      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }
    function _typeof(obj) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
        return typeof obj2;
      } : function(obj2) {
        return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      }, _typeof(obj);
    }
    module.exports = function combine(array) {
      var _this = this;
      var values = array;
      if (values instanceof this.constructor) {
        values = array.all();
      }
      var collection = {};
      if (Array.isArray(this.items) && Array.isArray(values)) {
        this.items.forEach(function(key, iterator) {
          collection[key] = values[iterator];
        });
      } else if (_typeof(this.items) === "object" && _typeof(values) === "object") {
        Object.keys(this.items).forEach(function(key, index) {
          collection[_this.items[key]] = values[Object.keys(values)[index]];
        });
      } else if (Array.isArray(this.items)) {
        collection[this.items[0]] = values;
      } else if (typeof this.items === "string" && Array.isArray(values)) {
        var _values = values;
        var _values2 = _slicedToArray(_values, 1);
        collection[this.items] = _values2[0];
      } else if (typeof this.items === "string") {
        collection[this.items] = values;
      }
      return new this.constructor(collection);
    };
  }
});
var require_clone = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/helpers/clone.js"(exports, module) {
    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }
    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
    }
    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) return _arrayLikeToArray(arr);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
    module.exports = function clone(items) {
      var cloned;
      if (Array.isArray(items)) {
        var _cloned;
        cloned = [];
        (_cloned = cloned).push.apply(_cloned, _toConsumableArray(items));
      } else {
        cloned = {};
        Object.keys(items).forEach(function(prop) {
          cloned[prop] = items[prop];
        });
      }
      return cloned;
    };
  }
});
var require_concat = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/concat.js"(exports, module) {
    function _typeof(obj) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
        return typeof obj2;
      } : function(obj2) {
        return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      }, _typeof(obj);
    }
    var clone = require_clone();
    module.exports = function concat(collectionOrArrayOrObject) {
      var list = collectionOrArrayOrObject;
      if (collectionOrArrayOrObject instanceof this.constructor) {
        list = collectionOrArrayOrObject.all();
      } else if (_typeof(collectionOrArrayOrObject) === "object") {
        list = [];
        Object.keys(collectionOrArrayOrObject).forEach(function(property) {
          list.push(collectionOrArrayOrObject[property]);
        });
      }
      var collection = clone(this.items);
      list.forEach(function(item) {
        if (_typeof(item) === "object") {
          Object.keys(item).forEach(function(key) {
            return collection.push(item[key]);
          });
        } else {
          collection.push(item);
        }
      });
      return new this.constructor(collection);
    };
  }
});
var require_values = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/helpers/values.js"(exports, module) {
    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }
    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
    }
    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) return _arrayLikeToArray(arr);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
    module.exports = function values(items) {
      var valuesArray = [];
      if (Array.isArray(items)) {
        valuesArray.push.apply(valuesArray, _toConsumableArray(items));
      } else if (items.constructor.name === "Collection") {
        valuesArray.push.apply(valuesArray, _toConsumableArray(items.all()));
      } else {
        Object.keys(items).forEach(function(prop) {
          return valuesArray.push(items[prop]);
        });
      }
      return valuesArray;
    };
  }
});
var require_contains = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/contains.js"(exports, module) {
    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }
    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
    }
    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) return _arrayLikeToArray(arr);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
    var values = require_values();
    var _require = require_is();
    var isFunction = _require.isFunction;
    module.exports = function contains(key, value) {
      if (value !== void 0) {
        if (Array.isArray(this.items)) {
          return this.items.filter(function(items) {
            return items[key] !== void 0 && items[key] === value;
          }).length > 0;
        }
        return this.items[key] !== void 0 && this.items[key] === value;
      }
      if (isFunction(key)) {
        return this.items.filter(function(item, index) {
          return key(item, index);
        }).length > 0;
      }
      if (Array.isArray(this.items)) {
        return this.items.indexOf(key) !== -1;
      }
      var keysAndValues = values(this.items);
      keysAndValues.push.apply(keysAndValues, _toConsumableArray(Object.keys(this.items)));
      return keysAndValues.indexOf(key) !== -1;
    };
  }
});
var require_containsOneItem = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/containsOneItem.js"(exports, module) {
    module.exports = function containsOneItem() {
      return this.count() === 1;
    };
  }
});
var require_count = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/count.js"(exports, module) {
    module.exports = function count() {
      var arrayLength = 0;
      if (Array.isArray(this.items)) {
        arrayLength = this.items.length;
      }
      return Math.max(Object.keys(this.items).length, arrayLength);
    };
  }
});
var require_countBy = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/countBy.js"(exports, module) {
    module.exports = function countBy() {
      var fn = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function(value) {
        return value;
      };
      return new this.constructor(this.items).groupBy(fn).map(function(value) {
        return value.count();
      });
    };
  }
});
var require_crossJoin = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/crossJoin.js"(exports, module) {
    module.exports = function crossJoin() {
      function join(collection, constructor, args) {
        var current = args[0];
        if (current instanceof constructor) {
          current = current.all();
        }
        var rest = args.slice(1);
        var last = !rest.length;
        var result = [];
        for (var i = 0; i < current.length; i += 1) {
          var collectionCopy = collection.slice();
          collectionCopy.push(current[i]);
          if (last) {
            result.push(collectionCopy);
          } else {
            result = result.concat(join(collectionCopy, constructor, rest));
          }
        }
        return result;
      }
      for (var _len = arguments.length, values = new Array(_len), _key = 0; _key < _len; _key++) {
        values[_key] = arguments[_key];
      }
      return new this.constructor(join([], this.constructor, [].concat([this.items], values)));
    };
  }
});
var require_dd = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/dd.js"(exports, module) {
    module.exports = function dd() {
      this.dump();
      if (typeof process !== "undefined") {
        process.exit(1);
      }
    };
  }
});
var require_diff = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/diff.js"(exports, module) {
    module.exports = function diff(values) {
      var valuesToDiff;
      if (values instanceof this.constructor) {
        valuesToDiff = values.all();
      } else {
        valuesToDiff = values;
      }
      var collection = this.items.filter(function(item) {
        return valuesToDiff.indexOf(item) === -1;
      });
      return new this.constructor(collection);
    };
  }
});
var require_diffAssoc = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/diffAssoc.js"(exports, module) {
    module.exports = function diffAssoc(values) {
      var _this = this;
      var diffValues = values;
      if (values instanceof this.constructor) {
        diffValues = values.all();
      }
      var collection = {};
      Object.keys(this.items).forEach(function(key) {
        if (diffValues[key] === void 0 || diffValues[key] !== _this.items[key]) {
          collection[key] = _this.items[key];
        }
      });
      return new this.constructor(collection);
    };
  }
});
var require_diffKeys = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/diffKeys.js"(exports, module) {
    module.exports = function diffKeys(object) {
      var objectToDiff;
      if (object instanceof this.constructor) {
        objectToDiff = object.all();
      } else {
        objectToDiff = object;
      }
      var objectKeys = Object.keys(objectToDiff);
      var remainingKeys = Object.keys(this.items).filter(function(item) {
        return objectKeys.indexOf(item) === -1;
      });
      return new this.constructor(this.items).only(remainingKeys);
    };
  }
});
var require_diffUsing = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/diffUsing.js"(exports, module) {
    module.exports = function diffUsing(values, callback) {
      var collection = this.items.filter(function(item) {
        return !(values && values.some(function(otherItem) {
          return callback(item, otherItem) === 0;
        }));
      });
      return new this.constructor(collection);
    };
  }
});
var require_doesntContain = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/doesntContain.js"(exports, module) {
    module.exports = function contains(key, value) {
      return !this.contains(key, value);
    };
  }
});
var require_dump = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/dump.js"(exports, module) {
    module.exports = function dump() {
      console.log(this);
      return this;
    };
  }
});
var require_duplicates = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/duplicates.js"(exports, module) {
    function _typeof(obj) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
        return typeof obj2;
      } : function(obj2) {
        return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      }, _typeof(obj);
    }
    module.exports = function duplicates() {
      var _this = this;
      var occuredValues = [];
      var duplicateValues = {};
      var stringifiedValue = function stringifiedValue2(value) {
        if (Array.isArray(value) || _typeof(value) === "object") {
          return JSON.stringify(value);
        }
        return value;
      };
      if (Array.isArray(this.items)) {
        this.items.forEach(function(value, index) {
          var valueAsString = stringifiedValue(value);
          if (occuredValues.indexOf(valueAsString) === -1) {
            occuredValues.push(valueAsString);
          } else {
            duplicateValues[index] = value;
          }
        });
      } else if (_typeof(this.items) === "object") {
        Object.keys(this.items).forEach(function(key) {
          var valueAsString = stringifiedValue(_this.items[key]);
          if (occuredValues.indexOf(valueAsString) === -1) {
            occuredValues.push(valueAsString);
          } else {
            duplicateValues[key] = _this.items[key];
          }
        });
      }
      return new this.constructor(duplicateValues);
    };
  }
});
var require_each = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/each.js"(exports, module) {
    module.exports = function each(fn) {
      var stop = false;
      if (Array.isArray(this.items)) {
        var length = this.items.length;
        for (var index = 0; index < length && !stop; index += 1) {
          stop = fn(this.items[index], index, this.items) === false;
        }
      } else {
        var keys = Object.keys(this.items);
        var _length = keys.length;
        for (var _index = 0; _index < _length && !stop; _index += 1) {
          var key = keys[_index];
          stop = fn(this.items[key], key, this.items) === false;
        }
      }
      return this;
    };
  }
});
var require_eachSpread = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/eachSpread.js"(exports, module) {
    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }
    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
    }
    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) return _arrayLikeToArray(arr);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
    module.exports = function eachSpread(fn) {
      this.each(function(values, key) {
        fn.apply(void 0, _toConsumableArray(values).concat([key]));
      });
      return this;
    };
  }
});
var require_every = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/every.js"(exports, module) {
    var values = require_values();
    module.exports = function every(fn) {
      var items = values(this.items);
      return items.every(fn);
    };
  }
});
var require_variadic = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/helpers/variadic.js"(exports, module) {
    module.exports = function variadic(args) {
      if (Array.isArray(args[0])) {
        return args[0];
      }
      return args;
    };
  }
});
var require_except = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/except.js"(exports, module) {
    var variadic = require_variadic();
    module.exports = function except() {
      var _this = this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var properties = variadic(args);
      if (Array.isArray(this.items)) {
        var _collection = this.items.filter(function(item) {
          return properties.indexOf(item) === -1;
        });
        return new this.constructor(_collection);
      }
      var collection = {};
      Object.keys(this.items).forEach(function(property) {
        if (properties.indexOf(property) === -1) {
          collection[property] = _this.items[property];
        }
      });
      return new this.constructor(collection);
    };
  }
});
var require_filter = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/filter.js"(exports, module) {
    function _typeof(obj) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
        return typeof obj2;
      } : function(obj2) {
        return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      }, _typeof(obj);
    }
    function falsyValue(item) {
      if (Array.isArray(item)) {
        if (item.length) {
          return false;
        }
      } else if (item !== void 0 && item !== null && _typeof(item) === "object") {
        if (Object.keys(item).length) {
          return false;
        }
      } else if (item) {
        return false;
      }
      return true;
    }
    function filterObject(func, items) {
      var result = {};
      Object.keys(items).forEach(function(key) {
        if (func) {
          if (func(items[key], key)) {
            result[key] = items[key];
          }
        } else if (!falsyValue(items[key])) {
          result[key] = items[key];
        }
      });
      return result;
    }
    function filterArray(func, items) {
      if (func) {
        return items.filter(func);
      }
      var result = [];
      for (var i = 0; i < items.length; i += 1) {
        var item = items[i];
        if (!falsyValue(item)) {
          result.push(item);
        }
      }
      return result;
    }
    module.exports = function filter(fn) {
      var func = fn || false;
      var filteredItems = null;
      if (Array.isArray(this.items)) {
        filteredItems = filterArray(func, this.items);
      } else {
        filteredItems = filterObject(func, this.items);
      }
      return new this.constructor(filteredItems);
    };
  }
});
var require_first = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/first.js"(exports, module) {
    var _require = require_is();
    var isFunction = _require.isFunction;
    module.exports = function first(fn, defaultValue) {
      if (isFunction(fn)) {
        var keys = Object.keys(this.items);
        for (var i = 0; i < keys.length; i += 1) {
          var key = keys[i];
          var item = this.items[key];
          if (fn(item, key)) {
            return item;
          }
        }
        if (isFunction(defaultValue)) {
          return defaultValue();
        }
        return defaultValue;
      }
      if (Array.isArray(this.items) && this.items.length || Object.keys(this.items).length) {
        if (Array.isArray(this.items)) {
          return this.items[0];
        }
        var firstKey = Object.keys(this.items)[0];
        return this.items[firstKey];
      }
      if (isFunction(defaultValue)) {
        return defaultValue();
      }
      return defaultValue;
    };
  }
});
var require_firstOrFail = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/firstOrFail.js"(exports, module) {
    var _require = require_is();
    var isFunction = _require.isFunction;
    module.exports = function firstOrFail(key, operator, value) {
      if (isFunction(key)) {
        return this.first(key, function() {
          throw new Error("Item not found.");
        });
      }
      var collection = this.where(key, operator, value);
      if (collection.isEmpty()) {
        throw new Error("Item not found.");
      }
      return collection.first();
    };
  }
});
var require_firstWhere = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/firstWhere.js"(exports, module) {
    module.exports = function firstWhere(key, operator, value) {
      return this.where(key, operator, value).first() || null;
    };
  }
});
var require_flatMap = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/flatMap.js"(exports, module) {
    module.exports = function flatMap(fn) {
      return this.map(fn).collapse();
    };
  }
});
var require_flatten = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/flatten.js"(exports, module) {
    var _require = require_is();
    var isArray = _require.isArray;
    var isObject = _require.isObject;
    module.exports = function flatten(depth) {
      var flattenDepth = depth || Infinity;
      var fullyFlattened = false;
      var collection = [];
      var flat = function flat2(items) {
        collection = [];
        if (isArray(items)) {
          items.forEach(function(item) {
            if (isArray(item)) {
              collection = collection.concat(item);
            } else if (isObject(item)) {
              Object.keys(item).forEach(function(property) {
                collection = collection.concat(item[property]);
              });
            } else {
              collection.push(item);
            }
          });
        } else {
          Object.keys(items).forEach(function(property) {
            if (isArray(items[property])) {
              collection = collection.concat(items[property]);
            } else if (isObject(items[property])) {
              Object.keys(items[property]).forEach(function(prop) {
                collection = collection.concat(items[property][prop]);
              });
            } else {
              collection.push(items[property]);
            }
          });
        }
        fullyFlattened = collection.filter(function(item) {
          return isObject(item);
        });
        fullyFlattened = fullyFlattened.length === 0;
        flattenDepth -= 1;
      };
      flat(this.items);
      while (!fullyFlattened && flattenDepth > 0) {
        flat(collection);
      }
      return new this.constructor(collection);
    };
  }
});
var require_flip = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/flip.js"(exports, module) {
    module.exports = function flip() {
      var _this = this;
      var collection = {};
      if (Array.isArray(this.items)) {
        Object.keys(this.items).forEach(function(key) {
          collection[_this.items[key]] = Number(key);
        });
      } else {
        Object.keys(this.items).forEach(function(key) {
          collection[_this.items[key]] = key;
        });
      }
      return new this.constructor(collection);
    };
  }
});
var require_forPage = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/forPage.js"(exports, module) {
    module.exports = function forPage(page, chunk) {
      var _this = this;
      var collection = {};
      if (Array.isArray(this.items)) {
        collection = this.items.slice(page * chunk - chunk, page * chunk);
      } else {
        Object.keys(this.items).slice(page * chunk - chunk, page * chunk).forEach(function(key) {
          collection[key] = _this.items[key];
        });
      }
      return new this.constructor(collection);
    };
  }
});
var require_forget = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/forget.js"(exports, module) {
    module.exports = function forget(key) {
      if (Array.isArray(this.items)) {
        this.items.splice(key, 1);
      } else {
        delete this.items[key];
      }
      return this;
    };
  }
});
var require_get = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/get.js"(exports, module) {
    var _require = require_is();
    var isFunction = _require.isFunction;
    module.exports = function get(key) {
      var defaultValue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
      if (this.items[key] !== void 0) {
        return this.items[key];
      }
      if (isFunction(defaultValue)) {
        return defaultValue();
      }
      if (defaultValue !== null) {
        return defaultValue;
      }
      return null;
    };
  }
});
var require_nestedValue = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/helpers/nestedValue.js"(exports, module) {
    module.exports = function nestedValue(mainObject, key) {
      try {
        return key.split(".").reduce(function(obj, property) {
          return obj[property];
        }, mainObject);
      } catch (err) {
        return mainObject;
      }
    };
  }
});
var require_groupBy = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/groupBy.js"(exports, module) {
    var nestedValue = require_nestedValue();
    var _require = require_is();
    var isFunction = _require.isFunction;
    module.exports = function groupBy(key) {
      var _this = this;
      var collection = {};
      this.items.forEach(function(item, index) {
        var resolvedKey;
        if (isFunction(key)) {
          resolvedKey = key(item, index);
        } else if (nestedValue(item, key) || nestedValue(item, key) === 0) {
          resolvedKey = nestedValue(item, key);
        } else {
          resolvedKey = "";
        }
        if (collection[resolvedKey] === void 0) {
          collection[resolvedKey] = new _this.constructor([]);
        }
        collection[resolvedKey].push(item);
      });
      return new this.constructor(collection);
    };
  }
});
var require_has = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/has.js"(exports, module) {
    var variadic = require_variadic();
    module.exports = function has() {
      var _this = this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var properties = variadic(args);
      return properties.filter(function(key) {
        return Object.hasOwnProperty.call(_this.items, key);
      }).length === properties.length;
    };
  }
});
var require_implode = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/implode.js"(exports, module) {
    module.exports = function implode(key, glue) {
      if (glue === void 0) {
        return this.items.join(key);
      }
      return new this.constructor(this.items).pluck(key).all().join(glue);
    };
  }
});
var require_intersect = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/intersect.js"(exports, module) {
    module.exports = function intersect(values) {
      var intersectValues = values;
      if (values instanceof this.constructor) {
        intersectValues = values.all();
      }
      var collection = this.items.filter(function(item) {
        return intersectValues.indexOf(item) !== -1;
      });
      return new this.constructor(collection);
    };
  }
});
var require_intersectByKeys = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/intersectByKeys.js"(exports, module) {
    module.exports = function intersectByKeys(values) {
      var _this = this;
      var intersectKeys = Object.keys(values);
      if (values instanceof this.constructor) {
        intersectKeys = Object.keys(values.all());
      }
      var collection = {};
      Object.keys(this.items).forEach(function(key) {
        if (intersectKeys.indexOf(key) !== -1) {
          collection[key] = _this.items[key];
        }
      });
      return new this.constructor(collection);
    };
  }
});
var require_isEmpty = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/isEmpty.js"(exports, module) {
    module.exports = function isEmpty() {
      if (Array.isArray(this.items)) {
        return !this.items.length;
      }
      return !Object.keys(this.items).length;
    };
  }
});
var require_isNotEmpty = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/isNotEmpty.js"(exports, module) {
    module.exports = function isNotEmpty() {
      return !this.isEmpty();
    };
  }
});
var require_join = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/join.js"(exports, module) {
    module.exports = function join(glue, finalGlue) {
      var collection = this.values();
      if (finalGlue === void 0) {
        return collection.implode(glue);
      }
      var count = collection.count();
      if (count === 0) {
        return "";
      }
      if (count === 1) {
        return collection.last();
      }
      var finalItem = collection.pop();
      return collection.implode(glue) + finalGlue + finalItem;
    };
  }
});
var require_keyBy = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/keyBy.js"(exports, module) {
    var nestedValue = require_nestedValue();
    var _require = require_is();
    var isFunction = _require.isFunction;
    module.exports = function keyBy(key) {
      var collection = {};
      if (isFunction(key)) {
        this.items.forEach(function(item) {
          collection[key(item)] = item;
        });
      } else {
        this.items.forEach(function(item) {
          var keyValue = nestedValue(item, key);
          collection[keyValue || ""] = item;
        });
      }
      return new this.constructor(collection);
    };
  }
});
var require_keys = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/keys.js"(exports, module) {
    module.exports = function keys() {
      var collection = Object.keys(this.items);
      if (Array.isArray(this.items)) {
        collection = collection.map(Number);
      }
      return new this.constructor(collection);
    };
  }
});
var require_last = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/last.js"(exports, module) {
    var _require = require_is();
    var isFunction = _require.isFunction;
    module.exports = function last(fn, defaultValue) {
      var items = this.items;
      if (isFunction(fn)) {
        items = this.filter(fn).all();
      }
      if (Array.isArray(items) && !items.length || !Object.keys(items).length) {
        if (isFunction(defaultValue)) {
          return defaultValue();
        }
        return defaultValue;
      }
      if (Array.isArray(items)) {
        return items[items.length - 1];
      }
      var keys = Object.keys(items);
      return items[keys[keys.length - 1]];
    };
  }
});
var require_macro = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/macro.js"(exports, module) {
    module.exports = function macro(name, fn) {
      this.constructor.prototype[name] = fn;
    };
  }
});
var require_make = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/make.js"(exports, module) {
    module.exports = function make() {
      var items = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
      return new this.constructor(items);
    };
  }
});
var require_map = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/map.js"(exports, module) {
    module.exports = function map(fn) {
      var _this = this;
      if (Array.isArray(this.items)) {
        return new this.constructor(this.items.map(fn));
      }
      var collection = {};
      Object.keys(this.items).forEach(function(key) {
        collection[key] = fn(_this.items[key], key);
      });
      return new this.constructor(collection);
    };
  }
});
var require_mapSpread = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/mapSpread.js"(exports, module) {
    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }
    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
    }
    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) return _arrayLikeToArray(arr);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
    module.exports = function mapSpread(fn) {
      return this.map(function(values, key) {
        return fn.apply(void 0, _toConsumableArray(values).concat([key]));
      });
    };
  }
});
var require_mapToDictionary = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/mapToDictionary.js"(exports, module) {
    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;
      var _s, _e;
      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }
    module.exports = function mapToDictionary(fn) {
      var collection = {};
      this.items.forEach(function(item, k) {
        var _fn = fn(item, k), _fn2 = _slicedToArray(_fn, 2), key = _fn2[0], value = _fn2[1];
        if (collection[key] === void 0) {
          collection[key] = [value];
        } else {
          collection[key].push(value);
        }
      });
      return new this.constructor(collection);
    };
  }
});
var require_mapInto = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/mapInto.js"(exports, module) {
    module.exports = function mapInto(ClassName) {
      return this.map(function(value, key) {
        return new ClassName(value, key);
      });
    };
  }
});
var require_mapToGroups = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/mapToGroups.js"(exports, module) {
    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;
      var _s, _e;
      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }
    module.exports = function mapToGroups(fn) {
      var collection = {};
      this.items.forEach(function(item, key) {
        var _fn = fn(item, key), _fn2 = _slicedToArray(_fn, 2), keyed = _fn2[0], value = _fn2[1];
        if (collection[keyed] === void 0) {
          collection[keyed] = [value];
        } else {
          collection[keyed].push(value);
        }
      });
      return new this.constructor(collection);
    };
  }
});
var require_mapWithKeys = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/mapWithKeys.js"(exports, module) {
    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;
      var _s, _e;
      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }
    module.exports = function mapWithKeys(fn) {
      var _this = this;
      var collection = {};
      if (Array.isArray(this.items)) {
        this.items.forEach(function(item, index) {
          var _fn = fn(item, index), _fn2 = _slicedToArray(_fn, 2), keyed = _fn2[0], value = _fn2[1];
          collection[keyed] = value;
        });
      } else {
        Object.keys(this.items).forEach(function(key) {
          var _fn3 = fn(_this.items[key], key), _fn4 = _slicedToArray(_fn3, 2), keyed = _fn4[0], value = _fn4[1];
          collection[keyed] = value;
        });
      }
      return new this.constructor(collection);
    };
  }
});
var require_max = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/max.js"(exports, module) {
    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }
    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
    }
    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) return _arrayLikeToArray(arr);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
    module.exports = function max(key) {
      if (typeof key === "string") {
        var filtered = this.items.filter(function(item) {
          return item[key] !== void 0;
        });
        return Math.max.apply(Math, _toConsumableArray(filtered.map(function(item) {
          return item[key];
        })));
      }
      return Math.max.apply(Math, _toConsumableArray(this.items));
    };
  }
});
var require_median = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/median.js"(exports, module) {
    module.exports = function median(key) {
      var length = this.items.length;
      if (key === void 0) {
        if (length % 2 === 0) {
          return (this.items[length / 2 - 1] + this.items[length / 2]) / 2;
        }
        return this.items[Math.floor(length / 2)];
      }
      if (length % 2 === 0) {
        return (this.items[length / 2 - 1][key] + this.items[length / 2][key]) / 2;
      }
      return this.items[Math.floor(length / 2)][key];
    };
  }
});
var require_merge = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/merge.js"(exports, module) {
    module.exports = function merge(value) {
      var arrayOrObject = value;
      if (typeof arrayOrObject === "string") {
        arrayOrObject = [arrayOrObject];
      }
      if (Array.isArray(this.items) && Array.isArray(arrayOrObject)) {
        return new this.constructor(this.items.concat(arrayOrObject));
      }
      var collection = JSON.parse(JSON.stringify(this.items));
      Object.keys(arrayOrObject).forEach(function(key) {
        collection[key] = arrayOrObject[key];
      });
      return new this.constructor(collection);
    };
  }
});
var require_mergeRecursive = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/mergeRecursive.js"(exports, module) {
    function _typeof(obj) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
        return typeof obj2;
      } : function(obj2) {
        return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      }, _typeof(obj);
    }
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        enumerableOnly && (symbols = symbols.filter(function(sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        })), keys.push.apply(keys, symbols);
      }
      return keys;
    }
    function _objectSpread(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = null != arguments[i] ? arguments[i] : {};
        i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
      return target;
    }
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    module.exports = function mergeRecursive(items) {
      var merge = function merge2(target, source) {
        var merged = {};
        var mergedKeys = Object.keys(_objectSpread(_objectSpread({}, target), source));
        mergedKeys.forEach(function(key) {
          if (target[key] === void 0 && source[key] !== void 0) {
            merged[key] = source[key];
          } else if (target[key] !== void 0 && source[key] === void 0) {
            merged[key] = target[key];
          } else if (target[key] !== void 0 && source[key] !== void 0) {
            if (target[key] === source[key]) {
              merged[key] = target[key];
            } else if (!Array.isArray(target[key]) && _typeof(target[key]) === "object" && !Array.isArray(source[key]) && _typeof(source[key]) === "object") {
              merged[key] = merge2(target[key], source[key]);
            } else {
              merged[key] = [].concat(target[key], source[key]);
            }
          }
        });
        return merged;
      };
      if (!items) {
        return this;
      }
      if (items.constructor.name === "Collection") {
        return new this.constructor(merge(this.items, items.all()));
      }
      return new this.constructor(merge(this.items, items));
    };
  }
});
var require_min = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/min.js"(exports, module) {
    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }
    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
    }
    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) return _arrayLikeToArray(arr);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
    module.exports = function min(key) {
      if (key !== void 0) {
        var filtered = this.items.filter(function(item) {
          return item[key] !== void 0;
        });
        return Math.min.apply(Math, _toConsumableArray(filtered.map(function(item) {
          return item[key];
        })));
      }
      return Math.min.apply(Math, _toConsumableArray(this.items));
    };
  }
});
var require_mode = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/mode.js"(exports, module) {
    module.exports = function mode(key) {
      var values = [];
      var highestCount = 1;
      if (!this.items.length) {
        return null;
      }
      this.items.forEach(function(item) {
        var tempValues = values.filter(function(value) {
          if (key !== void 0) {
            return value.key === item[key];
          }
          return value.key === item;
        });
        if (!tempValues.length) {
          if (key !== void 0) {
            values.push({
              key: item[key],
              count: 1
            });
          } else {
            values.push({
              key: item,
              count: 1
            });
          }
        } else {
          tempValues[0].count += 1;
          var count = tempValues[0].count;
          if (count > highestCount) {
            highestCount = count;
          }
        }
      });
      return values.filter(function(value) {
        return value.count === highestCount;
      }).map(function(value) {
        return value.key;
      });
    };
  }
});
var require_nth = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/nth.js"(exports, module) {
    var values = require_values();
    module.exports = function nth(n) {
      var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
      var items = values(this.items);
      var collection = items.slice(offset).filter(function(item, index) {
        return index % n === 0;
      });
      return new this.constructor(collection);
    };
  }
});
var require_only = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/only.js"(exports, module) {
    var variadic = require_variadic();
    module.exports = function only() {
      var _this = this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var properties = variadic(args);
      if (Array.isArray(this.items)) {
        var _collection = this.items.filter(function(item) {
          return properties.indexOf(item) !== -1;
        });
        return new this.constructor(_collection);
      }
      var collection = {};
      Object.keys(this.items).forEach(function(prop) {
        if (properties.indexOf(prop) !== -1) {
          collection[prop] = _this.items[prop];
        }
      });
      return new this.constructor(collection);
    };
  }
});
var require_pad = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/pad.js"(exports, module) {
    var clone = require_clone();
    module.exports = function pad(size, value) {
      var abs = Math.abs(size);
      var count = this.count();
      if (abs <= count) {
        return this;
      }
      var diff = abs - count;
      var items = clone(this.items);
      var isArray = Array.isArray(this.items);
      var prepend = size < 0;
      for (var iterator = 0; iterator < diff; ) {
        if (!isArray) {
          if (items[iterator] !== void 0) {
            diff += 1;
          } else {
            items[iterator] = value;
          }
        } else if (prepend) {
          items.unshift(value);
        } else {
          items.push(value);
        }
        iterator += 1;
      }
      return new this.constructor(items);
    };
  }
});
var require_partition = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/partition.js"(exports, module) {
    module.exports = function partition(fn) {
      var _this = this;
      var arrays;
      if (Array.isArray(this.items)) {
        arrays = [new this.constructor([]), new this.constructor([])];
        this.items.forEach(function(item) {
          if (fn(item) === true) {
            arrays[0].push(item);
          } else {
            arrays[1].push(item);
          }
        });
      } else {
        arrays = [new this.constructor({}), new this.constructor({})];
        Object.keys(this.items).forEach(function(prop) {
          var value = _this.items[prop];
          if (fn(value) === true) {
            arrays[0].put(prop, value);
          } else {
            arrays[1].put(prop, value);
          }
        });
      }
      return new this.constructor(arrays);
    };
  }
});
var require_pipe = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/pipe.js"(exports, module) {
    module.exports = function pipe(fn) {
      return fn(this);
    };
  }
});
var require_pluck = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/pluck.js"(exports, module) {
    var _require = require_is();
    var isArray = _require.isArray;
    var isObject = _require.isObject;
    var nestedValue = require_nestedValue();
    var buildKeyPathMap = function buildKeyPathMap2(items) {
      var keyPaths = {};
      items.forEach(function(item, index) {
        function buildKeyPath(val, keyPath) {
          if (isObject(val)) {
            Object.keys(val).forEach(function(prop) {
              buildKeyPath(val[prop], "".concat(keyPath, ".").concat(prop));
            });
          } else if (isArray(val)) {
            val.forEach(function(v, i) {
              buildKeyPath(v, "".concat(keyPath, ".").concat(i));
            });
          }
          keyPaths[keyPath] = val;
        }
        buildKeyPath(item, index);
      });
      return keyPaths;
    };
    module.exports = function pluck(value, key) {
      if (value.indexOf("*") !== -1) {
        var keyPathMap = buildKeyPathMap(this.items);
        var keyMatches = [];
        if (key !== void 0) {
          var keyRegex = new RegExp("0.".concat(key), "g");
          var keyNumberOfLevels = "0.".concat(key).split(".").length;
          Object.keys(keyPathMap).forEach(function(k) {
            var matchingKey = k.match(keyRegex);
            if (matchingKey) {
              var match = matchingKey[0];
              if (match.split(".").length === keyNumberOfLevels) {
                keyMatches.push(keyPathMap[match]);
              }
            }
          });
        }
        var valueMatches = [];
        var valueRegex = new RegExp("0.".concat(value), "g");
        var valueNumberOfLevels = "0.".concat(value).split(".").length;
        Object.keys(keyPathMap).forEach(function(k) {
          var matchingValue = k.match(valueRegex);
          if (matchingValue) {
            var match = matchingValue[0];
            if (match.split(".").length === valueNumberOfLevels) {
              valueMatches.push(keyPathMap[match]);
            }
          }
        });
        if (key !== void 0) {
          var collection = {};
          this.items.forEach(function(item, index) {
            collection[keyMatches[index] || ""] = valueMatches;
          });
          return new this.constructor(collection);
        }
        return new this.constructor([valueMatches]);
      }
      if (key !== void 0) {
        var _collection = {};
        this.items.forEach(function(item) {
          if (nestedValue(item, value) !== void 0) {
            _collection[item[key] || ""] = nestedValue(item, value);
          } else {
            _collection[item[key] || ""] = null;
          }
        });
        return new this.constructor(_collection);
      }
      return this.map(function(item) {
        if (nestedValue(item, value) !== void 0) {
          return nestedValue(item, value);
        }
        return null;
      });
    };
  }
});
var require_deleteKeys = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/helpers/deleteKeys.js"(exports, module) {
    var variadic = require_variadic();
    module.exports = function deleteKeys(obj) {
      for (var _len = arguments.length, keys = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        keys[_key - 1] = arguments[_key];
      }
      variadic(keys).forEach(function(key) {
        delete obj[key];
      });
    };
  }
});
var require_pop = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/pop.js"(exports, module) {
    var _require = require_is();
    var isArray = _require.isArray;
    var isObject = _require.isObject;
    var deleteKeys = require_deleteKeys();
    module.exports = function pop() {
      var _this = this;
      var count = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
      if (this.isEmpty()) {
        return null;
      }
      if (isArray(this.items)) {
        if (count === 1) {
          return this.items.pop();
        }
        return new this.constructor(this.items.splice(-count));
      }
      if (isObject(this.items)) {
        var keys = Object.keys(this.items);
        if (count === 1) {
          var key = keys[keys.length - 1];
          var last = this.items[key];
          deleteKeys(this.items, key);
          return last;
        }
        var poppedKeys = keys.slice(-count);
        var newObject = poppedKeys.reduce(function(acc, current) {
          acc[current] = _this.items[current];
          return acc;
        }, {});
        deleteKeys(this.items, poppedKeys);
        return new this.constructor(newObject);
      }
      return null;
    };
  }
});
var require_prepend = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/prepend.js"(exports, module) {
    module.exports = function prepend(value, key) {
      if (key !== void 0) {
        return this.put(key, value);
      }
      this.items.unshift(value);
      return this;
    };
  }
});
var require_pull = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/pull.js"(exports, module) {
    var _require = require_is();
    var isFunction = _require.isFunction;
    module.exports = function pull(key, defaultValue) {
      var returnValue = this.items[key] || null;
      if (!returnValue && defaultValue !== void 0) {
        if (isFunction(defaultValue)) {
          returnValue = defaultValue();
        } else {
          returnValue = defaultValue;
        }
      }
      delete this.items[key];
      return returnValue;
    };
  }
});
var require_push = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/push.js"(exports, module) {
    module.exports = function push() {
      var _this$items;
      (_this$items = this.items).push.apply(_this$items, arguments);
      return this;
    };
  }
});
var require_put = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/put.js"(exports, module) {
    module.exports = function put(key, value) {
      this.items[key] = value;
      return this;
    };
  }
});
var require_random = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/random.js"(exports, module) {
    var values = require_values();
    module.exports = function random() {
      var length = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
      var items = values(this.items);
      var collection = new this.constructor(items).shuffle();
      if (length !== parseInt(length, 10)) {
        return collection.first();
      }
      return collection.take(length);
    };
  }
});
var require_reduce = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/reduce.js"(exports, module) {
    module.exports = function reduce(fn, carry) {
      var _this = this;
      var reduceCarry = null;
      if (carry !== void 0) {
        reduceCarry = carry;
      }
      if (Array.isArray(this.items)) {
        this.items.forEach(function(item) {
          reduceCarry = fn(reduceCarry, item);
        });
      } else {
        Object.keys(this.items).forEach(function(key) {
          reduceCarry = fn(reduceCarry, _this.items[key], key);
        });
      }
      return reduceCarry;
    };
  }
});
var require_reject = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/reject.js"(exports, module) {
    module.exports = function reject(fn) {
      return new this.constructor(this.items).filter(function(item) {
        return !fn(item);
      });
    };
  }
});
var require_replace = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/replace.js"(exports, module) {
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        enumerableOnly && (symbols = symbols.filter(function(sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        })), keys.push.apply(keys, symbols);
      }
      return keys;
    }
    function _objectSpread(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = null != arguments[i] ? arguments[i] : {};
        i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
      return target;
    }
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    module.exports = function replace(items) {
      if (!items) {
        return this;
      }
      if (Array.isArray(items)) {
        var _replaced = this.items.map(function(value, index) {
          return items[index] || value;
        });
        return new this.constructor(_replaced);
      }
      if (items.constructor.name === "Collection") {
        var _replaced2 = _objectSpread(_objectSpread({}, this.items), items.all());
        return new this.constructor(_replaced2);
      }
      var replaced = _objectSpread(_objectSpread({}, this.items), items);
      return new this.constructor(replaced);
    };
  }
});
var require_replaceRecursive = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/replaceRecursive.js"(exports, module) {
    function _typeof(obj) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
        return typeof obj2;
      } : function(obj2) {
        return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      }, _typeof(obj);
    }
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        enumerableOnly && (symbols = symbols.filter(function(sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        })), keys.push.apply(keys, symbols);
      }
      return keys;
    }
    function _objectSpread(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = null != arguments[i] ? arguments[i] : {};
        i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
      return target;
    }
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    module.exports = function replaceRecursive(items) {
      var replace = function replace2(target, source) {
        var replaced = _objectSpread({}, target);
        var mergedKeys = Object.keys(_objectSpread(_objectSpread({}, target), source));
        mergedKeys.forEach(function(key) {
          if (!Array.isArray(source[key]) && _typeof(source[key]) === "object") {
            replaced[key] = replace2(target[key], source[key]);
          } else if (target[key] === void 0 && source[key] !== void 0) {
            if (_typeof(target[key]) === "object") {
              replaced[key] = _objectSpread({}, source[key]);
            } else {
              replaced[key] = source[key];
            }
          } else if (target[key] !== void 0 && source[key] === void 0) {
            if (_typeof(target[key]) === "object") {
              replaced[key] = _objectSpread({}, target[key]);
            } else {
              replaced[key] = target[key];
            }
          } else if (target[key] !== void 0 && source[key] !== void 0) {
            if (_typeof(source[key]) === "object") {
              replaced[key] = _objectSpread({}, source[key]);
            } else {
              replaced[key] = source[key];
            }
          }
        });
        return replaced;
      };
      if (!items) {
        return this;
      }
      if (!Array.isArray(items) && _typeof(items) !== "object") {
        return new this.constructor(replace(this.items, [items]));
      }
      if (items.constructor.name === "Collection") {
        return new this.constructor(replace(this.items, items.all()));
      }
      return new this.constructor(replace(this.items, items));
    };
  }
});
var require_reverse = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/reverse.js"(exports, module) {
    module.exports = function reverse() {
      var collection = [].concat(this.items).reverse();
      return new this.constructor(collection);
    };
  }
});
var require_search = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/search.js"(exports, module) {
    var _require = require_is();
    var isArray = _require.isArray;
    var isObject = _require.isObject;
    var isFunction = _require.isFunction;
    module.exports = function search(valueOrFunction, strict) {
      var _this = this;
      var result;
      var find = function find2(item, key) {
        if (isFunction(valueOrFunction)) {
          return valueOrFunction(_this.items[key], key);
        }
        if (strict) {
          return _this.items[key] === valueOrFunction;
        }
        return _this.items[key] == valueOrFunction;
      };
      if (isArray(this.items)) {
        result = this.items.findIndex(find);
      } else if (isObject(this.items)) {
        result = Object.keys(this.items).find(function(key) {
          return find(_this.items[key], key);
        });
      }
      if (result === void 0 || result < 0) {
        return false;
      }
      return result;
    };
  }
});
var require_shift = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/shift.js"(exports, module) {
    var _require = require_is();
    var isArray = _require.isArray;
    var isObject = _require.isObject;
    var deleteKeys = require_deleteKeys();
    module.exports = function shift() {
      var _this = this;
      var count = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
      if (this.isEmpty()) {
        return null;
      }
      if (isArray(this.items)) {
        if (count === 1) {
          return this.items.shift();
        }
        return new this.constructor(this.items.splice(0, count));
      }
      if (isObject(this.items)) {
        if (count === 1) {
          var key = Object.keys(this.items)[0];
          var value = this.items[key];
          delete this.items[key];
          return value;
        }
        var keys = Object.keys(this.items);
        var poppedKeys = keys.slice(0, count);
        var newObject = poppedKeys.reduce(function(acc, current) {
          acc[current] = _this.items[current];
          return acc;
        }, {});
        deleteKeys(this.items, poppedKeys);
        return new this.constructor(newObject);
      }
      return null;
    };
  }
});
var require_shuffle = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/shuffle.js"(exports, module) {
    var values = require_values();
    module.exports = function shuffle() {
      var items = values(this.items);
      var j;
      var x;
      var i;
      for (i = items.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = items[i - 1];
        items[i - 1] = items[j];
        items[j] = x;
      }
      this.items = items;
      return this;
    };
  }
});
var require_skip = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/skip.js"(exports, module) {
    var _require = require_is();
    var isObject = _require.isObject;
    module.exports = function skip(number) {
      var _this = this;
      if (isObject(this.items)) {
        return new this.constructor(Object.keys(this.items).reduce(function(accumulator, key, index) {
          if (index + 1 > number) {
            accumulator[key] = _this.items[key];
          }
          return accumulator;
        }, {}));
      }
      return new this.constructor(this.items.slice(number));
    };
  }
});
var require_skipUntil = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/skipUntil.js"(exports, module) {
    var _require = require_is();
    var isArray = _require.isArray;
    var isObject = _require.isObject;
    var isFunction = _require.isFunction;
    module.exports = function skipUntil(valueOrFunction) {
      var _this = this;
      var previous = null;
      var items;
      var callback = function callback2(value) {
        return value === valueOrFunction;
      };
      if (isFunction(valueOrFunction)) {
        callback = valueOrFunction;
      }
      if (isArray(this.items)) {
        items = this.items.filter(function(item) {
          if (previous !== true) {
            previous = callback(item);
          }
          return previous;
        });
      }
      if (isObject(this.items)) {
        items = Object.keys(this.items).reduce(function(acc, key) {
          if (previous !== true) {
            previous = callback(_this.items[key]);
          }
          if (previous !== false) {
            acc[key] = _this.items[key];
          }
          return acc;
        }, {});
      }
      return new this.constructor(items);
    };
  }
});
var require_skipWhile = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/skipWhile.js"(exports, module) {
    var _require = require_is();
    var isArray = _require.isArray;
    var isObject = _require.isObject;
    var isFunction = _require.isFunction;
    module.exports = function skipWhile(valueOrFunction) {
      var _this = this;
      var previous = null;
      var items;
      var callback = function callback2(value) {
        return value === valueOrFunction;
      };
      if (isFunction(valueOrFunction)) {
        callback = valueOrFunction;
      }
      if (isArray(this.items)) {
        items = this.items.filter(function(item) {
          if (previous !== true) {
            previous = !callback(item);
          }
          return previous;
        });
      }
      if (isObject(this.items)) {
        items = Object.keys(this.items).reduce(function(acc, key) {
          if (previous !== true) {
            previous = !callback(_this.items[key]);
          }
          if (previous !== false) {
            acc[key] = _this.items[key];
          }
          return acc;
        }, {});
      }
      return new this.constructor(items);
    };
  }
});
var require_slice = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/slice.js"(exports, module) {
    module.exports = function slice(remove, limit) {
      var collection = this.items.slice(remove);
      if (limit !== void 0) {
        collection = collection.slice(0, limit);
      }
      return new this.constructor(collection);
    };
  }
});
var require_sole = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/sole.js"(exports, module) {
    var _require = require_is();
    var isFunction = _require.isFunction;
    module.exports = function sole(key, operator, value) {
      var collection;
      if (isFunction(key)) {
        collection = this.filter(key);
      } else {
        collection = this.where(key, operator, value);
      }
      if (collection.isEmpty()) {
        throw new Error("Item not found.");
      }
      if (collection.count() > 1) {
        throw new Error("Multiple items found.");
      }
      return collection.first();
    };
  }
});
var require_some = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/some.js"(exports, module) {
    var contains = require_contains();
    module.exports = contains;
  }
});
var require_sort = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/sort.js"(exports, module) {
    module.exports = function sort(fn) {
      var collection = [].concat(this.items);
      if (fn === void 0) {
        if (this.every(function(item) {
          return typeof item === "number";
        })) {
          collection.sort(function(a, b) {
            return a - b;
          });
        } else {
          collection.sort();
        }
      } else {
        collection.sort(fn);
      }
      return new this.constructor(collection);
    };
  }
});
var require_sortDesc = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/sortDesc.js"(exports, module) {
    module.exports = function sortDesc() {
      return this.sort().reverse();
    };
  }
});
var require_sortBy = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/sortBy.js"(exports, module) {
    var nestedValue = require_nestedValue();
    var _require = require_is();
    var isFunction = _require.isFunction;
    module.exports = function sortBy(valueOrFunction) {
      var collection = [].concat(this.items);
      var getValue = function getValue2(item) {
        if (isFunction(valueOrFunction)) {
          return valueOrFunction(item);
        }
        return nestedValue(item, valueOrFunction);
      };
      collection.sort(function(a, b) {
        var valueA = getValue(a);
        var valueB = getValue(b);
        if (valueA === null || valueA === void 0) {
          return 1;
        }
        if (valueB === null || valueB === void 0) {
          return -1;
        }
        if (valueA < valueB) {
          return -1;
        }
        if (valueA > valueB) {
          return 1;
        }
        return 0;
      });
      return new this.constructor(collection);
    };
  }
});
var require_sortByDesc = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/sortByDesc.js"(exports, module) {
    module.exports = function sortByDesc(valueOrFunction) {
      return this.sortBy(valueOrFunction).reverse();
    };
  }
});
var require_sortKeys = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/sortKeys.js"(exports, module) {
    module.exports = function sortKeys() {
      var _this = this;
      var ordered = {};
      Object.keys(this.items).sort().forEach(function(key) {
        ordered[key] = _this.items[key];
      });
      return new this.constructor(ordered);
    };
  }
});
var require_sortKeysDesc = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/sortKeysDesc.js"(exports, module) {
    module.exports = function sortKeysDesc() {
      var _this = this;
      var ordered = {};
      Object.keys(this.items).sort().reverse().forEach(function(key) {
        ordered[key] = _this.items[key];
      });
      return new this.constructor(ordered);
    };
  }
});
var require_splice = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/splice.js"(exports, module) {
    module.exports = function splice(index, limit, replace) {
      var slicedCollection = this.slice(index, limit);
      this.items = this.diff(slicedCollection.all()).all();
      if (Array.isArray(replace)) {
        for (var iterator = 0, length = replace.length; iterator < length; iterator += 1) {
          this.items.splice(index + iterator, 0, replace[iterator]);
        }
      }
      return slicedCollection;
    };
  }
});
var require_split = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/split.js"(exports, module) {
    module.exports = function split(numberOfGroups) {
      var itemsPerGroup = Math.round(this.items.length / numberOfGroups);
      var items = JSON.parse(JSON.stringify(this.items));
      var collection = [];
      for (var iterator = 0; iterator < numberOfGroups; iterator += 1) {
        collection.push(new this.constructor(items.splice(0, itemsPerGroup)));
      }
      return new this.constructor(collection);
    };
  }
});
var require_sum = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/sum.js"(exports, module) {
    var values = require_values();
    var _require = require_is();
    var isFunction = _require.isFunction;
    module.exports = function sum(key) {
      var items = values(this.items);
      var total = 0;
      if (key === void 0) {
        for (var i = 0, length = items.length; i < length; i += 1) {
          total += parseFloat(items[i]);
        }
      } else if (isFunction(key)) {
        for (var _i = 0, _length = items.length; _i < _length; _i += 1) {
          total += parseFloat(key(items[_i]));
        }
      } else {
        for (var _i2 = 0, _length2 = items.length; _i2 < _length2; _i2 += 1) {
          total += parseFloat(items[_i2][key]);
        }
      }
      return parseFloat(total.toPrecision(12));
    };
  }
});
var require_take = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/take.js"(exports, module) {
    function _typeof(obj) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
        return typeof obj2;
      } : function(obj2) {
        return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      }, _typeof(obj);
    }
    module.exports = function take(length) {
      var _this = this;
      if (!Array.isArray(this.items) && _typeof(this.items) === "object") {
        var keys = Object.keys(this.items);
        var slicedKeys;
        if (length < 0) {
          slicedKeys = keys.slice(length);
        } else {
          slicedKeys = keys.slice(0, length);
        }
        var collection = {};
        keys.forEach(function(prop) {
          if (slicedKeys.indexOf(prop) !== -1) {
            collection[prop] = _this.items[prop];
          }
        });
        return new this.constructor(collection);
      }
      if (length < 0) {
        return new this.constructor(this.items.slice(length));
      }
      return new this.constructor(this.items.slice(0, length));
    };
  }
});
var require_takeUntil = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/takeUntil.js"(exports, module) {
    var _require = require_is();
    var isArray = _require.isArray;
    var isObject = _require.isObject;
    var isFunction = _require.isFunction;
    module.exports = function takeUntil(valueOrFunction) {
      var _this = this;
      var previous = null;
      var items;
      var callback = function callback2(value) {
        return value === valueOrFunction;
      };
      if (isFunction(valueOrFunction)) {
        callback = valueOrFunction;
      }
      if (isArray(this.items)) {
        items = this.items.filter(function(item) {
          if (previous !== false) {
            previous = !callback(item);
          }
          return previous;
        });
      }
      if (isObject(this.items)) {
        items = Object.keys(this.items).reduce(function(acc, key) {
          if (previous !== false) {
            previous = !callback(_this.items[key]);
          }
          if (previous !== false) {
            acc[key] = _this.items[key];
          }
          return acc;
        }, {});
      }
      return new this.constructor(items);
    };
  }
});
var require_takeWhile = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/takeWhile.js"(exports, module) {
    var _require = require_is();
    var isArray = _require.isArray;
    var isObject = _require.isObject;
    var isFunction = _require.isFunction;
    module.exports = function takeWhile(valueOrFunction) {
      var _this = this;
      var previous = null;
      var items;
      var callback = function callback2(value) {
        return value === valueOrFunction;
      };
      if (isFunction(valueOrFunction)) {
        callback = valueOrFunction;
      }
      if (isArray(this.items)) {
        items = this.items.filter(function(item) {
          if (previous !== false) {
            previous = callback(item);
          }
          return previous;
        });
      }
      if (isObject(this.items)) {
        items = Object.keys(this.items).reduce(function(acc, key) {
          if (previous !== false) {
            previous = callback(_this.items[key]);
          }
          if (previous !== false) {
            acc[key] = _this.items[key];
          }
          return acc;
        }, {});
      }
      return new this.constructor(items);
    };
  }
});
var require_tap = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/tap.js"(exports, module) {
    module.exports = function tap(fn) {
      fn(this);
      return this;
    };
  }
});
var require_times = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/times.js"(exports, module) {
    module.exports = function times(n, fn) {
      for (var iterator = 1; iterator <= n; iterator += 1) {
        this.items.push(fn(iterator));
      }
      return this;
    };
  }
});
var require_toArray = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/toArray.js"(exports, module) {
    module.exports = function toArray() {
      var collectionInstance = this.constructor;
      function iterate(list, collection2) {
        var childCollection = [];
        if (list instanceof collectionInstance) {
          list.items.forEach(function(i) {
            return iterate(i, childCollection);
          });
          collection2.push(childCollection);
        } else if (Array.isArray(list)) {
          list.forEach(function(i) {
            return iterate(i, childCollection);
          });
          collection2.push(childCollection);
        } else {
          collection2.push(list);
        }
      }
      if (Array.isArray(this.items)) {
        var collection = [];
        this.items.forEach(function(items) {
          iterate(items, collection);
        });
        return collection;
      }
      return this.values().all();
    };
  }
});
var require_toJson = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/toJson.js"(exports, module) {
    function _typeof(obj) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
        return typeof obj2;
      } : function(obj2) {
        return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      }, _typeof(obj);
    }
    module.exports = function toJson() {
      if (_typeof(this.items) === "object" && !Array.isArray(this.items)) {
        return JSON.stringify(this.all());
      }
      return JSON.stringify(this.toArray());
    };
  }
});
var require_transform = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/transform.js"(exports, module) {
    module.exports = function transform(fn) {
      var _this = this;
      if (Array.isArray(this.items)) {
        this.items = this.items.map(fn);
      } else {
        var collection = {};
        Object.keys(this.items).forEach(function(key) {
          collection[key] = fn(_this.items[key], key);
        });
        this.items = collection;
      }
      return this;
    };
  }
});
var require_undot = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/undot.js"(exports, module) {
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        enumerableOnly && (symbols = symbols.filter(function(sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        })), keys.push.apply(keys, symbols);
      }
      return keys;
    }
    function _objectSpread(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = null != arguments[i] ? arguments[i] : {};
        i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
      return target;
    }
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    module.exports = function undot() {
      var _this = this;
      if (Array.isArray(this.items)) {
        return this;
      }
      var collection = {};
      Object.keys(this.items).forEach(function(key) {
        if (key.indexOf(".") !== -1) {
          var obj = collection;
          key.split(".").reduce(function(acc, current, index, array) {
            if (!acc[current]) {
              acc[current] = {};
            }
            if (index === array.length - 1) {
              acc[current] = _this.items[key];
            }
            return acc[current];
          }, obj);
          collection = _objectSpread(_objectSpread({}, collection), obj);
        } else {
          collection[key] = _this.items[key];
        }
      });
      return new this.constructor(collection);
    };
  }
});
var require_unless = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/unless.js"(exports, module) {
    module.exports = function when(value, fn, defaultFn) {
      if (!value) {
        fn(this);
      } else {
        defaultFn(this);
      }
    };
  }
});
var require_whenNotEmpty = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/whenNotEmpty.js"(exports, module) {
    module.exports = function whenNotEmpty(fn, defaultFn) {
      if (Array.isArray(this.items) && this.items.length) {
        return fn(this);
      }
      if (Object.keys(this.items).length) {
        return fn(this);
      }
      if (defaultFn !== void 0) {
        if (Array.isArray(this.items) && !this.items.length) {
          return defaultFn(this);
        }
        if (!Object.keys(this.items).length) {
          return defaultFn(this);
        }
      }
      return this;
    };
  }
});
var require_whenEmpty = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/whenEmpty.js"(exports, module) {
    module.exports = function whenEmpty(fn, defaultFn) {
      if (Array.isArray(this.items) && !this.items.length) {
        return fn(this);
      }
      if (!Object.keys(this.items).length) {
        return fn(this);
      }
      if (defaultFn !== void 0) {
        if (Array.isArray(this.items) && this.items.length) {
          return defaultFn(this);
        }
        if (Object.keys(this.items).length) {
          return defaultFn(this);
        }
      }
      return this;
    };
  }
});
var require_union = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/union.js"(exports, module) {
    module.exports = function union(object) {
      var _this = this;
      var collection = JSON.parse(JSON.stringify(this.items));
      Object.keys(object).forEach(function(prop) {
        if (_this.items[prop] === void 0) {
          collection[prop] = object[prop];
        }
      });
      return new this.constructor(collection);
    };
  }
});
var require_unique = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/unique.js"(exports, module) {
    var _require = require_is();
    var isFunction = _require.isFunction;
    module.exports = function unique(key) {
      var collection;
      if (key === void 0) {
        collection = this.items.filter(function(element, index, self2) {
          return self2.indexOf(element) === index;
        });
      } else {
        collection = [];
        var usedKeys = [];
        for (var iterator = 0, length = this.items.length; iterator < length; iterator += 1) {
          var uniqueKey = void 0;
          if (isFunction(key)) {
            uniqueKey = key(this.items[iterator]);
          } else {
            uniqueKey = this.items[iterator][key];
          }
          if (usedKeys.indexOf(uniqueKey) === -1) {
            collection.push(this.items[iterator]);
            usedKeys.push(uniqueKey);
          }
        }
      }
      return new this.constructor(collection);
    };
  }
});
var require_unwrap = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/unwrap.js"(exports, module) {
    module.exports = function unwrap(value) {
      if (value instanceof this.constructor) {
        return value.all();
      }
      return value;
    };
  }
});
var require_values2 = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/values.js"(exports, module) {
    var getValues = require_values();
    module.exports = function values() {
      return new this.constructor(getValues(this.items));
    };
  }
});
var require_when = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/when.js"(exports, module) {
    module.exports = function when(value, fn, defaultFn) {
      if (value) {
        return fn(this, value);
      }
      if (defaultFn) {
        return defaultFn(this, value);
      }
      return this;
    };
  }
});
var require_where = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/where.js"(exports, module) {
    var values = require_values();
    var nestedValue = require_nestedValue();
    module.exports = function where(key, operator, value) {
      var comparisonOperator = operator;
      var comparisonValue = value;
      var items = values(this.items);
      if (operator === void 0 || operator === true) {
        return new this.constructor(items.filter(function(item) {
          return nestedValue(item, key);
        }));
      }
      if (operator === false) {
        return new this.constructor(items.filter(function(item) {
          return !nestedValue(item, key);
        }));
      }
      if (value === void 0) {
        comparisonValue = operator;
        comparisonOperator = "===";
      }
      var collection = items.filter(function(item) {
        switch (comparisonOperator) {
          case "==":
            return nestedValue(item, key) === Number(comparisonValue) || nestedValue(item, key) === comparisonValue.toString();
          default:
          case "===":
            return nestedValue(item, key) === comparisonValue;
          case "!=":
          case "<>":
            return nestedValue(item, key) !== Number(comparisonValue) && nestedValue(item, key) !== comparisonValue.toString();
          case "!==":
            return nestedValue(item, key) !== comparisonValue;
          case "<":
            return nestedValue(item, key) < comparisonValue;
          case "<=":
            return nestedValue(item, key) <= comparisonValue;
          case ">":
            return nestedValue(item, key) > comparisonValue;
          case ">=":
            return nestedValue(item, key) >= comparisonValue;
        }
      });
      return new this.constructor(collection);
    };
  }
});
var require_whereBetween = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/whereBetween.js"(exports, module) {
    module.exports = function whereBetween(key, values) {
      return this.where(key, ">=", values[0]).where(key, "<=", values[values.length - 1]);
    };
  }
});
var require_whereIn = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/whereIn.js"(exports, module) {
    var extractValues = require_values();
    var nestedValue = require_nestedValue();
    module.exports = function whereIn(key, values) {
      var items = extractValues(values);
      var collection = this.items.filter(function(item) {
        return items.indexOf(nestedValue(item, key)) !== -1;
      });
      return new this.constructor(collection);
    };
  }
});
var require_whereInstanceOf = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/whereInstanceOf.js"(exports, module) {
    module.exports = function whereInstanceOf(type) {
      return this.filter(function(item) {
        return item instanceof type;
      });
    };
  }
});
var require_whereNotBetween = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/whereNotBetween.js"(exports, module) {
    var nestedValue = require_nestedValue();
    module.exports = function whereNotBetween(key, values) {
      return this.filter(function(item) {
        return nestedValue(item, key) < values[0] || nestedValue(item, key) > values[values.length - 1];
      });
    };
  }
});
var require_whereNotIn = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/whereNotIn.js"(exports, module) {
    var extractValues = require_values();
    var nestedValue = require_nestedValue();
    module.exports = function whereNotIn(key, values) {
      var items = extractValues(values);
      var collection = this.items.filter(function(item) {
        return items.indexOf(nestedValue(item, key)) === -1;
      });
      return new this.constructor(collection);
    };
  }
});
var require_whereNull = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/whereNull.js"(exports, module) {
    module.exports = function whereNull() {
      var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
      return this.where(key, "===", null);
    };
  }
});
var require_whereNotNull = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/whereNotNull.js"(exports, module) {
    module.exports = function whereNotNull() {
      var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
      return this.where(key, "!==", null);
    };
  }
});
var require_wrap = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/wrap.js"(exports, module) {
    function _typeof(obj) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
        return typeof obj2;
      } : function(obj2) {
        return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      }, _typeof(obj);
    }
    module.exports = function wrap(value) {
      if (value instanceof this.constructor) {
        return value;
      }
      if (_typeof(value) === "object") {
        return new this.constructor(value);
      }
      return new this.constructor([value]);
    };
  }
});
var require_zip = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/methods/zip.js"(exports, module) {
    module.exports = function zip(array) {
      var _this = this;
      var values = array;
      if (values instanceof this.constructor) {
        values = values.all();
      }
      var collection = this.items.map(function(item, index) {
        return new _this.constructor([item, values[index]]);
      });
      return new this.constructor(collection);
    };
  }
});
var require_dist = __commonJS({
  "node_modules/.pnpm/collect.js@4.36.1/node_modules/collect.js/dist/index.js"(exports, module) {
    function _typeof(obj) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
        return typeof obj2;
      } : function(obj2) {
        return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      }, _typeof(obj);
    }
    function Collection(collection) {
      if (collection !== void 0 && !Array.isArray(collection) && _typeof(collection) !== "object") {
        this.items = [collection];
      } else if (collection instanceof this.constructor) {
        this.items = collection.all();
      } else {
        this.items = collection || [];
      }
    }
    var SymbolIterator = require_symbol_iterator();
    if (typeof Symbol !== "undefined") {
      Collection.prototype[Symbol.iterator] = SymbolIterator;
    }
    Collection.prototype.toJSON = function toJSON() {
      return this.items;
    };
    Collection.prototype.all = require_all();
    Collection.prototype.average = require_average();
    Collection.prototype.avg = require_avg();
    Collection.prototype.chunk = require_chunk();
    Collection.prototype.collapse = require_collapse();
    Collection.prototype.combine = require_combine();
    Collection.prototype.concat = require_concat();
    Collection.prototype.contains = require_contains();
    Collection.prototype.containsOneItem = require_containsOneItem();
    Collection.prototype.count = require_count();
    Collection.prototype.countBy = require_countBy();
    Collection.prototype.crossJoin = require_crossJoin();
    Collection.prototype.dd = require_dd();
    Collection.prototype.diff = require_diff();
    Collection.prototype.diffAssoc = require_diffAssoc();
    Collection.prototype.diffKeys = require_diffKeys();
    Collection.prototype.diffUsing = require_diffUsing();
    Collection.prototype.doesntContain = require_doesntContain();
    Collection.prototype.dump = require_dump();
    Collection.prototype.duplicates = require_duplicates();
    Collection.prototype.each = require_each();
    Collection.prototype.eachSpread = require_eachSpread();
    Collection.prototype.every = require_every();
    Collection.prototype.except = require_except();
    Collection.prototype.filter = require_filter();
    Collection.prototype.first = require_first();
    Collection.prototype.firstOrFail = require_firstOrFail();
    Collection.prototype.firstWhere = require_firstWhere();
    Collection.prototype.flatMap = require_flatMap();
    Collection.prototype.flatten = require_flatten();
    Collection.prototype.flip = require_flip();
    Collection.prototype.forPage = require_forPage();
    Collection.prototype.forget = require_forget();
    Collection.prototype.get = require_get();
    Collection.prototype.groupBy = require_groupBy();
    Collection.prototype.has = require_has();
    Collection.prototype.implode = require_implode();
    Collection.prototype.intersect = require_intersect();
    Collection.prototype.intersectByKeys = require_intersectByKeys();
    Collection.prototype.isEmpty = require_isEmpty();
    Collection.prototype.isNotEmpty = require_isNotEmpty();
    Collection.prototype.join = require_join();
    Collection.prototype.keyBy = require_keyBy();
    Collection.prototype.keys = require_keys();
    Collection.prototype.last = require_last();
    Collection.prototype.macro = require_macro();
    Collection.prototype.make = require_make();
    Collection.prototype.map = require_map();
    Collection.prototype.mapSpread = require_mapSpread();
    Collection.prototype.mapToDictionary = require_mapToDictionary();
    Collection.prototype.mapInto = require_mapInto();
    Collection.prototype.mapToGroups = require_mapToGroups();
    Collection.prototype.mapWithKeys = require_mapWithKeys();
    Collection.prototype.max = require_max();
    Collection.prototype.median = require_median();
    Collection.prototype.merge = require_merge();
    Collection.prototype.mergeRecursive = require_mergeRecursive();
    Collection.prototype.min = require_min();
    Collection.prototype.mode = require_mode();
    Collection.prototype.nth = require_nth();
    Collection.prototype.only = require_only();
    Collection.prototype.pad = require_pad();
    Collection.prototype.partition = require_partition();
    Collection.prototype.pipe = require_pipe();
    Collection.prototype.pluck = require_pluck();
    Collection.prototype.pop = require_pop();
    Collection.prototype.prepend = require_prepend();
    Collection.prototype.pull = require_pull();
    Collection.prototype.push = require_push();
    Collection.prototype.put = require_put();
    Collection.prototype.random = require_random();
    Collection.prototype.reduce = require_reduce();
    Collection.prototype.reject = require_reject();
    Collection.prototype.replace = require_replace();
    Collection.prototype.replaceRecursive = require_replaceRecursive();
    Collection.prototype.reverse = require_reverse();
    Collection.prototype.search = require_search();
    Collection.prototype.shift = require_shift();
    Collection.prototype.shuffle = require_shuffle();
    Collection.prototype.skip = require_skip();
    Collection.prototype.skipUntil = require_skipUntil();
    Collection.prototype.skipWhile = require_skipWhile();
    Collection.prototype.slice = require_slice();
    Collection.prototype.sole = require_sole();
    Collection.prototype.some = require_some();
    Collection.prototype.sort = require_sort();
    Collection.prototype.sortDesc = require_sortDesc();
    Collection.prototype.sortBy = require_sortBy();
    Collection.prototype.sortByDesc = require_sortByDesc();
    Collection.prototype.sortKeys = require_sortKeys();
    Collection.prototype.sortKeysDesc = require_sortKeysDesc();
    Collection.prototype.splice = require_splice();
    Collection.prototype.split = require_split();
    Collection.prototype.sum = require_sum();
    Collection.prototype.take = require_take();
    Collection.prototype.takeUntil = require_takeUntil();
    Collection.prototype.takeWhile = require_takeWhile();
    Collection.prototype.tap = require_tap();
    Collection.prototype.times = require_times();
    Collection.prototype.toArray = require_toArray();
    Collection.prototype.toJson = require_toJson();
    Collection.prototype.transform = require_transform();
    Collection.prototype.undot = require_undot();
    Collection.prototype.unless = require_unless();
    Collection.prototype.unlessEmpty = require_whenNotEmpty();
    Collection.prototype.unlessNotEmpty = require_whenEmpty();
    Collection.prototype.union = require_union();
    Collection.prototype.unique = require_unique();
    Collection.prototype.unwrap = require_unwrap();
    Collection.prototype.values = require_values2();
    Collection.prototype.when = require_when();
    Collection.prototype.whenEmpty = require_whenEmpty();
    Collection.prototype.whenNotEmpty = require_whenNotEmpty();
    Collection.prototype.where = require_where();
    Collection.prototype.whereBetween = require_whereBetween();
    Collection.prototype.whereIn = require_whereIn();
    Collection.prototype.whereInstanceOf = require_whereInstanceOf();
    Collection.prototype.whereNotBetween = require_whereNotBetween();
    Collection.prototype.whereNotIn = require_whereNotIn();
    Collection.prototype.whereNull = require_whereNull();
    Collection.prototype.whereNotNull = require_whereNotNull();
    Collection.prototype.wrap = require_wrap();
    Collection.prototype.zip = require_zip();
    var collect = function collect2(collection) {
      return new Collection(collection);
    };
    module.exports = collect;
    module.exports.collect = collect;
    module.exports["default"] = collect;
    module.exports.Collection = Collection;
  }
});
var __getOwnPropDesc22 = Object.getOwnPropertyDescriptor;
var __decorateClass22 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc22(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = decorator(result) || result;
  return result;
};
var DISCOVERABLE_DECORATOR_KEY_PREFIX = "@discoverable:";
var MODULE_METADATA = {
  IMPORTS: "imports",
  PROVIDERS: "providers",
  CONTROLLERS: "controllers",
  EXPORTS: "exports"
};
var GLOBAL_MODULE_METADATA = "__module:global__";
var PARAMTYPES_METADATA = "design:paramtypes";
var SELF_DECLARED_DEPS_METADATA = "self:paramtypes";
var PROPERTY_DEPS_METADATA = "self:properties_metadata";
var SCOPE_OPTIONS_METADATA = "scope:options";
var INJECTABLE_WATERMARK = "__injectable__";
function Injectable(options) {
  return (target) => {
    defineMetadata(INJECTABLE_WATERMARK, true, target);
    defineMetadata(SCOPE_OPTIONS_METADATA, options, target);
  };
}
var DiscoverableMetaHostCollection = class {
  static {
    this.metaHostLinks = /* @__PURE__ */ new Map();
  }
  static {
    this.providersByMetaKey = /* @__PURE__ */ new WeakMap();
  }
  /**
   * Register a class → metadata-key link.
   *
   * Called from inside the decorator returned by
   * `DiscoveryService.createDecorator()` whenever the decorator is applied
   * at class level.
   *
   * @param target - The decorated class (or constructor function)
   * @param metadataKey - The key produced by `DiscoveryService.createDecorator()`
   */
  static addClassMetaHostLink(target, metadataKey) {
    this.metaHostLinks.set(target, metadataKey);
  }
  /**
   * Remove every class → metadata-key link.
   *
   * Primarily useful for tests that register fresh classes for each
   * suite. Production code should never need to call this.
   */
  static clearClassMetaHostLinks() {
    this.metaHostLinks.clear();
  }
  /**
   * Inspect a provider wrapper and add it to the per-container index if
   * its class was registered via {@link addClassMetaHostLink}.
   *
   * Called once per provider during `ModuleContainer.addProvider()`.
   * No-op when the provider's class was never decorated with a
   * discoverable decorator — the common case.
   *
   * @param hostContainerRef - The `ModuleContainer` the provider belongs to
   * @param instanceWrapper - The provider wrapper produced by `Module.addProvider`
   */
  static inspectProvider(hostContainerRef, instanceWrapper) {
    const metaKey = this.getMetaKeyByInstanceWrapper(instanceWrapper);
    if (!metaKey) {
      return;
    }
    let collection = this.providersByMetaKey.get(hostContainerRef);
    if (!collection) {
      collection = /* @__PURE__ */ new Map();
      this.providersByMetaKey.set(hostContainerRef, collection);
    }
    this.insertByMetaKey(metaKey, instanceWrapper, collection);
  }
  /**
   * Insert a wrapper into the per-key set, creating the set on demand.
   *
   * Re-inserting the same wrapper is a no-op (Sets dedupe by reference),
   * which makes `inspectProvider` safe to call multiple times — useful in
   * scenarios where the same provider is registered into more than one
   * module via dynamic-module merging.
   *
   * @param metaKey - The discoverable key
   * @param instanceWrapper - The provider wrapper to add
   * @param collection - The per-container key-to-wrappers map
   */
  static insertByMetaKey(metaKey, instanceWrapper, collection) {
    const wrappers = collection.get(metaKey);
    if (wrappers) {
      wrappers.add(instanceWrapper);
      return;
    }
    collection.set(metaKey, /* @__PURE__ */ new Set([instanceWrapper]));
  }
  /**
   * Look up every provider tagged with the given metadata key for a
   * specific `ModuleContainer`.
   *
   * Returns an empty `Set` when nothing has been registered. Callers
   * typically wrap the result with `Array.from(...)` to expose it as an
   * array.
   *
   * @param hostContainerRef - The `ModuleContainer` to query
   * @param metaKey - The discoverable key to look up
   * @returns A `Set` of `InstanceWrapper`s — possibly empty
   */
  static getProvidersByMetaKey(hostContainerRef, metaKey) {
    const collection = this.providersByMetaKey.get(hostContainerRef);
    return collection?.get(metaKey) ?? /* @__PURE__ */ new Set();
  }
  /**
   * Resolve a wrapper's class reference, falling back through the
   * possible shapes a provider can take.
   *
   * - Class providers — `wrapper.metatype` is the class itself.
   * - Value providers — `wrapper.metatype` is `null`; we fall back to
   *   `wrapper.instance?.constructor` because the value is set at
   *   registration time.
   * - Factory providers — `wrapper.metatype` is the factory function and
   *   `wrapper.inject` is non-null. Falling back to
   *   `wrapper.instance?.constructor` would still point at the produced
   *   instance's class once it has been resolved, but at scan-time the
   *   instance is `null`. Factory-produced classes therefore are not
   *   indexed, which matches NestJS's behavior — there's no decorated
   *   class to associate the wrapper with.
   *
   * @param instanceWrapper - The wrapper to inspect
   * @returns The discoverable key, or `undefined` if the class isn't tagged
   */
  static getMetaKeyByInstanceWrapper(instanceWrapper) {
    let classRef;
    if (instanceWrapper.metatype && !instanceWrapper.inject) {
      classRef = instanceWrapper.metatype;
    } else {
      classRef = instanceWrapper.instance?.constructor ?? instanceWrapper.metatype;
    }
    if (!classRef) {
      return void 0;
    }
    return this.metaHostLinks.get(classRef);
  }
};
var resolvedInstances = /* @__PURE__ */ new Map();
function getTokenKey(token) {
  if (typeof token === "function") return token.name;
  if (typeof token === "symbol") return token.toString();
  return String(token);
}
function inject(token) {
  return new Proxy({}, {
    get(_target, prop) {
      {
        if (prop === Symbol.toPrimitive) return () => `[inject:${String(token)}]`;
        if (prop === Symbol.toStringTag) return `inject<${String(token)}>`;
        if (prop === Symbol.iterator) return void 0;
        if (prop === "toString") return () => `[inject:${String(token)}]`;
        if (prop === "valueOf") return () => null;
        if (prop === "toJSON") return () => null;
        if (prop === "$$typeof") return void 0;
        if (prop === "constructor") return void 0;
        if (prop === "prototype") return void 0;
        if (prop === "render") return void 0;
        if (prop === "displayName") return void 0;
        if (prop === "name") return `inject<${String(token)}>`;
        if (prop === "length") return 0;
        if (prop === "caller") return void 0;
        if (prop === "arguments") return void 0;
        if (prop === "apply") return void 0;
        if (prop === "call") return void 0;
        if (prop === "bind") return void 0;
        if (typeof prop === "string" && prop.startsWith("@@__IMMUTABLE")) return void 0;
        if (prop === "inspect" || prop === "nodeType") return void 0;
        throw new Error(
          `inject(${String(token)}) cannot resolve \u2014 application not bootstrapped yet. Ensure ApplicationFactory.create() has been called before accessing this service.`
        );
      }
    }
  });
}
inject.swap = function swap(token, instance) {
  const key = getTokenKey(token);
  resolvedInstances.set(key, instance);
};
inject.clear = function clear(token) {
  const key = getTokenKey(token);
  resolvedInstances.delete(key);
};
inject.clearAll = function clearAll() {
  resolvedInstances.clear();
};
function generateMetadataKey() {
  const cryptoRef = globalThis.crypto;
  const uuid = cryptoRef?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 12)}`;
  return `${DISCOVERABLE_DECORATOR_KEY_PREFIX}${uuid}`;
}
var DiscoveryService = class {
  /**
   * Create a new `DiscoveryService` instance.
   *
   * The container is normally injected automatically — `ApplicationFactory.create()`
   * registers `ModuleContainer` as a value provider on every module so any
   * module that imports `DiscoveryModule` can resolve it.
   *
   * @param modulesContainer - The active `ModuleContainer`
   */
  constructor(modulesContainer) {
    this.modulesContainer = modulesContainer;
  }
  /**
   * Create a discoverable class/method decorator.
   *
   * Each call generates a unique metadata key. The returned decorator:
   *
   * - At class level: writes the options under `KEY` on the class **and**
   *   registers the class with {@link DiscoverableMetaHostCollection} so
   *   it can be looked up by `getProviders({ metadataKey })`.
   *
   * - At method level: writes the options under `KEY` on the method's
   *   property descriptor value (the function). Methods are not registered
   *   with the static index — use `getMetadataByDecorator(decorator, wrapper, methodKey)`
   *   to read method-level metadata back.
   *
   * `opts` defaults to an empty object when omitted, mirroring NestJS's
   * behavior — `Reflect.getMetadata(KEY, target)` then returns `{}` rather
   * than `undefined`, which simplifies consumer code.
   *
   * @typeParam T - Shape of the options object
   * @returns A class/method decorator with a stable `KEY` property
   *
   * @example
   * ```typescript
   * const Webhook = DiscoveryService.createDecorator<{ name: string }>();
   *
   * @Webhook({ name: 'flush' })
   * class FlushWebhook {}
   *
   * Webhook.KEY; // → '@discoverable:7f1c8b40-…'
   * ```
   */
  static createDecorator() {
    const metadataKey = generateMetadataKey();
    const decorator = ((opts) => {
      const value = opts ?? {};
      return ((target, propertyKey, descriptor) => {
        if (descriptor && propertyKey !== void 0) {
          defineMetadata(metadataKey, value, descriptor.value);
          return descriptor;
        }
        DiscoverableMetaHostCollection.addClassMetaHostLink(target, metadataKey);
        defineMetadata(metadataKey, value, target);
        return target;
      });
    });
    Object.defineProperty(decorator, "KEY", {
      value: metadataKey,
      writable: false,
      configurable: false,
      enumerable: true
    });
    return decorator;
  }
  /**
   * Find provider wrappers in the running container.
   *
   * Three modes:
   *
   * - `getProviders()` — every provider in every module, flattened.
   * - `getProviders({ include: [SomeModule, ...] })` — providers from a
   *   whitelist of module classes only.
   * - `getProviders({ metadataKey: SomeDecorator.KEY })` — providers whose
   *   class was decorated with `SomeDecorator`. Resolved in O(1) via the
   *   static `DiscoverableMetaHostCollection` index.
   *
   * The `metadataKey` and `include` options are mutually exclusive — when
   * `metadataKey` is present it takes precedence and `modules` is ignored,
   * matching NestJS.
   *
   * @param options - Discovery filter
   * @param modules - Optional pre-computed module list (used internally)
   * @returns Array of `InstanceWrapper`s — possibly empty
   */
  getProviders(options = {}, modules = this.getModules(options)) {
    if ("metadataKey" in options && options.metadataKey) {
      const wrappers = DiscoverableMetaHostCollection.getProvidersByMetaKey(
        this.modulesContainer,
        options.metadataKey
      );
      return Array.from(wrappers);
    }
    const result = [];
    for (const moduleRef of modules) {
      for (const wrapper of moduleRef.providers.values()) {
        result.push(wrapper);
      }
    }
    return result;
  }
  /**
   * Read the metadata that was attached to a wrapper by a discoverable
   * decorator.
   *
   * Without `methodKey`, reads class-level metadata from
   * `wrapper.instance.constructor` (so `useValue` / `useFactory` providers
   * resolve to the actual class) or `wrapper.metatype` as a fallback.
   *
   * With `methodKey`, reads method-level metadata from
   * `wrapper.instance[methodKey]`. The wrapper must be resolved at this
   * point (which is always the case after `ApplicationFactory.create()` returns).
   *
   * @typeParam D - The decorator type, used to infer the options shape
   * @param decorator - The decorator factory whose `KEY` to look up
   * @param wrapper - A wrapper returned by `getProviders()`
   * @param methodKey - Optional method name for method-level metadata
   * @returns The options object, or `undefined` if the wrapper isn't tagged
   */
  getMetadataByDecorator(decorator, wrapper, methodKey) {
    if (methodKey) {
      const instance = wrapper.instance;
      const method = instance?.[methodKey];
      if (typeof method !== "function") {
        return void 0;
      }
      return getMetadata(decorator.KEY, method);
    }
    const classRef = wrapper.instance?.constructor ?? wrapper.metatype;
    if (!classRef) {
      return void 0;
    }
    return getMetadata(decorator.KEY, classRef);
  }
  /**
   * Resolve the module list to walk for `getProviders()` without a
   * `metadataKey` filter.
   *
   * @param options - The original discovery options
   * @returns Modules in the container, or a whitelisted subset
   */
  getModules(options = {}) {
    if (!("include" in options) || !options.include) {
      return [...this.modulesContainer.getModules().values()];
    }
    const whitelist = options.include;
    const matches = [];
    for (const moduleRef of this.modulesContainer.getModules().values()) {
      if (whitelist.some((cls) => cls === moduleRef.metatype)) {
        matches.push(moduleRef);
      }
    }
    return matches;
  }
};
DiscoveryService = __decorateClass22([
  Injectable()
], DiscoveryService);
__toESM(require_Reflect());
function Inject(token) {
  const hasExplicitToken = arguments.length > 0;
  return (target, key, index) => {
    let resolvedToken = token;
    if (!resolvedToken && !hasExplicitToken) {
      if (key !== void 0) {
        resolvedToken = getMetadata("design:type", target, key);
      } else if (index !== void 0) {
        const paramTypes = getMetadata(PARAMTYPES_METADATA, target) ?? [];
        resolvedToken = paramTypes[index];
      }
    }
    if (resolvedToken && typeof resolvedToken === "object" && "forwardRef" in resolvedToken) {
      const thunk = resolvedToken.forwardRef;
      resolvedToken = typeof thunk === "function" ? thunk() : thunk;
    }
    if (index !== void 0) {
      updateMetadata(
        SELF_DECLARED_DEPS_METADATA,
        [],
        (deps) => [...deps, { index, param: resolvedToken }],
        target
      );
    } else {
      updateMetadata(
        PROPERTY_DEPS_METADATA,
        [],
        (props) => [
          ...props,
          { key, type: resolvedToken }
        ],
        target.constructor
      );
    }
  };
}
var PROPERTY_TO_METADATA_KEY = {
  imports: MODULE_METADATA.IMPORTS,
  controllers: MODULE_METADATA.CONTROLLERS,
  providers: MODULE_METADATA.PROVIDERS,
  exports: MODULE_METADATA.EXPORTS
};
var VALID_MODULE_KEYS = new Set(Object.keys(PROPERTY_TO_METADATA_KEY));
function Module(metadata) {
  const invalidKeys = Object.keys(metadata).filter((key) => !VALID_MODULE_KEYS.has(key));
  if (invalidKeys.length > 0) {
    throw new Error(
      `Invalid property '${invalidKeys.join("', '")}' passed into the @Module() decorator. Valid properties are: ${[...VALID_MODULE_KEYS].join(", ")}.`
    );
  }
  return (target) => {
    for (const property in metadata) {
      if (!Object.prototype.hasOwnProperty.call(metadata, property)) continue;
      const metadataKey = PROPERTY_TO_METADATA_KEY[property];
      defineMetadata(metadataKey, metadata[property], target);
    }
  };
}
function Global() {
  return (target) => {
    defineMetadata(GLOBAL_MODULE_METADATA, true, target);
  };
}
var Reflector = class {
  /**
   * Read metadata from a single target (class or method).
   *
   * @typeParam T - The expected metadata type
   * @param metadataKey - The metadata key to read
   * @param target - The class constructor or method function
   * @returns The metadata value, or `undefined` if not set
   *
   * @example
   * ```typescript
   * const roles = reflector.get<string[]>('roles', handler);
   * ```
   */
  get(metadataKey, target) {
    return getMetadata(metadataKey, target);
  }
  /**
   * Read metadata from multiple targets and return the first non-undefined value.
   *
   * Useful for the "method overrides class" pattern — check the method
   * first, fall back to the class. The first target that has the metadata
   * wins.
   *
   * @typeParam T - The expected metadata type
   * @param metadataKey - The metadata key to read
   * @param targets - Array of targets to check in order (first match wins)
   * @returns The first non-undefined metadata value, or `undefined`
   *
   * @example
   * ```typescript
   * // Method-level @Roles(['admin']) overrides class-level @Roles(['user'])
   * const roles = reflector.getAllAndOverride<string[]>('roles', [
   *   handler,       // method — checked first
   *   controller,    // class — fallback
   * ]);
   * ```
   */
  getAllAndOverride(metadataKey, targets) {
    for (const target of targets) {
      const result = getMetadata(metadataKey, target);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }
  /**
   * Read metadata from multiple targets and merge all values into a flat array.
   *
   * Useful for the "accumulate from all levels" pattern — collect roles
   * from both the method and the class, then check if the user has any.
   *
   * @typeParam T - The expected metadata item type
   * @param metadataKey - The metadata key to read
   * @param targets - Array of targets to read from
   * @returns A flat array of all metadata values found (empty if none)
   *
   * @example
   * ```typescript
   * // Class has @Roles(['user']), method has @Roles(['admin'])
   * const allRoles = reflector.getAllAndMerge<string>('roles', [
   *   handler,
   *   controller,
   * ]);
   * // → ['admin', 'user']
   * ```
   */
  getAllAndMerge(metadataKey, targets) {
    const result = [];
    for (const target of targets) {
      const value = getMetadata(metadataKey, target);
      if (value === void 0) continue;
      if (Array.isArray(value)) {
        result.push(...value);
      } else {
        result.push(value);
      }
    }
    return result;
  }
};
Reflector = __decorateClass22([
  Injectable()
], Reflector);
var DiscoveryModule = class {
};
DiscoveryModule = __decorateClass22([
  Global(),
  Module({
    providers: [DiscoveryService],
    exports: [DiscoveryService]
  })
], DiscoveryModule);
var LOGGER_CONFIG = /* @__PURE__ */ Symbol.for("LOGGER_CONFIG");
var LOGGER_MANAGER = /* @__PURE__ */ Symbol.for("LOGGER_MANAGER");
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["Debug"] = 0] = "Debug";
  LogLevel2[LogLevel2["Info"] = 1] = "Info";
  LogLevel2[LogLevel2["Warn"] = 2] = "Warn";
  LogLevel2[LogLevel2["Error"] = 3] = "Error";
  LogLevel2[LogLevel2["Fatal"] = 4] = "Fatal";
  return LogLevel2;
})(LogLevel || {});
__toESM(require_dist());
var Str = class _Str {
  /**
   * Return the remainder of a string after the first occurrence of a given value.
   *
   * @param subject - The string to search in
   * @param search  - The value to search for
   * @returns The portion of the string after the first occurrence of search
   *
   * @example
   * ```typescript
   * Str.after('hello world', 'hello '); // 'world'
   * Str.after('a.b.c', '.');            // 'b.c'
   * ```
   */
  static after(subject, search) {
    if (search === "") return subject;
    const index = subject.indexOf(search);
    return index === -1 ? subject : subject.substring(index + search.length);
  }
  /**
   * Return the remainder of a string after the last occurrence of a given value
   */
  static afterLast(subject, search) {
    if (search === "") return subject;
    const index = subject.lastIndexOf(search);
    return index === -1 ? subject : subject.substring(index + search.length);
  }
  /**
   * Convert a string to title case following APA guidelines
   */
  static apa(value) {
    const minorWords = [
      "a",
      "an",
      "and",
      "as",
      "at",
      "but",
      "by",
      "for",
      "in",
      "of",
      "on",
      "or",
      "the",
      "to",
      "up"
    ];
    const words = value.split(" ");
    return words.map((word, index) => {
      if (index === 0 || !minorWords.includes(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    }).join(" ");
  }
  /**
   * Transliterate a UTF-8 value to ASCII
   */
  static ascii(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  /**
   * Get the portion of a string before the first occurrence of a given value
   */
  static before(subject, search) {
    if (search === "") return subject;
    const index = subject.indexOf(search);
    return index === -1 ? subject : subject.substring(0, index);
  }
  /**
   * Get the portion of a string before the last occurrence of a given value
   */
  static beforeLast(subject, search) {
    if (search === "") return subject;
    const index = subject.lastIndexOf(search);
    return index === -1 ? subject : subject.substring(0, index);
  }
  /**
   * Get the portion of a string between two values
   */
  static between(subject, from, to) {
    if (from === "" || to === "") return subject;
    const startIndex = subject.indexOf(from);
    if (startIndex === -1) return "";
    const start = startIndex + from.length;
    const endIndex = subject.indexOf(to, start);
    return endIndex === -1 ? "" : subject.substring(start, endIndex);
  }
  /**
   * Get the smallest possible portion of a string between two values
   */
  static betweenFirst(subject, from, to) {
    return _Str.between(subject, from, to);
  }
  /**
   * Convert a string to camelCase.
   *
   * Handles word boundaries from separators (`-`, `_`, space) and from
   * consecutive uppercase runs (e.g. `XML_HTTP_REQUEST` → `xmlHttpRequest`).
   *
   * @param value - The input string
   * @returns The camelCase string
   *
   * @example
   * ```typescript
   * Str.camel('foo_bar');           // 'fooBar'
   * Str.camel('foo-bar baz');        // 'fooBarBaz'
   * Str.camel('XML_HTTP_REQUEST');  // 'xmlHttpRequest'
   * ```
   */
  static camel(value) {
    return _Str.studly(value).replace(/^(.)/, (char) => char.toLowerCase());
  }
  /**
   * Get the character at the specified index
   */
  static charAt(subject, index) {
    if (index < 0 || index >= subject.length) return false;
    return subject.charAt(index);
  }
  /**
   * Remove the first occurrence of the given value from the start of the string
   */
  static chopStart(subject, search) {
    const searches = Array.isArray(search) ? search : [search];
    for (const s of searches) {
      if (subject.startsWith(s)) {
        return subject.substring(s.length);
      }
    }
    return subject;
  }
  /**
   * Remove the last occurrence of the given value from the end of the string
   */
  static chopEnd(subject, search) {
    const searches = Array.isArray(search) ? search : [search];
    for (const s of searches) {
      if (subject.endsWith(s)) {
        return subject.substring(0, subject.length - s.length);
      }
    }
    return subject;
  }
  /**
   * Determine if a given string contains a given substring
   */
  static contains(haystack, needles, ignoreCase = false) {
    const needleArray = Array.isArray(needles) ? needles : [needles];
    const subject = ignoreCase ? haystack.toLowerCase() : haystack;
    return needleArray.some((needle) => {
      const search = ignoreCase ? needle.toLowerCase() : needle;
      return subject.includes(search);
    });
  }
  /**
   * Determine if a given string contains all array values
   */
  static containsAll(haystack, needles, ignoreCase = false) {
    const subject = ignoreCase ? haystack.toLowerCase() : haystack;
    return needles.every((needle) => {
      const search = ignoreCase ? needle.toLowerCase() : needle;
      return subject.includes(search);
    });
  }
  /**
   * Determine if a given string doesn't contain a given substring
   */
  static doesntContain(haystack, needles, ignoreCase = false) {
    return !_Str.contains(haystack, needles, ignoreCase);
  }
  /**
   * Replace consecutive instances of a character with a single instance
   */
  static deduplicate(value, character = " ") {
    const escaped = character.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`${escaped}+`, "g");
    return value.replace(regex, character);
  }
  /**
   * Determine if a given string ends with a given substring
   */
  static endsWith(haystack, needles) {
    const needleArray = Array.isArray(needles) ? needles : [needles];
    return needleArray.some((needle) => haystack.endsWith(needle));
  }
  /**
   * Extract an excerpt from text that matches the first instance of a phrase
   */
  static excerpt(text, phrase, options = {}) {
    const radius = options.radius ?? 100;
    const omission = options.omission ?? "...";
    const index = text.indexOf(phrase);
    if (index === -1) return "";
    const start = Math.max(0, index - radius);
    const end = Math.min(text.length, index + phrase.length + radius);
    let excerpt = text.substring(start, end);
    if (start > 0) excerpt = omission + excerpt;
    if (end < text.length) excerpt = excerpt + omission;
    return excerpt;
  }
  /**
   * Cap a string with a single instance of a given value
   */
  static finish(value, cap) {
    return value.endsWith(cap) ? value : value + cap;
  }
  /**
   * Convert a string to headline case
   */
  static headline(value) {
    return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  }
  /**
   * Determine if a given string matches a given pattern
   */
  static is(pattern, value, ignoreCase = false) {
    const regexPattern = pattern.replace(/\*/g, ".*");
    const flags = ignoreCase ? "i" : "";
    const regex = new RegExp(`^${regexPattern}$`, flags);
    return regex.test(value);
  }
  /**
   * Determine if a given string is 7-bit ASCII
   */
  static isAscii(value) {
    return /^[\x00-\x7F]*$/.test(value);
  }
  /**
   * Determine if a given string is valid JSON
   */
  static isJson(value) {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Determine if a given string is a valid URL
   */
  static isUrl(value, protocols) {
    try {
      if (typeof URL === "undefined") {
        const urlPattern = /^https?:\/\/.+/i;
        return urlPattern.test(value);
      }
      const urlObj = new URL(value);
      if (protocols) {
        return protocols.includes(urlObj.protocol.replace(":", ""));
      }
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Determine if a given string is a valid ULID
   */
  static isUlid(value) {
    return /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(value);
  }
  /**
   * Determine if a given string is a valid UUID
   */
  static isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }
  /**
   * Convert a string to kebab-case
   */
  static kebab(value) {
    return value.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
  }
  /**
   * Return the given string with the first character lowercased
   */
  static lcfirst(value) {
    return value.charAt(0).toLowerCase() + value.slice(1);
  }
  /**
   * Return the length of the given string
   */
  static len(value) {
    return value.length;
  }
  /**
   * Limit the number of characters in a string
   */
  static limit(value, limit = 100, end = "...", preserveWords = false) {
    if (value.length <= limit) return value;
    let truncated = value.substring(0, limit);
    if (preserveWords) {
      const lastSpace = truncated.lastIndexOf(" ");
      if (lastSpace > 0) {
        truncated = truncated.substring(0, lastSpace);
      }
    }
    return truncated + end;
  }
  /**
   * Convert the given string to lowercase
   */
  static lower(value) {
    return value.toLowerCase();
  }
  /**
   * Masks a portion of a string with a repeated character
   */
  static mask(value, character, index, length) {
    if (index < 0) {
      index = value.length + index;
    }
    const maskLength = length ?? value.length - index;
    const mask = character.repeat(Math.abs(maskLength));
    return value.substring(0, index) + mask + value.substring(index + Math.abs(maskLength));
  }
  /**
   * Pad both sides of a string with another
   */
  static padBoth(value, length, pad = " ") {
    const totalPadding = length - value.length;
    if (totalPadding <= 0) return value;
    const leftPadding = Math.floor(totalPadding / 2);
    const rightPadding = totalPadding - leftPadding;
    return pad.repeat(leftPadding) + value + pad.repeat(rightPadding);
  }
  /**
   * Pad the left side of a string with another
   */
  static padLeft(value, length, pad = " ") {
    return value.padStart(length, pad);
  }
  /**
   * Pad the right side of a string with another
   */
  static padRight(value, length, pad = " ") {
    return value.padEnd(length, pad);
  }
  /**
   * Get the plural form of an English word
   */
  static plural(value, count = 2) {
    if (count === 1) return value;
    if (value.endsWith("y") && !/[aeiou]y$/i.test(value)) {
      return value.slice(0, -1) + "ies";
    }
    if (value.endsWith("s") || value.endsWith("x") || value.endsWith("z") || value.endsWith("ch") || value.endsWith("sh")) {
      return value + "es";
    }
    return value + "s";
  }
  /**
   * Pluralize the last word of an English, studly caps case string
   */
  static pluralStudly(value, count = 2) {
    const parts = value.match(/[A-Z][a-z]*/g) || [value];
    const lastWord = parts[parts.length - 1];
    const pluralized = _Str.plural(lastWord, count);
    parts[parts.length - 1] = pluralized;
    return parts.join("");
  }
  /**
   * Find the position of the first occurrence of a substring
   */
  static position(haystack, needle) {
    const pos = haystack.indexOf(needle);
    return pos === -1 ? false : pos;
  }
  /**
   * Generate a random string
   */
  static random(length = 16) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  /**
   * Remove the given value from the string
   */
  static remove(search, subject, caseSensitive = true) {
    const searches = Array.isArray(search) ? search : [search];
    let result = subject;
    searches.forEach((s) => {
      const flags = caseSensitive ? "g" : "gi";
      const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(escaped, flags), "");
    });
    return result;
  }
  /**
   * Repeat the given string
   */
  static repeat(value, times) {
    return value.repeat(times);
  }
  /**
   * Replace the given value in the given string
   */
  static replace(search, replace, subject, caseSensitive = true) {
    const flags = caseSensitive ? "g" : "gi";
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return subject.replace(new RegExp(escaped, flags), replace);
  }
  /**
   * Replace a given value in the string sequentially with an array
   */
  static replaceArray(search, replacements, subject) {
    let result = subject;
    let index = 0;
    while (result.includes(search) && index < replacements.length) {
      result = result.replace(search, replacements[index]);
      index++;
    }
    return result;
  }
  /**
   * Replace the first occurrence of a given value in the string
   */
  static replaceFirst(search, replace, subject) {
    return subject.replace(search, replace);
  }
  /**
   * Replace the last occurrence of a given value in the string
   */
  static replaceLast(search, replace, subject) {
    const index = subject.lastIndexOf(search);
    if (index === -1) return subject;
    return subject.substring(0, index) + replace + subject.substring(index + search.length);
  }
  /**
   * Replace the first occurrence only if it appears at the start
   */
  static replaceStart(search, replace, subject) {
    return subject.startsWith(search) ? replace + subject.substring(search.length) : subject;
  }
  /**
   * Replace the last occurrence only if it appears at the end
   */
  static replaceEnd(search, replace, subject) {
    return subject.endsWith(search) ? subject.substring(0, subject.length - search.length) + replace : subject;
  }
  /**
   * Reverse the given string
   */
  static reverse(value) {
    return value.split("").reverse().join("");
  }
  /**
   * Get the singular form of an English word
   */
  static singular(value) {
    if (value.endsWith("ies")) {
      return value.slice(0, -3) + "y";
    }
    if (value.endsWith("es")) {
      return value.slice(0, -2);
    }
    if (value.endsWith("s") && !value.endsWith("ss")) {
      return value.slice(0, -1);
    }
    return value;
  }
  /**
   * Generate a URL friendly slug
   */
  static slug(value, separator = "-") {
    return value.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, separator).replace(new RegExp(`${separator}+`, "g"), separator).replace(new RegExp(`^${separator}|${separator}$`, "g"), "");
  }
  /**
   * Convert a string to snake_case.
   *
   * Handles word boundaries from separators (`-`, `_`, space) and from
   * uppercase boundaries (camelCase or consecutive-uppercase runs).
   *
   * @param value     - The input string
   * @param delimiter - Word delimiter (default: `'_'`)
   * @returns The snake_case string
   *
   * @example
   * ```typescript
   * Str.snake('camelCase');     // 'camel_case'
   * Str.snake('HTMLParser');    // 'html_parser'
   * Str.snake('foo bar baz');    // 'foo_bar_baz'
   * ```
   */
  static snake(value, delimiter = "_") {
    return _Str.splitWords(value).map((word) => word.toLowerCase()).join(delimiter);
  }
  /**
   * Remove all extraneous whitespace
   */
  static squish(value) {
    return value.trim().replace(/\s+/g, " ");
  }
  /**
   * Begin a string with a single instance of a given value
   */
  static start(value, prefix) {
    return value.startsWith(prefix) ? value : prefix + value;
  }
  /**
   * Determine if a given string starts with a given substring
   */
  static startsWith(haystack, needles) {
    const needleArray = Array.isArray(needles) ? needles : [needles];
    return needleArray.some((needle) => haystack.startsWith(needle));
  }
  /**
   * Convert a value to StudlyCase (a.k.a. PascalCase).
   *
   * Splits the input into words on separators (`-`, `_`, space) and on
   * uppercase boundaries (camelCase or consecutive-uppercase runs), then
   * joins each word with its first letter capitalized and the rest
   * lowercased.
   *
   * @param value - The input string
   * @returns The StudlyCase string
   *
   * @example
   * ```typescript
   * Str.studly('hello_world');           // 'HelloWorld'
   * Str.studly('hello-world foo bar');    // 'HelloWorldFooBar'
   * Str.studly('XML_HTTP_REQUEST');      // 'XmlHttpRequest'
   * Str.studly('camelCase');              // 'CamelCase'
   * ```
   */
  static studly(value) {
    return _Str.splitWords(value).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
  }
  /**
   * Split a string into word tokens.
   *
   * Splits on `-`, `_`, whitespace, and on uppercase boundaries. Treats
   * consecutive uppercase letters followed by a lowercase letter as the
   * end of an uppercase run (so `XMLHttp` → `['XML', 'Http']`).
   *
   * @param value - The input string
   * @returns Array of word tokens (lowercased boundaries preserved)
   *
   * @internal Used by `camel`, `studly`, `kebab`, `snake`, etc.
   */
  static splitWords(value) {
    if (!value) return [];
    return value.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_\s]+/g, " ").trim().split(" ").filter(Boolean);
  }
  /**
   * Returns the portion of string specified by the start and length parameters
   */
  static substr(value, start, length) {
    return value.substr(start, length);
  }
  /**
   * Returns the number of substring occurrences
   */
  static substrCount(haystack, needle) {
    return (haystack.match(new RegExp(needle, "g")) || []).length;
  }
  /**
   * Replace text within a portion of a string
   */
  static substrReplace(value, replace, start, length) {
    const actualLength = length ?? value.length - start;
    return value.substring(0, start) + replace + value.substring(start + actualLength);
  }
  /**
   * Swap multiple keywords in a string with other keywords.
   *
   * Performs an atomic single-pass swap — replacements are applied
   * simultaneously so the output of one swap is never re-swapped.
   *
   * @param map     - Map of search → replace pairs
   * @param subject - The string to perform swaps on
   * @returns The string with all swaps applied
   *
   * @example
   * ```typescript
   * Str.swap({ foo: 'bar', bar: 'baz' }, 'foo bar');
   * // → 'bar baz' (not 'baz baz' — atomic, no re-swapping)
   * ```
   */
  static swap(map, subject) {
    const keys = Object.keys(map);
    if (keys.length === 0) return subject;
    const sortedKeys = [...keys].sort((a, b) => b.length - a.length);
    const escaped = sortedKeys.map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(escaped.join("|"), "g");
    return subject.replace(pattern, (match) => map[match] ?? match);
  }
  /**
   * Take the first or last {limit} characters
   */
  static take(value, limit) {
    if (limit < 0) {
      return value.slice(limit);
    }
    return value.slice(0, limit);
  }
  /**
   * Convert the given string to title case
   */
  static title(value) {
    return value.toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }
  /**
   * Convert the given string to Base64
   */
  static toBase64(value) {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(value).toString("base64");
    }
    if (typeof btoa !== "undefined") {
      return btoa(value);
    }
    throw new Error("Base64 encoding not supported in this environment");
  }
  /**
   * Transliterate a string to its closest ASCII representation
   */
  static transliterate(value) {
    return _Str.ascii(value);
  }
  /**
   * Trim whitespace from both ends of the string
   */
  static trim(value, characters) {
    if (!characters) return value.trim();
    const escaped = characters.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return value.replace(new RegExp(`^[${escaped}]+|[${escaped}]+$`, "g"), "");
  }
  /**
   * Trim whitespace from the beginning of the string
   */
  static ltrim(value, characters) {
    if (!characters) return value.trimStart();
    const escaped = characters.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return value.replace(new RegExp(`^[${escaped}]+`, "g"), "");
  }
  /**
   * Trim whitespace from the end of the string
   */
  static rtrim(value, characters) {
    if (!characters) return value.trimEnd();
    const escaped = characters.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return value.replace(new RegExp(`[${escaped}]+$`, "g"), "");
  }
  /**
   * Make a string's first character uppercase
   */
  static ucfirst(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  /**
   * Split a string by uppercase characters
   */
  static ucsplit(value) {
    return value.match(/[A-Z][a-z]*/g) || [value];
  }
  /**
   * Convert the given string to uppercase
   */
  static upper(value) {
    return value.toUpperCase();
  }
  /**
   * Remove the specified strings from the beginning and end
   */
  static unwrap(value, before, after) {
    const actualAfter = after ?? before;
    let result = value;
    if (result.startsWith(before)) {
      result = result.substring(before.length);
    }
    if (result.endsWith(actualAfter)) {
      result = result.substring(0, result.length - actualAfter.length);
    }
    return result;
  }
  /**
   * Get the number of words a string contains
   */
  static wordCount(value) {
    return value.trim().split(/\s+/).filter((word) => word.length > 0).length;
  }
  /**
   * Wrap a string to a given number of characters
   */
  static wordWrap(value, characters = 75, breakStr = "\n") {
    const words = value.split(" ");
    let line = "";
    const lines = [];
    words.forEach((word) => {
      if ((line + word).length > characters) {
        if (line) lines.push(line.trim());
        line = word + " ";
      } else {
        line += word + " ";
      }
    });
    if (line) lines.push(line.trim());
    return lines.join(breakStr);
  }
  /**
   * Limit the number of words in a string
   */
  static words(value, words = 100, end = "...") {
    const wordArray = value.split(/\s+/);
    if (wordArray.length <= words) return value;
    return wordArray.slice(0, words).join(" ") + end;
  }
  /**
   * Wrap the string with the given strings
   */
  static wrap(value, before, after) {
    const actualAfter = after ?? before;
    return before + value + actualAfter;
  }
};
var MultipleInstanceManager = class {
  constructor() {
    this.instances = /* @__PURE__ */ new Map();
    this.pending = /* @__PURE__ */ new Map();
    this.customCreators = /* @__PURE__ */ new Map();
    this.driverKey = "driver";
  }
  /**
   * Create a driver instance asynchronously.
   * Called by `instanceAsync()` when no custom creator is registered.
   *
   * Override this for drivers that require async initialization
   * (e.g., establishing connections, loading remote config).
   *
   * By default, falls back to the sync `createDriver()`.
   *
   * @param driver - The driver name from config
   * @param config - The raw instance config
   * @returns A promise that resolves to the driver instance
   */
  async createDriverAsync(driver, config) {
    return this.createDriver(driver, config);
  }
  // ── Lifecycle hook ──────────────────────────────────────────────────────
  /**
   * Called after a new instance is created and before it's cached.
   * Override to configure instances (e.g., set names, event dispatchers).
   *
   * @param name - The instance name
   * @param instance - The newly created instance
   * @returns The instance (possibly modified)
   */
  onInstanceCreated(_name, instance) {
    return instance;
  }
  // ── Public API — Sync ───────────────────────────────────────────────────
  /**
   * Get an instance by name (sync).
   *
   * Returns a cached instance if available, otherwise resolves
   * via `createDriver()` and caches it.
   *
   * @param name - Instance name (uses default if omitted)
   */
  instance(name) {
    const instanceName = name ?? this.getDefaultInstance();
    const existing = this.instances.get(instanceName);
    if (existing) {
      return existing;
    }
    const resolved = this.resolve(instanceName);
    this.instances.set(instanceName, resolved);
    return resolved;
  }
  // ── Public API — Async ──────────────────────────────────────────────────
  /**
   * Get an instance by name (async).
   *
   * Returns a cached instance if available, otherwise resolves
   * via `createDriverAsync()` and caches it.
   *
   * Deduplicates in-flight resolutions — if two callers request
   * the same instance simultaneously, they share one Promise.
   *
   * @param name - Instance name (uses default if omitted)
   *
   * @example
   * ```typescript
   * // In RedisManager:
   * async connection(name?: string): Promise<RedisConnection> {
   *   return this.instanceAsync(name);
   * }
   * ```
   */
  async instanceAsync(name) {
    const instanceName = name ?? this.getDefaultInstance();
    const existing = this.instances.get(instanceName);
    if (existing) {
      return existing;
    }
    let promise = this.pending.get(instanceName);
    if (!promise) {
      promise = this.resolveAsync(instanceName);
      this.pending.set(instanceName, promise);
    }
    try {
      const resolved = await promise;
      this.instances.set(instanceName, resolved);
      return resolved;
    } finally {
      this.pending.delete(instanceName);
    }
  }
  // ── Public API — Registration ───────────────────────────────────────────
  /**
   * Register a custom driver creator.
   * Custom creators take priority over built-in drivers.
   */
  extend(driver, creator) {
    this.customCreators.set(driver, creator);
    return this;
  }
  // ── Public API — Cache management ───────────────────────────────────────
  /**
   * Remove a cached instance, forcing re-creation on next access.
   *
   * @param name - Instance name(s). Uses default if omitted.
   */
  forgetInstance(name) {
    const names = name ? Array.isArray(name) ? name : [name] : [this.getDefaultInstance()];
    for (const n of names) {
      this.instances.delete(n);
    }
    return this;
  }
  /**
   * Remove all cached instances.
   */
  purge() {
    this.instances.clear();
    this.pending.clear();
  }
  /**
   * Check if an instance has been resolved and cached.
   */
  hasInstance(name) {
    return this.instances.has(name);
  }
  /**
   * Get all resolved instance names.
   */
  getResolvedInstances() {
    return Array.from(this.instances.keys());
  }
  /**
   * Manually set a resolved instance in the cache.
   * Useful when instance creation happens outside the normal
   * `instance()` / `instanceAsync()` flow.
   */
  setInstance(name, instance) {
    this.instances.set(name, instance);
  }
  // ── Deprecated aliases (backward compat) ────────────────────────────────
  /**
   * @deprecated Use `hasInstance()` instead.
   */
  hasResolvedInstance(name) {
    return this.hasInstance(name);
  }
  // ── Private — Sync resolution ───────────────────────────────────────────
  resolve(name) {
    const config = this.getInstanceConfig(name);
    if (!config) {
      throw new Error(`Instance [${name}] is not defined.`);
    }
    const driver = config[this.driverKey];
    if (!driver) {
      throw new Error(`Instance [${name}] does not specify a "${this.driverKey}".`);
    }
    const customCreator = this.customCreators.get(driver);
    const instance = customCreator ? customCreator(config) : this.createDriver(driver, config);
    return this.onInstanceCreated(name, instance);
  }
  // ── Private — Async resolution ──────────────────────────────────────────
  async resolveAsync(name) {
    const config = this.getInstanceConfig(name);
    if (!config) {
      throw new Error(`Instance [${name}] is not defined.`);
    }
    const driver = config[this.driverKey];
    if (!driver) {
      throw new Error(`Instance [${name}] does not specify a "${this.driverKey}".`);
    }
    const customCreator = this.customCreators.get(driver);
    const instance = customCreator ? customCreator(config) : await this.createDriverAsync(driver, config);
    return this.onInstanceCreated(name, instance);
  }
};
({
  [LogLevel.Debug]: "color: #8B8B8B",
  [LogLevel.Info]: "color: #2196F3",
  [LogLevel.Warn]: "color: #FF9800",
  [LogLevel.Error]: "color: #F44336",
  [LogLevel.Fatal]: "color: #FFFFFF; background: #F44336; font-weight: bold; padding: 1px 4px; border-radius: 2px"
});
var REPORTER_METADATA = "REPORTER_METADATA";
var LOGGER_STATIC_REF = "LoggerStaticRef";
function Reporter(options) {
  return (target) => {
    Injectable()(target);
    defineMetadata(REPORTER_METADATA, options, target);
  };
}
function toConsolaLevel(level) {
  switch (level) {
    case LogLevel.Debug:
      return 4;
    case LogLevel.Info:
      return 3;
    case LogLevel.Warn:
      return 2;
    case LogLevel.Error:
      return 1;
    case LogLevel.Fatal:
      return 0;
    default:
      return 3;
  }
}
var ConsoleReporter = class {
  /**
   * Create a new ConsoleReporter instance.
   *
   * @param options - Optional configuration for level and tag
   */
  constructor(options = {}) {
    this.name = "console";
    this._level = options.level ?? LogLevel.Debug;
    this.consola = createConsola2({
      level: toConsolaLevel(this._level),
      defaults: {
        tag: options.tag ?? "app"
      }
    });
  }
  /**
   * Deliver a log entry to the browser console.
   *
   * Routes the entry to the appropriate consola method based on
   * the log level. Context is passed as additional arguments so
   * DevTools can expand it as a structured object.
   *
   * Entries below the configured minimum level are silently skipped.
   *
   * @param entry - The log entry to output
   */
  report(entry) {
    if (entry.level < this._level) {
      return;
    }
    const hasContext = entry.context && Object.keys(entry.context).length > 0;
    switch (entry.level) {
      case LogLevel.Debug:
        hasContext ? this.consola.debug(entry.message, entry.context) : this.consola.debug(entry.message);
        break;
      case LogLevel.Info:
        hasContext ? this.consola.info(entry.message, entry.context) : this.consola.info(entry.message);
        break;
      case LogLevel.Warn:
        hasContext ? this.consola.warn(entry.message, entry.context) : this.consola.warn(entry.message);
        break;
      case LogLevel.Error:
        hasContext ? this.consola.error(entry.message, entry.context) : this.consola.error(entry.message);
        break;
      case LogLevel.Fatal:
        hasContext ? this.consola.fatal(entry.message, entry.context) : this.consola.fatal(entry.message);
        break;
      default:
        hasContext ? this.consola.log(entry.message, entry.context) : this.consola.log(entry.message);
    }
  }
  /**
   * No-op flush — console output is immediate.
   */
  flush() {
  }
  /** @inheritdoc */
  getLevel() {
    return this._level;
  }
  /** @inheritdoc */
  setLevel(level) {
    this._level = level;
    this.consola.level = toConsolaLevel(level);
  }
};
ConsoleReporter = __decorateClass2([
  Reporter({ name: "console" })
], ConsoleReporter);
var LoggerService = class _LoggerService {
  constructor(configOrContext) {
    this._level = LogLevel.Debug;
    this._sharedContext = {};
    if (typeof configOrContext === "string" || configOrContext === void 0) {
      this._mode = "facade";
      this._contextString = configOrContext;
    } else {
      this._mode = "config";
      this._config = configOrContext;
      this._reporters = configOrContext.reporters ?? [new ConsoleReporter()];
      this._level = configOrContext.level ?? LogLevel.Debug;
      if (configOrContext.context) {
        this._sharedContext = { ...configOrContext.context };
      }
    }
  }
  static {
    this.staticManagerRef = void 0;
  }
  /**
   * Set the static LoggerManager reference.
   * Called automatically by `LoggerModule.forRoot()` during bootstrap.
   *
   * @param manager - The bootstrapped LoggerManager instance
   */
  static overrideLogger(manager) {
    _LoggerService.staticManagerRef = manager;
  }
  static {
    this._fallbackLoggerInstance = void 0;
  }
  /**
   * Get the fallback logger instance (created lazily on first access).
   *
   * @returns A minimal LoggerService with console output at Warn level
   */
  static get _fallbackLogger() {
    if (!_LoggerService._fallbackLoggerInstance) {
      _LoggerService._fallbackLoggerInstance = new _LoggerService({
        reporters: [new ConsoleReporter({ level: LogLevel.Warn })]
      });
    }
    return _LoggerService._fallbackLoggerInstance;
  }
  // ── Log methods ─────────────────────────────────────────────────────────
  /**
   * Log a message at the debug level.
   *
   * @param message - The log message
   * @param context - Optional contextual data for this single entry
   */
  debug(message, context = {}) {
    if (this._mode === "facade") {
      this.facadeDispatch("debug", message, context);
    } else {
      this.emit(LogLevel.Debug, message, context);
    }
  }
  /**
   * Log a message at the info level.
   *
   * @param message - The log message
   * @param context - Optional contextual data for this single entry
   */
  info(message, context = {}) {
    if (this._mode === "facade") {
      this.facadeDispatch("info", message, context);
    } else {
      this.emit(LogLevel.Info, message, context);
    }
  }
  /**
   * Log a message at the warn level.
   *
   * @param message - The log message
   * @param context - Optional contextual data for this single entry
   */
  warn(message, context = {}) {
    if (this._mode === "facade") {
      this.facadeDispatch("warn", message, context);
    } else {
      this.emit(LogLevel.Warn, message, context);
    }
  }
  /**
   * Log a message at the error level.
   *
   * @param message - The log message
   * @param context - Optional contextual data for this single entry
   */
  error(message, context = {}) {
    if (this._mode === "facade") {
      this.facadeDispatch("error", message, context);
    } else {
      this.emit(LogLevel.Error, message, context);
    }
  }
  /**
   * Log a message at the fatal level.
   *
   * @param message - The log message
   * @param context - Optional contextual data for this single entry
   */
  fatal(message, context = {}) {
    if (this._mode === "facade") {
      this.facadeDispatch("fatal", message, context);
    } else {
      this.emit(LogLevel.Fatal, message, context);
    }
  }
  // ── Context management ──────────────────────────────────────────────────
  /**
   * Add persistent context merged into every future log entry.
   *
   * @param context - Key-value pairs to add to the shared context
   * @returns This instance for fluent chaining
   *
   * @example
   * ```typescript
   * logger.withContext({ requestId: 'abc-123', userId: '42' });
   * logger.info('Processing'); // includes requestId and userId
   * ```
   */
  withContext(context) {
    this._sharedContext = { ...this._sharedContext, ...context };
    return this;
  }
  /**
   * Remove keys from shared context, or clear it entirely.
   *
   * @param keys - Optional array of keys to remove. Omit to clear all.
   * @returns This instance for fluent chaining
   */
  withoutContext(keys) {
    if (!keys) {
      this._sharedContext = {};
    } else {
      for (const key of keys) {
        delete this._sharedContext[key];
      }
    }
    return this;
  }
  // ── Accessors ───────────────────────────────────────────────────────────
  /**
   * Get the reporters for this logger instance.
   *
   * @returns Array of active reporter instances
   */
  getReporters() {
    if (this._mode === "facade") {
      return this.resolveDelegate().getReporters();
    }
    return this._reporters;
  }
  /**
   * Get the configuration for this logger instance.
   *
   * @returns The ILoggerConfig, or undefined in facade mode
   */
  getConfig() {
    if (this._mode === "facade") {
      return this.resolveDelegate().getConfig();
    }
    return this._config;
  }
  // ── Private — Facade delegation ─────────────────────────────────────────
  /**
   * Resolve the delegate LoggerService for facade mode.
   * Returns the default channel from the static manager, or the fallback logger.
   *
   * @returns The resolved LoggerService to delegate calls to
   */
  resolveDelegate() {
    if (_LoggerService.staticManagerRef) {
      return _LoggerService.staticManagerRef.channel();
    }
    return _LoggerService._fallbackLogger;
  }
  /**
   * Dispatch a log call in facade mode: resolve delegate, merge contexts, call method.
   *
   * @param method - The log level method name
   * @param message - The log message
   * @param callContext - Per-call context data
   */
  facadeDispatch(method, message, callContext) {
    const delegate = this.resolveDelegate();
    const mergedContext = {
      ...this._contextString !== void 0 ? { context: this._contextString } : {},
      ...this._sharedContext,
      ...callContext
    };
    delegate[method](message, mergedContext);
  }
  // ── Private — Config-mode dispatch ──────────────────────────────────────
  /**
   * Emit a log entry to all reporters in config mode.
   *
   * Each reporter is wrapped in a try-catch to prevent a failing reporter
   * from blocking other reporters or crashing the application.
   *
   * @param level - The log level
   * @param message - The log message
   * @param context - Per-call context data
   */
  emit(level, message, context) {
    if (level < this._level) {
      return;
    }
    const entry = {
      level,
      message,
      context: { ...this._sharedContext, ...context },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    for (const reporter of this._reporters) {
      try {
        reporter.report(entry);
      } catch {
      }
    }
  }
};
var SilentReporter = class {
  constructor() {
    this.name = "silent";
    this._level = LogLevel.Debug;
  }
  /**
   * No-op report method. Silently discards the entry.
   *
   * @param _entry - The log entry (ignored)
   */
  report(_entry) {
  }
  /**
   * No-op flush.
   */
  flush() {
  }
  /** @inheritdoc */
  getLevel() {
    return this._level;
  }
  /** @inheritdoc */
  setLevel(level) {
    this._level = level;
  }
};
SilentReporter = __decorateClass2([
  Reporter({ name: "silent" })
], SilentReporter);
var LoggerManager = class extends MultipleInstanceManager {
  /**
   * Create a new LoggerManager instance.
   *
   * @param config - Logger module configuration (default channel, channels map)
   */
  constructor(config) {
    super();
    this.config = config;
    this.services = /* @__PURE__ */ new Map();
  }
  // ── Lifecycle ───────────────────────────────────────────────────────────
  /**
   * Called after all providers are instantiated.
   * Eagerly creates the default channel to catch config errors early.
   * If the default channel has issues, logs a warning instead of crashing.
   */
  onModuleInit() {
    try {
      this.channel();
    } catch (err) {
      console.warn(
        `[LoggerManager] Failed to create default channel '${this.config.default}':`,
        err.message
      );
    }
  }
  /**
   * Called on `app.close()`.
   * Flushes all reporters and clears internal caches.
   */
  async onModuleDestroy() {
    for (const [, service] of this.services) {
      for (const reporter of service.getReporters()) {
        reporter.flush?.();
      }
    }
    this.services.clear();
    this.purge();
  }
  // ── MultipleInstanceManager contract ────────────────────────────────────
  /**
   * Get the default channel name from configuration.
   *
   * @returns The default channel name (e.g., "console", "combined")
   */
  getDefaultInstance() {
    return this.config.default;
  }
  /**
   * Change the default channel at runtime.
   *
   * Subsequent calls to `channel()` without a name argument will
   * resolve to the new default. Does not affect already-resolved
   * LoggerService instances.
   *
   * @param name - The new default channel name (must exist in config)
   */
  setDefaultInstance(name) {
    this.config.default = name;
  }
  /**
   * Get the configuration for a named channel.
   *
   * Adds a synthetic `driver` field so the base class can resolve it.
   * The driver name is inferred from the first reporter's class name.
   *
   * @param name - Channel name to look up
   * @returns The channel configuration with a `driver` field, or `undefined`
   */
  getInstanceConfig(name) {
    const channelConfig = this.config.channels[name];
    if (!channelConfig) return void 0;
    const driver = this.resolveDriverName(channelConfig);
    return { driver, ...channelConfig };
  }
  /**
   * Create a channel driver instance (LoggerConfig).
   *
   * Called by the base class when a channel is requested for the first time.
   * Returns the channel config with default reporters if none specified.
   *
   * @param driver - Driver name inferred from reporters
   * @param config - Raw channel configuration
   * @returns A LoggerConfig with guaranteed reporters
   */
  createDriver(driver, config) {
    const channelConfig = config;
    if (!channelConfig.reporters || channelConfig.reporters.length === 0) {
      if (driver === "silent") {
        return { ...channelConfig, reporters: [new SilentReporter()] };
      }
      return { ...channelConfig, reporters: [new ConsoleReporter()] };
    }
    return channelConfig;
  }
  // ── Channel access ──────────────────────────────────────────────────────
  /**
   * Get a LoggerService for a named channel.
   *
   * The primary consumer API. Returns a LoggerService wrapping the
   * channel's reporters with debug, info, warn, error, fatal methods.
   * Cached — subsequent calls return the same instance.
   *
   * @param name - Channel name. Uses default if omitted.
   * @returns A LoggerService instance for the requested channel
   *
   * @example
   * ```typescript
   * const logger = manager.channel();           // default
   * const errors = manager.channel('errors');   // named
   * ```
   */
  channel(name) {
    const channelName = name ?? this.config.default;
    const existing = this.services.get(channelName);
    if (existing) return existing;
    const channelConfig = this.instance(channelName);
    const service = new LoggerService(channelConfig);
    this.services.set(channelName, service);
    return service;
  }
  // ── Introspection ───────────────────────────────────────────────────────
  /**
   * Get all configured channel names (from config, not just active).
   *
   * @returns Array of channel names
   */
  getChannelNames() {
    return Object.keys(this.config.channels);
  }
  /**
   * Check if a channel is configured (exists in config).
   *
   * @param name - Channel name to check
   * @returns `true` if the channel exists in configuration
   */
  hasChannel(name) {
    return name in this.config.channels;
  }
  /**
   * Check if a channel is currently active (cached and resolved).
   *
   * @param name - Channel name. Uses default if omitted.
   * @returns `true` if the channel has been resolved and cached
   */
  isChannelActive(name) {
    const channelName = name ?? this.config.default;
    return this.services.has(channelName);
  }
  // ── Channel management ──────────────────────────────────────────────────
  /**
   * Forget a cached channel and its LoggerService wrapper.
   * Forces re-creation on next `channel()` call.
   *
   * @param name - Channel name(s). Uses default if omitted.
   * @returns This instance for chaining
   */
  forgetChannel(name) {
    const names = name ? Array.isArray(name) ? name : [name] : [this.config.default];
    for (const n of names) {
      this.services.delete(n);
    }
    return this.forgetInstance(name);
  }
  /**
   * Clear all cached channels and LoggerService wrappers.
   * Forces full re-creation on next access.
   */
  purge() {
    this.services.clear();
    super.purge();
  }
  // ── Private helpers ─────────────────────────────────────────────────────
  /**
   * Resolve a driver name from channel config.
   * Used to populate the synthetic `driver` field for the base class.
   *
   * @param config - The channel configuration
   * @returns A driver name string (e.g., "console", "storage", "silent")
   */
  resolveDriverName(config) {
    if (!config.reporters || config.reporters.length === 0) {
      return "console";
    }
    const first = config.reporters[0];
    const name = Str.lower(first.constructor.name);
    if (Str.contains(name, "silent")) return "silent";
    if (Str.contains(name, "storage")) return "storage";
    return "console";
  }
};
LoggerManager = __decorateClass2([
  Injectable(),
  __decorateParam(0, Inject(LOGGER_CONFIG))
], LoggerManager);
var ReporterLoader = class {
  constructor(discoveryService, loggerManager) {
    this.discoveryService = discoveryService;
    this.loggerManager = loggerManager;
  }
  /**
   * Called after all modules are initialized.
   * Scans providers for `@Reporter` metadata and attaches them to channels.
   */
  onApplicationBootstrap() {
    this.loadReporters();
  }
  /**
   * Scan all providers for `@Reporter`-decorated classes and attach them.
   */
  loadReporters() {
    const providers = this.discoveryService.getProviders();
    for (const wrapper of providers) {
      const { instance } = wrapper;
      if (!instance || wrapper.isAlias) continue;
      const constructor = instance.constructor;
      if (!constructor) continue;
      const reporterOptions = getMetadata(
        REPORTER_METADATA,
        constructor
      );
      if (!reporterOptions) continue;
      const reporter = instance;
      if (typeof reporter.report !== "function") {
        console.error(
          `[Logger] Reporter "${reporterOptions.name}" does not implement ILogReporter.report()`
        );
        continue;
      }
      if (reporterOptions.level !== void 0 && typeof reporter.setLevel === "function") {
        reporter.setLevel(reporterOptions.level);
      }
      const targetChannels = reporterOptions.channels && reporterOptions.channels.length > 0 ? reporterOptions.channels : this.loggerManager.getChannelNames();
      for (const channelName of targetChannels) {
        if (!this.loggerManager.hasChannel(channelName)) {
          console.warn(
            `[Logger] Reporter "${reporterOptions.name}" targets channel "${channelName}" which does not exist`
          );
          continue;
        }
        const channelLogger = this.loggerManager.channel(channelName);
        const existingReporters = channelLogger.getReporters();
        const alreadyAttached = existingReporters.some((r) => r.name === reporterOptions.name);
        if (!alreadyAttached) {
          existingReporters.push(reporter);
        }
      }
    }
  }
};
ReporterLoader = __decorateClass2([
  Injectable()
], ReporterLoader);
var getLoggerChannelToken = (channelName = "default") => `LoggerChannel:${channelName}`;
var LoggerModule = class {
  /**
   * Configure the logger module.
   *
   * Channels are declared in config. Reporters are auto-discovered
   * from providers decorated with `@Reporter`.
   *
   * @param config - Logger configuration with named channels
   * @returns A DynamicModule with all logger providers
   */
  static forRoot(config) {
    const channelProviders = Object.keys(config.channels).map((channelName) => ({
      provide: getLoggerChannelToken(channelName),
      useFactory: (manager) => manager.channel(channelName),
      inject: [LoggerManager]
    }));
    const defaultChannelProvider = {
      provide: getLoggerChannelToken(),
      useFactory: (manager) => manager.channel(),
      inject: [LoggerManager]
    };
    const channelTokens = [
      getLoggerChannelToken(),
      ...Object.keys(config.channels).map(getLoggerChannelToken)
    ];
    return {
      module: LoggerModule,
      global: true,
      imports: [DiscoveryModule],
      providers: [
        { provide: LOGGER_CONFIG, useValue: config },
        { provide: LoggerManager, useClass: LoggerManager },
        { provide: LOGGER_MANAGER, useExisting: LoggerManager },
        ReporterLoader,
        {
          provide: LOGGER_STATIC_REF,
          useFactory: (manager) => {
            LoggerService.staticManagerRef = manager;
            return manager;
          },
          inject: [LoggerManager]
        },
        defaultChannelProvider,
        ...channelProviders
      ],
      exports: [LoggerManager, LOGGER_MANAGER, LOGGER_CONFIG, ...channelTokens]
    };
  }
};
LoggerModule = __decorateClass2([
  Global(),
  Module({})
], LoggerModule);
var Logger = LoggerService;
var StorageReporter = class {
  /**
   * Create a new StorageReporter instance.
   *
   * @param options - Optional configuration for storage key, limits, and level
   */
  constructor(options = {}) {
    this.name = "storage";
    this._level = options.level ?? LogLevel.Debug;
    this._key = options.key ?? "logger:entries";
    this._maxEntries = options.maxEntries ?? 100;
  }
  /**
   * Persist a log entry to localStorage.
   *
   * The entry is serialized as JSON, appended to the existing entries
   * array, and trimmed to the maximum entry limit. If localStorage is
   * unavailable or full, the error is silently swallowed.
   *
   * @param entry - The log entry to persist
   */
  report(entry) {
    if (entry.level < this._level) {
      return;
    }
    try {
      const entries = this.readEntries();
      entries.push(entry);
      while (entries.length > this._maxEntries) {
        entries.shift();
      }
      localStorage.setItem(this._key, JSON.stringify(entries));
    } catch {
    }
  }
  /**
   * No-op flush — localStorage writes are synchronous.
   */
  flush() {
  }
  /** @inheritdoc */
  getLevel() {
    return this._level;
  }
  /** @inheritdoc */
  setLevel(level) {
    this._level = level;
  }
  /**
   * Clear all stored log entries from localStorage.
   * Useful for manual cleanup or when resetting application state.
   */
  clear() {
    try {
      localStorage.removeItem(this._key);
    } catch {
    }
  }
  /**
   * Retrieve all stored log entries from localStorage.
   *
   * @returns An array of stored ILogEntry objects
   */
  getEntries() {
    return this.readEntries();
  }
  /**
   * Read the current entries array from localStorage.
   * Returns an empty array if the key does not exist or parsing fails.
   *
   * @returns The parsed entries array
   */
  readEntries() {
    try {
      const raw = localStorage.getItem(this._key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
};
StorageReporter = __decorateClass2([
  Reporter({ name: "storage" })
], StorageReporter);
var InjectLogger = (channelName) => Inject(getLoggerChannelToken(channelName));
var InjectLoggerManager = () => Inject(LOGGER_MANAGER);
var ContainerContext = createContext(null);
ContainerContext.displayName = "ContainerContext";
inject(LoggerManager);
function defineConfig(config) {
  return config;
}

// src/reporters/pino.reporter.ts
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
        LoggerModule$1.forRoot(resolvedPinoParams),
        // @stackra/ts-logger handles application-level logging
        LoggerModule.forRoot({
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
  Module$1({})
], NestLoggerModule);
/*! Bundled license information:

@stackra/ts-logger/dist/index.js:
  (**
   * @stackra/ts-logger v1.0.0
   * (c) 2026 [object Object]
   * @license MIT
   *)

@stackra/ts-logger/dist/index.js:
  (*! Bundled license information:
  
  reflect-metadata/Reflect.js:
    (*! *****************************************************************************
    Copyright (C) Microsoft. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0
    
    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.
    
    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** *)
  
  @stackra/ts-support/dist/index.js:
    (**
     * @stackra/ts-support v2.7.0
     * (c) 2026 [object Object]
     * @license MIT
     *)
  *)
*/

export { ConsoleReporter, InjectLogger, InjectLoggerManager, Logger, LoggerManager, LoggerModule, NestLoggerModule, PinoReporter, Reporter, SilentReporter, StorageReporter, defineConfig };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map