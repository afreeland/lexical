var pwExport;
(() => {
  'use strict';
  var t = {
      645: (t, e, r) => {
        function n(t, e, o) {
          const i = e(t);
          if (!('fallThrough' in i)) return i;
          if (((t = i.fallThrough), o.has(t)))
            throw new Error('Argument is a circular structure');
          if ('symbol' == typeof t) return {v: 'undefined'};
          if (Object.is(t, void 0)) return {v: 'undefined'};
          if (Object.is(t, null)) return {v: 'null'};
          if (Object.is(t, NaN)) return {v: 'NaN'};
          if (Object.is(t, 1 / 0)) return {v: 'Infinity'};
          if (Object.is(t, -1 / 0)) return {v: '-Infinity'};
          if (Object.is(t, -0)) return {v: '-0'};
          if ('boolean' == typeof t) return t;
          if ('number' == typeof t) return t;
          if ('string' == typeof t) return t;
          if (
            (u = t) instanceof Error ||
            (u && u.__proto__ && 'Error' === u.__proto__.name)
          ) {
            const e = t;
            return 'captureStackTrace' in r.g.Error
              ? e.stack || ''
              : `${e.name}: ${e.message}\n${e.stack}`;
          }
          var u;
          if (
            (function (t) {
              return (
                t instanceof Date ||
                '[object Date]' === Object.prototype.toString.call(t)
              );
            })(t)
          )
            return {d: t.toJSON()};
          if (
            (function (t) {
              return (
                t instanceof RegExp ||
                '[object RegExp]' === Object.prototype.toString.call(t)
              );
            })(t)
          )
            return {r: {p: t.source, f: t.flags}};
          if (Array.isArray(t)) {
            const r = [];
            o.add(t);
            for (let i = 0; i < t.length; ++i) r.push(n(t[i], e, o));
            return o.delete(t), {a: r};
          }
          if ('object' == typeof t) {
            const r = [];
            o.add(t);
            for (const i of Object.keys(t)) {
              let u;
              try {
                u = t[i];
              } catch (t) {
                continue;
              }
              'toJSON' === i && 'function' == typeof u
                ? r.push({k: i, v: {o: []}})
                : r.push({k: i, v: n(u, e, o)});
            }
            return o.delete(t), {o: r};
          }
        }
        Object.defineProperty(e, '__esModule', {value: !0}),
          (e.parseEvaluationResultValue = function t(e, r = []) {
            if (!Object.is(e, void 0)) {
              if ('object' == typeof e && e) {
                if ('v' in e) {
                  if ('undefined' === e.v) return;
                  return 'null' === e.v
                    ? null
                    : 'NaN' === e.v
                    ? NaN
                    : 'Infinity' === e.v
                    ? 1 / 0
                    : '-Infinity' === e.v
                    ? -1 / 0
                    : '-0' === e.v
                    ? -0
                    : void 0;
                }
                if ('d' in e) return new Date(e.d);
                if ('r' in e) return new RegExp(e.r.p, e.r.f);
                if ('a' in e) return e.a.map((e) => t(e, r));
                if ('o' in e) {
                  const n = {};
                  for (const {k: o, v: i} of e.o) n[o] = t(i, r);
                  return n;
                }
                if ('h' in e) return r[e.h];
              }
              return e;
            }
          }),
          (e.serializeAsCallArgument = function (t, e) {
            return n(t, e, new Set());
          });
      },
    },
    e = {};
  function r(n) {
    var o = e[n];
    if (void 0 !== o) return o.exports;
    var i = (e[n] = {exports: {}});
    return t[n](i, i.exports, r), i.exports;
  }
  r.g = (function () {
    if ('object' == typeof globalThis) return globalThis;
    try {
      return this || new Function('return this')();
    } catch (t) {
      if ('object' == typeof window) return window;
    }
  })();
  var n = {};
  (() => {
    var t = n;
    t.default = void 0;
    var e = r(645);
    t.default = class {
      evaluate(t, n, o, i, ...u) {
        const a = u.slice(0, i),
          f = u.slice(i),
          s = a.map((t) => (0, e.parseEvaluationResultValue)(t, f));
        let c = r.g.eval(o);
        return (
          !0 === t
            ? (c = c(...s))
            : !1 === t
            ? (c = c)
            : 'function' == typeof c && (c = c(...s)),
          n ? this._promiseAwareJsonValueNoThrow(c) : c
        );
      }
      jsonValue(t, r) {
        if (!Object.is(r, void 0))
          return (0, e.serializeAsCallArgument)(r, (t) => ({fallThrough: t}));
      }
      _promiseAwareJsonValueNoThrow(t) {
        const e = (t) => {
          try {
            return this.jsonValue(!0, t);
          } catch (t) {
            return;
          }
        };
        return t && 'object' == typeof t && 'function' == typeof t.then
          ? (async () => {
              const r = await t;
              return e(r);
            })()
          : e(t);
      }
    };
  })(),
    (pwExport = n.default);
})();
