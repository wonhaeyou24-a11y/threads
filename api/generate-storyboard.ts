import { generateId } from "../src/lib/id";
import type { StoryCandidate } from "../src/types/story";
import { generateStoryboardResponseSchema } from "../src/services/ai/schemas";
import { generateJSON, GeminiCallError, delay } from "./_lib/geminiClient";
import { checkRateLimit, getClientKey } from "./_lib/rateLimit";
import { buildStoryboardPrompt, buildStoryboardSystemPrompt } from "./_lib/prompts";
import type { ApiHandler } from "./_lib/httpTypes";

interface RequestBody {
  candidate: StoryCandidate;
  panelCount: number;
}

function validateRequestBody(body: unknown): RequestBody | null {
  if (!body || typeof body !== "object") return null;
  const { candidate, panelCount } = body as Record<string, unknown>;
  if (!candidate || typeof candidate !== "object") return null;
  if (typeof panelCount !== "number" || panelCount < 8 || panelCount > 12) {
    return null;
  }
  return { candidate: candidate as StoryCandidate, panelCount };
}

async function callGeminiWithRetry(candidate: StoryCandidate, panelCount: number) {
  const systemInstruction = buildStoryboardSystemPrompt();
  const prompt = buildStoryboardPrompt(candidate, panelCount);

  const attempt = async (retryHint?: string) => {
    const raw = await generateJSON({
      systemInstruction,
      prompt: retryHint ? `${prompt}\n\n(참고: ${retryHint})` : prompt,
    });
    return generateStoryboardResponseSchema.parse(raw);
  };

  try {
    return await attempt();
  } catch {
    await delay(1500);
    return await attempt(
      `이전 응답이 형식에 맞지 않았다. 반드시 정확히 ${panelCount}개의 panels를 지정된 JSON 스키마로 응답하라.`
    );
  }
}

const handler: ApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "허용되지 않은 메서드입니다." });
    return;
  }

  const clientKey = getClientKey(req as unknown as { headers: Record<string, unknown> });
  if (!checkRateLimit(clientKey)) {
    res.status(429).json({
      error: "잠시 후 다시 시도해주세요. (요청이 너무 많습니다)",
    });
    return;
  }

  const parsed = validateRequestBody(req.body);
  if (!parsed) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }

  try {
    const result = await callGeminiWithRetry(parsed.candidate, parsed.panelCount);
    const panels = result.panels.map((p) => ({
      ...p,
      id: p.id || generateId(),
      imagePrompt: "",
    }));
    res.status(200).json({ panels });
  } catch (err) {
    console.error("[generate-storyboard]", err);
    const message =
      err instanceof GeminiCallError
        ? "콘티를 생성하지 못했습니다. 잠시 후 다시 시도해주세요."
        : "콘티를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.";
    res.status(502).json({ error: message });
  }
};

export default handler;
