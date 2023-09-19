import { MatchInvitation, PrismaClient } from "@prisma/client";

export interface IMatchRepository {
  createNewInvitation(invitation: Omit<MatchInvitation, "id">): Promise<MatchInvitation>;
}

export class MatchRepository implements IMatchRepository {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  public async createNewInvitation(invitation: Omit<MatchInvitation, "id">): Promise<MatchInvitation> {
    return this.prisma.matchInvitation.create({
      data: invitation,
    });
  }
}
