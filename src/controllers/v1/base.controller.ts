import { Response, Router } from 'express';
import HttpStatusCode from '../status';
import { AppError, ErrorType } from '../../shared/AppError';

export abstract class BaseController {
  /**
   * getRouter returns the class's router
   */
  public abstract getRouter(): Router;

  public static errResponse(res: Response, code: number, error?: AppError): Response {
    return res.status(code).send({
      apiVersion: 'v1',
      error: {
        type: error?.type,
        code: error?.code,
        message: error?.message,
        errors: error?.errors,
      },
    });
  }

  public ok<T>(res: Response, body?: T) {
    if (body) {
      return res.status(HttpStatusCode.OK).json({
        apiVersion: 'v1',
        data: body,
      });
    }

    return res.sendStatus(HttpStatusCode.OK);
  }

  public created<T>(res: Response, body?: T) {
    if (body) {
      return res.status(HttpStatusCode.CREATED).json({
        apiVersion: 'v1',
        data: body,
      });
    }

    return res.sendStatus(HttpStatusCode.CREATED);
  }

  public badRequest(res: Response, err?: AppError) {
    return BaseController.errResponse(res, HttpStatusCode.BAD_REQUEST, err);
  }

  public unauthorized(res: Response, err?: AppError) {
    return BaseController.errResponse(res, HttpStatusCode.UNAUTHORIZED, err);
  }

  public forbidden(res: Response, err?: AppError) {
    return BaseController.errResponse(res, HttpStatusCode.FORBIDDEN, err);
  }

  public notFound(res: Response, err?: AppError) {
    return BaseController.errResponse(res, HttpStatusCode.NOT_FOUND, err);
  }

  public conflict(res: Response, err?: AppError) {
    return BaseController.errResponse(res, HttpStatusCode.CONFLICT, err);
  }

  public badEntity(res: Response, err?: AppError) {
    return BaseController.errResponse(res, HttpStatusCode.UNPROCESSABLE_ENTITY, err);
  }

  public fail(res: Response, err?: AppError) {
    return BaseController.errResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, err);
  }

  public summariseError<T extends AppError>(res: Response, err: T) {
    let code: number;
    switch (err.type) {
      case ErrorType.ErrUnexpected:
        code = HttpStatusCode.INTERNAL_SERVER_ERROR;
        break;
      case ErrorType.ErrRequestTimeout:
        code = HttpStatusCode.REQUEST_TIMEOUT;
        break;
      case ErrorType.ErrInvalidInput:
        code = HttpStatusCode.BAD_REQUEST;
        break;
      case ErrorType.ErrUnprocessableEntity:
        code = HttpStatusCode.UNPROCESSABLE_ENTITY;
        break;
      case ErrorType.ErrBadRequest:
        code = HttpStatusCode.BAD_REQUEST;
        break;
      case ErrorType.ErrNotFound:
        code = HttpStatusCode.NOT_FOUND;
        break;
      case ErrorType.ErrConflictState:
        code = HttpStatusCode.CONFLICT;
        break;
      case ErrorType.ErrUnauthorized:
        code = HttpStatusCode.UNAUTHORIZED;
        break;
      case ErrorType.ErrForbidden:
        code = HttpStatusCode.FORBIDDEN;
    }

    return BaseController.errResponse(res, code, err);
  }
}
