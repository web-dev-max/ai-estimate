import { z } from 'zod';

export const extractedItemSchema = z.object({
  serviceQuery: z.string().min(2).max(200),
  quantity: z.number().positive().max(1_000_000).nullable(),
  unitCode: z.string().min(1).max(16).nullable(),
  room: z.string().max(120).nullable().optional(),
  confidence: z.number().min(0).max(1),
});

export const estimateExtractionSchema = z.object({
  items: z.array(extractedItemSchema).max(200),
  questions: z.array(z.string().min(5).max(300)).max(10).default([]),
});

export type ExtractedItem = z.infer<typeof extractedItemSchema>;
export type EstimateExtraction = z.infer<typeof estimateExtractionSchema>;

export const ESTIMATE_EXTRACTION_JSON_SCHEMA = z.toJSONSchema(
  estimateExtractionSchema,
) as Record<string, unknown>;
