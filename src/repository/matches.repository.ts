import { MatchInvitation, PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";

export interface IMatchRepository {
  getMatchInvitationByPeople(challengerID: number, challengedID: number): Promise<MatchInvitation | null>;
  createNewInvitation(invitation: Omit<MatchInvitation, "id" | "createdAt">): Promise<MatchInvitation>;
}

export class MatchRepository implements IMatchRepository {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  public async getMatchInvitationByPeople(challengerId: number, challengedId: number): Promise<MatchInvitation | null> {
    return this.prisma.matchInvitation.findFirst({
      where: {
        challengerId,
        challengedId,
      },
      orderBy: {
        createdAt: "desc",
      }
    })
  }

  public async createNewInvitation(invitation: Omit<MatchInvitation, "id">): Promise<MatchInvitation> {
    return this.prisma.matchInvitation.create({
      data: invitation,
    });
  }
}
