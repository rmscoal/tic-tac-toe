import { AppError, ErrorType } from '../../shared/AppError';

export class InvitationNotFound extends AppError {
  constructor() {
    super(ErrorType.ErrNotFound, 'invitation not found')
  }
}

export class InvitationAlreadyProcessed extends AppError {
  constructor() {
    super(ErrorType.ErrUnprocessableEntity, 'invitation was already processed')
  }
}

export class SelfInvitationNotAllowed extends AppError {
  constructor() {
    super(ErrorType.ErrBadRequest, 'self invitation is not allowed');
  }
}

export class AlreadyFriends extends AppError {
  constructor() {
    super(ErrorType.ErrConflictState, 'already in friends');
  }
}

export class InvitationWasRejected extends AppError {
  constructor() {
    super(ErrorType.ErrUnprocessableEntity, 'invitation had been rejected previously');
  }
}

export class NotFriends extends AppError {
  constructor() {
    super(ErrorType.ErrUnprocessableEntity, 'not in friends list');
  }
}
