import { Router, Request, Response } from 'express';
import { BaseController } from './base.controller';
import { IUserUseCase } from '../../usecase/users/user.usecase';
import { AppError } from '../../shared/AppError';
import { mapUsersModelToResponse, mapUserModelToSignupResponse } from './dto/mapper';
import { authMiddleware } from '../middlewares';
import { currentUserKey } from './constants';

export class UserController extends BaseController {
  private router: Router;
  private userUC: IUserUseCase;

  private constructor(userUC: IUserUseCase) {
    super();
    this.router = Router();
    this.userUC = userUC;

    // Protected
    this.router.get('/players', authMiddleware.authenticate, this.searchUsersHandler);

    this.router.post('/signup', this.signupHandler);
    this.router.post('/login', this.loginHandler);
  }

  public static create(userUC: IUserUseCase): Router {
    return new UserController(userUC).getRouter();
  }

  public getRouter(): Router {
    return this.router;
  }

  /**
   * The signupHandler handles signup request.
   */
  private signupHandler = async (req: Request, res: Response) => {
    const result = await this.userUC.signup(req.body);

    if (result instanceof AppError) {
      this.summariseError(res, result);
      return;
    }

    this.ok(res, mapUserModelToSignupResponse(result));
  };

  /**
   * The loginHandler handles the login request.
   */
  private loginHandler = async (req: Request, res: Response) => {
    const result = await this.userUC.login(req.body);

    if (result instanceof AppError) {
      this.summariseError(res, result);
      return;
    }

    this.ok(res, mapUserModelToSignupResponse(result));
  };

  /**
   * The searchUsersHandlers searches user that are not
   * in friends list.
   */
  private searchUsersHandler = async (req: Request, res: Response) => {
    const currentUser = req.app.get(currentUserKey);

    const result = await this.userUC.searchUsers(
      currentUser,
      req.query['username'] as string | undefined
    );
    if (result instanceof AppError) {
      this.summariseError(res, result);
      return;
    }

    this.ok(res, mapUsersModelToResponse(result));
  };
}
