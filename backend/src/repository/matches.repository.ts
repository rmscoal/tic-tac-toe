import { Match, MatchInvitation, PrismaClient } from '@prisma/client';
import { Db as MongoDB, Collection as MongoCollection } from 'mongodb';
import { IMatch, IMove } from '../models/match.model';

export interface IMatchRepository {
  getMatchByID(id: number): Promise<Match | null>;
  getMongoMatchByID(id: number): Promise<IMatch | null>;
  getMatchInvitationByID(id: number): Promise<MatchInvitation | null>;
  getMatchInvitationByPeople(
    challengerID: number,
    challengedID: number
  ): Promise<MatchInvitation | null>;
  createNewInvitation(
    invitation: Omit<MatchInvitation, 'id' | 'createdAt'>
  ): Promise<MatchInvitation>;
  updateInvitationStatus(invitation: MatchInvitation): Promise<void>;
  createNewMatch(match: Omit<Match, 'id' | 'winnerId'>): Promise<Match>;
  insertMove(id: number, move: IMove, state: string[][], nextId: number): Promise<void>;
  endGame(id: number, winnnerId?: number): Promise<void>;
}

export class MatchRepository implements IMatchRepository {
  private prisma: PrismaClient;
  private mongo: MongoCollection<IMatch>;

  constructor(prisma: PrismaClient, mongo: MongoDB) {
    this.prisma = prisma;
    this.mongo = mongo.collection<IMatch>('matches');
  }

  public async getMatchByID(id: number): Promise<Match | null> {
    return await this.prisma.match.findFirst({ where: { id } });
  }

  public async getMongoMatchByID(id: number): Promise<IMatch | null> {
    return await this.mongo.findOne({ id });
  }

  public async getMatchInvitationByID(id: number): Promise<MatchInvitation | null> {
    return this.prisma.matchInvitation.findFirst({ where: { id }, include: { match: true } });
  }

  public async getMatchInvitationByPeople(
    challengerId: number,
    challengedId: number
  ): Promise<MatchInvitation | null> {
    return this.prisma.matchInvitation.findFirst({
      where: {
        challengerId,
        challengedId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  public async createNewInvitation(
    invitation: Omit<MatchInvitation, 'id'>
  ): Promise<MatchInvitation> {
    return this.prisma.matchInvitation.create({
      data: invitation,
    });
  }

  public async updateInvitationStatus(invitation: MatchInvitation): Promise<void> {
    await this.prisma.matchInvitation.update({
      where: { id: invitation.id },
      data: { status: invitation.status },
    });
  }

  public async createNewMatch(match: Omit<Match, 'id' | 'winnerId'>): Promise<Match> {
    const result = await this.prisma.match.create({ data: match });

    await this.mongo.insertOne({
      id: result.id,
      blueId: match.blueId,
      redId: match.redId,
      onGoing: true,
      turn: match.blueId,
      moves: [],
      state: [
        ['-', '-', '-'],
        ['-', '-', '-'],
        ['-', '-', '-'],
      ],
    });

    return result;
  }

  public async insertMove(
    id: number,
    move: IMove,
    state: string[][],
    nextId: number
  ): Promise<void> {
    this.mongo.updateOne({ id }, { $push: { moves: move }, $set: { turn: nextId, state } });
  }

  public async endGame(id: number, winnerId?: number): Promise<void> {
    Promise.all([
      this.mongo.updateOne({ id }, { $set: { onGoing: false, winner: winnerId } }),
      this.prisma.match.update({ where: { id }, data: { winnerId: winnerId, onGoing: false } }),
    ]);
  }
}
