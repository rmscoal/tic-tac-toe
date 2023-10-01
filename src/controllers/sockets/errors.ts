import { AppError, ErrorType } from '../../shared/AppError';

export class UnrecognisedMatchID extends AppError {
  constructor() {
    super(ErrorType.ErrBadRequest, 'unrecognized match room id');
  }
}
