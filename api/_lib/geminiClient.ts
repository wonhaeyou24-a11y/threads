const DEFAULT_MODEL = "gemini-3.1-flash-lite";

export class GeminiCallError extends Error {}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GenerateJSONOptions {
  systemInstruction: string;
  prompt: string;
}

/** Gemini generateContent 호출 후 JSON 문자열을 파싱해 반환한다. API 키는 서버 환경변수에서만 읽는다. */
export async function generateJSON<T = unknown>(
  options: GenerateJSONOptions
): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiCallError("GEMINI_API_KEY가 설정되어 있지 않습니다.");
  }
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: options.systemInstruction }],
      },
      contents: [{ role: "user", parts: [{ text: options.prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.9,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new GeminiCallError(`Gemini API 오류 (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new GeminiCallError("Gemini 응답에서 텍스트를 찾을 수 없습니다.");
  }

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    throw new GeminiCallError(
      `Gemini 응답 JSON 파싱 실패: ${(err as Error).message}`
    );
  }
}
