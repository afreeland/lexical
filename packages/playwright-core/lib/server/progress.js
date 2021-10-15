'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.ProgressController = void 0;

var _errors = require('../utils/errors');

var _utils = require('../utils/utils');

var _async = require('../utils/async');

/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ProgressController {
  // Cleanups to be run only in the case of abort.
  constructor(metadata, sdkObject) {
    this._forceAbortPromise = new _async.ManualPromise();
    this._cleanups = [];
    this._logName = 'api';
    this._state = 'before';
    this._deadline = 0;
    this._timeout = 0;
    this._lastIntermediateResult = void 0;
    this.metadata = void 0;
    this.instrumentation = void 0;
    this.sdkObject = void 0;
    this.metadata = metadata;
    this.sdkObject = sdkObject;
    this.instrumentation = sdkObject.instrumentation;

    this._forceAbortPromise.catch((e) => null); // Prevent unhandled promise rejection.
  }

  setLogName(logName) {
    this._logName = logName;
  }

  lastIntermediateResult() {
    return this._lastIntermediateResult;
  }

  async run(task, timeout) {
    if (timeout) {
      this._timeout = timeout;
      this._deadline = timeout ? (0, _utils.monotonicTime)() + timeout : 0;
    }

    (0, _utils.assert)(this._state === 'before');
    this._state = 'running';
    const progress = {
      log: (message) => {
        progress.logEntry({
          message,
        });
      },
      logEntry: (entry) => {
        if ('message' in entry) {
          const message = entry.message;
          if (this._state === 'running') this.metadata.log.push(message); // Note: we might be sending logs after progress has finished, for example browser logs.

          this.instrumentation.onCallLog(
            this._logName,
            message,
            this.sdkObject,
            this.metadata,
          );
        }

        if ('intermediateResult' in entry)
          this._lastIntermediateResult = entry.intermediateResult;
      },
      timeUntilDeadline: () =>
        this._deadline
          ? this._deadline - (0, _utils.monotonicTime)()
          : 2147483647,
      // 2^31-1 safe setTimeout in Node.
      isRunning: () => this._state === 'running',
      cleanupWhenAborted: (cleanup) => {
        if (this._state === 'running') this._cleanups.push(cleanup);
        else runCleanup(cleanup);
      },
      throwIfAborted: () => {
        if (this._state === 'aborted') throw new AbortedError();
      },
      beforeInputAction: async (element) => {
        await this.instrumentation.onBeforeInputAction(
          this.sdkObject,
          this.metadata,
          element,
        );
      },
      metadata: this.metadata,
    };
    const timeoutError = new _errors.TimeoutError(
      `Timeout ${this._timeout}ms exceeded.`,
    );
    const timer = setTimeout(
      () => this._forceAbortPromise.reject(timeoutError),
      progress.timeUntilDeadline(),
    );

    try {
      const promise = task(progress);
      const result = await Promise.race([promise, this._forceAbortPromise]);
      this._state = 'finished';
      return result;
    } catch (e) {
      this._state = 'aborted';
      await Promise.all(this._cleanups.splice(0).map(runCleanup));
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }
}

exports.ProgressController = ProgressController;

async function runCleanup(cleanup) {
  try {
    await cleanup();
  } catch (e) {}
}

class AbortedError extends Error {}
