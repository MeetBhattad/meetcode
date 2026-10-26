const axios = require('axios');

const JUDGE0_BASE_URL = 'https://ce.judge0.com';

const getLanguageById = (lang) => {
  const language = { "c++": 54, "java": 62, "python": 71 };
  return language[lang.toLowerCase()];
};

const normalizeLanguage = (lang) => {
  const l = (lang || '').toLowerCase();
  if (l === 'cpp' || l === 'c++') return 'c++';
  if (l === 'py' || l === 'python') return 'python';
  if (l === 'java') return 'java';
  return l;
};

const buildFinalCode = (problem, language, userCode) => {
  const targetLang = normalizeLanguage(language);
  const harness = problem.testHarness?.find(
    (h) => normalizeLanguage(h.language) === targetLang
  );

  if (harness?.harnessCode && harness.harnessCode.includes('{{USER_CODE}}')) {
    return harness.harnessCode.replace(/\{\{USER_CODE\}\}/g, userCode);
  }
  return userCode;
};

const unescapeNewlines = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/\\n/g, '\n');
};

// 🚨 BASE64 HELPERS
const encodeBase64 = (str) => {
  if (str === undefined || str === null) return str;
  return Buffer.from(String(str), 'utf-8').toString('base64');
};

const decodeBase64 = (str) => {
  if (!str) return str;
  return Buffer.from(str, 'base64').toString('utf-8');
};

const submitBatch = async (submissions) => {
  // 1. Encode all submission fields to Base64
  const encodedSubmissions = submissions.map(sub => ({
    source_code: encodeBase64(sub.source_code),
    language_id: sub.language_id,
    stdin: encodeBase64(sub.stdin),
    expected_output: encodeBase64(sub.expected_output)
  }));

  const options = {
    method: 'POST',
    url: `${JUDGE0_BASE_URL}/submissions/batch`,
    params: { base64_encoded: 'true' }, // 🚨 Enable Base64
    headers: { 'Content-Type': 'application/json' },
    data: { submissions: encodedSubmissions }
  };
  
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(`Judge0 Batch Error: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
};

const waiting = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

const submitToken = async (resultToken) => {
  const options = {
    method: 'GET',
    url: `${JUDGE0_BASE_URL}/submissions/batch`,
    params: { 
      tokens: resultToken.join(','), 
      base64_encoded: 'true', // 🚨 Enable Base64
      fields: '*' 
    },
    headers: { 'Content-Type': 'application/json' }
  };

  while (true) {
    try {
      const response = await axios.request(options);
      const result = response.data;
      
      const isResultObtained = result.submissions.every((r) => r.status_id > 2);
      
      if (isResultObtained) {
        // 2. Decode the results before returning
        return result.submissions.map(sub => ({
          ...sub,
          stdout: decodeBase64(sub.stdout),
          stderr: decodeBase64(sub.stderr),
          compile_output: decodeBase64(sub.compile_output),
          message: decodeBase64(sub.message),
          expected_output: decodeBase64(sub.expected_output)
        }));
      }
      await waiting(1000);
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(`Judge0 Token Error: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
};

module.exports = { getLanguageById, submitBatch, submitToken, buildFinalCode, normalizeLanguage, unescapeNewlines };