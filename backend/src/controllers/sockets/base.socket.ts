import { Server, Socket } from 'socket.io';
import { AppError } from '../../shared/AppError';

export class BaseSocket {
  protected io: Server;
  protected namespace: string | RegExp;

  constructor(io: Server, namespace: string | RegExp) {
    this.io = io;
    this.namespace = namespace;
  }

  public errResponse(socket: Socket, error?: AppError) {
    socket.send({
      type: error?.type,
      code: error?.code,
      message: error?.message,
      errors: error?.errors,
    });
  }
}
