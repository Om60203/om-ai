export async function getDeepSeekResponse(
  userMessage: string,
  actor: any,
): Promise<string | null> {
  try {
    if (!actor) return null;
    const result = await actor.callDeepSeek(userMessage);
    if (!result) return null;

    // Check for JSON error responses (Insufficient Balance, rate limit, etc.)
    if (result.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(result);
        if (parsed.error) return null; // API error -> fall back to mock AI
        const content = parsed?.choices?.[0]?.message?.content;
        if (content) return content;
      } catch {
        // Not valid JSON, treat as plain text response
      }
    }

    if (
      result.startsWith("Error:") ||
      result.startsWith("API Error") ||
      result.includes("Insufficient Balance") ||
      result.includes("invalid_request_error") ||
      result.includes("rate_limit")
    ) {
      return null;
    }

    return result;
  } catch {
    return null;
  }
}
