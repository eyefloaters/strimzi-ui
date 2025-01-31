import { z } from 'zod';

export const ApiError = z.object({
  meta: z.object({ type: z.string() }), // z.map(z.string(), z.string()),
  id: z.string().optional(),
  status: z.string().optional(),
  code: z.string().optional(),
  title: z.string(),
  detail: z.string(),
  source: z
    .object({
      pointer: z.string(),
      parameter: z.string(),
      header: z.string(),
    })
    .optional(),
});

export function filterUndefinedFromObj(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== undefined && value !== null,
    ),
  );
}
