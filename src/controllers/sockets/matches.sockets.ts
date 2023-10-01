import { User } from '@prisma/client';
import { Server, Namespace } from 'socket.io';
import { BaseSocket } from './base.socket';
import { IMatchUC } from '../../usecase/matches/matches.usecase';
import { SocketEvent } from '../../shared/contants';
import { ActiveMatchRequest } from '../v1/dto/request';
import { AppError } from '../../shared/AppError';
import { authSocketMiddleware } from '../middlewares';
import { UnrecognisedMatchID } from './errors';

export class MatchSocket extends BaseSocket {
  private handler: Namespace;
  private matchUC: IMatchUC;
  private parser: RegExp;

  constructor(io: Server, namespace: string | RegExp, matchUC: IMatchUC) {
    super(io, namespace);
    this.parser = /\/match\/(\d+)/;
    this.matchUC = matchUC;
    this.handler = this.io.of(this.namespace);
    this.handler.use(authSocketMiddleware.authenticate);

    this.handler.on(SocketEvent.CONNECTION, async (socket) => {
      const currentUser: User = socket.data;

      const parsedNSP = socket.nsp.name.match(this.parser);
      if (!parsedNSP) {
        this.errResponse(socket, new UnrecognisedMatchID());
        socket.disconnect();
      }
      const roomId = parsedNSP![1];

      // Ask the user to join room with the
      // given match id parsed from the nsp.
      socket.join(roomId);

      socket.on(SocketEvent.MESSAGE, async (data: ActiveMatchRequest) => {
        const result = await this.matchUC.liveMatch(currentUser, data);
        if (result instanceof AppError) {
          this.errResponse(socket, result);
        } else {
          this.handler.to(roomId).emit(SocketEvent.MESSAGE, result);
          // If the match ended then we disconnect all clients
          // in our current match room.
          if (result.status === 'END') {
            this.handler.timeout(1000).disconnectSockets();
          }
        }
      });

      socket.on(SocketEvent.DISCONNECT, () => {
        this.handler.emit('DISCONNECT');
      });

      socket.on(SocketEvent.ERROR, (err: Error) => {
        this.errResponse(socket, err as AppError);
        socket.disconnect();
      });
    });
  }
}
