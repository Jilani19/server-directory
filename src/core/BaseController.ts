import { Response } from 'express';
import { ResponseWrapper } from '../utils/ResponseWrapper';
import { HTTP_STATUS } from '../utils/constants';

export abstract class BaseController {
  protected sendSuccess(res: Response, data: any, meta?: any, status: number = HTTP_STATUS.OK): void {
    res.status(status).json(ResponseWrapper.success(data, meta));
  }

  protected sendCreated(res: Response, data: any, meta?: any): void {
    this.sendSuccess(res, data, meta, HTTP_STATUS.CREATED);
  }

  protected sendNoContent(res: Response): void {
    res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
