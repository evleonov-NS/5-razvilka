import { z } from "zod";
import { DbProfile } from "./config";

export const dbProfileSchema = z.enum(["local", "prod"]);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const rowPayloadSchema = z.record(z.string(), z.unknown());

export function parseDbProfile(value: unknown): DbProfile {
  return dbProfileSchema.parse(value);
}
