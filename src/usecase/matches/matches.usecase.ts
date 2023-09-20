import { Match, MatchInvitation, MatchInvitationStatus, User, UserStatus } from "@prisma/client";
import { AppError, UnexpectedError } from "../../shared/AppError";
import { IUserRepository } from "../../repository/user.repository";
import {
  MatchInvitationExpired,
  MatchInvitationMisdirect,
  MatchInvitationNotFound,
  MatchOnProcess, RivalUnavailable,
  SelfStatusUnavailable,
} from "./errors";
import { UserNotFound } from "../users/errors";
import { IMatchRepository } from "../../repository/matches.repository";
import { IFriendsRepository } from "../../repository/friends.repository";
import { NotFriends } from "../friends/errors";
import { DateTime } from "luxon";

export interface IMatchUC {
  inviteDuel(currentUser: User, rivalID: number): Promise<MatchInvitation | AppError>,
  acceptDuel(currentUser: User, invitationID: number): Promise<Match | AppError>,
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

      const invitation: Omit<MatchInvitation, "id" | "createdAt"> = {
        challengedId: rival.id,
        challengerId: currentUser.id,
        status: MatchInvitationStatus.PENDING,
        expiresAt: DateTime.now().plus({ minutes: 1 }).toJSDate(),
      };

      let exists = await this.matchRepo.getMatchInvitationByPeople(invitation.challengerId, invitation.challengedId);
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

  public async acceptDuel(currerntUser: User, invitationID: number): Promise<Match | AppError> {
    try {
      const invitation = await this.matchRepo.getMatchInvitationByID(invitationID);
      if (!invitation) {
        return new MatchInvitationNotFound();
      }

      if (invitation.challengedId !== currerntUser.id) {
        return new MatchInvitationMisdirect()
      }

      if (invitation.expiresAt < DateTime.now().toJSDate()) {
        return new MatchInvitationExpired()
      }

      if ('match' in invitation) {
        if (invitation.match) {
          return new MatchOnProcess();
        }
      }

      const challenger = await this.userRepo.getUserByID(invitation.challengerId);
      if (!challenger) {
        return new UserNotFound()
      }

      if (challenger.status !== UserStatus.ONLINE) {
        return new RivalUnavailable()
      }

      const blue = Math.random() < 0.5 ? currerntUser : challenger;
      const red = blue === currerntUser ? challenger : currerntUser;

      console.log("BLUE", blue);
      console.log("RED", red);

      const match: Omit<Match, "id" | "winnerId"> = {
        matchInvitationId: invitation.id,
        blueId: blue.id,
        redId: red.id,
        onGoing: true,
      }

      return await this.matchRepo.createNewMatch(match);
    } catch (err) {
      return new UnexpectedError(err)
    }
  }
}
