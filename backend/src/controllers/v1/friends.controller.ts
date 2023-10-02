import { Router, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { AppError, ErrorType } from '../../shared/AppError';
import { IFriendsUseCase } from '../../usecase/friends/friends.usecase';
import { currentUserKey } from './constants';
import { mapIncomingInvitationsToResponse, mapUsersModelToResponse } from './dto/mapper';

export class FriendsController extends BaseController {
  private router: Router;
  private friendsUC: IFriendsUseCase;

  private constructor(friendsUC: IFriendsUseCase) {
    super();
    this.router = Router();
    this.friendsUC = friendsUC;

    this.router.get('', this.viewFriendsHandler)
    this.router.get('/invites/incoming', this.incomingInvitationHandler);
    this.router.post('/invites/:targetID', this.invitationHandler);
    this.router.patch('/invites', this.processInvitationHandler);
  }

  public static create(friendsUC: IFriendsUseCase): Router {
    return new FriendsController(friendsUC).getRouter();
  }

  public getRouter(): Router {
    return this.router;
  }

  private invitationHandler = async (req: Request, res: Response) => {
    const currentUser = req.app.get(currentUserKey)

    const targetID = parseInt(req.params.targetID)
    if (isNaN(targetID)) {
      this.badRequest(res, new AppError(ErrorType.ErrBadRequest, 'target id has to be a number'));
      return;
    }

    const result = await this.friendsUC.requestFriend(currentUser, targetID)
    if (result instanceof AppError) {
      this.summariseError(res, result)
      return;
    }

    this.created(res, result);
  }

  private incomingInvitationHandler = async (req: Request, res: Response) => {
    const currentUser = req.app.get(currentUserKey)

    const result = await this.friendsUC.getIncomingRequests(currentUser)
    if (result instanceof AppError) {
      this.summariseError(res, result);
      return;
    }

    this.ok(res, mapIncomingInvitationsToResponse(result));
  }

  private processInvitationHandler = async (req: Request, res: Response) => {
    const currentUser = req.app.get(currentUserKey);

    const result = await this.friendsUC.processInvitation(currentUser, req.body);
    if (result instanceof AppError) {
      this.summariseError(res, result);
      return;
    }

    this.ok(res, result);
  }

  private viewFriendsHandler = async (req: Request, res: Response) => {
    const currentUser = req.app.get(currentUserKey);

    const result = await this.friendsUC.getFriendsList(currentUser, req.query['username'] as string | undefined);
    if (result instanceof AppError) {
      this.summariseError(res, result);
      return;
    }

    this.ok(res, mapUsersModelToResponse(result));
  }
}
