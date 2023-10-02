import { MatchInvitationStatus } from '@prisma/client';
import { Grid, Pieces } from '../../../models/match.model';

export type ActiveMatchRequest = {
  id: number;
  piece: Pieces;
  x: Grid;
  y: Grid;
};

export type ProcessMatchInvitationRequest = {
  id: number;
  action: MatchInvitationStatus;
};
