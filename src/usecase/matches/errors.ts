import { AppError, ErrorType } from '../../shared/AppError';

/**
 ********************************
 * Match Invitations Error
 ********************************
 */

export class RivalUnavailable extends AppError {
  constructor() {
    super(ErrorType.ErrUnprocessableEntity, 'rival not available for a duel');
  }
}

export class SelfStatusUnavailable extends AppError {
  constructor() {
    super(ErrorType.ErrUnprocessableEntity, 'you are unvailable for a match');
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

/**
 ********************************
 * Live Matches Error
 ********************************
 */
export class MatchNotFound extends AppError {
  constructor() {
    super(ErrorType.ErrNotFound, 'match not found');
  }
}

export class InvalidMatchAccess extends AppError {
  constructor() {
    super(ErrorType.ErrForbidden, 'you are not the player in this match');
  }
}

export class MatchHasEnded extends AppError {
  constructor() {
    super(ErrorType.ErrBadRequest, 'the match has ended');
  }
}

export class NotYourTurn extends AppError {
  constructor() {
    super(ErrorType.ErrBadRequest, 'it is currently not your turn');
  }
}

export class BlockAlreadyFilled extends AppError {
  constructor() {
    super(ErrorType.ErrBadRequest, 'block has already been filled with an exisiting piece');
  }
}
