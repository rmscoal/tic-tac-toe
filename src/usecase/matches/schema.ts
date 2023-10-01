import { MatchInvitationStatus } from '@prisma/client';
import { z } from 'zod';

export const ProcessMatchInvitationSchema = z.object({
  id: z.number().gt(0),
  action: z.literal(MatchInvitationStatus.ACCEPTED).or(z.literal(MatchInvitationStatus.REJECTED)),
});

export const MoveSchema = z.object({
  x: z.literal(0).or(z.literal(1).or(z.literal(2))),
  y: z.literal(0).or(z.literal(1).or(z.literal(2))),
});
