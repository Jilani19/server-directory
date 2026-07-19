"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const BaseController_1 = require("../../core/BaseController");
class HealthController extends BaseController_1.BaseController {
    liveness = (req, res) => {
        this.sendSuccess(res, { status: 'UP' });
    };
    readiness = (req, res) => {
        // In a real app, you would check Prisma connection here
        this.sendSuccess(res, { status: 'READY', db: 'OK' });
    };
    version = (req, res) => {
        this.sendSuccess(res, { version: '1.0.0' });
    };
}
exports.HealthController = HealthController;
