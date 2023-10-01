/* eslint-disable @typescript-eslint/no-namespace */
export enum ErrorType {
  ErrUnexpected = 'Unexpected Error',
  ErrRequestTimeout = 'Request Timeout Error',
  ErrInvalidInput = 'Invalid Input Error',
  ErrUnprocessableEntity = 'Domain Validation Error',
  ErrBadRequest = 'Bad Request Error',
  ErrNotFound = 'Not Found Error',
  ErrConflictState = 'Conflict State Error',
  ErrUnauthorized = 'Unauthorized Error',
  ErrForbidden = 'Forbidden Error',
}

type AppErrorDetail = {
  message: string;
};

export class AppError extends Error {
  public code: number;
  public type: ErrorType;
  public errors?: AppErrorDetail[];

  constructor(type: ErrorType, message: string) {
    super(message);
    this.type = type;

    switch (type) {
      case ErrorType.ErrUnexpected:
        this.code = 500;
        break;
      case ErrorType.ErrRequestTimeout:
        this.code = 429;
        break;
      case ErrorType.ErrInvalidInput:
        this.code = 400;
        break;
      case ErrorType.ErrUnprocessableEntity:
        this.code = 422;
        break;
      case ErrorType.ErrBadRequest:
        this.code = 400;
        break;
      case ErrorType.ErrNotFound:
        this.code = 404;
        break;
      case ErrorType.ErrConflictState:
        this.code = 409;
        break;
      case ErrorType.ErrUnauthorized:
        this.code = 401;
        break;
      case ErrorType.ErrForbidden:
        this.code = 403;
    }
  }
}

export class UnexpectedError extends AppError {
  constructor(error?: Error | unknown) {
    console.error(error);
    super(ErrorType.ErrUnexpected, 'Something unexpected happened');
  }
}

export class UnauthenticatedError extends AppError {
  constructor() {
    super(ErrorType.ErrUnauthorized, 'Unauthorized request');
  }
}
