/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Response, Request, Router } from 'express';
import { BaseController } from '../v1/base.controller';
import { IDoorkeeper } from '../../services/doorkeeper/doorkeeper.service';
import { AppError, ErrorType, UnauthenticatedError } from '../../shared/AppError';
import { UserNotFoundInPayload } from '../../services/doorkeeper/errors';
import { currentUserKey } from '../v1/constants';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';

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

export class AuthSocketMiddleware {
  private dkSrv: IDoorkeeper;

  private constructor(dkSrv: IDoorkeeper) {
    this.dkSrv = dkSrv;
  }

  public static create(dkSrv: IDoorkeeper): AuthSocketMiddleware {
    return new AuthSocketMiddleware(dkSrv);
  }

  public authenticate = async (socket: Socket, next: any) => {
    // Authenticate action
    const authorization = socket.request.headers.authorization;
    if (!authorization) {
      next(new UnauthenticatedError());
      return;
    }

    const result = await this.dkSrv.verifyJWT(authorization!);
    if (result instanceof AppError) {
      next(new UnauthenticatedError());
      return;
    }

    socket.data = result as User;
    next();
  };
}
