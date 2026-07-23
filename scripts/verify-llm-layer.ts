/**
 * Проверка LLM-слоя без UI:
 * 1) parseJsonSafe — валидный / markdown / битый JSON
 * 2) Zod ScenarioResponseSchema
 * 3) опционально smoke-вызов, если есть DEEPSEEK_API_KEY / OPENAI_API_KEY / QWEN_API_KEY
 *
 * Запуск: npm run llm:verify
 */
import { parseJsonSafe } from "../lib/json";
import { chatCompletionPlatform, isLlmConfigured } from "../lib/llm";
import { ScenarioResponseSchema } from "../lib/validators";

let failed = 0;

function assert(cond: boolean, label: string, detail?: string) {
  if (cond) {
    console.log(`  OK  ${label}`);
  } else {
    failed += 1;
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function section(title: string) {
  console.log(`\n== ${title} ==`);
}

function main() {
  console.log("verify-llm-layer: старт");

  section("parseJsonSafe");

  const validRaw = JSON.stringify({
    scenarios: [
      {
        kind: "optimistic",
        likelihood: "low",
        narrative: "Всё сложилось лучше ожиданий.",
      },
      {
        kind: "BASE",
        likelihood: "MEDIUM",
        narrative: "Умеренный прогресс без сюрпризов.",
      },
      {
        kind: "PESSIMISTIC",
        likelihood: "high",
        narrative: "Риски реализовались сильнее базы.",
      },
    ],
    failure_modes: [
      { cause: "Нет плана B", prevention: "Заранее договориться о запасном варианте" },
      { cause: "Выгорание", prevention: "Ограничить нагрузку на старте" },
      { cause: "Слабая сеть", prevention: "Назначить 2 информационные встречи в месяц" },
    ],
  });

  const parsedValid = parseJsonSafe(validRaw);
  assert(parsedValid.ok, "валидный JSON → ok");

  const fenced = parseJsonSafe("```json\n" + validRaw + "\n```");
  assert(fenced.ok, "JSON в markdown fence → ok");

  const broken = parseJsonSafe("это не json {{{");
  assert(!broken.ok, "битый JSON → ok:false");

  section("ScenarioResponseSchema");

  if (parsedValid.ok) {
    const zodOk = ScenarioResponseSchema.safeParse(parsedValid.data);
    assert(
      zodOk.success,
      "валидный ответ + нормализация регистра",
      zodOk.success ? undefined : JSON.stringify(zodOk.error.issues),
    );
  } else {
    assert(false, "пропуск Zod: parse не прошёл");
  }

  const badZod = ScenarioResponseSchema.safeParse({
    scenarios: [{ kind: "BASE", likelihood: "MEDIUM", narrative: "one" }],
    failure_modes: [{ cause: "a", prevention: "b" }],
  });
  assert(!badZod.success, "неполный ответ → Zod reject");

  section("LLM smoke (опционально)");

  if (!isLlmConfigured()) {
    console.log(
      "  SKIP нет DEEPSEEK_API_KEY / OPENAI_API_KEY / QWEN_API_KEY — smoke пропущен",
    );
    finish();
    return;
  }

  void runLlmSmoke().then(finish).catch((err) => {
    failed += 1;
    console.error("  FAIL LLM smoke:", err);
    finish();
  });
}

async function runLlmSmoke() {
  const result = await chatCompletionPlatform(
    [
      {
        role: "system",
        content:
          'Ответь ТОЛЬКО JSON без markdown: {"ping":"pong"}. Никакого другого текста.',
      },
      { role: "user", content: "ping" },
    ],
    { temperature: 0, timeoutMs: 45_000 },
  );

  console.log(
    `  info provider=${result.provider} model=${result.model} tokens=${result.promptTokens}+${result.completionTokens}`,
  );

  const parsed = parseJsonSafe(result.content);
  assert(parsed.ok, "smoke: ответ парсится как JSON");
  if (parsed.ok) {
    const ping = (parsed.data as { ping?: unknown }).ping;
    assert(ping === "pong", "smoke: ping === pong", `получено: ${String(ping)}`);
  }
}

function finish() {
  console.log("");
  if (failed > 0) {
    console.error(`verify-llm-layer: ПРОВАЛ (${failed})`);
    process.exit(1);
  }
  console.log("verify-llm-layer: УСПЕХ");
}

main();
