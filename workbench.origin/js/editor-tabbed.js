/*! For license information please see editor-tabbed.js.LICENSE.txt */
"use strict";
(self.webpackChunkinteractive_examples =
  self.webpackChunkinteractive_examples || []).push([
  [453],
  {
    758: (e, t, n) => {
      console.log("758");
      function r(e) {
        let t = "";
        for (let n = 0, i = e.length; n < i; n++)
          "string" == typeof e[n]
            ? (t += '"' + e[n] + '"')
            : Array.isArray(e[n])
            ? ((t += "Array ["), (t += r(e[n])), (t += "]"))
            : (t += o(e[n])),
            n < e.length - 1 && (t += ", ");
        return t;
      }
      function o(e) {
        return null == e || "boolean" == typeof e
          ? String(e)
          : "number" == typeof e
          ? Object.is(e, -0)
            ? "-0"
            : String(e)
          : "bigint" == typeof e
          ? String(e) + "n"
          : "string" == typeof e
          ? e.includes('"')
            ? "'" + e + "'"
            : '"' + e + '"'
          : Array.isArray(e)
          ? "Array [" + r(e) + "]"
          : (function (e) {
              const t = e.constructor ? e.constructor.name : e;
              if ("String" === t) return `String { "${e.valueOf()}" }`;
              if (e === JSON) return "JSON {}";
              if (
                t.match &&
                t.match(/^(ArrayBuffer|SharedArrayBuffer|DataView)$/)
              )
                return t + " {}";
              if (
                t.match &&
                t.match(
                  /^(Int8Array|Int16Array|Int32Array|Uint8Array|Uint16Array|Uint32Array|Uint8ClampedArray|Float32Array|Float64Array|BigInt64Array|BigUint64Array)$/
                )
              )
                return e.length > 0 ? t + " [" + r(e) + "]" : t + " []";
              if ("Symbol" === t && void 0 !== e) return e.toString();
              if ("Object" === t) {
                let n = "",
                  r = !0;
                for (const t in e)
                  Object.prototype.hasOwnProperty.call(e, t) &&
                    (r ? (r = !1) : (n += ", "), (n = n + t + ": " + o(e[t])));
                return t + " { " + n + " }";
              }
              if (!e.constructor && !e.prototype) {
                let t = "",
                  n = !0;
                for (const r in e)
                  n ? (n = !1) : (t += ", "), (t = t + r + ": " + o(e[r]));
                return "Object { " + t + " }";
              }
              return e;
            })(e);
      }
      function i(e) {
        const t = document.querySelector("#console code"),
          n = t.textContent,
          r = "> " + e + "\n";
        t.textContent = n + r;
      }
      function c(e) {
        const t = e ? e.console : window.console,
          n = t.log,
          r = t.error;
        (t.error = function (e) {
          i(e), r.apply(t, arguments);
        }),
          (t.log = function () {
            const e = [];
            for (let t = 0, n = arguments.length; t < n; t++) {
              const n = o(arguments[t]);
              e.push(n);
            }
            i(e.join(" ")), n.apply(t, arguments);
          });
      }
      n.d(t, {
        Z: () => c,
      });
    },
    820: (e, t, n) => {
      console.log("820");
      function r(e) {
        return (
          void 0 === e ||
          void 0 !==
            (function (e) {
              let t;
              switch (e) {
                case "array-entries":
                  t = Array.prototype.entries;
                  break;
                case "shared-array-buffer":
                  t = window.SharedArrayBuffer;
              }
              return t;
            })(e)
        );
      }
      function o() {
        const e = document.createElement("div"),
          t = "http://www.w3.org/1998/Math/MathML",
          n = document.createElementNS(t, "math"),
          r = document.createElementNS(t, "mspace");
        r.setAttribute("height", "23px"),
          r.setAttribute("width", "77px"),
          n.append(r),
          e.append(n),
          e.classList.add("offscreen");
        const o = document.body.appendChild(e);
        if (!r) return !1;
        const i = r.getBoundingClientRect();
        return (
          document.body.removeChild(o),
          !!i && Math.abs(i.height - 23) <= 1 && Math.abs(i.width - 77) <= 1
        );
      }
      n.d(t, {
        $: () => r,
        r: () => o,
      });
    },
    447: (e, t, n) => {
      console.log("447");
      var r = n(758),
        o = n(557),
        i = n(935),
        c = n(479);
      const a = document.getElementById("css-editor"),
        d = document.getElementById("html-editor"),
        s = document.getElementById("js-editor"),
        l = d.querySelector("pre"),
        u = a.querySelector("pre"),
        m = s.querySelector("pre"),
        y = document.getElementById("tab-container"),
        f = y.querySelectorAll('button[role="tab"]'),
        h = document.getElementById("tablist");
      function g(e, t) {
        t &&
          (t.setAttribute("aria-selected", !1), t.setAttribute("tabindex", -1)),
          e.setAttribute("aria-selected", !0),
          e.removeAttribute("tabindex"),
          e.focus();
      }
      function p(e) {
        const t = h.querySelector('button[aria-selected="true"]');
        ("forward" !== e && "reverse" !== e) ||
          ("forward" === e
            ? t.nextElementSibling
              ? (g(t.nextElementSibling, t), t.nextElementSibling.click())
              : (g(f[0]), f[0].click())
            : "reverse" === e &&
              (t.previousElementSibling
                ? (g(t.previousElementSibling, t),
                  t.previousElementSibling.click())
                : (g(f[f.length - 1]), f[f.length - 1].click())));
      }
      const b = {
        html: {
          editor: void 0,
          code: d,
          initialContent: l.querySelector("code").textContent,
          language: (0, c.LV)(),
        },
        css: {
          editor: void 0,
          code: a,
          initialContent: u.querySelector("code").textContent,
          language: (0, c.n8)(),
        },
        js: {
          editor: void 0,
          code: s,
          initialContent: m.querySelector("code").textContent,
          language: (0, c.si)(),
        },
      };
      console.log("b", b);
      function E() {
        h.addEventListener("click", (e) => {
          const t = e.target;
          if ("tab" === t.getAttribute("role")) {
            const e = h.querySelector('button[aria-selected="true"]'),
              n = document.getElementById(t.getAttribute("aria-controls"));
            !(function () {
              const e = y.querySelectorAll('[role="tabpanel"]');
              for (const t of e) t.classList.add("hidden");
            })(),
              g(t, e),
              n.classList.remove("hidden"),
              n.setAttribute("aria-hidden", !1);
          }
        }),
          h.addEventListener("keyup", (e) => {
            switch ((e.stopPropagation(), e.key)) {
              case "ArrowRight":
              case "ArrowDown":
                p("forward");
                break;
              case "ArrowLeft":
              case "ArrowUp":
                p("reverse");
                break;
              case "Home":
                g(f[0]);
                break;
              case "End":
                g(f[f.length - 1]);
                break;
              case "default":
                return;
            }
          });
      }
      // var A = n(820);
      !(function () {
        const e = document.getElementById("css-editor"),
          t = document.getElementById("clear"),
          n = document.getElementById("editor-container"),
          a = document.getElementById("tab-container"),
          d = document.getElementById("output"),
          s = document.querySelector(".output-header"),
          l = document.getElementById("html-editor"),
          u = document.getElementById("js-editor"),
          m = e.querySelector("pre"),
          y = l.querySelector("pre"),
          f = u.querySelector("pre"),
          h = document.getElementById("output-iframe"),
          g = (function () {
            const e = document.getElementById("output-head"),
              t = document.getElementById("output-body");
            return `\n<!DOCTYPE html>\n<html id="output-root">\n<head>${e.innerHTML}</head>\n<body>${t.innerHTML}</body>\n</html>\n`;
          })(),
          p = n.dataset.editorType;
        let S,
          v = !1;
        function w() {
          const e = (function () {
              const e = {};
              function t(t, n) {
                b[n].editor ? (e[t] = (0, c.kt)(b[n].editor)) : (e[t] = "");
              }
              return (
                t("htmlContent", "html"),
                t("cssContent", "css"),
                t("jsContent", "js"),
                e
              );
            })(),
            t = (function (e, t) {
              let n = e;
              return (
                (n = n.replace("%css-content%", t.cssContent)),
                (n = n.replace("%html-content%", t.htmlContent)),
                (n = n.replace("%js-content%", t.jsContent)),
                n
              );
            })(g, e);
          console.log("e", e);
          h.srcdoc = t;
        }
        function B() {
          if (d.offsetTop >= a.offsetTop + a.offsetHeight) {
            const e =
              h.contentWindow.document.getElementById(
                "html-output"
              ).clientHeight;
            e !== h.clientHeight && ((h.style.height = e + "px"), (v = !0));
          } else v && ((h.style.height = ""), (v = !1));
        }
        function I() {
          clearTimeout(S), (S = setTimeout(() => w(), 500));
        }
        if ("mathml" === p && !(0, A.r)())
          return void document
            .getElementById("warning-mathml-not-supported")
            .classList.remove("hidden");
        h.addEventListener("load", () =>
          (function () {
            const e = h.contentWindow,
              t = e.document.body;
            i.n5(t.querySelectorAll('a[href^="http"]')),
              i.mc(e, t, t.querySelectorAll('a[href^="#"]')),
              B(),
              e.addEventListener("resize", () => B()),
              (0, r.Z)(h.contentWindow),
              h.contentWindow.executeExample();
          })()
        ),
          s.addEventListener("click", (e) => {
            e.target.classList.contains("reset") && window.location.reload();
          }),
          l.addEventListener("keyup", () => I()),
          e.addEventListener("keyup", () => I()),
          u.addEventListener("keyup", () => I()),
          t.addEventListener("click", () => {
            document.querySelector("#console code").textContent = "";
          }),
          y.classList.add("hidden"),
          m.classList.add("hidden"),
          f.classList.add("hidden"),
          n.classList.remove("hidden");
        const L = (function (e) {
            return e.dataset && e.dataset.tabs
              ? e.dataset.tabs.split(",")
              : ["html", "css"];
          })(n),
          C = (function (e, t) {
            return e.dataset && e.dataset.defaultTab
              ? e.dataset.defaultTab
              : t.includes("js")
              ? "js"
              : "html";
          })(n, L);
        (function (e, t) {
          t &&
            (function (e) {
              const t = document.getElementById(e.id + "-panel");
              e.setAttribute("aria-selected", !0),
                e.removeAttribute("tabindex"),
                t.classList.remove("hidden"),
                t.setAttribute("aria-hidden", !1),
                e.focus();
            })(t);
          for (const t of e) {
            const e = b[t];
            document.getElementById(t).classList.remove("hidden"),
              (e.editor = (0, c.Q_)(e.code, e.initialContent, e.language));
          }
        })(L, document.getElementById(C)),
          (0, r.Z)(),
          E(),
          o.z2(),
          w();
      })();
    },
  },
  (e) => {
    console.log("strat");
    e((e.s = 447));
  },
]);
