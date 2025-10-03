import { EventEmitter } from "node:events";
import { Writable } from "node:stream";
const hrtime$1 = /* @__PURE__ */ Object.assign(function hrtime(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, { bigint: function bigint() {
  return BigInt(Date.now() * 1e6);
} });
class ReadStream {
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
}
class WriteStream {
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
}
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = () => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  };
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
const NODE_VERSION = "22.14.0";
class Process extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw /* @__PURE__ */ createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw /* @__PURE__ */ createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw /* @__PURE__ */ createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw /* @__PURE__ */ createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw /* @__PURE__ */ createNotImplementedError("process.kill");
  }
  abort() {
    throw /* @__PURE__ */ createNotImplementedError("process.abort");
  }
  dlopen() {
    throw /* @__PURE__ */ createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw /* @__PURE__ */ createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw /* @__PURE__ */ createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw /* @__PURE__ */ createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw /* @__PURE__ */ createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw /* @__PURE__ */ createNotImplementedError("process.openStdin");
  }
  assert() {
    throw /* @__PURE__ */ createNotImplementedError("process.assert");
  }
  binding() {
    throw /* @__PURE__ */ createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
}
const globalProcess = globalThis["process"];
const getBuiltinModule = globalProcess.getBuiltinModule;
const workerdProcess = getBuiltinModule("node:process");
const isWorkerdProcessV2 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
const unenvProcess = new Process({
  env: globalProcess.env,
  // `hrtime` is only available from workerd process v2
  hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime$1,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
const { exit, features, platform } = workerdProcess;
const {
  // Always implemented by workerd
  env,
  // Only implemented in workerd v2
  hrtime: hrtime2,
  // Always implemented by workerd
  nextTick
} = unenvProcess;
const {
  _channel,
  _disconnect,
  _events,
  _eventsCount,
  _handleQueue,
  _maxListeners,
  _pendingMessage,
  _send,
  assert,
  disconnect,
  mainModule
} = unenvProcess;
const {
  // @ts-expect-error `_debugEnd` is missing typings
  _debugEnd,
  // @ts-expect-error `_debugProcess` is missing typings
  _debugProcess,
  // @ts-expect-error `_exiting` is missing typings
  _exiting,
  // @ts-expect-error `_fatalException` is missing typings
  _fatalException,
  // @ts-expect-error `_getActiveHandles` is missing typings
  _getActiveHandles,
  // @ts-expect-error `_getActiveRequests` is missing typings
  _getActiveRequests,
  // @ts-expect-error `_kill` is missing typings
  _kill,
  // @ts-expect-error `_linkedBinding` is missing typings
  _linkedBinding,
  // @ts-expect-error `_preload_modules` is missing typings
  _preload_modules,
  // @ts-expect-error `_rawDebug` is missing typings
  _rawDebug,
  // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
  _startProfilerIdleNotifier,
  // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
  _stopProfilerIdleNotifier,
  // @ts-expect-error `_tickCallback` is missing typings
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  availableMemory,
  // @ts-expect-error `binding` is missing typings
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  // @ts-expect-error `domain` is missing typings
  domain,
  emit,
  emitWarning,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  // @ts-expect-error `initgroups` is missing typings
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  memoryUsage,
  // @ts-expect-error `moduleLoadList` is missing typings
  moduleLoadList,
  off,
  on,
  once,
  // @ts-expect-error `openStdin` is missing typings
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  // @ts-expect-error `reallyExit` is missing typings
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = isWorkerdProcessV2 ? workerdProcess : unenvProcess;
const _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime2,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
globalThis.process = _process;
const noop = Object.assign(() => {
}, { __unenv__: true });
const _console = globalThis.console;
const _ignoreErrors = true;
const _stderr = new Writable();
const _stdout = new Writable();
const Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
const _times = /* @__PURE__ */ new Map();
const _stdoutErrorHandler = noop;
const _stderrErrorHandler = noop;
const workerdConsole = globalThis["console"];
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
globalThis.console = workerdConsole;
const _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
const _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
const nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
class PerformanceEntry {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
}
const PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
class PerformanceMeasure extends PerformanceEntry {
  entryType = "measure";
}
class PerformanceResourceTiming extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
}
class PerformanceObserverEntryList {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
}
class Performance {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
}
class PerformanceObserver {
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
}
const performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    form[key] = value;
  }
};
var handleParsingNestedValues = (form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match[1], new RegExp(`^${match[2]}(?=/${next})`)] : [label, match[1], new RegExp(`^${match[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decoder(match);
      } catch {
        return match;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", 8);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? decodeURIComponent_(value) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param ? /\%/.test(param) ? tryDecodeURIComponent(param) : param : void 0;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value && typeof value === "string") {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw[key]();
  };
  json() {
    return this.#cachedBody("json");
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};
var HtmlEscapedCallbackPhase = {
  Stringify: 1
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  {
    return resStr;
  }
};
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setHeaders = (headers, map = {}) => {
  for (const key of Object.keys(map)) {
    headers.set(key, map[key]);
  }
  return headers;
};
var Context = class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status = 200;
  #executionCtx;
  #headers;
  #preparedHeaders;
  #res;
  #isFresh = true;
  #layout;
  #renderer;
  #notFoundHandler;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    this.#isFresh = false;
    return this.#res ||= new Response("404 Not Found", { status: 404 });
  }
  set res(_res) {
    this.#isFresh = false;
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    if (value === void 0) {
      if (this.#headers) {
        this.#headers.delete(name);
      } else if (this.#preparedHeaders) {
        delete this.#preparedHeaders[name.toLocaleLowerCase()];
      }
      if (this.finalized) {
        this.res.headers.delete(name);
      }
      return;
    }
    if (options?.append) {
      if (!this.#headers) {
        this.#isFresh = false;
        this.#headers = new Headers(this.#preparedHeaders);
        this.#preparedHeaders = {};
      }
      this.#headers.append(name, value);
    } else {
      if (this.#headers) {
        this.#headers.set(name, value);
      } else {
        this.#preparedHeaders ??= {};
        this.#preparedHeaders[name.toLowerCase()] = value;
      }
    }
    if (this.finalized) {
      if (options?.append) {
        this.res.headers.append(name, value);
      } else {
        this.res.headers.set(name, value);
      }
    }
  };
  status = (status) => {
    this.#isFresh = false;
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    if (this.#isFresh && !headers && !arg && this.#status === 200) {
      return new Response(data, {
        headers: this.#preparedHeaders
      });
    }
    if (arg && typeof arg !== "number") {
      const header = new Headers(arg.headers);
      if (this.#headers) {
        this.#headers.forEach((v, k) => {
          if (k === "set-cookie") {
            header.append(k, v);
          } else {
            header.set(k, v);
          }
        });
      }
      const headers2 = setHeaders(header, this.#preparedHeaders);
      return new Response(data, {
        headers: headers2,
        status: arg.status ?? this.#status
      });
    }
    const status = typeof arg === "number" ? arg : this.#status;
    this.#preparedHeaders ??= {};
    this.#headers ??= new Headers();
    setHeaders(this.#headers, this.#preparedHeaders);
    if (this.#res) {
      this.#res.headers.forEach((v, k) => {
        if (k === "set-cookie") {
          this.#headers?.append(k, v);
        } else {
          this.#headers?.set(k, v);
        }
      });
      setHeaders(this.#headers, this.#preparedHeaders);
    }
    headers ??= {};
    for (const [k, v] of Object.entries(headers)) {
      if (typeof v === "string") {
        this.#headers.set(k, v);
      } else {
        this.#headers.delete(k);
        for (const v2 of v) {
          this.#headers.append(k, v2);
        }
      }
    }
    return new Response(data, {
      status,
      headers: this.#headers
    });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => {
    return typeof arg === "number" ? this.#newResponse(data, arg, headers) : this.#newResponse(data, arg);
  };
  text = (text, arg, headers) => {
    if (!this.#preparedHeaders) {
      if (this.#isFresh && !headers && !arg) {
        return new Response(text);
      }
      this.#preparedHeaders = {};
    }
    this.#preparedHeaders["content-type"] = TEXT_PLAIN;
    if (typeof arg === "number") {
      return this.#newResponse(text, arg, headers);
    }
    return this.#newResponse(text, arg);
  };
  json = (object, arg, headers) => {
    const body = JSON.stringify(object);
    this.#preparedHeaders ??= {};
    this.#preparedHeaders["content-type"] = "application/json";
    return typeof arg === "number" ? this.#newResponse(body, arg, headers) : this.#newResponse(body, arg);
  };
  html = (html, arg, headers) => {
    this.#preparedHeaders ??= {};
    this.#preparedHeaders["content-type"] = "text/html; charset=UTF-8";
    if (typeof html === "object") {
      return resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then((html2) => {
        return typeof arg === "number" ? this.#newResponse(html2, arg, headers) : this.#newResponse(html2, arg);
      });
    }
    return typeof arg === "number" ? this.#newResponse(html, arg, headers) : this.#newResponse(html, arg);
  };
  redirect = (location, status) => {
    this.#headers ??= new Headers();
    this.#headers.set("Location", String(location));
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
};
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    return err.getResponse();
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono$1 = class Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono$1({
      router: this.router,
      getPath: this.getPath
    });
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        replaceRequest = options.replaceRequest;
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node$1 = class Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node$1();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node$1();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node$1();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};
var emptyParam = [];
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.#buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  #buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (Object.keys(curNode.#children).includes(key)) {
        curNode = curNode.#children[key];
        const pattern2 = getPattern(p, nextP);
        if (pattern2) {
          possibleKeys.push(pattern2[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    const m = /* @__PURE__ */ Object.create(null);
    const handlerSet = {
      handler,
      possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
      score: this.#order
    };
    m[method] = handlerSet;
    curNode.#methods.push(m);
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          if (part === "") {
            continue;
          }
          const [key, name, matcher] = pattern;
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};
var Hono2 = class extends Hono$1 {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};
var cors = (options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  return async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    const allowOrigin = findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.origin !== "*") {
      const existingVary = c.req.header("Vary");
      if (existingVary) {
        set("Vary", existingVary);
      } else {
        set("Vary", "Origin");
      }
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      if (opts.allowMethods?.length) {
        set("Access-Control-Allow-Methods", opts.allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
  };
};
var validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
var validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
var parse = (cookie, name) => {
  if (cookie.indexOf(name) === -1) {
    return {};
  }
  const pairs = cookie.trim().split(";");
  const parsedCookie = {};
  for (let pairStr of pairs) {
    pairStr = pairStr.trim();
    const valueStartPos = pairStr.indexOf("=");
    if (valueStartPos === -1) {
      continue;
    }
    const cookieName = pairStr.substring(0, valueStartPos).trim();
    if (name !== cookieName || !validCookieNameRegEx.test(cookieName)) {
      continue;
    }
    let cookieValue = pairStr.substring(valueStartPos + 1).trim();
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
      cookieValue = cookieValue.slice(1, -1);
    }
    if (validCookieValueRegEx.test(cookieValue)) {
      parsedCookie[cookieName] = decodeURIComponent_(cookieValue);
      {
        break;
      }
    }
  }
  return parsedCookie;
};
var _serialize = (name, value, opt = {}) => {
  let cookie = `${name}=${value}`;
  if (name.startsWith("__Secure-") && !opt.secure) {
    throw new Error("__Secure- Cookie must have Secure attributes");
  }
  if (name.startsWith("__Host-")) {
    if (!opt.secure) {
      throw new Error("__Host- Cookie must have Secure attributes");
    }
    if (opt.path !== "/") {
      throw new Error('__Host- Cookie must have Path attributes with "/"');
    }
    if (opt.domain) {
      throw new Error("__Host- Cookie must not have Domain attributes");
    }
  }
  if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
    if (opt.maxAge > 3456e4) {
      throw new Error(
        "Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration."
      );
    }
    cookie += `; Max-Age=${opt.maxAge | 0}`;
  }
  if (opt.domain && opt.prefix !== "host") {
    cookie += `; Domain=${opt.domain}`;
  }
  if (opt.path) {
    cookie += `; Path=${opt.path}`;
  }
  if (opt.expires) {
    if (opt.expires.getTime() - Date.now() > 3456e7) {
      throw new Error(
        "Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future."
      );
    }
    cookie += `; Expires=${opt.expires.toUTCString()}`;
  }
  if (opt.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (opt.secure) {
    cookie += "; Secure";
  }
  if (opt.sameSite) {
    cookie += `; SameSite=${opt.sameSite.charAt(0).toUpperCase() + opt.sameSite.slice(1)}`;
  }
  if (opt.priority) {
    cookie += `; Priority=${opt.priority}`;
  }
  if (opt.partitioned) {
    if (!opt.secure) {
      throw new Error("Partitioned Cookie must have Secure attributes");
    }
    cookie += "; Partitioned";
  }
  return cookie;
};
var serialize = (name, value, opt) => {
  value = encodeURIComponent(value);
  return _serialize(name, value, opt);
};
var getCookie = (c, key, prefix) => {
  const cookie = c.req.raw.headers.get("Cookie");
  {
    if (!cookie) {
      return void 0;
    }
    let finalKey = key;
    const obj2 = parse(cookie, finalKey);
    return obj2[finalKey];
  }
};
var setCookie = (c, name, value, opt) => {
  let cookie;
  if (opt?.prefix === "secure") {
    cookie = serialize("__Secure-" + name, value, { path: "/", ...opt, secure: true });
  } else if (opt?.prefix === "host") {
    cookie = serialize("__Host-" + name, value, {
      ...opt,
      path: "/",
      secure: true,
      domain: void 0
    });
  } else {
    cookie = serialize(name, value, { path: "/", ...opt });
  }
  c.header("Set-Cookie", cookie, { append: true });
};
var createMiddleware = (middleware) => middleware;
var HTTPException = class extends Error {
  res;
  status;
  constructor(status = 500, options) {
    super(options?.message, { cause: options?.cause });
    this.res = options?.res;
    this.status = status;
  }
  getResponse() {
    if (this.res) {
      const newResponse = new Response(this.res.body, {
        status: this.status,
        headers: this.res.headers
      });
      return newResponse;
    }
    return new Response(this.message, {
      status: this.status
    });
  }
};
const DEFAULT_MOCHA_USERS_SERVICE_API_URL = "https://getmocha.com/u";
const MOCHA_SESSION_TOKEN_COOKIE_NAME = "mocha_session_token";
const SUPPORTED_OAUTH_PROVIDERS = ["google"];
async function getOAuthRedirectUrl(provider, options) {
  if (!SUPPORTED_OAUTH_PROVIDERS.includes(provider)) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
  const apiUrl = options.apiUrl || DEFAULT_MOCHA_USERS_SERVICE_API_URL;
  const response = await fetch(`${apiUrl}/oauth/${provider}/redirect_url`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": options.apiKey
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to get redirect URL for provider ${provider}: ${response.statusText}`);
  }
  const { redirect_url } = await response.json();
  return redirect_url;
}
async function exchangeCodeForSessionToken(code, options) {
  const apiUrl = options.apiUrl || DEFAULT_MOCHA_USERS_SERVICE_API_URL;
  const response = await fetch(`${apiUrl}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": options.apiKey
    },
    body: JSON.stringify({ code })
  });
  if (!response.ok) {
    throw new Error(`Failed to exchange code for session token: ${response.statusText}`);
  }
  const { session_token } = await response.json();
  return session_token;
}
async function getCurrentUser(sessionToken, options) {
  const apiUrl = options.apiUrl || DEFAULT_MOCHA_USERS_SERVICE_API_URL;
  try {
    const response = await fetch(`${apiUrl}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "x-api-key": options.apiKey
      }
    });
    if (!response.ok) {
      return null;
    }
    const { data: user } = await response.json();
    return user;
  } catch (error) {
    console.error("Error validating session:", error);
    return null;
  }
}
async function deleteSession(sessionToken, options) {
  const apiUrl = options.apiUrl || DEFAULT_MOCHA_USERS_SERVICE_API_URL;
  try {
    await fetch(`${apiUrl}/sessions`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "x-api-key": options.apiKey
      }
    });
  } catch (error) {
    console.error("Error deleting session:", error);
  }
}
const authMiddleware = createMiddleware(async (c, next) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
  if (typeof sessionToken !== "string") {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const options = {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
  };
  const user = await getCurrentUser(sessionToken, options);
  if (!user) {
    throw new HTTPException(401, { message: "Invalid session token" });
  }
  c.set("user", user);
  await next();
});
let siteConfig = null;
let lastConfigUpdate = 0;
const CONFIG_CACHE_DURATION = 5 * 60 * 1e3;
const defaultConfig = {
  site_name: "سوق حلب",
  site_name_en: "Market Halab",
  site_logo_url: "",
  site_description: "منصة تجارية متكاملة",
  primary_color: "#dc2626",
  secondary_color: "#059669",
  announcement_text: "مرحباً بكم في سوق حلب - أفضل المنتجات والخدمات",
  support_email: "",
  support_phone: "",
  facebook_url: "",
  twitter_url: "",
  min_deposit_amount: "10",
  max_deposit_amount: "1000",
  enable_registrations: "1"
};
const CONFIG_STORAGE_KEY = "site_config_v1";
async function getSiteConfig(db, env2) {
  const now = Date.now();
  if (siteConfig && now - lastConfigUpdate < CONFIG_CACHE_DURATION) {
    return siteConfig;
  }
  if (env2 && env2.SITE_CONFIG_KV) {
    try {
      const storedConfig = await env2.SITE_CONFIG_KV.get(CONFIG_STORAGE_KEY);
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        siteConfig = { ...defaultConfig, ...parsedConfig };
        lastConfigUpdate = now;
        return siteConfig;
      }
    } catch (error) {
      console.warn("Could not load config from KV storage:", error);
    }
  }
  try {
    const settings = await db.prepare(`
      SELECT setting_key, setting_value FROM settings
    `).all();
    const settingsMap = (settings.results || []).reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {});
    siteConfig = { ...defaultConfig, ...settingsMap };
    lastConfigUpdate = now;
    if (env2 && env2.SITE_CONFIG_KV) {
      try {
        await env2.SITE_CONFIG_KV.put(CONFIG_STORAGE_KEY, JSON.stringify(siteConfig));
      } catch (error) {
        console.warn("Could not save config to KV storage:", error);
      }
    }
    return siteConfig;
  } catch (error) {
    console.error("Error fetching site config:", error);
    return defaultConfig;
  }
}
async function updateSiteConfig(db, newSettings, env2) {
  try {
    for (const [key, value] of Object.entries(newSettings)) {
      await db.prepare(`
        INSERT OR REPLACE INTO settings (setting_key, setting_value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `).bind(key, value).run();
    }
    if (siteConfig) {
      siteConfig = { ...siteConfig, ...newSettings };
    } else {
      siteConfig = { ...defaultConfig, ...newSettings };
    }
    lastConfigUpdate = Date.now();
    if (env2 && env2.SITE_CONFIG_KV) {
      try {
        await env2.SITE_CONFIG_KV.put(CONFIG_STORAGE_KEY, JSON.stringify(siteConfig));
      } catch (error) {
        console.warn("Could not save config to KV storage:", error);
      }
    }
  } catch (error) {
    console.error("Error updating site config:", error);
    throw error;
  }
}
const app = new Hono2();
app.use("*", cors());
app.get("/api/oauth/google/redirect_url", async (c) => {
  const redirectUrl = await getOAuthRedirectUrl("google", {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
  });
  return c.json({ redirectUrl }, 200);
});
app.post("/api/sessions", async (c) => {
  const body = await c.req.json();
  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }
  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
  });
  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60
    // 60 days
  });
  return c.json({ success: true }, 200);
});
app.get("/api/users/me", authMiddleware, async (c) => {
  const mochaUser = c.get("user");
  if (!mochaUser) {
    return c.json({ error: "User not found" }, 404);
  }
  const db = c.env.DB;
  let localUser = await db.prepare(`
    SELECT * FROM users WHERE mocha_user_id = ?
  `).bind(mochaUser.id).first();
  if (!localUser) {
    const result = await db.prepare(`
      INSERT INTO users (mocha_user_id, username, email, full_name)
      VALUES (?, ?, ?, ?)
    `).bind(
      mochaUser.id,
      mochaUser.google_user_data?.name || mochaUser.email.split("@")[0],
      mochaUser.email,
      mochaUser.google_user_data?.name || mochaUser.email
    ).run();
    if (result.success) {
      localUser = await db.prepare(`
        SELECT * FROM users WHERE id = ?
      `).bind(result.meta.last_row_id).first();
    }
  }
  return c.json({
    ...mochaUser,
    localUser
  });
});
app.get("/api/logout", async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
  if (typeof sessionToken === "string") {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
    });
  }
  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0
  });
  return c.json({ success: true }, 200);
});
const adminAuthMiddleware = async (c, next) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
  if (!sessionToken) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const mochaUser = await getCurrentUser(sessionToken, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY
  });
  if (!mochaUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const db = c.env.DB;
  const user = await db.prepare(`
    SELECT * FROM users WHERE mocha_user_id = ? AND is_admin = 1 AND is_active = 1
  `).bind(mochaUser.id).first();
  if (!user) {
    return c.json({ error: "Admin access required" }, 403);
  }
  c.set("user", mochaUser);
  c.set("adminUser", user);
  await next();
};
app.get("/api/public/home", async (c) => {
  try {
    const db = c.env.DB;
    const config2 = await getSiteConfig(db, c.env);
    const banners = await db.prepare(`
      SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order, created_at DESC
    `).all();
    const categories = await db.prepare(`
      SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order, name_ar
    `).all();
    const featured_products = await db.prepare(`
      SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 
      ORDER BY p.created_at DESC 
      LIMIT 8
    `).all();
    const homeData = {
      banners: banners.results || [],
      categories: categories.results || [],
      featured_products: featured_products.results || [],
      announcement: config2.announcement_text,
      site_name: config2.site_name,
      site_name_en: config2.site_name_en,
      site_logo_url: config2.site_logo_url,
      primary_color: config2.primary_color,
      secondary_color: config2.secondary_color
    };
    return c.json(homeData);
  } catch (error) {
    console.error("Error fetching home data:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/public/categories", async (c) => {
  try {
    const db = c.env.DB;
    const categories = await db.prepare(`
      SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order, name_ar
    `).all();
    return c.json(categories.results || []);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/public/categories/:id/products", async (c) => {
  try {
    const categoryId = c.req.param("id");
    const db = c.env.DB;
    const products = await db.prepare(`
      SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.is_active = 1
      ORDER BY p.created_at DESC
    `).bind(categoryId).all();
    return c.json(products.results || []);
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/public/payment-methods", async (c) => {
  try {
    const db = c.env.DB;
    const paymentMethods = await db.prepare(`
      SELECT * FROM payment_methods WHERE is_active = 1 ORDER BY sort_order, name_ar
    `).all();
    return c.json(paymentMethods.results || []);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/public/payment-methods/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const paymentMethod = await db.prepare(`
      SELECT * FROM payment_methods WHERE id = ? AND is_active = 1
    `).bind(id).first();
    if (!paymentMethod) {
      return c.json({ error: "Payment method not found" }, 404);
    }
    return c.json(paymentMethod);
  } catch (error) {
    console.error("Error fetching payment method:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/public/popups", async (c) => {
  try {
    const db = c.env.DB;
    const popups = await db.prepare(`
      SELECT * FROM popups WHERE is_active = 1 ORDER BY created_at DESC
    `).all();
    return c.json(popups.results || []);
  } catch (error) {
    console.error("Error fetching popups:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/users/orders", authMiddleware, async (c) => {
  try {
    const mochaUser = c.get("user");
    if (!mochaUser) {
      return c.json({ error: "User not found" }, 404);
    }
    const db = c.env.DB;
    const localUser = await db.prepare(`
      SELECT * FROM users WHERE mocha_user_id = ?
    `).bind(mochaUser.id).first();
    if (!localUser) {
      return c.json({ error: "User not found" }, 404);
    }
    const orders = await db.prepare(`
      SELECT o.*, p.name_ar as product_name_ar, p.name_en as product_name_en
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.user_id = ? 
      ORDER BY o.created_at DESC 
      LIMIT 50
    `).bind(localUser.id).all();
    return c.json(orders.results || []);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/wallet/transactions", authMiddleware, async (c) => {
  try {
    const mochaUser = c.get("user");
    if (!mochaUser) {
      return c.json({ error: "User not found" }, 404);
    }
    const db = c.env.DB;
    const localUser = await db.prepare(`
      SELECT * FROM users WHERE mocha_user_id = ?
    `).bind(mochaUser.id).first();
    if (!localUser) {
      return c.json({ error: "User not found" }, 404);
    }
    const transactions = await db.prepare(`
      SELECT wt.*, pm.name_ar as payment_method_name
      FROM wallet_transactions wt
      LEFT JOIN payment_methods pm ON wt.payment_method_id = pm.id
      WHERE wt.user_id = ? 
      ORDER BY wt.created_at DESC 
      LIMIT 50
    `).bind(localUser.id).all();
    return c.json(transactions.results || []);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.post("/api/wallet/deposit", authMiddleware, async (c) => {
  try {
    const mochaUser = c.get("user");
    if (!mochaUser) {
      return c.json({ error: "User not found" }, 404);
    }
    const db = c.env.DB;
    const localUser = await db.prepare(`
      SELECT * FROM users WHERE mocha_user_id = ?
    `).bind(mochaUser.id).first();
    if (!localUser) {
      return c.json({ error: "User not found" }, 404);
    }
    const body = await c.req.json();
    const paymentMethod = await db.prepare(`
      SELECT * FROM payment_methods WHERE id = ? AND is_active = 1
    `).bind(body.payment_method_id).first();
    if (!paymentMethod) {
      return c.json({ error: "Invalid payment method" }, 400);
    }
    const amount = parseFloat(body.amount);
    const minAmount = paymentMethod.min_amount || 10;
    const maxAmount = paymentMethod.max_amount || 1e3;
    if (amount < minAmount || amount > maxAmount) {
      return c.json({
        error: `Amount must be between $${minAmount} and $${maxAmount}`
      }, 400);
    }
    const result = await db.prepare(`
      INSERT INTO wallet_transactions (
        user_id, amount, transaction_type, payment_method_id, 
        transaction_id, receipt_image_url, admin_notes
      ) VALUES (?, ?, 'deposit', ?, ?, ?, ?)
    `).bind(
      localUser.id,
      amount,
      body.payment_method_id,
      body.transaction_id || null,
      body.receipt_image_url || null,
      body.notes || null
    ).run();
    if (result.success) {
      return c.json({
        message: "Deposit request submitted successfully",
        transaction_id: result.meta.last_row_id
      });
    } else {
      return c.json({ error: "Failed to submit deposit request" }, 500);
    }
  } catch (error) {
    console.error("Error submitting deposit:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.post("/api/admin/create-first-admin", authMiddleware, async (c) => {
  try {
    const mochaUser = c.get("user");
    if (!mochaUser) {
      return c.json({ error: "User not found" }, 404);
    }
    const db = c.env.DB;
    const existingAdmin = await db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE is_admin = 1
    `).first();
    if (existingAdmin && existingAdmin.count > 0) {
      return c.json({ error: "Admin already exists" }, 400);
    }
    let localUser = await db.prepare(`
      SELECT * FROM users WHERE mocha_user_id = ?
    `).bind(mochaUser.id).first();
    if (!localUser) {
      const result = await db.prepare(`
        INSERT INTO users (mocha_user_id, username, email, full_name, is_admin)
        VALUES (?, ?, ?, ?, 1)
      `).bind(
        mochaUser.id,
        mochaUser.google_user_data?.name || mochaUser.email.split("@")[0],
        mochaUser.email,
        mochaUser.google_user_data?.name || mochaUser.email
      ).run();
      if (!result.success) {
        return c.json({ error: "Failed to create admin user" }, 500);
      }
    } else {
      await db.prepare(`
        UPDATE users SET is_admin = 1, updated_at = CURRENT_TIMESTAMP
        WHERE mocha_user_id = ?
      `).bind(mochaUser.id).run();
    }
    return c.json({ message: "First admin created successfully" });
  } catch (error) {
    console.error("Error creating first admin:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/admin/check", authMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const adminCount = await db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE is_admin = 1
    `).first();
    if (!adminCount || adminCount.count === 0) {
      return c.json({ hasAdmin: false }, 404);
    }
    return c.json({ hasAdmin: true });
  } catch (error) {
    console.error("Error checking admin:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/admin/dashboard", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const totalUsers = await db.prepare("SELECT COUNT(*) as count FROM users").first();
    const totalOrders = await db.prepare("SELECT COUNT(*) as count FROM orders").first();
    const totalRevenue = await db.prepare('SELECT SUM(amount) as total FROM wallet_transactions WHERE transaction_type = "deposit" AND status = "completed"').first();
    const pendingTransactions = await db.prepare('SELECT COUNT(*) as count FROM wallet_transactions WHERE status = "pending"').first();
    const todayStart = /* @__PURE__ */ new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();
    const todayUsers = await db.prepare("SELECT COUNT(*) as count FROM users WHERE created_at >= ?").bind(todayISO).first();
    const todayOrders = await db.prepare("SELECT COUNT(*) as count FROM orders WHERE created_at >= ?").bind(todayISO).first();
    const todayRevenue = await db.prepare('SELECT SUM(amount) as total FROM wallet_transactions WHERE transaction_type = "deposit" AND status = "completed" AND created_at >= ?').bind(todayISO).first();
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart);
    const yesterdayStartISO = yesterdayStart.toISOString();
    const yesterdayEndISO = yesterdayEnd.toISOString();
    const yesterdayUsers = await db.prepare("SELECT COUNT(*) as count FROM users WHERE created_at >= ? AND created_at < ?").bind(yesterdayStartISO, yesterdayEndISO).first();
    const yesterdayOrders = await db.prepare("SELECT COUNT(*) as count FROM orders WHERE created_at >= ? AND created_at < ?").bind(yesterdayStartISO, yesterdayEndISO).first();
    const yesterdayRevenue = await db.prepare('SELECT SUM(amount) as total FROM wallet_transactions WHERE transaction_type = "deposit" AND status = "completed" AND created_at >= ? AND created_at < ?').bind(yesterdayStartISO, yesterdayEndISO).first();
    const calculateGrowth = (today, yesterday) => {
      if (yesterday === 0) return today > 0 ? 100 : 0;
      return Math.round((today - yesterday) / yesterday * 100);
    };
    const todayUsersCount = todayUsers?.count || 0;
    const todayOrdersCount = todayOrders?.count || 0;
    const todayRevenueAmount = Number(todayRevenue?.total || 0);
    const yesterdayUsersCount = yesterdayUsers?.count || 0;
    const yesterdayOrdersCount = yesterdayOrders?.count || 0;
    const yesterdayRevenueAmount = Number(yesterdayRevenue?.total || 0);
    const recentUsers = await db.prepare("SELECT username, created_at FROM users ORDER BY created_at DESC LIMIT 2").all();
    const recentOrders = await db.prepare("SELECT o.*, u.username, p.name_ar FROM orders o LEFT JOIN users u ON o.user_id = u.id LEFT JOIN products p ON o.product_id = p.id ORDER BY o.created_at DESC LIMIT 2").all();
    const recentTransactions = await db.prepare('SELECT wt.*, u.username FROM wallet_transactions wt LEFT JOIN users u ON wt.user_id = u.id WHERE wt.status = "pending" ORDER BY wt.created_at DESC LIMIT 2').all();
    const recentActivity = [];
    for (const user of recentUsers.results || []) {
      const timeAgo = getTimeAgo(user.created_at);
      recentActivity.push({
        id: `user_${user.username}`,
        type: "user",
        message: `مستخدم جديد انضم: ${user.username}`,
        time: timeAgo,
        icon: "user"
      });
    }
    for (const order of recentOrders.results || []) {
      const timeAgo = getTimeAgo(order.created_at);
      recentActivity.push({
        id: `order_${order.id}`,
        type: "order",
        message: `طلب جديد: ${order.name_ar} - $${Number(order.price).toFixed(2)}`,
        time: timeAgo,
        icon: "cart"
      });
    }
    for (const transaction of recentTransactions.results || []) {
      const timeAgo = getTimeAgo(transaction.created_at);
      recentActivity.push({
        id: `transaction_${transaction.id}`,
        type: "payment",
        message: `معاملة مالية تحتاج مراجعة: $${Number(transaction.amount).toFixed(2)} - ${transaction.username}`,
        time: timeAgo,
        icon: "dollar"
      });
    }
    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    const stats = {
      totalUsers: totalUsers?.count || 0,
      totalOrders: totalOrders?.count || 0,
      totalRevenue: Number(totalRevenue?.total || 0),
      pendingTransactions: pendingTransactions?.count || 0,
      todayStats: {
        newUsers: todayUsersCount,
        newOrders: todayOrdersCount,
        todayRevenue: todayRevenueAmount
      },
      recentActivity: recentActivity.slice(0, 5),
      growthMetrics: {
        usersGrowth: calculateGrowth(todayUsersCount, yesterdayUsersCount),
        ordersGrowth: calculateGrowth(todayOrdersCount, yesterdayOrdersCount),
        revenueGrowth: calculateGrowth(todayRevenueAmount, yesterdayRevenueAmount)
      }
    };
    return c.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
function getTimeAgo(dateString) {
  const now = /* @__PURE__ */ new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1e3);
  if (diffInSeconds < 60) {
    return `منذ ${diffInSeconds} ثانية`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `منذ ${minutes} دقيقة`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `منذ ${hours} ساعة`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `منذ ${days} يوم`;
  }
}
app.get("/api/admin/users", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const offset = (page - 1) * limit;
    const users = await db.prepare(`
      SELECT * FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    const total = await db.prepare("SELECT COUNT(*) as count FROM users").first();
    return c.json({
      users: users.results || [],
      total: total?.count || 0,
      page,
      totalPages: Math.ceil(Number(total?.count || 0) / limit)
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.patch("/api/admin/users/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const { is_active, is_vip, is_admin } = await c.req.json();
    const db = c.env.DB;
    await db.prepare(`
      UPDATE users 
      SET is_active = ?, is_vip = ?, is_admin = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(is_active ? 1 : 0, is_vip ? 1 : 0, is_admin ? 1 : 0, id).run();
    return c.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.post("/api/admin/users/:id/add-balance", adminAuthMiddleware, async (c) => {
  try {
    const userId = c.req.param("id");
    const { amount, notes } = await c.req.json();
    const db = c.env.DB;
    if (amount <= 0) {
      return c.json({ error: "Invalid amount" }, 400);
    }
    await db.prepare(`
      UPDATE users 
      SET balance = COALESCE(CAST(balance AS REAL), 0.0) + CAST(? AS REAL), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(amount, userId).run();
    await db.prepare(`
      INSERT INTO wallet_transactions (user_id, amount, transaction_type, status, admin_notes)
      VALUES (?, ?, 'admin_credit', 'completed', ?)
    `).bind(userId, amount, notes || "Admin balance addition").run();
    return c.json({ message: "Balance added successfully" });
  } catch (error) {
    console.error("Error adding balance:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/admin/users/export", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const users = await db.prepare(`
      SELECT id, username, email, full_name, balance, is_admin, is_vip, is_active, created_at
      FROM users 
      ORDER BY created_at DESC
    `).all();
    const csvHeader = "ID,Username,Email,Full Name,Balance,Is Admin,Is VIP,Is Active,Created At\n";
    const csvContent = users.results.map(
      (user) => `${user.id},"${user.username}","${user.email}","${user.full_name}",${user.balance},${user.is_admin ? "Yes" : "No"},${user.is_vip ? "Yes" : "No"},${user.is_active ? "Yes" : "No"},${user.created_at}`
    ).join("\n");
    const csv = csvHeader + csvContent;
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users_export_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv"`
      }
    });
  } catch (error) {
    console.error("Error exporting users:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/admin/products", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const products = await db.prepare(`
      SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `).all();
    return c.json(products.results || []);
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/admin/categories", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const categories = await db.prepare(`
      SELECT * FROM categories ORDER BY level, sort_order, name_ar
    `).all();
    return c.json(categories.results || []);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/admin/providers", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const providers = await db.prepare(`
      SELECT * FROM service_providers ORDER BY created_at DESC
    `).all();
    return c.json(providers.results || []);
  } catch (error) {
    console.error("Error fetching providers:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.post("/api/admin/providers", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const { name, api_url, api_token, is_active } = await c.req.json();
    const result = await db.prepare(`
      INSERT INTO service_providers (name, api_url, api_token, is_active)
      VALUES (?, ?, ?, ?)
    `).bind(name, api_url, api_token, is_active ? 1 : 0).run();
    return c.json({ id: result.meta.last_row_id, message: "Provider created successfully" });
  } catch (error) {
    console.error("Error creating provider:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.put("/api/admin/providers/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const { name, api_url, api_token, is_active } = await c.req.json();
    await db.prepare(`
      UPDATE service_providers 
      SET name = ?, api_url = ?, api_token = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(name, api_url, api_token, is_active ? 1 : 0, id).run();
    return c.json({ message: "Provider updated successfully" });
  } catch (error) {
    console.error("Error updating provider:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.delete("/api/admin/providers/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const productCount = await db.prepare(`
      SELECT COUNT(*) as count FROM products WHERE provider_id = ?
    `).bind(id).first();
    if (productCount && productCount.count > 0) {
      return c.json({ error: "Cannot delete provider with existing products" }, 400);
    }
    await db.prepare(`DELETE FROM service_providers WHERE id = ?`).bind(id).run();
    return c.json({ message: "Provider deleted successfully" });
  } catch (error) {
    console.error("Error deleting provider:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.post("/api/admin/providers/test", adminAuthMiddleware, async (c) => {
  try {
    const { id } = await c.req.json();
    const db = c.env.DB;
    const provider = await db.prepare(`
      SELECT * FROM service_providers WHERE id = ?
    `).bind(id).first();
    if (!provider) {
      return c.json({ error: "Provider not found" }, 404);
    }
    const response = await fetch(provider.api_url + "/client/api/products", {
      headers: {
        "api-token": provider.api_token
      }
    });
    if (response.ok) {
      return c.json({ success: true, message: "Connection successful" });
    } else {
      return c.json({ success: false, error: "Connection failed" });
    }
  } catch (error) {
    console.error("Error testing provider:", error);
    return c.json({ success: false, error: "Connection error" });
  }
});
app.post("/api/admin/providers/balance", adminAuthMiddleware, async (c) => {
  try {
    const { id } = await c.req.json();
    const db = c.env.DB;
    const provider = await db.prepare(`
      SELECT * FROM service_providers WHERE id = ?
    `).bind(id).first();
    if (!provider) {
      return c.json({ error: "Provider not found" }, 404);
    }
    const response = await fetch(provider.api_url + "/client/api/profile", {
      headers: {
        "api-token": provider.api_token
      }
    });
    if (response.ok) {
      const data = await response.json();
      return c.json({
        success: true,
        balance: data.balance,
        email: data.email
      });
    } else {
      return c.json({ success: false, error: "Failed to fetch balance" });
    }
  } catch (error) {
    console.error("Error fetching provider balance:", error);
    return c.json({ success: false, error: "Balance fetch error" });
  }
});
app.post("/api/admin/providers/fetch-categories", adminAuthMiddleware, async (c) => {
  try {
    const { providerId } = await c.req.json();
    const db = c.env.DB;
    const provider = await db.prepare(`
      SELECT * FROM service_providers WHERE id = ?
    `).bind(providerId).first();
    if (!provider) {
      return c.json({ error: "Provider not found" }, 404);
    }
    const response = await fetch(provider.api_url + "/client/api/content/0", {
      headers: {
        "api-token": provider.api_token,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        return c.json({ error: "Invalid API response format (expected JSON, got HTML)" }, 400);
      }
      const data = await response.json();
      return c.json(data.categories || []);
    } else {
      const errorText = await response.text();
      console.error("API error:", errorText.substring(0, 200));
      return c.json({ error: "Failed to fetch categories from provider" }, 400);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ error: `Error fetching categories: ${error}` }, 500);
  }
});
app.post("/api/admin/providers/fetch-category-content", adminAuthMiddleware, async (c) => {
  try {
    const { providerId, categoryId } = await c.req.json();
    const db = c.env.DB;
    const provider = await db.prepare(`
      SELECT * FROM service_providers WHERE id = ?
    `).bind(providerId).first();
    if (!provider) {
      return c.json({ error: "Provider not found" }, 404);
    }
    const response = await fetch(provider.api_url + "/client/api/content/" + categoryId, {
      headers: {
        "api-token": provider.api_token,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response for category", categoryId, ":", text.substring(0, 200));
        return c.json({ error: "Invalid API response format (expected JSON, got HTML)" }, 400);
      }
      const data = await response.json();
      return c.json({
        categories: data.categories || [],
        products: data.products || []
      });
    } else {
      const errorText = await response.text();
      console.error("API error for category", categoryId, ":", errorText.substring(0, 200));
      return c.json({ error: "Failed to fetch category content from provider" }, 400);
    }
  } catch (error) {
    console.error("Error fetching category content:", error);
    return c.json({ error: `Error fetching category content: ${error}` }, 500);
  }
});
app.post("/api/admin/providers/import-tree", adminAuthMiddleware, async (c) => {
  try {
    const { providerId, categoryTree } = await c.req.json();
    const db = c.env.DB;
    const provider = await db.prepare(`
      SELECT * FROM service_providers WHERE id = ?
    `).bind(providerId).first();
    if (!provider) {
      return c.json({ error: "Provider not found" }, 404);
    }
    let importedCategories = 0;
    let importedProducts = 0;
    const importCategory = async (category, parentId = null) => {
      const existing = await db.prepare(`
        SELECT id FROM categories WHERE name_ar = ? OR name_en = ?
      `).bind(category.name, category.name).first();
      let categoryId;
      if (!existing) {
        let level = 0;
        let full_path = category.name;
        if (parentId) {
          const parent = await db.prepare(`SELECT level, full_path FROM categories WHERE id = ?`).bind(parentId).first();
          if (parent) {
            level = parent.level + 1;
            full_path = `${parent.full_path} > ${category.name}`;
          }
        }
        const result = await db.prepare(`
          INSERT INTO categories (name_ar, name_en, description, parent_id, level, full_path, is_active)
          VALUES (?, ?, ?, ?, ?, ?, 1)
        `).bind(category.name, category.name, category.description || null, parentId, level, full_path).run();
        categoryId = result.meta.last_row_id;
        importedCategories++;
      } else {
        categoryId = existing.id;
      }
      if (category.products && category.products.length > 0) {
        for (const product of category.products) {
          const existingProduct = await db.prepare(`
            SELECT id FROM products WHERE external_id = ? AND provider_id = ?
          `).bind(product.id, providerId).first();
          if (!existingProduct) {
            await db.prepare(`
              INSERT INTO products (
                provider_id, external_id, category_id, name_ar, name_en, 
                description, price, base_price, product_type, status,
                qty_values, params, available, is_active
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'automatic', 'accept', ?, ?, 1, 1)
            `).bind(
              providerId,
              product.id,
              categoryId,
              product.name,
              product.name,
              product.description || null,
              product.price,
              product.price,
              product.qty_values || null,
              product.params || null
            ).run();
            importedProducts++;
          }
        }
      }
      if (category.children && category.children.length > 0) {
        for (const subCategory of category.children) {
          await importCategory(subCategory, categoryId);
        }
      }
    };
    await importCategory(categoryTree);
    await db.prepare(`
      UPDATE service_providers SET last_sync_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(providerId).run();
    return c.json({
      message: "Tree imported successfully",
      imported: {
        categories: importedCategories,
        products: importedProducts
      }
    });
  } catch (error) {
    console.error("Error importing tree:", error);
    return c.json({ error: "Error importing tree" }, 500);
  }
});
app.post("/api/admin/providers/fetch-products", adminAuthMiddleware, async (c) => {
  try {
    const { providerId } = await c.req.json();
    const db = c.env.DB;
    const provider = await db.prepare(`
      SELECT * FROM service_providers WHERE id = ?
    `).bind(providerId).first();
    if (!provider) {
      return c.json({ error: "Provider not found" }, 404);
    }
    const response = await fetch(provider.api_url + "/client/api/products", {
      headers: {
        "api-token": provider.api_token
      }
    });
    if (response.ok) {
      const data = await response.json();
      return c.json(data.products || data || []);
    } else {
      return c.json({ error: "Failed to fetch products" }, 400);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ error: "Error fetching products" }, 500);
  }
});
app.post("/api/admin/providers/import", adminAuthMiddleware, async (c) => {
  try {
    const { providerId, selectedCategories, selectedProducts } = await c.req.json();
    const db = c.env.DB;
    const provider = await db.prepare(`
      SELECT * FROM service_providers WHERE id = ?
    `).bind(providerId).first();
    if (!provider) {
      return c.json({ error: "Provider not found" }, 404);
    }
    let importedCategories = 0;
    let importedProducts = 0;
    if (selectedCategories && selectedCategories.length > 0) {
      const categoriesResponse = await fetch(provider.api_url + "/client/api/content/0", {
        headers: {
          "api-token": provider.api_token
        }
      });
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        const categories = categoriesData.categories || [];
        for (const categoryId of selectedCategories) {
          const category = categories.find((c2) => c2.id === categoryId);
          if (category) {
            const existing = await db.prepare(`
              SELECT id FROM categories WHERE name_ar = ? OR name_en = ?
            `).bind(category.name, category.name).first();
            if (!existing) {
              await db.prepare(`
                INSERT INTO categories (name_ar, name_en, description, is_active)
                VALUES (?, ?, ?, 1)
              `).bind(category.name, category.name, category.description || null).run();
              importedCategories++;
            }
          }
        }
      }
    }
    if (selectedProducts && selectedProducts.length > 0) {
      const productsResponse = await fetch(provider.api_url + "/client/api/products", {
        headers: {
          "api-token": provider.api_token
        }
      });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const products = productsData.products || productsData || [];
        for (const productId of selectedProducts) {
          const product = products.find((p) => p.id === productId);
          if (product) {
            const existing = await db.prepare(`
              SELECT id FROM products WHERE external_id = ? AND provider_id = ?
            `).bind(product.id, providerId).first();
            if (!existing) {
              let categoryId = null;
              if (product.category_id) {
                const category = await db.prepare(`
                  SELECT id FROM categories WHERE name_ar = ? OR name_en = ?
                `).bind(product.category_name || "", product.category_name || "").first();
                if (category) {
                  categoryId = category.id;
                }
              }
              await db.prepare(`
                INSERT INTO products (
                  provider_id, external_id, category_id, name_ar, name_en, 
                  description, price, base_price, product_type, status,
                  qty_values, params, available, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'automatic', 'wait', ?, ?, 1, 1)
              `).bind(
                providerId,
                product.id,
                categoryId,
                product.name,
                product.name,
                product.description || null,
                product.price,
                product.price,
                product.qty_values || null,
                product.params || null
              ).run();
              importedProducts++;
            }
          }
        }
      }
    }
    await db.prepare(`
      UPDATE service_providers SET last_sync_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(providerId).run();
    return c.json({
      message: "Import completed successfully",
      imported: {
        categories: importedCategories,
        products: importedProducts
      }
    });
  } catch (error) {
    console.error("Error importing data:", error);
    return c.json({ error: "Error importing data" }, 500);
  }
});
app.patch("/api/admin/products/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = c.env.DB;
    const updates = [];
    const values = [];
    if (body.category_id !== void 0) {
      updates.push("category_id = ?");
      values.push(body.category_id);
    }
    if (body.status !== void 0) {
      updates.push("status = ?");
      values.push(body.status);
    }
    if (body.product_type !== void 0) {
      updates.push("product_type = ?");
      values.push(body.product_type);
    }
    if (body.price !== void 0) {
      updates.push("price = ?");
      values.push(body.price);
    }
    if (body.is_active !== void 0) {
      updates.push("is_active = ?");
      values.push(body.is_active ? 1 : 0);
    }
    if (updates.length === 0) {
      return c.json({ error: "No fields to update" }, 400);
    }
    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);
    await db.prepare(`
      UPDATE products SET ${updates.join(", ")} WHERE id = ?
    `).bind(...values).run();
    return c.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/admin/payment-methods", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const paymentMethods = await db.prepare(`
      SELECT * FROM payment_methods ORDER BY sort_order, name_ar
    `).all();
    return c.json(paymentMethods.results || []);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.post("/api/admin/payment-methods", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const {
      name_ar,
      name_en,
      image_url,
      description_ar,
      description_en,
      instructions_ar,
      instructions_en,
      requires_receipt,
      requires_transaction_id,
      custom_fields,
      min_amount,
      max_amount,
      is_active,
      sort_order
    } = await c.req.json();
    const result = await db.prepare(`
      INSERT INTO payment_methods (
        name_ar, name_en, image_url, description_ar, description_en,
        instructions_ar, instructions_en, requires_receipt, requires_transaction_id,
        custom_fields, min_amount, max_amount, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name_ar,
      name_en,
      image_url,
      description_ar,
      description_en,
      instructions_ar,
      instructions_en,
      requires_receipt ? 1 : 0,
      requires_transaction_id ? 1 : 0,
      custom_fields,
      min_amount || 10,
      max_amount || 1e3,
      is_active ? 1 : 0,
      sort_order || 0
    ).run();
    return c.json({ id: result.meta.last_row_id, message: "Payment method created successfully" });
  } catch (error) {
    console.error("Error creating payment method:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.put("/api/admin/payment-methods/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const {
      name_ar,
      name_en,
      image_url,
      description_ar,
      description_en,
      instructions_ar,
      instructions_en,
      requires_receipt,
      requires_transaction_id,
      custom_fields,
      min_amount,
      max_amount,
      is_active,
      sort_order
    } = await c.req.json();
    await db.prepare(`
      UPDATE payment_methods 
      SET name_ar = ?, name_en = ?, image_url = ?, description_ar = ?, description_en = ?,
          instructions_ar = ?, instructions_en = ?, requires_receipt = ?, requires_transaction_id = ?,
          custom_fields = ?, min_amount = ?, max_amount = ?, is_active = ?, sort_order = ?, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name_ar,
      name_en,
      image_url,
      description_ar,
      description_en,
      instructions_ar,
      instructions_en,
      requires_receipt ? 1 : 0,
      requires_transaction_id ? 1 : 0,
      custom_fields,
      min_amount || 10,
      max_amount || 1e3,
      is_active ? 1 : 0,
      sort_order || 0,
      id
    ).run();
    return c.json({ message: "Payment method updated successfully" });
  } catch (error) {
    console.error("Error updating payment method:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.delete("/api/admin/payment-methods/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const transactionCount = await db.prepare(`
      SELECT COUNT(*) as count FROM wallet_transactions WHERE payment_method_id = ?
    `).bind(id).first();
    if (transactionCount && transactionCount.count > 0) {
      await db.prepare(`
        UPDATE payment_methods SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(id).run();
      return c.json({ message: "Payment method deactivated (has existing transactions)" });
    }
    await db.prepare(`DELETE FROM payment_methods WHERE id = ?`).bind(id).run();
    return c.json({ message: "Payment method deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/admin/orders", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const orders = await db.prepare(`
      SELECT o.*, u.username, u.email, p.name_ar as product_name_ar
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN products p ON o.product_id = p.id
      ORDER BY o.created_at DESC
    `).all();
    return c.json(orders.results || []);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/admin/transactions", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const transactions = await db.prepare(`
      SELECT wt.*, u.username, u.email, pm.name_ar as payment_method_name
      FROM wallet_transactions wt
      LEFT JOIN users u ON wt.user_id = u.id
      LEFT JOIN payment_methods pm ON wt.payment_method_id = pm.id
      ORDER BY wt.created_at DESC
    `).all();
    return c.json(transactions.results || []);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.patch("/api/admin/transactions/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const { status, admin_notes } = await c.req.json();
    const db = c.env.DB;
    const transaction = await db.prepare(`
      SELECT * FROM wallet_transactions WHERE id = ?
    `).bind(id).first();
    if (!transaction) {
      return c.json({ error: "Transaction not found" }, 404);
    }
    await db.prepare(`
      UPDATE wallet_transactions 
      SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, admin_notes, id).run();
    if (status === "completed" && transaction.transaction_type === "deposit") {
      const amount = parseFloat(transaction.amount.toString());
      await db.prepare(`
        UPDATE users 
        SET balance = COALESCE(CAST(balance AS REAL), 0.0) + CAST(? AS REAL), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(amount, transaction.user_id).run();
    }
    if (status === "rejected" && transaction.status === "completed" && transaction.transaction_type === "deposit") {
      const amount = parseFloat(transaction.amount.toString());
      await db.prepare(`
        UPDATE users 
        SET balance = COALESCE(CAST(balance AS REAL), 0.0) - CAST(? AS REAL), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(amount, transaction.user_id).run();
    }
    return c.json({ message: "Transaction updated successfully" });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/admin/settings", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const config2 = await getSiteConfig(db, c.env);
    return c.json(config2);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.post("/api/admin/settings", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const settings = await c.req.json();
    await updateSiteConfig(db, settings, c.env);
    return c.json({
      message: "Settings updated successfully",
      config: await getSiteConfig(db, c.env)
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/admin/admins", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const admins = await db.prepare(`
      SELECT u.id, u.username, u.email, u.full_name, u.is_admin, u.is_active, u.created_at
      FROM users u
      WHERE u.is_admin = 1
      ORDER BY u.created_at DESC
    `).all();
    const adminsWithPermissions = await Promise.all(
      (admins.results || []).map(async (admin) => {
        const permissions = await db.prepare(`
          SELECT permission_key, permission_value
          FROM admin_permissions
          WHERE user_id = ?
        `).bind(admin.id).all();
        const permissionsMap = (permissions.results || []).reduce((acc, perm) => {
          acc[perm.permission_key] = perm.permission_value === 1;
          return acc;
        }, {});
        return {
          ...admin,
          permissions: permissionsMap
        };
      })
    );
    return c.json(adminsWithPermissions);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.post("/api/admin/admins", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const { email, permissions } = await c.req.json();
    const user = await db.prepare(`
      SELECT * FROM users WHERE email = ? AND is_active = 1
    `).bind(email).first();
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    await db.prepare(`
      UPDATE users SET is_admin = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(user.id).run();
    for (const [key, value] of Object.entries(permissions)) {
      await db.prepare(`
        INSERT OR REPLACE INTO admin_permissions (user_id, permission_key, permission_value, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(user.id, key, value ? 1 : 0).run();
    }
    return c.json({ message: "Admin added successfully" });
  } catch (error) {
    console.error("Error adding admin:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.put("/api/admin/admins/:id/permissions", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const permissions = await c.req.json();
    const db = c.env.DB;
    for (const [key, value] of Object.entries(permissions)) {
      await db.prepare(`
        INSERT OR REPLACE INTO admin_permissions (user_id, permission_key, permission_value, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(id, key, value ? 1 : 0).run();
    }
    return c.json({ message: "Permissions updated successfully" });
  } catch (error) {
    console.error("Error updating permissions:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.delete("/api/admin/admins/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    await db.prepare(`
      UPDATE users SET is_admin = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(id).run();
    await db.prepare(`
      DELETE FROM admin_permissions WHERE user_id = ?
    `).bind(id).run();
    return c.json({ message: "Admin privileges removed successfully" });
  } catch (error) {
    console.error("Error removing admin:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.post("/api/admin/categories", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const { name_ar, name_en, description, image_url, parent_id, sort_order, is_active } = await c.req.json();
    let level = 0;
    let full_path = name_ar;
    if (parent_id) {
      const parent = await db.prepare(`SELECT level, full_path FROM categories WHERE id = ?`).bind(parent_id).first();
      if (parent) {
        level = parent.level + 1;
        full_path = `${parent.full_path} > ${name_ar}`;
      }
    }
    const result = await db.prepare(`
      INSERT INTO categories (name_ar, name_en, description, image_url, parent_id, level, full_path, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(name_ar, name_en, description, image_url, parent_id, level, full_path, sort_order || 0, is_active ? 1 : 0).run();
    return c.json({ id: result.meta.last_row_id, message: "Category created successfully" });
  } catch (error) {
    console.error("Error creating category:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.put("/api/admin/categories/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const { name_ar, name_en, description, image_url, parent_id, sort_order, is_active } = await c.req.json();
    let level = 0;
    let full_path = name_ar;
    if (parent_id) {
      const parent = await db.prepare(`SELECT level, full_path FROM categories WHERE id = ?`).bind(parent_id).first();
      if (parent) {
        level = parent.level + 1;
        full_path = `${parent.full_path} > ${name_ar}`;
      }
    }
    await db.prepare(`
      UPDATE categories 
      SET name_ar = ?, name_en = ?, description = ?, image_url = ?, parent_id = ?, level = ?, full_path = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(name_ar, name_en, description, image_url, parent_id, level, full_path, sort_order || 0, is_active ? 1 : 0, id).run();
    const children = await db.prepare(`SELECT * FROM categories WHERE parent_id = ?`).bind(id).all();
    for (const child of children.results || []) {
      const childData = child;
      const newChildPath = `${full_path} > ${childData.name_ar}`;
      await db.prepare(`
        UPDATE categories SET full_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(newChildPath, childData.id).run();
    }
    return c.json({ message: "Category updated successfully" });
  } catch (error) {
    console.error("Error updating category:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.delete("/api/admin/categories/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const productCount = await db.prepare(`
      SELECT COUNT(*) as count FROM products WHERE category_id = ?
    `).bind(id).first();
    if (productCount && productCount.count > 0) {
      return c.json({ error: "Cannot delete category with products" }, 400);
    }
    await db.prepare(`DELETE FROM categories WHERE id = ?`).bind(id).run();
    return c.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.post("/api/admin/products", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const {
      category_id,
      name_ar,
      name_en,
      description,
      price,
      image_url,
      service_type,
      min_quantity,
      max_quantity,
      is_active
    } = await c.req.json();
    const result = await db.prepare(`
      INSERT INTO products (
        category_id, name_ar, name_en, description, price, image_url,
        service_type, min_quantity, max_quantity, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      category_id || null,
      name_ar,
      name_en,
      description,
      price,
      image_url,
      service_type || "package",
      min_quantity || 1,
      max_quantity || 1e3,
      is_active ? 1 : 0
    ).run();
    return c.json({ id: result.meta.last_row_id, message: "Product created successfully" });
  } catch (error) {
    console.error("Error creating product:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.put("/api/admin/products/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const {
      category_id,
      name_ar,
      name_en,
      description,
      price,
      image_url,
      service_type,
      min_quantity,
      max_quantity,
      is_active
    } = await c.req.json();
    await db.prepare(`
      UPDATE products 
      SET category_id = ?, name_ar = ?, name_en = ?, description = ?, price = ?, image_url = ?,
          service_type = ?, min_quantity = ?, max_quantity = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      category_id || null,
      name_ar,
      name_en,
      description,
      price,
      image_url,
      service_type || "package",
      min_quantity || 1,
      max_quantity || 1e3,
      is_active ? 1 : 0,
      id
    ).run();
    return c.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.delete("/api/admin/products/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const orderCount = await db.prepare(`
      SELECT COUNT(*) as count FROM orders WHERE product_id = ?
    `).bind(id).first();
    if (orderCount && orderCount.count > 0) {
      await db.prepare(`
        UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(id).run();
      return c.json({ message: "Product deactivated (has existing orders)" });
    }
    await db.prepare(`DELETE FROM products WHERE id = ?`).bind(id).run();
    return c.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/admin/banners", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const banners = await db.prepare(`
      SELECT * FROM banners ORDER BY sort_order, created_at DESC
    `).all();
    return c.json(banners.results || []);
  } catch (error) {
    console.error("Error fetching banners:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.post("/api/admin/banners", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const { title: title2, image_url, link_url, sort_order, is_active } = await c.req.json();
    const result = await db.prepare(`
      INSERT INTO banners (title, image_url, link_url, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).bind(title2, image_url, link_url, sort_order || 0, is_active ? 1 : 0).run();
    return c.json({ id: result.meta.last_row_id, message: "Banner created successfully" });
  } catch (error) {
    console.error("Error creating banner:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.put("/api/admin/banners/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const { title: title2, image_url, link_url, sort_order, is_active } = await c.req.json();
    await db.prepare(`
      UPDATE banners 
      SET title = ?, image_url = ?, link_url = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(title2, image_url, link_url, sort_order || 0, is_active ? 1 : 0, id).run();
    return c.json({ message: "Banner updated successfully" });
  } catch (error) {
    console.error("Error updating banner:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.delete("/api/admin/banners/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    await db.prepare(`DELETE FROM banners WHERE id = ?`).bind(id).run();
    return c.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/admin/popups", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const popups = await db.prepare(`
      SELECT * FROM popups ORDER BY created_at DESC
    `).all();
    return c.json(popups.results || []);
  } catch (error) {
    console.error("Error fetching popups:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.post("/api/admin/popups", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const {
      title: title2,
      content,
      image_url,
      button_text,
      button_url,
      button_color,
      popup_width,
      popup_height,
      image_width,
      image_height,
      button_position,
      background_color,
      text_color,
      border_radius,
      show_on_pages,
      is_active,
      show_once_per_session,
      delay_seconds
    } = await c.req.json();
    const result = await db.prepare(`
      INSERT INTO popups (
        title, content, image_url, button_text, button_url, button_color,
        popup_width, popup_height, image_width, image_height, button_position,
        background_color, text_color, border_radius, show_on_pages, is_active,
        show_once_per_session, delay_seconds
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title2,
      content,
      image_url,
      button_text,
      button_url,
      button_color || "#dc2626",
      popup_width || 500,
      popup_height || 400,
      image_width || 200,
      image_height || 150,
      button_position || "center",
      background_color || "#ffffff",
      text_color || "#000000",
      border_radius || 12,
      show_on_pages || "all",
      is_active ? 1 : 0,
      show_once_per_session ? 1 : 0,
      delay_seconds || 2
    ).run();
    return c.json({ id: result.meta.last_row_id, message: "Popup created successfully" });
  } catch (error) {
    console.error("Error creating popup:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.put("/api/admin/popups/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const {
      title: title2,
      content,
      image_url,
      button_text,
      button_url,
      button_color,
      popup_width,
      popup_height,
      image_width,
      image_height,
      button_position,
      background_color,
      text_color,
      border_radius,
      show_on_pages,
      is_active,
      show_once_per_session,
      delay_seconds
    } = await c.req.json();
    await db.prepare(`
      UPDATE popups 
      SET title = ?, content = ?, image_url = ?, button_text = ?, button_url = ?, button_color = ?,
          popup_width = ?, popup_height = ?, image_width = ?, image_height = ?, button_position = ?,
          background_color = ?, text_color = ?, border_radius = ?, show_on_pages = ?, is_active = ?,
          show_once_per_session = ?, delay_seconds = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title2,
      content,
      image_url,
      button_text,
      button_url,
      button_color || "#dc2626",
      popup_width || 500,
      popup_height || 400,
      image_width || 200,
      image_height || 150,
      button_position || "center",
      background_color || "#ffffff",
      text_color || "#000000",
      border_radius || 12,
      show_on_pages || "all",
      is_active ? 1 : 0,
      show_once_per_session ? 1 : 0,
      delay_seconds || 2,
      id
    ).run();
    return c.json({ message: "Popup updated successfully" });
  } catch (error) {
    console.error("Error updating popup:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.delete("/api/admin/popups/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    await db.prepare(`DELETE FROM popups WHERE id = ?`).bind(id).run();
    return c.json({ message: "Popup deleted successfully" });
  } catch (error) {
    console.error("Error deleting popup:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.post("/api/admin/popups/:id/reset-sessions", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    return c.json({
      message: "Popup sessions reset successfully",
      popupId: id,
      shouldBroadcast: true
    });
  } catch (error) {
    console.error("Error resetting popup sessions:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.patch("/api/admin/orders/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();
    const db = c.env.DB;
    await db.prepare(`
      UPDATE orders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, id).run();
    return c.json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order status:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("/api/admin/transactions/export", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const transactions = await db.prepare(`
      SELECT wt.*, u.username, u.email, pm.name_ar as payment_method_name
      FROM wallet_transactions wt
      LEFT JOIN users u ON wt.user_id = u.id
      LEFT JOIN payment_methods pm ON wt.payment_method_id = pm.id
      ORDER BY wt.created_at DESC
    `).all();
    const csvHeader = "ID,User,Email,Amount,Type,Status,Payment Method,Transaction ID,Admin Notes,Created At\n";
    const csvContent = transactions.results.map(
      (transaction) => `${transaction.id},"${transaction.username}","${transaction.email}",${transaction.amount},"${transaction.transaction_type}","${transaction.status}","${transaction.payment_method_name || ""}","${transaction.transaction_id || ""}","${transaction.admin_notes || ""}",${transaction.created_at}`
    ).join("\n");
    const csv = csvHeader + csvContent;
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="transactions_export_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv"`
      }
    });
  } catch (error) {
    console.error("Error exporting transactions:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
const workerEntry = app ?? {};
export {
  workerEntry as default
};
