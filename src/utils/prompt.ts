const prompt = (diff: string) => `
You are an assistant that generates commit messages for git.

Task:
- Read the following code changes (diff).
- Write a **single concise commit message** describing the change.
- The commit message must:
  • Be at most 10–12 words.  
  • Use imperative mood (e.g., "Add", "Fix", "Update", not "Added", "Fixed").  
  • Clearly summarize the change without extra details.  
  • Avoid mentioning file names, line numbers, or phrases like "this commit".

Examples:
- "Fix typo in user authentication middleware"
- "Add input validation for email field"
- "Update Dockerfile to improve build caching"
- "Refactor API routes for better readability"

Now, here is the diff you should summarize:
${diff}
`;

export { prompt };
