// backend/scripts/generateProblems.js
require('dotenv').config();
const axios = require('axios');
const OpenAI = require('openai');

const ADMIN_EMAIL = "meetbhattad@gmail.com"; 
const ADMIN_PASSWORD = "Jaibabari@1";
const BACKEND_URL = "http://localhost:3000";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const problemsToGenerate = [
  "Two Sum",
  "Valid Parentheses",
  "Merge Two Sorted Lists"
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 🚨 THE BASE64 PROMPT
const systemPrompt = `
You are an expert DSA problem creator. Output raw JSON only. Do NOT wrap the JSON in markdown blocks.

The JSON must match this exact structure:
{
  "title": "Problem Title",
  "description": "Clear problem description...",
  "difficulty": "easy",
  "tags": "array",
  "visibleTestCases": [
    { "input": "input string", "output": "expected output", "explanation": "why it works" }
  ],
  "hiddenTestCases": [
    { "input": "input string", "output": "expected output" }
  ],
  "startCode": [
    { "language": "C++", "initialCode": "<BASE64_ENCODED_STRING>" },
    { "language": "Java", "initialCode": "<BASE64_ENCODED_STRING>" },
    { "language": "Python", "initialCode": "<BASE64_ENCODED_STRING>" }
  ],
  "referenceSolution": [
    { "language": "C++", "completeCode": "<BASE64_ENCODED_STRING>" },
    { "language": "Java", "completeCode": "<BASE64_ENCODED_STRING>" },
    { "language": "Python", "completeCode": "<BASE64_ENCODED_STRING>" }
  ]
}

CRITICAL RULES (FAILURE TO FOLLOW THESE WILL BREAK THE SYSTEM):
1. "difficulty" MUST be exactly one of: "easy", "medium", "hard".
2. "tags" MUST be a single string matching one of: "array", "string", "hashMap", "twoPointers", "slidingWindow", "stack", "binarySearch", "linkedList", "tree", "trie", "heap", "backtracking", "graph", "dp", "greedy", "intervals", "math", "bitManipulation".
3. Test case "input" and "output" MUST be non-empty strings.
4. 🚨 CRITICAL: ALL CODE (initialCode and completeCode) MUST BE ENCODED IN BASE64. 
   - DO NOT output raw code.
   - Encode the entire string to Base64. Example: "int main() { return 0; }" becomes "aW50IG1haW4oKSB7IHJldHVybiAwOyB9".
5. The reference solutions MUST be full programs reading STDIN and writing to STDOUT.
6. C++ MUST have "int main()". Java MUST have "public class Main" and "public static void main".
`;

const enforceSchema = (data) => {
  // 1. Decode Base64 helper
  const decodeBase64 = (str) => {
    if (!str) return "";
    try {
      return Buffer.from(str, 'base64').toString('utf-8');
    } catch (e) {
      return str; // If it wasn't base64, return as is
    }
  };

  const fixCode = (codeStr, language) => {
    let fixed = decodeBase64(codeStr);
    // Just in case the AI added literal \n outside base64
    fixed = fixed.replace(/\\n/g, '\n'); 
    fixed = fixed.replace(/#include <([^>]+)>using/g, '#include <$1>\nusing'); 
    if (language === 'Java') {
       fixed = fixed.replace(/split\s*\(\s*'([^']+)'\s*\)/g, 'split("$1")');
    }
    return fixed;
  };

  const enforceThreeLanguages = (arr, codeKey) => {
    if (!Array.isArray(arr)) arr = [];
    const finalArray = [];
    const languages = [
      { key: 'C++', match: ['c++', 'cpp'] },
      { key: 'Java', match: ['java'] },
      { key: 'Python', match: ['python', 'py'] }
    ];

    for (const lang of languages) {
      const found = arr.find(item => 
        item.language && lang.match.some(m => item.language.toLowerCase().includes(m))
      );
      let code = found ? fixCode(found[codeKey], lang.key) : "";
      
      // 🚨 Sanity Check: Ensure the code actually has a main function
      if (lang.key === 'C++' && !code.includes('main')) code = "// ERROR: AI failed to generate C++ main function";
      if (lang.key === 'Java' && !code.includes('main')) code = "// ERROR: AI failed to generate Java main function";

      finalArray.push({
        language: lang.key,
        [codeKey]: code
      });
    }
    return finalArray;
  };

  data.startCode = enforceThreeLanguages(data.startCode, 'initialCode');
  data.referenceSolution = enforceThreeLanguages(data.referenceSolution, 'completeCode');

  // Enforce Difficulty & Tags
  data.difficulty = ['easy', 'medium', 'hard'].includes(data.difficulty?.toLowerCase()) ? data.difficulty.toLowerCase() : 'medium';
  const validTags = ['array', 'string', 'hashMap', 'twoPointers', 'slidingWindow', 'stack', 'binarySearch', 'linkedList', 'tree', 'trie', 'heap', 'backtracking', 'graph', 'dp', 'greedy', 'intervals', 'math', 'bitManipulation'];
  if (Array.isArray(data.tags)) data.tags = data.tags[0];
  if (!validTags.includes(data.tags)) data.tags = 'array';

  // Clean Test Cases
  const cleanTestCases = (cases) => {
    if (!Array.isArray(cases)) return [];
    return cases
      .map(tc => ({
        input: tc.input ? String(tc.input).trim() : "",
        output: tc.output ? String(tc.output).trim() : "",
        ...(tc.explanation && { explanation: String(tc.explanation) })
      }))
      .filter(tc => tc.input !== "" && tc.output !== "");
  };
  data.visibleTestCases = cleanTestCases(data.visibleTestCases);
  data.hiddenTestCases = cleanTestCases(data.hiddenTestCases);
  if (data.hiddenTestCases.length === 0) data.hiddenTestCases = [{ input: "1", output: "1" }];

  return data;
};

const generateProblemJSON = async (problemName) => {
  const modelsToTry = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`   Calling ${modelName} (Attempt ${attempt + 1})...`);
        const completion = await groq.chat.completions.create({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate the problem data for: ${problemName}` }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1, 
        });

        let jsonStr = completion.choices[0].message.content.trim();
        if (jsonStr.startsWith("```json")) jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "");
        
        let parsedData = JSON.parse(jsonStr);
        return enforceSchema(parsedData);

      } catch (err) {
        lastError = err;
        console.log(`   ⚠️ Error on ${modelName}: ${err.message.split('\n')[0]}`);
        if (err.status === 429 || err.status === 503) await sleep(5000);
        break; 
      }
    }
  }
  throw lastError;
};

const runAgent = async () => {
  try {
    console.log("🔐 Logging in as Admin...");
    const loginRes = await axios.post(`${BACKEND_URL}/user/login`, {
      emailId: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    const cookies = loginRes.headers['set-cookie'];
    if (!cookies) throw new Error("Login failed.");
    console.log("✅ Logged in successfully.\n");

    for (const problemName of problemsToGenerate) {
      console.log(`🤖 Generating data for: "${problemName}"...`);
      
      try {
        const problemData = await generateProblemJSON(problemName);
        console.log(`📤 Sending "${problemName}" to backend for Judge0 validation...`);

        await axios.post(`${BACKEND_URL}/problem/create`, problemData, {
          headers: { Cookie: cookies }
        });

        console.log(`✅ Success! "${problemName}" saved to database.\n`);
        await sleep(5000); 

      } catch (err) {
        console.error(`❌ Failed on "${problemName}":`);
        if (err.response?.data?.error) {
            console.error("Backend Error:", err.response.data.error);
        } else {
            console.error("Network Error:", err.message);
        }
        console.log("Skipping to next problem...\n");
      }
    }
    console.log("🎉 Finished processing all problems!");
  } catch (err) {
    console.error("❌ Fatal Error:", err.message);
  }
};

runAgent();