"use strict";
// A generic Result pattern to handle errors gracefully without throwing exceptions everywhere.
// This is critical for a "Error-Free" system.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
exports.Result = {
    ok: (data) => ({ success: true, data }),
    fail: (code, message, details) => ({
        success: false,
        error: { code, message, details }
    })
};
