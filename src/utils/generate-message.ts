import fetch from "node-fetch";
import { prompt } from "./prompt.js";

async function getCommitMessageFromGemini(
  diff: string,
  apiKey: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: prompt(diff),
          },
        ],
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error response:", errorText);
    throw new Error(
      `Gemini API error: ${response.status} ${response.statusText}`
    );
  }

  const data: any = await response.json();

  const commitMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (
    !commitMessage ||
    typeof commitMessage !== "string" ||
    !commitMessage.trim()
  ) {
    throw new Error("No valid commit message received from Gemini API");
  }

  return commitMessage.trim();
}

export { getCommitMessageFromGemini };
