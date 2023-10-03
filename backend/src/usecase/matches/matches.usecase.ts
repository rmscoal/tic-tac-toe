import { Match, MatchInvitation, MatchInvitationStatus, User, UserStatus } from '@prisma/client';
import { AppError, UnexpectedError } from '../../shared/AppError';
import { IUserRepository } from '../../repository/user.repository';
import { UserNotFound } from '../users/errors';
import { IMatchRepository } from '../../repository/matches.repository';
import { IFriendsRepository } from '../../repository/friends.repository';
import { NotFriends } from '../friends/errors';
import { DateTime } from 'luxon';
import { ActiveMatchRequest, ProcessMatchInvitationRequest } from '../../controllers/v1/dto/request';
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
  BlockAlreadyFilled,
} from './errors';
import { IMove, LiveMatchResponse } from '../../models/match.model';

export interface IMatchUC {
  inviteDuel(currentUser: User, rivalID: number): Promise<MatchInvitation | AppError>;
  processDuelInvitation(currentUser: User, dto: ProcessMatchInvitationRequest): Promise<Match | null | AppError>;
  liveMatch(currentUser: User, dto: ActiveMatchRequest): Promise<LiveMatchResponse | AppError>;
}

export class MatchUseCase implements IMatchUC {
  private userRepo: IUserRepository;
  private matchRepo: IMatchRepository;
  private friendsRepo: IFriendsRepository;

  constructor(userRepo: IUserRepository, friendsRepo: IFriendsRepository, matchRepo: IMatchRepository) {
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

      const exists = await this.matchRepo.getMatchInvitationByPeople(invitation.challengerId, invitation.challengedId);
      if (exists) {
        if (exists.status === MatchInvitationStatus.PENDING && exists.expiresAt > DateTime.now().toJSDate()) {
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

  public async liveMatch(currentUser: User, dto: ActiveMatchRequest): Promise<LiveMatchResponse | AppError> {
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

      if (match.state[dto.x][dto.y] !== '-') {
        return new BlockAlreadyFilled();
      }

      // Setup initial result
      const result: LiveMatchResponse = {
        status: 'CONTINUE',
        id: dto.id,
        move,
      };

      // Edit the move with the current state...
      match.state[dto.x][dto.y] = move.piece;
      const turn = match.turn === match.blueId ? match.redId : match.blueId;
      await this.matchRepo.insertMove(match.id, move, match.state, turn);

      // Next check if it was a winning move
      if (this.checkWinning(move, match.state)) {
        await this.matchRepo.endGame(match.id, currentUser.id);
        result.status = 'END';
        result.winner = move.mover;
        return result;
      }

      // If not then check if the game state
      // is a draw
      if (this.checkDraw(match.state)) {
        await this.matchRepo.endGame(match.id);
        result.status = 'END';
        result.draw = true;
        return result;
      }

      return result;
    } catch (err) {
      return new UnexpectedError(err);
    }
  }

  /**
   * checkWinning checks whether the move with
   * the game state is a winning move or not
   * @param move the move from user
   * @param state the game board state
   * @returns whether the move was a winning move or not
   */
  private checkWinning(move: IMove, state: string[][]): boolean {
    return this.checkDiag(move, state) || this.checkHorizontal(move, state) || this.checkVertical(move, state);
  }

  /**
   * checkDraw checks whether the game board
   * state is a draw or not
   * @param state the game board state
   * @returns
   */
  private checkDraw(state: string[][]): boolean {
    for (const x of state) {
      for (const y of x) {
        if (y === '-') return false;
      }
    }

    return true;
  }

  /**
   * checkHorizontal checks whether the move alongside
   * its relative horizontal state is a strike
   * @param move the move from user
   * @param state the game board state
   * @returns if the horizontal move is a strike
   */
  private checkHorizontal(move: IMove, state: string[][]): boolean {
    for (let i = 0; i < 3; i++) {
      if (state[move.x][i] !== move.piece) {
        return false;
      }
    }
    return true;
  }

  /**
   * checkVertical checks whether the move alongside
   * its relative vertical state is a strike
   * @param move the move from user
   * @param state the game board state
   * @returns if the vertical state is a strike
   */
  private checkVertical(move: IMove, state: string[][]): boolean {
    for (let i = 0; i < 3; i++) {
      if (state[i][move.y] !== move.piece) {
        return false;
      }
    }

    return true;
  }

  /**
   * checkDiag checks whether the diagonal is a strike
   * of the move's piece
   * @param move the move from user
   * @param state the game board state
   * @returns if the diagonals state is a strike
   */
  private checkDiag(move: IMove, state: string[][]): boolean {
    if (move.x !== move.y + 2 && move.x !== move.y) return false;

    switch ([move.x, move.y]) {
      case [1, 1]:
        if (this.checkMainDiag(move, state)) {
          return true;
        }
        if (this.checkSecondaryDiag(move, state)) {
          return true;
        }
        return false;

      case [0, 0]:
      case [2, 2]:
        if (this.checkMainDiag(move, state)) {
          return true;
        }
        return false;
      case [0, 2]:
      case [2, 0]:
        if (this.checkSecondaryDiag(move, state)) {
          return true;
        }
        return false;
      default:
        return false;
    }
  }

  private checkMainDiag(move: IMove, state: string[][]): boolean {
    for (let i = 0; i < 3; i++) {
      if (state[i][i] !== move.piece) {
        return false;
      }
    }

    return true;
  }

  private checkSecondaryDiag(move: IMove, state: string[][]): boolean {
    for (let i = 0, j = 2; i < 3; i++, j--) {
      if (state[i][j] !== move.piece) {
        return false;
      }
    }

    return true;
  }
}
