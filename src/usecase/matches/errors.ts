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

export class MatchInvitationNotFound extends AppError {
  constructor() {
    super(ErrorType.ErrNotFound, 'match invitation not found');
  }
}

export class MatchInvitationExpired extends AppError {
  constructor() {
    super(ErrorType.ErrNotFound, 'match invitation already expired');
  }
}

export class MatchOnProcess extends AppError {
  constructor() {
    super(ErrorType.ErrNotFound, 'match already on process');
  }
}
export class MatchInvitationMisdirect extends AppError {
  constructor() {
    super(ErrorType.ErrUnprocessableEntity, 'match invitation is not intended for you');
  }
}
