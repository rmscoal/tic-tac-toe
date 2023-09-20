import { Match, MatchInvitation, PrismaClient } from "@prisma/client";

export interface IMatchRepository {
  getMatchInvitationByID(id: number): Promise<MatchInvitation | null>;
  getMatchInvitationByPeople(challengerID: number, challengedID: number): Promise<MatchInvitation | null>; createNewInvitation(invitation: Omit<MatchInvitation, "id" | "createdAt">): Promise<MatchInvitation>;

  createNewMatch(match: Omit<Match, "id" | "winnerId">): Promise<Match>;
}

export class MatchRepository implements IMatchRepository {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  public async getMatchInvitationByID(id: number): Promise<MatchInvitation | null> {
    return this.prisma.matchInvitation.findFirst({ where: { id }, include: { match: true } });
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

  public async createNewMatch(match: Omit<Match, "id" | "winnerId">): Promise<Match> {
    return this.prisma.match.create({
      data: match,
    })
  }
}
