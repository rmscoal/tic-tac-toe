import { ObjectId } from 'mongodb';

export type Pieces = 'O' | 'X';

export type Grid = 0 | 1 | 2;

export interface IMove {
  mover: number;
  piece: Pieces;
  x: Grid;
  y: Grid;
}

export interface IMatch {
  _id?: ObjectId;
  id: number;
  blueId: number;
  redId: number;
  onGoing: boolean;
  winner?: number;
  turn: number;
  moves: IMove[];
  state: string[][];
}

export type LiveMatchStatus = 'CONTINUE' | 'END';

export type LiveMatchResponse = {
  id: number;
  status: LiveMatchStatus;
  winner?: number;
  draw?: boolean;
  move: IMove;
};
