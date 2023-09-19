import { MatchInvitation, MatchInvitationStatus, User, UserStatus } from "@prisma/client";
import { AppError, UnexpectedError } from "../../shared/AppError";
import { IUserRepository } from "../../repository/user.repository";
import { RivalUnavailable, SelfStatusUnavailable } from "./errors";
import { UserNotFound } from "../users/errors";
import { IMatchRepository } from "../../repository/matches.repository";
import { IFriendsRepository } from "../../repository/friends.repository";
import { NotFriends } from "../friends/errors";
import { DateTime } from "luxon";

export interface IMatchUC {
  inviteDuel(currentUser: User, rivalID: number): Promise<MatchInvitation | AppError>,
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

      const invitation: Omit<MatchInvitation, "id"> = {
        challengedId: rival.id,
        challengerId: currentUser.id,
        status: MatchInvitationStatus.PENDING,
        expiresAt: DateTime.now().plus({ minutes: 1 }).toJSDate(),
      };

      return await this.matchRepo.createNewInvitation(invitation);
    } catch (err) {
      return new UnexpectedError(err);
    }
  }
}
