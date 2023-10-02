import { AppError, ErrorType } from '../../shared/AppError';

export class SessionExpired extends AppError {
  constructor() {
    super(ErrorType.ErrUnauthorized, 'session has expired');
  }
}

export class UserNotFoundInPayload extends AppError {
  constructor() {
    super(ErrorType.ErrUnauthorized, 'unable to identify resource');
  }
}
