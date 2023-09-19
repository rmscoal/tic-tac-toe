import { ZodError } from 'zod';
import { AppError, ErrorType } from '../../shared/AppError';

export class DuplicateUserRecord extends AppError {
  constructor() {
    super(ErrorType.ErrConflictState, 'duplicate user records');
  }
}

export class UserNotFound extends AppError {
  constructor() {
    super(ErrorType.ErrNotFound, 'user not found');
  }
}

export class MismatchedPassword extends AppError {
  constructor() {
    super(ErrorType.ErrUnauthorized, 'password mismatched');
  }
}
