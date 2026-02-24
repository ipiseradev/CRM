"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const logger_middleware_1 = require("./middlewares/logger.middleware");
const error_handler_1 = require("./middlewares/error.handler");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const clients_routes_1 = __importDefault(require("./routes/clients.routes"));
const deals_routes_1 = __importDefault(require("./routes/deals.routes"));
const tasks_routes_1 = __importDefault(require("./routes/tasks.routes"));
const activities_routes_1 = __importDefault(require("./routes/activities.routes"));
const metrics_routes_1 = __importDefault(require("./routes/metrics.routes"));
const app = (0, express_1.default)();
// ─── Security Middleware ───────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: env_1.env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        ok: false,
        error: { message: 'Too many requests, please try again later.', code: 'RATE_LIMIT' },
    },
});
app.use(limiter);
// ─── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// ─── Logging ───────────────────────────────────────────────────────────────────
app.use(logger_middleware_1.loggerMiddleware);
// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({
        ok: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            service: 'SalesCore API',
        },
    });
});
// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', auth_routes_1.default);
app.use('/api/clients', clients_routes_1.default);
app.use('/api/deals', deals_routes_1.default);
app.use('/api/tasks', tasks_routes_1.default);
app.use('/api/activities', activities_routes_1.default);
app.use('/api/metrics', metrics_routes_1.default);
// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use(error_handler_1.notFoundHandler);
// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use(error_handler_1.errorHandler);
// ─── Start Server ──────────────────────────────────────────────────────────────
const server = app.listen(env_1.env.PORT, () => {
    console.log(`\n🚀 SalesCore API running on http://localhost:${env_1.env.PORT}`);
    console.log(`   Environment: ${env_1.env.NODE_ENV}`);
    console.log(`   CORS Origin: ${env_1.env.CORS_ORIGIN}\n`);
});
// ─── Graceful Shutdown ─────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map