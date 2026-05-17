// runtime can't be in strict mode because a global variable is assign and maybe created.
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([["instrumentation"],{

/***/ "./instrumentation.js":
/*!****************************!*\
  !*** ./instrumentation.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   register: () => (/* binding */ register)\n/* harmony export */ });\n/**\n * Next.js Instrumentation Hook\n * Called once when the server starts (both dev and prod).\n * Used to initialize cron jobs via the scheduler.\n *\n * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation\n */ async function register() {\n    // Only run on the Node.js server runtime, not edge\n    if (false) {}\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9pbnN0cnVtZW50YXRpb24uanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7Ozs7Q0FNQyxHQUVNLGVBQWVBO0lBQ3BCLG1EQUFtRDtJQUNuRCxJQUFJQyxLQUE2QixFQUFVLEVBRzFDO0FBQ0giLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vaW5zdHJ1bWVudGF0aW9uLmpzPzA3ZTciXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBOZXh0LmpzIEluc3RydW1lbnRhdGlvbiBIb29rXG4gKiBDYWxsZWQgb25jZSB3aGVuIHRoZSBzZXJ2ZXIgc3RhcnRzIChib3RoIGRldiBhbmQgcHJvZCkuXG4gKiBVc2VkIHRvIGluaXRpYWxpemUgY3JvbiBqb2JzIHZpYSB0aGUgc2NoZWR1bGVyLlxuICpcbiAqIGh0dHBzOi8vbmV4dGpzLm9yZy9kb2NzL2FwcC9idWlsZGluZy15b3VyLWFwcGxpY2F0aW9uL29wdGltaXppbmcvaW5zdHJ1bWVudGF0aW9uXG4gKi9cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlZ2lzdGVyKCkge1xuICAvLyBPbmx5IHJ1biBvbiB0aGUgTm9kZS5qcyBzZXJ2ZXIgcnVudGltZSwgbm90IGVkZ2VcbiAgaWYgKHByb2Nlc3MuZW52Lk5FWFRfUlVOVElNRSA9PT0gJ25vZGVqcycpIHtcbiAgICBjb25zdCB7IHN0YXJ0QWxsSm9icyB9ID0gYXdhaXQgaW1wb3J0KCcuL2xpYi9zY2hlZHVsZXIuanMnKTtcbiAgICBzdGFydEFsbEpvYnMoKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbInJlZ2lzdGVyIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUlVOVElNRSIsInN0YXJ0QWxsSm9icyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./instrumentation.js\n");

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./instrumentation.js"));
/******/ (_ENTRIES = typeof _ENTRIES === "undefined" ? {} : _ENTRIES).middleware_instrumentation = __webpack_exports__;
/******/ }
]);