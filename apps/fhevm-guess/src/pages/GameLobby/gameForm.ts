import z from 'zod';

export const gameFormSchema = z.object({
  deadline: z.string(),
});

export type GameFormValues = z.infer<typeof gameFormSchema>;
