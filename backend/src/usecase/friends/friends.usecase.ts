/* eslint-disable @typescript-eslint/no-explicit-any */
import { FriendsInvitation, InvitationStatus, User } from '@prisma/client';
import { IUserRepository } from '../../repository/user.repository';
import { AppError, UnexpectedError } from '../../shared/AppError';
import { IFriendsRepository } from '../../repository/friends.repository';
import { UserNotFound } from '../users/errors';
import {
  AlreadyFriends,
  InvitationAlreadyProcessed,
  InvitationNotFound,
  InvitationWasRejected,
  SelfInvitationNotAllowed,
} from './errors';
import { ProcessInvitationDTO } from './dto';
import { ProcessInvitation } from './schema';
import { UnprocessableEntity } from '../common/errors';

export interface IFriendsUseCase {
  getFriendsList(currentUser: User, search?: string): Promise<User[] | AppError>;
  getIncomingRequests(currentUser: User): Promise<FriendsInvitation[] | AppError>;
  requestFriend(currentUser: User, targetID: number): Promise<FriendsInvitation | AppError>;
  processInvitation(currentUser: User, dto: ProcessInvitationDTO): Promise<FriendsInvitation | AppError>;
}

export class FriendsUseCase implements IFriendsUseCase {
  private friendsRepo: IFriendsRepository;
  private userRepo: IUserRepository;

  constructor(userRepo: IUserRepository, friendsRepo: IFriendsRepository) {
    this.userRepo = userRepo;
    this.friendsRepo = friendsRepo;
  }

  public async requestFriend(currentUser: User, targetID: number): Promise<FriendsInvitation | AppError> {
    try {
      const target = await this.userRepo.getUserByID(targetID);

      if (!target) {
        return new UserNotFound();
      }

      // Checks if the target is the currentUser
      if (target.id === currentUser.id) {
        return new SelfInvitationNotAllowed();
      }

      // Checks whether the target user is indeed
      // already in the friends list. This can be
      // done by checking invitations
      const invitation = await this.friendsRepo.getInvitationByPeople(targetID, currentUser.id);
      if (invitation) {
        switch (invitation.status) {
          case InvitationStatus.ACCEPTED: {
            return new AlreadyFriends();
          }
          case InvitationStatus.PENDING: {
            return invitation;
          }
          case InvitationStatus.REJECTED: {
            return new InvitationWasRejected();
          }
        }
      }

      const friendsInvitation = await this.friendsRepo.createNewInvitation(target, currentUser);

      return friendsInvitation;
    } catch (err) {
      return new UnexpectedError(err);
    }
  }

  public async getIncomingRequests(currentUser: User): Promise<FriendsInvitation[] | AppError> {
    try {
      const requests = await this.friendsRepo.getIncomingRequests(currentUser.id);

      return requests;
    } catch (err) {
      return new UnexpectedError(err);
    }
  }

  public async processInvitation(currentUser: User, dto: ProcessInvitationDTO): Promise<FriendsInvitation | AppError> {
    try {
      const validate = ProcessInvitation.safeParse(dto);
      if (!validate.success) {
        if ('error' in validate) {
          return new UnprocessableEntity(validate.error);
        }
      }

      let invitation = await this.friendsRepo.getInvitationByID(dto.id);
      if (!invitation) {
        return new InvitationNotFound();
      }

      if (invitation.status != 'PENDING') {
        return new InvitationAlreadyProcessed();
      }

      invitation.status = dto.action;
      invitation = await this.friendsRepo.updateInvitationStatus(invitation.id, invitation.status);

      if (invitation.status === 'ACCEPTED') {
        const result = await this.friendsRepo.addFriendsByID(currentUser, invitation.requesteeId);
        if (result instanceof AppError) {
          return result;
        }
      }

      return invitation;
    } catch (err) {
      return new UnexpectedError(err);
    }
  }

  public async getFriendsList(currentUser: User, search?: string): Promise<User[] | AppError> {
    try {
      const users = await this.friendsRepo.getFriends(currentUser, search);

      return users;
    } catch (err) {
      return new UnexpectedError(err);
    }
  }
}
