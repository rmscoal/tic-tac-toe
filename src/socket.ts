import { Server } from "socket.io";
import { MatchSocket } from "./controllers/v1/sockets/matches.sockets";
import { server } from "./server";
import { matchUseCase } from "./usecase";
import { doorkeeperService } from "./services/doorkeeper";

export const io = new Server(server);

// Socket Handlers
new MatchSocket(io, "match", matchUseCase, doorkeeperService);

export { server }

