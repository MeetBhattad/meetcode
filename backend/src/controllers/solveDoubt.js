const { GoogleGenAI } = require("@google/genai");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const solveDoubt = async (req, res) => {
  try {
    const { messages, title, description, testCases, startCode } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Messages array is required." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
    const modelsToTry = ["gemini-3.8-flash", "gemini-3.5-flash-lite"];

    // 🚨 NEW STRICT PROMPT
    const systemInstruction = `
You are an expert Data Structures and Algorithms (DSA) tutor. Your goal is to help the user *learn* and *solve* the problem themselves. 

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title}
[PROBLEM_DESCRIPTION]: ${description}
[EXAMPLES]: ${JSON.stringify(testCases)}
[startCode]: ${JSON.stringify(startCode)}

## 🚨 CRITICAL RULES (DO NOT BREAK):
1. **NEVER provide the full, complete solution code.** If the user asks for the full code, politely refuse and offer a hint instead.
2. **DO NOT output full runnable programs.** (e.g., no \`#include <iostream>\` or \`public class Main\`).
3. **You MAY provide short code snippets** ONLY to demonstrate a specific line or concept (e.g., "You can swap them like this: \`a ^= b; b ^= a; a ^= b;\`"). Keep snippets under 5 lines.
4. **You MAY provide pseudocode** wrapped in a markdown code block with the language set to \`text\`.
5. **Always format Time and Space Complexity using Big-O notation** (e.g., O(1), O(N log N)). Use markdown inline math (e.g., \`$O(N)$\` or \`$O(1)$\`) so it renders beautifully.

## YOUR CAPABILITIES:
- **Hint Provider**: Give step-by-step logic hints.
- **Debugger**: Point out logic errors in the user's code, explain *why* it's wrong, and tell them how to fix it without writing the fix for them.
- **Complexity Analyzer**: Explain time and space complexities.
- **Approach Suggester**: Compare Brute Force vs. Optimized approaches (explain the logic, don't write the code).

## RESPONSE FORMAT:
- Be concise and encouraging.
- Use Markdown for formatting (bolding, lists, code blocks).
- If you need to show a formula or complexity, use LaTeX math formatting (e.g., \`$O(N)$\`).
`;

    let lastError = null;

    for (const modelName of modelsToTry) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: messages,
            config: { systemInstruction },
          });

          return res.status(200).json({ message: response.text });

        } catch (err) {
          lastError = err;
          if (err.status === 503) {
            const delay = Math.pow(2, attempt) * 1000;
            await sleep(delay);
            continue;
          } else {
            console.error(`Model ${modelName} failed:`, err.message);
            break;
          }
        }
      }
    }
    throw lastError;
  } catch (err) {
    console.error("Gemini API Error Details:", err);
    res.status(500).json({ message: "Failed to generate AI response." });
  }
};

module.exports = solveDoubt;