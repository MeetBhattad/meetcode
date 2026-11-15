const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const ReviewCard = require("../models/reviewCard");
const { getLanguageById, submitBatch, submitToken, buildFinalCode, unescapeNewlines } = require("../utils/problemUtility");

const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    let { code, language } = req.body;

    if (!userId || !problemId || !language || code === undefined)
      return res.status(400).json({ error: "Some fields are missing" });

    if (language === "cpp") language = "c++";

    const problem = await Problem.findById(problemId);
    if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
  return res.status(400).json({
    error: 'This problem is not yet configured for submission. Check back soon.',
  });
}
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0)
      return res.status(400).json({ error: "Problem has no hidden test cases" });

    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: "pending",
      testCasesTotal: problem.hiddenTestCases.length,
    });

    const languageId = getLanguageById(language);
    if (!languageId) return res.status(400).json({ error: `Unsupported language: ${language}` });

    // 🚨 WRAP USER CODE IN HARNESS
    const finalCode = buildFinalCode(problem, language, code);

    const submissions = problem.hiddenTestCases.map((testcase) => ({
      source_code: finalCode,
      language_id: languageId,
      stdin: unescapeNewlines(testcase.input),
      expected_output: unescapeNewlines(testcase.output),
    }));

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((v) => v.token);
    const testResult = await submitToken(resultToken);

    if (!Array.isArray(testResult)) return res.status(502).json({ error: "Judge0 unavailable" });

        let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errorMessage = null;
    let errorType = null;

    for(const test of testResult){
        if(test.status_id === 3){
           testCasesPassed++;
           runtime += parseFloat(test.time) || 0;
           memory = Math.max(memory, test.memory || 0);
        } else if(test.status_id === 4){
          status = "wrong";
          errorType = "wrong";
          errorMessage = `Wrong Answer\nExpected: ${test.expected_output}\nGot: ${test.stdout || "(empty)"}`;
        } else if(test.status_id === 5){
          status = "error";
          errorType = "runtime";
          errorMessage = "Time Limit Exceeded";
        } else if(test.status_id === 6){
          status = "error";
          errorType = "compile";
          errorMessage = test.compile_output || "Compilation error";
        } else if(test.status_id >= 7 && test.status_id <= 12){
          status = "error";
          errorType = "runtime";
          errorMessage = test.stderr || `Runtime error (status ${test.status_id})`;
        } else {
          status = "error";
          errorType = "runtime";
          errorMessage = test.stderr || `Judge0 error (status ${test.status_id})`;
        }
    }

    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage || "";
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;
    await submittedResult.save();

    

     if (status === "accepted") {
      const alreadySolved = req.result.problemSolved.some((id) => id.toString() === problemId);
      if (!alreadySolved) {
        req.result.problemSolved.push(problemId);
        await req.result.save();

        // 🚀 Spaced Repetition: Auto-enroll on first solve
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 1); // Review tomorrow
        
        await ReviewCard.findOneAndUpdate(
          { userId, problemId },
          { nextReviewDate: nextDate, interval: 1, easeFactor: 2.5, repetitions: 1 },
          { upsert: true, new: true }
        );
      }
    }

      res.status(201).json({
      accepted: status === "accepted",
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory,
      errorMessage,
      errorType,
    });
  } catch (err) {
    console.error("submitCode error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const runCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    let { code, language } = req.body;

    if (!userId || !problemId || !language || code === undefined)
      return res.status(400).json({ error: "Some fields are missing" });

    const problem = await Problem.findById(problemId);
    if (!problem.visibleTestCases || problem.visibleTestCases.length === 0) {
  return res.status(400).json({
    error: 'This problem is not yet configured for testing. Check back soon.',
  });
}
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    if (language === "cpp") language = "c++";

    const languageId = getLanguageById(language);
    if (!languageId) return res.status(400).json({ error: `Unsupported language: ${language}` });

    // 🚨 WRAP USER CODE IN HARNESS
    const finalCode = buildFinalCode(problem, language, code);

    const submissions = problem.visibleTestCases.map((testcase) => ({
      source_code: finalCode,
      language_id: languageId,
      stdin: unescapeNewlines(testcase.input),
      expected_output: unescapeNewlines(testcase.output),
    }));

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((v) => v.token);
    const testResult = await submitToken(resultToken);

    if (!Array.isArray(testResult)) return res.status(502).json({ error: "Judge0 unavailable" });

        let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let errorMessage = null;
    let errorType = null;

    for(const test of testResult){
      if(test.status_id === 3){
        testCasesPassed++;
        runtime += parseFloat(test.time) || 0;
        memory = Math.max(memory, test.memory || 0);
      } else if(test.status_id === 4){
        errorType = "wrong";
        errorMessage = test.stderr || null;
      } else if(test.status_id === 6){
        errorType = "compile";
        errorMessage = test.compile_output || "Compilation error";
      } else {
        errorType = "runtime";
        errorMessage = test.stderr || test.compile_output || null;
      }
    }

    const success = testResult.length > 0 && testCasesPassed === testResult.length;

    res.status(201).json({
      success,
      testCases: testResult,
      runtime,
      memory,
      errorMessage,
      errorType,
    });
  } catch (err) {
    console.error("runCode error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { submitCode, runCode };