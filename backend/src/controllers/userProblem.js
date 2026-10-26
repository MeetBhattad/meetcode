const { getLanguageById, submitBatch, submitToken, buildFinalCode, unescapeNewlines } = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const SolutionVideo = require("../models/solutionVideo");

// ─────────────────────────────────────────────────────────────
// Helper: validate that every reference solution passes visible tests
// ─────────────────────────────────────────────────────────────
const validateReferenceSolutions = async (problemData) => {
  const { referenceSolution, visibleTestCases } = problemData;

  if (!referenceSolution || referenceSolution.length === 0) {
    throw new Error("At least one reference solution is required");
  }
  if (!visibleTestCases || visibleTestCases.length === 0) {
    throw new Error("At least one visible test case is required");
  }

  for (const tc of visibleTestCases) {
    if (!tc.output || !tc.output.trim()) {
      throw new Error("Visible test case output cannot be empty");
    }
  }

  for (const { language, completeCode } of referenceSolution) {
    const languageId = getLanguageById(language);
    if (!languageId) throw new Error(`Unsupported language: ${language}`);

    // Wrap the reference solution in the test harness (if provided)
    const finalCode = buildFinalCode(problemData, language, completeCode);

    const submissions = visibleTestCases.map((testcase) => ({
      source_code: finalCode,
      language_id: languageId,
      stdin: unescapeNewlines(testcase.input),
      expected_output: unescapeNewlines(testcase.output),
    }));

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((v) => v.token);
    const testResult = await submitToken(resultToken);

    if (!Array.isArray(testResult)) {
      throw new Error(`Judge0 unavailable while validating ${language}`);
    }

    for (let i = 0; i < testResult.length; i++) {
      const test = testResult[i];
      if (test.status_id !== 3) {
        const reason = test.compile_output || test.stderr || `status ${test.status_id}`;
        throw new Error(`Reference solution for ${language} failed test case ${i + 1}:\n${reason}`);
      }
    }
  }
};

const createProblem = async (req, res) => {
  try {
    await validateReferenceSolutions(req.body);
    await Problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });
    res.status(201).json({ message: "Problem saved successfully" });
  } catch (err) {
    console.error("createProblem error:", err);
    res.status(400).json({ error: err.message || "Failed to create problem" });
  }
};

const updateProblem = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) return res.status(400).json({ error: "Missing ID field" });
    const existing = await Problem.findById(id);
    if (!existing) return res.status(404).json({ error: "Problem not found" });

    if (req.body.referenceSolution && req.body.visibleTestCases) {
      await validateReferenceSolutions(req.body);
    }

    const updated = await Problem.findByIdAndUpdate(
      id,
      { ...req.body },
      { runValidators: true, new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    console.error("updateProblem error:", err);
    res.status(500).json({ error: err.message || "Failed to update problem" });
  }
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) return res.status(400).json({ error: "ID is missing" });
    const deleted = await Problem.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Problem not found" });
    await SolutionVideo.findOneAndDelete({ problemId: id });
    res.status(200).json({ message: "Problem deleted successfully" });
  } catch (err) {
    console.error("deleteProblem error:", err);
    res.status(500).json({ error: "Failed to delete problem" });
  }
};

const getProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) return res.status(400).json({ error: "ID is missing" });
    const getProblem = await Problem.findById(id).select(
      "_id title description difficulty tags visibleTestCases startCode"
    );
    if (!getProblem) return res.status(404).json({ error: "Problem not found" });

    const videos = await SolutionVideo.findOne({ problemId: id });
    if (videos) {
      return res.status(200).json({
        ...getProblem.toObject(),
        secureUrl: videos.secureUrl,
        thumbnailUrl: videos.thumbnailUrl,
        duration: videos.duration,
      });
    }
    res.status(200).json(getProblem);
  } catch (err) {
    console.error("getProblemById error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getProblemForAdmin = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.status(200).json(problem);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSolution = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: "Invalid user" });

    const hasSolved = user.problemSolved.some((id) => id.toString() === problemId);
    if (!hasSolved && user.role !== "admin") {
      return res.status(403).json({ error: "Solve the problem first" });
    }

    const problem = await Problem.findById(problemId).select("referenceSolution");
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.status(200).json({ referenceSolution: problem.referenceSolution });
  } catch (err) {
    console.error("getSolution error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllProblem = async (req, res) => {
  try {
    const problems = await Problem.find({}).select("_id title difficulty tags");
    res.status(200).json(problems);
  } catch (err) {
    console.error("getAllProblem error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const solvedAllProblembyUser = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await User.findById(userId).populate({
      path: "problemSolved",
      select: "_id title difficulty tags",
    });
    res.status(200).json(user?.problemSolved || []);
  } catch (err) {
    console.error("solvedAllProblembyUser error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const submittedProblem = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.pid;
    const submissions = await Submission.find({ userId, problemId }).sort({ createdAt: -1 });
    return res.status(200).json(submissions);
  } catch (err) {
    console.error("submittedProblem error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getProblemForAdmin,
  getSolution,
  getAllProblem,
  solvedAllProblembyUser,
  submittedProblem,
};