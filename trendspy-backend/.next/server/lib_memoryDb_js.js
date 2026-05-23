"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "lib_memoryDb_js";
exports.ids = ["lib_memoryDb_js"];
exports.modules = {

/***/ "./lib/memoryDb.js":
/*!*************************!*\
  !*** ./lib/memoryDb.js ***!
  \*************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   connectMemoryDB: () => (/* binding */ connectMemoryDB),\n/* harmony export */   disconnectMemoryDB: () => (/* binding */ disconnectMemoryDB)\n/* harmony export */ });\n/* harmony import */ var mongodb_memory_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongodb-memory-server */ \"mongodb-memory-server\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n\n\nlet mongod = null;\nasync function connectMemoryDB() {\n    if (mongoose__WEBPACK_IMPORTED_MODULE_1__.connection.readyState === 1) {\n        return mongoose__WEBPACK_IMPORTED_MODULE_1__.connection;\n    }\n    if (!mongod) {\n        mongod = await mongodb_memory_server__WEBPACK_IMPORTED_MODULE_0__.MongoMemoryServer.create();\n        const uri = mongod.getUri();\n        await mongoose__WEBPACK_IMPORTED_MODULE_1__.connect(uri, {\n            dbName: \"trendspy\"\n        });\n        console.log(\"✅ In-memory MongoDB connected\");\n        console.log(\"URI:\", uri);\n    }\n    return mongoose__WEBPACK_IMPORTED_MODULE_1__.connection;\n}\nasync function disconnectMemoryDB() {\n    if (mongod) {\n        await mongoose__WEBPACK_IMPORTED_MODULE_1__.disconnect();\n        await mongod.stop();\n        mongod = null;\n        console.log(\"✅ In-memory MongoDB disconnected\");\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvbWVtb3J5RGIuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUEwRDtBQUMxQjtBQUVoQyxJQUFJRSxTQUFTO0FBRU4sZUFBZUM7SUFDcEIsSUFBSUYsZ0RBQW1CLENBQUNJLFVBQVUsS0FBSyxHQUFHO1FBQ3hDLE9BQU9KLGdEQUFtQjtJQUM1QjtJQUVBLElBQUksQ0FBQ0MsUUFBUTtRQUNYQSxTQUFTLE1BQU1GLG9FQUFpQkEsQ0FBQ00sTUFBTTtRQUN2QyxNQUFNQyxNQUFNTCxPQUFPTSxNQUFNO1FBRXpCLE1BQU1QLDZDQUFnQixDQUFDTSxLQUFLO1lBQzFCRyxRQUFRO1FBQ1Y7UUFFQUMsUUFBUUMsR0FBRyxDQUFDO1FBQ1pELFFBQVFDLEdBQUcsQ0FBQyxRQUFRTDtJQUN0QjtJQUVBLE9BQU9OLGdEQUFtQjtBQUM1QjtBQUVPLGVBQWVZO0lBQ3BCLElBQUlYLFFBQVE7UUFDVixNQUFNRCxnREFBbUI7UUFDekIsTUFBTUMsT0FBT2EsSUFBSTtRQUNqQmIsU0FBUztRQUNUUyxRQUFRQyxHQUFHLENBQUM7SUFDZDtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHJlbmRzcHktYmFja2VuZC8uL2xpYi9tZW1vcnlEYi5qcz80MTBlIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1vbmdvTWVtb3J5U2VydmVyIH0gZnJvbSAnbW9uZ29kYi1tZW1vcnktc2VydmVyJztcbmltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSc7XG5cbmxldCBtb25nb2QgPSBudWxsO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29ubmVjdE1lbW9yeURCKCkge1xuICBpZiAobW9uZ29vc2UuY29ubmVjdGlvbi5yZWFkeVN0YXRlID09PSAxKSB7XG4gICAgcmV0dXJuIG1vbmdvb3NlLmNvbm5lY3Rpb247XG4gIH1cblxuICBpZiAoIW1vbmdvZCkge1xuICAgIG1vbmdvZCA9IGF3YWl0IE1vbmdvTWVtb3J5U2VydmVyLmNyZWF0ZSgpO1xuICAgIGNvbnN0IHVyaSA9IG1vbmdvZC5nZXRVcmkoKTtcblxuICAgIGF3YWl0IG1vbmdvb3NlLmNvbm5lY3QodXJpLCB7XG4gICAgICBkYk5hbWU6ICd0cmVuZHNweScsXG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygn4pyFIEluLW1lbW9yeSBNb25nb0RCIGNvbm5lY3RlZCcpO1xuICAgIGNvbnNvbGUubG9nKCdVUkk6JywgdXJpKTtcbiAgfVxuXG4gIHJldHVybiBtb25nb29zZS5jb25uZWN0aW9uO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGlzY29ubmVjdE1lbW9yeURCKCkge1xuICBpZiAobW9uZ29kKSB7XG4gICAgYXdhaXQgbW9uZ29vc2UuZGlzY29ubmVjdCgpO1xuICAgIGF3YWl0IG1vbmdvZC5zdG9wKCk7XG4gICAgbW9uZ29kID0gbnVsbDtcbiAgICBjb25zb2xlLmxvZygn4pyFIEluLW1lbW9yeSBNb25nb0RCIGRpc2Nvbm5lY3RlZCcpO1xuICB9XG59XG4iXSwibmFtZXMiOlsiTW9uZ29NZW1vcnlTZXJ2ZXIiLCJtb25nb29zZSIsIm1vbmdvZCIsImNvbm5lY3RNZW1vcnlEQiIsImNvbm5lY3Rpb24iLCJyZWFkeVN0YXRlIiwiY3JlYXRlIiwidXJpIiwiZ2V0VXJpIiwiY29ubmVjdCIsImRiTmFtZSIsImNvbnNvbGUiLCJsb2ciLCJkaXNjb25uZWN0TWVtb3J5REIiLCJkaXNjb25uZWN0Iiwic3RvcCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./lib/memoryDb.js\n");

/***/ })

};
;