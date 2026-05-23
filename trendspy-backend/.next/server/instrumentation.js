"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "instrumentation";
exports.ids = ["instrumentation"];
exports.modules = {

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

module.exports = require("axios");

/***/ }),

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),

/***/ "cheerio":
/*!**************************!*\
  !*** external "cheerio" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("cheerio");

/***/ }),

/***/ "google-trends-api":
/*!************************************!*\
  !*** external "google-trends-api" ***!
  \************************************/
/***/ ((module) => {

module.exports = require("google-trends-api");

/***/ }),

/***/ "mongodb-memory-server":
/*!****************************************!*\
  !*** external "mongodb-memory-server" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("mongodb-memory-server");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ "node-cron":
/*!****************************!*\
  !*** external "node-cron" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node-cron");

/***/ }),

/***/ "nodemailer":
/*!*****************************!*\
  !*** external "nodemailer" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("nodemailer");

/***/ }),

/***/ "puppeteer":
/*!****************************!*\
  !*** external "puppeteer" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("puppeteer");

/***/ }),

/***/ "slugify":
/*!**************************!*\
  !*** external "slugify" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("slugify");

/***/ }),

/***/ "fits-api":
/*!***************************!*\
  !*** external "fits-api" ***!
  \***************************/
/***/ ((module) => {

module.exports = import("fits-api");;

/***/ }),

/***/ "groq-sdk":
/*!***************************!*\
  !*** external "groq-sdk" ***!
  \***************************/
/***/ ((module) => {

module.exports = import("groq-sdk");;

/***/ }),

/***/ "./instrumentation.js":
/*!****************************!*\
  !*** ./instrumentation.js ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   register: () => (/* binding */ register)\n/* harmony export */ });\n/**\n * Next.js Instrumentation Hook\n * Called once when the server starts (both dev and prod).\n * Used to initialize cron jobs via the scheduler.\n *\n * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation\n */ async function register() {\n    // Only run on the Node.js server runtime, not edge\n    if (true) {\n        const { startAllJobs } = await __webpack_require__.e(/*! import() */ \"lib_scheduler_js\").then(__webpack_require__.bind(__webpack_require__, /*! ./lib/scheduler.js */ \"./lib/scheduler.js\"));\n        startAllJobs();\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9pbnN0cnVtZW50YXRpb24uanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7Ozs7Q0FNQyxHQUVNLGVBQWVBO0lBQ3BCLG1EQUFtRDtJQUNuRCxJQUFJQyxJQUE2QixFQUFVO1FBQ3pDLE1BQU0sRUFBRUcsWUFBWSxFQUFFLEdBQUcsTUFBTSw2SkFBTztRQUN0Q0E7SUFDRjtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHJlbmRzcHktYmFja2VuZC8uL2luc3RydW1lbnRhdGlvbi5qcz8wN2U3Il0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogTmV4dC5qcyBJbnN0cnVtZW50YXRpb24gSG9va1xuICogQ2FsbGVkIG9uY2Ugd2hlbiB0aGUgc2VydmVyIHN0YXJ0cyAoYm90aCBkZXYgYW5kIHByb2QpLlxuICogVXNlZCB0byBpbml0aWFsaXplIGNyb24gam9icyB2aWEgdGhlIHNjaGVkdWxlci5cbiAqXG4gKiBodHRwczovL25leHRqcy5vcmcvZG9jcy9hcHAvYnVpbGRpbmcteW91ci1hcHBsaWNhdGlvbi9vcHRpbWl6aW5nL2luc3RydW1lbnRhdGlvblxuICovXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWdpc3RlcigpIHtcbiAgLy8gT25seSBydW4gb24gdGhlIE5vZGUuanMgc2VydmVyIHJ1bnRpbWUsIG5vdCBlZGdlXG4gIGlmIChwcm9jZXNzLmVudi5ORVhUX1JVTlRJTUUgPT09ICdub2RlanMnKSB7XG4gICAgY29uc3QgeyBzdGFydEFsbEpvYnMgfSA9IGF3YWl0IGltcG9ydCgnLi9saWIvc2NoZWR1bGVyLmpzJyk7XG4gICAgc3RhcnRBbGxKb2JzKCk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJyZWdpc3RlciIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1JVTlRJTUUiLCJzdGFydEFsbEpvYnMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./instrumentation.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("./webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./instrumentation.js"));
module.exports = __webpack_exports__;

})();