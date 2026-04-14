import { z } from 'zod';

export const CreateOrderDto = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export type CreateOrderInput = z.infer<typeof CreateOrderDto>;
