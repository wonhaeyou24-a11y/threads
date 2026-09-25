import type { StoryCandidate } from "../src/types/story";
import type { StoryboardPanel } from "../src/types/storyboard";
import { rewriteStoryResponseSchema } from "./_lib/schemas.js";
import { generateJSON, GeminiCallError, delay } from "./_lib/geminiClient.js";
import { checkRateLimit, getClientKey } from "./_lib/rateLimit.js";
import {
  buildStoryRewritePrompt,
  buildStoryRewriteSystemPrompt,
} from "./_lib/prompts.js";
import type { ApiHandler } from "./_lib/httpTypes";

const MAX_REQUEST_LENGTH = 1000;

interface RequestBody {
  candidate: StoryCandidate;
  panels: StoryboardPanel[];
  userRequest: string;
}

function validateRequestBody(body: unknown): RequestBody | null {
  if (!body || typeof body !== "object") return null;
  const { candidate, panels, userRequest } = body as Record<string, unknown>;
  if (!candidate || typeof candidate !== "object") return null;
  if (!Array.isArray(panels) || panels.length < 8 || panels.length > 12) {
    return null;
  }
  if (
    typeof userRequest !== "string" ||
    userRequest.trim().length === 0 ||
    userRequest.length > MAX_REQUEST_LENGTH
  ) {
    return null;
  }
  return {
    candidate: candidate as StoryCandidate,
    panels: panels as StoryboardPanel[],
    userRequest,
  };
}

async function callGeminiWithRetry(
  candidate: StoryCandidate,
  panels: StoryboardPanel[],
  userRequest: string
) {
  const systemInstruction = buildStoryRewriteSystemPrompt();
  const prompt = buildStoryRewritePrompt(candidate, panels, userRequest);

  const attempt = async (retryHint?: string) => {
    const raw = await generateJSON({
      systemInstruction,
      prompt: retryHint ? `${prompt}\n\n(참고: ${retryHint})` : prompt,
    });
    const parsed = rewriteStoryResponseSchema.parse(raw);
    if (parsed.panels.length !== panels.length) {
      throw new GeminiCallError(
        `panels 개수가 일치하지 않음 (기대: ${panels.length}, 실제: ${parsed.panels.length})`
      );
    }
    return parsed;
  };

  try {
    return await attempt();
  } catch {
    await delay(1500);
    return await attempt(
      `이전 응답의 panels 개수가 맞지 않았다. 반드시 정확히 ${panels.length}개의 panels를 원본과 동일한 id/panelNumber 순서로 반환하라.`
    );
  }
}

const handler: ApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "허용되지 않은 메서드입니다." });
    return;
  }

  const clientKey = getClientKey(
    req as unknown as { headers: Record<string, unknown> }
  );
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
    const result = await callGeminiWithRetry(
      parsed.candidate,
      parsed.panels,
      parsed.userRequest
    );

    // 잠긴 컷은 서버에서도 원본을 강제 보존한다 (AI가 지시를 어겨도 안전).
    const mergedPanels = parsed.panels.map((original, i) => {
      if (original.locked) return original;
      const rewritten = result.panels[i];
      return {
        ...rewritten,
        id: original.id,
        panelNumber: original.panelNumber,
        imagePrompt: "",
      };
    });

    res.status(200).json({ panels: mergedPanels });
  } catch (err) {
    console.error("[rewrite-story]", err);
    const message =
      err instanceof GeminiCallError
        ? "전체 스토리를 다시 생성하지 못했습니다. 잠시 후 다시 시도해주세요."
        : "전체 스토리를 다시 생성하지 못했습니다. 잠시 후 다시 시도해주세요.";
    res.status(502).json({ error: message });
  }
};

export default handler;
