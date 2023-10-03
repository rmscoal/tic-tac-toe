/* eslint-disable @typescript-eslint/no-explicit-any */
import { FriendsInvitation, PrismaClient, User } from '@prisma/client';
import { AppError, UnexpectedError } from '../shared/AppError';

export interface IFriendsRepository {
  getFriends(user: User, username?: string): Promise<User[]>;
  getInvitationByID(id: number): Promise<FriendsInvitation | null>;
  getInvitationByPeople(targetID: number, requesteeID: number): Promise<FriendsInvitation | null>;
  getIncomingRequests(userID: number): Promise<FriendsInvitation[]>;
  createNewInvitation(target: User | number, requestee: User | number): Promise<FriendsInvitation>;
  updateInvitationStatus(id: number, status: 'REJECTED' | 'PENDING' | 'ACCEPTED'): Promise<FriendsInvitation>;
  addFriendsByID(user: User, friendID: number): Promise<null | AppError>;
}

export class FriendsRepository implements IFriendsRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async getInvitationByPeople(targetID: number, requesteeID: number): Promise<FriendsInvitation | null> {
    return this.prisma.friendsInvitation.findFirst({
      where: {
        OR: [
          {
            targetId: targetID,
            requesteeId: requesteeID,
          },
          {
            targetId: requesteeID,
            requesteeId: targetID,
          },
        ],
      },
    });
  }

  public async getInvitationByID(id: number): Promise<FriendsInvitation | null> {
    return this.prisma.friendsInvitation.findFirst({
      where: { id },
      include: {
        requestee: true,
      },
    });
  }

  public async createNewInvitation(target: User | number, requestee: User | number): Promise<FriendsInvitation> {
    const invitation: Omit<FriendsInvitation, 'id'> = {
      targetId: 0,
      requesteeId: 0,
      status: 'PENDING',
    };
    if (typeof target === 'number') {
      invitation.targetId = target;
    } else {
      invitation.targetId = target.id;
    }

    if (typeof requestee === 'number') {
      invitation.requesteeId = requestee;
    } else {
      invitation.requesteeId = requestee.id;
    }

    return this.prisma.friendsInvitation.create({ data: invitation });
  }

  public async getIncomingRequests(userID: number): Promise<FriendsInvitation[]> {
    return this.prisma.friendsInvitation.findMany({
      where: {
        targetId: userID,
        status: 'PENDING',
      },
      include: {
        requestee: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  public async updateInvitationStatus(
    id: number,
    status: 'REJECTED' | 'PENDING' | 'ACCEPTED'
  ): Promise<FriendsInvitation> {
    return this.prisma.friendsInvitation.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  public async addFriendsByID(user: User, friendID: number): Promise<null | AppError> {
    try {
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            friends: {
              connect: [{ id: friendID }],
            },
          },
        }),
        this.prisma.user.update({
          where: {
            id: friendID,
          },
          data: {
            friends: {
              connect: [{ id: user.id }],
            },
          },
        }),
      ]);
      return null;
    } catch (err) {
      return new UnexpectedError(err);
    }
  }

  public async getFriends(user: User, username?: string): Promise<User[]> {
    let where: any = {
      friendOf: {
        some: {
          id: user.id,
        },
      },
    };

    if (username) {
      if (typeof username === 'string' && username !== '') {
        where = {
          ...where,
          username: {
            contains: username,
          },
        };
      }
    }

    return this.prisma.user.findMany({ where });
  }
}
