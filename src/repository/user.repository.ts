/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient, User, UserStatus } from '@prisma/client';

export interface IUserRepository {
  checkUniqueness(payload: Partial<User>): Promise<boolean>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
  getUserByID(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getUsersByUsername(id: number, username?: string): Promise<User[]>;
  updateStatus(user: User, status: UserStatus): Promise<null>;
}

export class UserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Checks the uniqueness of email and username
   */
  public async checkUniqueness(payload: Partial<User>): Promise<boolean> {
    const count = await this.prisma.user.count({ where: payload });

    return count !== 0;
  }

  /**
   * Creates a new user
   */
  public async createUser(user: Omit<User, 'id'>): Promise<User> {
    return await this.prisma.user.create({
      data: user,
    });
  }

  /**
   * Retrieves a user record by username
   */
  public async getUserByUsername(username: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            username: username,
          },
        ],
      },
    });
  }

  /**
   * Searches users
   * @param username filters for specific username
   */
  public async getUsersByUsername(id: number, username?: string): Promise<User[]> {
    let where: any = {
      friendOf: {
        none: {
          id,
        },
      },
      NOT: { id },
    };
    if (username) {
      where = {
        ...where,
        username: {
          contains: username,
        },
      };
      return await this.prisma.user.findMany({ where });
    }

    return await this.prisma.user.findMany({ where });
  }

  public async getUserByID(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  public async updateStatus(user: User, status: UserStatus): Promise<null> {
    await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        status
      }
    });

    return null;
  }
}
