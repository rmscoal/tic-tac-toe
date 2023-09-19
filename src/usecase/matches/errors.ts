import { AppError, ErrorType } from "../../shared/AppError";

export class RivalUnavailable extends AppError {
  constructor() {
    super(ErrorType.ErrUnprocessableEntity, 'rival not available for a duel');
  }
}

export class SelfStatusUnavailable extends AppError {
  constructor() {
    super(ErrorType.ErrUnprocessableEntity, 'you are unvailable for a match')
  }
}

