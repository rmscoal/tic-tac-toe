import { Server } from 'socket.io';
import { MatchSocket } from './controllers/sockets/matches.sockets';
import { server } from './server';
import { matchUseCase } from './usecase';

export const io = new Server(server);

// Socket Handlers
new MatchSocket(io, /^\/match\/\d{1,}$/, matchUseCase);

export { server };
