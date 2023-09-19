import { NextFunction, Response, Request, Router } from 'express';
import { BaseController } from '../v1/base.controller';
import { IDoorkeeper } from '../../services/doorkeeper/doorkeeper.service';
import { AppError, ErrorType } from '../../shared/AppError';
import { UserNotFoundInPayload } from '../../services/doorkeeper/errors';
import { currentUserKey } from '../v1/constants';

export class AuthMiddleware extends BaseController {
  private router: Router;
  private dkService: IDoorkeeper;

  private constructor(dkService: IDoorkeeper) {
    super();
    this.dkService = dkService;
    this.router = Router();
  }

  public static create(dkService: IDoorkeeper): AuthMiddleware {
    return new AuthMiddleware(dkService);
  }

  public getRouter(): Router {
    return this.router;
  }

  public authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = req.headers.authorization;
    if (!bearerToken) {
      this.unauthorized(
        res,
        new AppError(ErrorType.ErrUnauthorized, 'this is a protected endpoint')
      );
      return;
    }

    if (typeof bearerToken !== 'string') {
      this.unauthorized(res, new AppError(ErrorType.ErrUnauthorized, 'token is not string'));
      return;
    }

    if (!bearerToken.includes('Bearer ')) {
      this.unauthorized(res, new AppError(ErrorType.ErrUnauthorized, 'bearer token not provided'));
      return;
    }

    const token = bearerToken.split(' ')[1];

    const currentUser = await this.dkService.verifyJWT(token);
    if (currentUser instanceof AppError) {
      this.unauthorized(res, currentUser);
      return;
    }

    req.app.set('currentUser', currentUser);
    if (!req.app.get(currentUserKey)) {
      this.unauthorized(res, new UserNotFoundInPayload());
      return;
    }

    next();
  };
}
