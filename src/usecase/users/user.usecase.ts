/* eslint-disable @typescript-eslint/no-explicit-any */
import { User, UserStatus } from '@prisma/client';
import { IUserRepository } from '../../repository/user.repository';
import {
  DuplicateUserRecord,
  MismatchedPassword,
  UserNotFound,
} from './errors';
import { AppError, UnexpectedError } from '../../shared/AppError';
import { CredentialResult, LoginDTO, NewUserDTO } from './dto';
import { IDoorkeeper } from '../../services/doorkeeper/doorkeeper.service';
import { LoginRequest, SignupRequest } from './schema';
import { UnprocessableEntity } from '../common/errors';

export interface IUserUseCase {
  signup(dto: NewUserDTO): Promise<CredentialResult | AppError>;
  login(dto: LoginDTO): Promise<CredentialResult | AppError>;
  searchUsers(currentUser: User, username?: string): Promise<User[] | AppError>;
}

export class UserUseCase implements IUserUseCase {
  private userRepo: IUserRepository;
  private dkService: IDoorkeeper;

  constructor(userRepo: IUserRepository, dkService: IDoorkeeper) {
    this.userRepo = userRepo;
    this.dkService = dkService;
  }

  public async signup(dto: NewUserDTO): Promise<CredentialResult | AppError> {
    try {
      const validate = SignupRequest.safeParse(dto);

      if (!validate.success) {
        return new UnprocessableEntity(validate.error);
      }

      const exists = await this.userRepo.checkUniqueness({
        username: dto.username,
      });

      if (exists) {
        return new DuplicateUserRecord();
      }

      const password = await this.dkService.hashPassword(dto.password);

      const user = await this.userRepo.createUser({
        username: dto.username,
        password: password,
        status: UserStatus.ONLINE,
      });

      const token = await this.dkService.signJWT(user);

      return { accessToken: token, user: user };
    } catch (err) {
      return new UnexpectedError(err);
    }
  }

  public async login(dto: LoginDTO): Promise<CredentialResult | AppError> {
    try {
      const validate = LoginRequest.safeParse(dto);
      if (!validate.success) {
        return new UnprocessableEntity(validate.error);
      }

      const user = await this.userRepo.getUserByUsername(dto.username);
      if (!user) {
        return new UserNotFound();
      }

      const match = await this.dkService.verifyPassword(user.password, dto.password);
      if (!match) {
        return new MismatchedPassword();
      }

      await this.userRepo.updateStatus(user, UserStatus.ONLINE);

      const token = await this.dkService.signJWT(user);

      return { accessToken: token, user: user };
    } catch (err) {
      return new UnexpectedError(err);
    }
  }

  public async searchUsers(currentUser: User, username?: string): Promise<User[] | AppError> {
    try {
      const users = await this.userRepo.getUsersByUsername(currentUser.id, username);
      return users;
    } catch (err) {
      return new UnexpectedError(err);
    }
  }
}
