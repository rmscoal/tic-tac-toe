/* eslint-disable @typescript-eslint/no-explicit-any */
import * as argon from 'argon2';
import * as jose from 'jose';
import { AppError, ErrorType } from '../../shared/AppError';
import { SessionExpired, UserNotFoundInPayload } from './errors';
import { User } from '@prisma/client';

const AccessTokenDuration = '1h';

export interface IDoorkeeper {
  hashPassword(raw: string): Promise<string>;
  verifyPassword(hash: string, raw: string): Promise<boolean>;
  signJWT(user: User): Promise<string>;
  verifyJWT(jwt: string): Promise<User | AppError>;
}

export class Doorkeeper implements IDoorkeeper {
  private salt: Buffer;
  private secret: Uint8Array;
  private alg: string;
  private issuer: string;
  private audience: string;

  constructor() {
    this.salt = Buffer.from('This is IV456', 'utf-8');
    this.secret = new TextEncoder().encode('cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2');
    this.alg = 'HS256';
    this.issuer = 'tic-tac-toe';
    this.audience = 'tic-tac-toe-players';
  }

  public async hashPassword(raw: string): Promise<string> {
    const hash = await argon.hash(raw, { salt: this.salt });

    return hash;
  }

  public async verifyPassword(hash: string, raw: string): Promise<boolean> {
    return argon.verify(hash, raw, { salt: this.salt });
  }

  public async signJWT(user: User): Promise<string> {
    const jwt = await new jose.SignJWT({
      user: {
        id: user.id,
        username: user.username,
        status: user.status,
      },
    })
      .setProtectedHeader({ alg: this.alg })
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setExpirationTime(AccessTokenDuration)
      .sign(this.secret);

    return jwt;
  }

  public async verifyJWT(jwt: string): Promise<User | AppError> {
    try {
      const { payload } = await jose.jwtVerify(jwt, this.secret, {
        issuer: this.issuer,
        audience: this.audience,
      });

      // Verify payloads
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && currentTime > payload.exp) {
        return new SessionExpired();
      }

      const user = payload['user'];

      if (!this.isUser(user)) {
        return new UserNotFoundInPayload();
      }

      return user;
    } catch (err) {
      const error = err as Error;
      return new AppError(ErrorType.ErrUnauthorized, error.message);
    }
  }

  private isUser(obj: any): obj is User {
    return typeof obj === 'object' && 'id' in obj && 'username' in obj && 'status' in obj;
  }
}
