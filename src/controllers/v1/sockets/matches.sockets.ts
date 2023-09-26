import { User } from "@prisma/client";
import { Server, Namespace } from "socket.io";
import { BaseSocket } from "./base.socket";
import { IMatchUC } from "../../../usecase/matches/matches.usecase";
import { SocketEvent } from "../../../shared/contants";
import { ActiveMatchRequest } from "../dto/request";
import { IDoorkeeper } from "../../../services/doorkeeper/doorkeeper.service";
import { AppError } from "../../../shared/AppError";

export class MatchSocket extends BaseSocket {
  private handler: Namespace;
  private matchUC: IMatchUC;
  private dkSrv: IDoorkeeper;

  constructor(io: Server, namespace: string, matchUC: IMatchUC, dkSrv: IDoorkeeper) {
    super(io, namespace);
    this.matchUC = matchUC;
    this.dkSrv = dkSrv;
    this.handler = this.io.of(this.namespace);

    this.handler.on(SocketEvent.CONNECTION, async (socket) => {
      // Authenticate action
      const authorization = socket.request.headers.authorization
      if (!authorization) {
        socket.send("Unauthorized action");
        socket.disconnect();
      }

      const result = await this.dkSrv.verifyJWT(authorization!);
      if (result instanceof AppError) {
        socket.send(`${result.message}`);
        socket.disconnect();
      }

      const currentUser = result as User;

      socket.on(SocketEvent.MESSAGE, async (data: ActiveMatchRequest) => {
        const result = await this.matchUC.liveMatch(currentUser, data);
        if (result instanceof AppError) {
          socket.send(`${result.message}`);
        } else {
          this.handler.emit(SocketEvent.MESSAGE, data);
        }
      });

      socket.on(SocketEvent.DISCONNECT, (_data) => {
        this.handler.emit("DISCONNECT");
      });
    })
  }
}
