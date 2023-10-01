import { Server } from "socket.io";

export class BaseSocket {
  protected io: Server;
  protected namespace: string

  constructor(io: Server, namespace: string) {
    this.io = io;
    this.namespace = namespace;
  }
}
