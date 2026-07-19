"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const ResponseWrapper_1 = require("../utils/ResponseWrapper");
const constants_1 = require("../utils/constants");
class BaseController {
    sendSuccess(res, data, meta, status = constants_1.HTTP_STATUS.OK) {
        res.status(status).json(ResponseWrapper_1.ResponseWrapper.success(data, meta));
    }
    sendCreated(res, data, meta) {
        this.sendSuccess(res, data, meta, constants_1.HTTP_STATUS.CREATED);
    }
    sendNoContent(res) {
        res.status(constants_1.HTTP_STATUS.NO_CONTENT).send();
    }
}
exports.BaseController = BaseController;
