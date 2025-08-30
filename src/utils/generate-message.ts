import fetch from "node-fetch";
import { prompt } from "./prompt.js";

async function getCommitMessageFromDeepseek(
  diff: string,
  apiKey: string
): Promise<string> {
  const url = "https://openrouter.ai/api/v1/chat/completions";

  const body = {
    model: "deepseek/deepseek-chat-v3.1:free",
    messages: [
      {
        role: "user",
        content: prompt(diff),
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Deepseek API error response:", errorText);
    throw new Error(
      `Deepseek API error: ${response.status} ${response.statusText}`
    );
  }

  const data: any = await response.json();

  const commitMessage = data.choices?.[0]?.message?.content;

  if (
    !commitMessage ||
    typeof commitMessage !== "string" ||
    !commitMessage.trim()
  ) {
    throw new Error("No valid commit message received from Deepseek API");
  }

  return commitMessage.trim();
}

export { getCommitMessageFromDeepseek };
