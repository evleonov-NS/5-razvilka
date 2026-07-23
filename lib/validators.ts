/**
 * Zod-схемы: ввод решений и ответы LLM (PROJECT.md §10).
 * Enum нормализуются в ВЕРХНИЙ регистр — как в Prisma.
 */
import { z } from "zod";

/** Строковый enum с toUpperCase до проверки (ADR-007). */
function upperEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess((val) => {
    if (typeof val === "string") return val.trim().toUpperCase();
    return val;
  }, z.enum(values));
}

export const LikelihoodSchema = upperEnum(["LOW", "MEDIUM", "HIGH"] as const);
export const ScenarioKindSchema = upperEnum([
  "OPTIMISTIC",
  "BASE",
  "PESSIMISTIC",
] as const);
export const HorizonSchema = upperEnum([
  "THREE_MONTHS",
  "ONE_YEAR",
  "FIVE_YEARS",
] as const);
export const DecisionTypeSchema = upperEnum([
  "DECISION",
  "HABIT",
] as const);

const nonEmptyString = z.string().trim().min(1);

/** Вход POST /api/decisions (создание карточки / генерация). */
export const CreateDecisionInputSchema = z.object({
  title: nonEmptyString.max(200, "Название слишком длинное"),
  context: nonEmptyString.max(12_000, "Контекст слишком длинный"),
  horizon: HorizonSchema,
  type: DecisionTypeSchema,
});

export type CreateDecisionInput = z.infer<typeof CreateDecisionInputSchema>;

const ScenarioItemSchema = z.object({
  kind: ScenarioKindSchema,
  likelihood: LikelihoodSchema,
  narrative: nonEmptyString,
});

const FailureModeItemSchema = z.object({
  cause: nonEmptyString,
  prevention: nonEmptyString,
});

/**
 * Ответ промпта 9.1: ровно 3 сценария + 3–5 failure modes.
 * kinds должны покрывать OPTIMISTIC / BASE / PESSIMISTIC (по одному).
 */
export const ScenarioResponseSchema = z
  .object({
    scenarios: z.array(ScenarioItemSchema).length(3),
    failure_modes: z.array(FailureModeItemSchema).min(3).max(5),
  })
  .superRefine((data, ctx) => {
    const kinds = data.scenarios.map((s) => s.kind);
    const unique = new Set(kinds);
    if (unique.size !== 3) {
      ctx.addIssue({
        code: "custom",
        message:
          "scenarios: нужны три разных kind — OPTIMISTIC, BASE, PESSIMISTIC",
        path: ["scenarios"],
      });
    }
  });

export type ScenarioResponse = z.infer<typeof ScenarioResponseSchema>;

/** Узел ветки дерева (рекурсия; глубина UI — до 3, см. этап 7). */
export type TreeBranch = {
  choice: string;
  consequence: string;
  likelihood: z.infer<typeof LikelihoodSchema>;
  branches: TreeBranch[];
};

export const TreeBranchSchema: z.ZodType<TreeBranch> = z.lazy(() =>
  z.object({
    choice: nonEmptyString,
    consequence: nonEmptyString,
    likelihood: LikelihoodSchema,
    branches: z.array(TreeBranchSchema),
  }),
);

/** Ответ промпта 9.2 — заготовка для этапа 7. */
export const TreeResponseSchema = z.object({
  label: nonEmptyString,
  branches: z.array(TreeBranchSchema),
});

export type TreeResponse = z.infer<typeof TreeResponseSchema>;

/** Ответ промпта 9.3 — заготовка для этапа 8. */
export const ReviewResponseSchema = z.object({
  closest_scenario: ScenarioKindSchema,
  missed: nonEmptyString,
  lesson: nonEmptyString,
});

export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;

/** Исход для resolve (этап 8). */
export const ResolveDecisionInputSchema = z.object({
  outcome: nonEmptyString.max(8_000),
});

export type ResolveDecisionInput = z.infer<typeof ResolveDecisionInputSchema>;
