import { Router, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { AppError, ErrorType } from '../../shared/AppError';
import { IMatchUC } from '../../usecase/matches/matches.usecase';
import { currentUserKey } from './constants';

export class MatchController extends BaseController {
  private router: Router;
  private matchUC: IMatchUC;

  private constructor(matchUC: IMatchUC) {
    super();
    this.router = Router();
    this.matchUC = matchUC;

    this.router.post('/:rivalID', this.inviteHandler);
    this.router.post('/accept/:invitationID', this.acceptHandler);
  }

  public static create(matchUC: IMatchUC): Router {
    return new MatchController(matchUC).getRouter();
  }

  public getRouter(): Router {
    return this.router;
  }

  private inviteHandler = async (req: Request, res: Response) => {
    const currentUser = req.app.get(currentUserKey);

    const rivalID = parseInt(req.params.rivalID)
    if (isNaN(rivalID)) {
      this.badRequest(res, new AppError(ErrorType.ErrBadRequest, 'invitation id has to be a number'));
      return;
    }

    const result = await this.matchUC.inviteDuel(currentUser, rivalID);
    if (result instanceof AppError) {
      this.summariseError(res, result);
      return;
    }

    this.created(res, result);
  }

  private acceptHandler = async (req: Request, res: Response) => {
    const currentUser = req.app.get(currentUserKey);

    const invitationID = parseInt(req.params.invitationID)
    if (isNaN(invitationID)) {
      this.badRequest(res, new AppError(ErrorType.ErrBadRequest, 'invitation id has to be a number'));
      return;
    }

    const result = await this.matchUC.acceptDuel(currentUser, invitationID);
    if (result instanceof AppError) {
      this.summariseError(res, result);
      return
    }

    this.created(res, result);
  }
}
