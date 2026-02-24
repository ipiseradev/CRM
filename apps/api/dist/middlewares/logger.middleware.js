"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = void 0;
const loggerMiddleware = (req, res, next) => {
    const start = Date.now();
    const { method, url, ip } = req;
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        const color = statusCode >= 500
            ? '\x1b[31m' // red
            : statusCode >= 400
                ? '\x1b[33m' // yellow
                : statusCode >= 300
                    ? '\x1b[36m' // cyan
                    : '\x1b[32m'; // green
        const reset = '\x1b[0m';
        console.log(`${color}[${new Date().toISOString()}] ${method} ${url} ${statusCode} ${duration}ms - ${ip}${reset}`);
    });
    next();
};
exports.loggerMiddleware = loggerMiddleware;
//# sourceMappingURL=logger.middleware.js.map