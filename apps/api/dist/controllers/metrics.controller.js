"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsController = void 0;
const metrics_service_1 = require("../services/metrics.service");
const tenant_guard_1 = require("../middlewares/tenant.guard");
exports.metricsController = {
    async getSummary(req, res, next) {
        try {
            const companyId = (0, tenant_guard_1.getCompanyId)(req);
            const { period, from, to } = req.query;
            const selectedPeriod = period === 'today' || period === 'week' || period === 'month' || period === 'custom'
                ? period
                : 'month';
            const summary = await metrics_service_1.metricsService.getSummary(companyId, {
                period: selectedPeriod,
                from,
                to,
            });
            res.status(200).json({ ok: true, data: { summary } });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=metrics.controller.js.map