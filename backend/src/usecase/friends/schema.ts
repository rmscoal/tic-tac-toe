import { z } from 'zod';

export const ProcessInvitation = z.object({
  id: z.number().gte(1),
  action: z.literal("REJECTED").or(z.literal("ACCEPTED")),
})

