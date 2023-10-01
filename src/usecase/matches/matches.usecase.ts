import { Match, MatchInvitation, MatchInvitationStatus, User, UserStatus } from '@prisma/client';
import { AppError, UnexpectedError } from '../../shared/AppError';
import { IUserRepository } from '../../repository/user.repository';
import { UserNotFound } from '../users/errors';
import { IMatchRepository } from '../../repository/matches.repository';
import { IFriendsRepository } from '../../repository/friends.repository';
import { NotFriends } from '../friends/errors';
import { DateTime } from 'luxon';
import {
  ActiveMatchRequest,
  ProcessMatchInvitationRequest,
} from '../../controllers/v1/dto/request';
import { MoveSchema, ProcessMatchInvitationSchema } from './schema';
import { UnprocessableEntity } from '../common/errors';
import {
  MatchInvitationExpired,
  MatchInvitationMisdirect,
  MatchInvitationNotFound,
  MatchOnProcess,
  RivalUnavailable,
  SelfStatusUnavailable,
  InvalidMatchAccess,
  MatchHasEnded,
  MatchNotFound,
  NotYourTurn,
} from './errors';
import { IMove } from '../../models/match.model';

export interface IMatchUC {
  inviteDuel(currentUser: User, rivalID: number): Promise<MatchInvitation | AppError>;
  processDuelInvitation(
    currentUser: User,
    dto: ProcessMatchInvitationRequest
  ): Promise<Match | null | AppError>;
  liveMatch(currentUser: User, dto: ActiveMatchRequest): Promise<null | AppError>;
}

export class MatchUseCase implements IMatchUC {
  private userRepo: IUserRepository;
  private matchRepo: IMatchRepository;
  private friendsRepo: IFriendsRepository;

  constructor(
    userRepo: IUserRepository,
    friendsRepo: IFriendsRepository,
    matchRepo: IMatchRepository
  ) {
    this.userRepo = userRepo;
    this.matchRepo = matchRepo;
    this.friendsRepo = friendsRepo;
  }

  public async inviteDuel(currentUser: User, rivalID: number): Promise<MatchInvitation | AppError> {
    try {
      const rival = await this.userRepo.getUserByID(rivalID);
      if (!rival) {
        return new UserNotFound();
      }

      if (rival.status !== UserStatus.ONLINE) {
        return new RivalUnavailable();
      }

      if (currentUser.status !== UserStatus.ONLINE) {
        return new SelfStatusUnavailable();
      }

      const friends = await this.friendsRepo.getFriends(currentUser);
      const friend = friends.find((item) => item.id === rival.id);
      if (!friend) {
        return new NotFriends();
      }

      const invitation: Omit<MatchInvitation, 'id' | 'createdAt'> = {
        challengedId: rival.id,
        challengerId: currentUser.id,
        status: MatchInvitationStatus.PENDING,
        expiresAt: DateTime.now().plus({ minutes: 1 }).toJSDate(),
      };

      const exists = await this.matchRepo.getMatchInvitationByPeople(
        invitation.challengerId,
        invitation.challengedId
      );
      if (exists) {
        if (
          exists.status === MatchInvitationStatus.PENDING &&
          exists.expiresAt > DateTime.now().toJSDate()
        ) {
          return exists;
        }
      }

      return await this.matchRepo.createNewInvitation(invitation);
    } catch (err) {
      return new UnexpectedError(err);
    }
  }

  public async processDuelInvitation(
    currentUser: User,
    dto: ProcessMatchInvitationRequest
  ): Promise<Match | null | AppError> {
    try {
      const validate = ProcessMatchInvitationSchema.safeParse(dto);
      if (!validate.success) {
        return new UnprocessableEntity(validate.error);
      }

      const invitation = await this.matchRepo.getMatchInvitationByID(dto.id);
      if (!invitation) {
        return new MatchInvitationNotFound();
      }

      if (invitation.challengedId !== currentUser.id) {
        return new MatchInvitationMisdirect();
      }

      if (invitation.expiresAt < DateTime.now().toJSDate()) {
        return new MatchInvitationExpired();
      }

      if ('match' in invitation) {
        if (invitation.match) {
          return new MatchOnProcess();
        }
      }

      invitation.status = dto.action;
      await this.matchRepo.updateInvitationStatus(invitation);

      // We return null if match is not accepted
      if (invitation.status !== MatchInvitationStatus.ACCEPTED) return null;

      const challenger = await this.userRepo.getUserByID(invitation.challengerId);
      if (!challenger) {
        return new UserNotFound();
      }

      if (challenger.status !== UserStatus.ONLINE) {
        return new RivalUnavailable();
      }

      const blue = Math.random() < 0.5 ? currentUser : challenger;
      const red = blue === currentUser ? challenger : currentUser;

      const match: Omit<Match, 'id' | 'winnerId'> = {
        matchInvitationId: invitation.id,
        blueId: blue.id,
        redId: red.id,
        onGoing: true,
      };

      return await this.matchRepo.createNewMatch(match);
    } catch (err) {
      return new UnexpectedError(err);
    }
  }

  public async liveMatch(currentUser: User, dto: ActiveMatchRequest): Promise<null | AppError> {
    try {
      const match = await this.matchRepo.getMongoMatchByID(dto.id);
      if (!match) {
        return new MatchNotFound();
      }

      if (match?.blueId !== currentUser.id && match?.redId !== currentUser.id) {
        return new InvalidMatchAccess();
      }

      if (!match.onGoing) {
        return new MatchHasEnded();
      }

      if (match.turn !== currentUser.id) {
        return new NotYourTurn();
      }

      const move: IMove = {
        mover: currentUser.id,
        piece: currentUser.id === match.blueId ? 'X' : 'O',
        x: dto.x,
        y: dto.y,
      };

      const validate = MoveSchema.safeParse(move);
      if (!validate.success) {
        return new UnprocessableEntity(validate.error);
      }

      await this.matchRepo.insertMove(match.id, move);

      return null;
    } catch (err) {
      return new UnexpectedError(err);
    }
  }
}
