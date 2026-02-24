"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateBody = void 0;
const zod_1 = require("zod");
const error_handler_1 = require("./error.handler");
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                next(new error_handler_1.AppError(message, 400, 'VALIDATION_ERROR'));
                return;
            }
            next(error);
        }
    };
};
exports.validateBody = validateBody;
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                next(new error_handler_1.AppError(message, 400, 'VALIDATION_ERROR'));
                return;
            }
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
//# sourceMappingURL=validate.middleware.js.map