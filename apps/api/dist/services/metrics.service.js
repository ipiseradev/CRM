"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsService = void 0;
const metrics_repository_1 = require("../repositories/metrics.repository");
exports.metricsService = {
    async getSummary(companyId, input) {
        return metrics_repository_1.metricsRepository.getSummary(companyId, input);
    },
};
//# sourceMappingURL=metrics.service.js.map