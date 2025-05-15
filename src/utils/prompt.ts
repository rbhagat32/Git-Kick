const prompt = (diff: string) =>
  `Write a concise git commit message (not more than 10-12 words) describing the following code changes:\n${diff}`;

export { prompt };
