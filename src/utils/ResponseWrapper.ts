export class ResponseWrapper {
  static success(data: any, meta?: any) {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
  }

  static error(errorCode: string, message: string, meta?: any) {
    return {
      success: false,
      error: {
        code: errorCode,
        message
      },
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
  }
}
