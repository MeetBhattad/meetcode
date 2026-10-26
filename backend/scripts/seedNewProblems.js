// backend/scripts/seedNewProblems.js
require('dotenv').config();
const axios = require('axios');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const BACKEND_URL = "http://localhost:3000";

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("❌ Error: ADMIN_EMAIL or ADMIN_PASSWORD is missing from your .env file.");
  process.exit(1);
}

const problemsData = [
  {
    title: "Find All Numbers Disappeared in an Array",
    description: "Given an array `nums` of `n` integers where `nums[i]` is in the range `[1, n]`, return an array of all the integers in the range `[1, n]` that do not appear in `nums`.",
    difficulty: "easy",
    tags: "array",
    visibleTestCases: [
      { input: "4 3 2 7 8 2 3 1", output: "5 6", explanation: "The numbers 5 and 6 are missing." },
      { input: "1 1", output: "2", explanation: "The number 2 is missing." }
    ],
    hiddenTestCases: [
      { input: "2 2", output: "1" },
      { input: "1 1 3", output: "2" }
    ],
    startCode: [
      { language: "C++", initialCode: "class Solution {\npublic:\n    vector<int> findDisappearedNumbers(vector<int>& nums) {\n        // Write your code here\n        return {};\n    }\n};" },
      { language: "Java", initialCode: "class Solution {\n    public List<Integer> findDisappearedNumbers(int[] nums) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}" },
      { language: "Python", initialCode: "from typing import List\n\nclass Solution:\n    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:\n        # Write your code here\n        pass" }
    ],
    referenceSolution: [
      { language: "C++", completeCode: "class Solution {\npublic:\n    vector<int> findDisappearedNumbers(vector<int>& nums) {\n        for (int i = 0; i < nums.size(); i++) {\n            int idx = abs(nums[i]) - 1;\n            nums[idx] = -abs(nums[idx]);\n        }\n        vector<int> res;\n        for (int i = 0; i < nums.size(); i++) {\n            if (nums[i] > 0) res.push_back(i + 1);\n        }\n        return res;\n    }\n};" },
      { language: "Java", completeCode: "class Solution {\n    public List<Integer> findDisappearedNumbers(int[] nums) {\n        for (int i = 0; i < nums.length; i++) {\n            int idx = Math.abs(nums[i]) - 1;\n            nums[idx] = -Math.abs(nums[idx]);\n        }\n        List<Integer> res = new ArrayList<>();\n        for (int i = 0; i < nums.length; i++) {\n            if (nums[i] > 0) res.add(i + 1);\n        }\n        return res;\n    }\n}" },
      { language: "Python", completeCode: "from typing import List\n\nclass Solution:\n    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:\n        for i in range(len(nums)):\n            idx = abs(nums[i]) - 1\n            nums[idx] = -abs(nums[idx])\n        return [i + 1 for i in range(len(nums)) if nums[i] > 0]" }
    ],
    testHarness: [
      { language: "C++", harnessCode: "#include <iostream>\n#include <vector>\n#include <sstream>\n#include <cmath>\n#include <algorithm>\nusing namespace std;\n\n{{USER_CODE}}\n\nint main() {\n    string line; getline(cin, line); stringstream ss(line);\n    vector<int> nums; int x; while (ss >> x) nums.push_back(x);\n    Solution sol;\n    vector<int> res = sol.findDisappearedNumbers(nums);\n    for (size_t i = 0; i < res.size(); i++) cout << res[i] << (i < res.size() - 1 ? \" \" : \"\");\n    cout << endl;\n    return 0;\n}" },
      { language: "Java", harnessCode: "import java.util.*;\nimport java.io.*;\n\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        Solution sol = new Solution();\n        List<Integer> res = sol.findDisappearedNumbers(nums);\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < res.size(); i++) {\n            sb.append(res.get(i));\n            if (i < res.size() - 1) sb.append(\" \");\n        }\n        System.out.println(sb.toString());\n    }\n}" },
      { language: "Python", harnessCode: "import sys\n\n{{USER_CODE}}\n\ndef main():\n    data = sys.stdin.read().strip()\n    if not data: return\n    nums = list(map(int, data.split()))\n    res = Solution().findDisappearedNumbers(nums)\n    print(' '.join(map(str, res)))\n\nif __name__ == '__main__':\n    main()" }
    ]
  },
  {
    title: "Maximum Product Subarray",
    description: "Given an integer array `nums`, find a subarray that has the largest product, and return the product.\n\nThe test cases are generated so that the answer will fit in a 32-bit integer.",
    difficulty: "medium",
    tags: "dp",
    visibleTestCases: [
      { input: "2 3 -2 4", output: "6", explanation: "[2,3] has the largest product 6." },
      { input: "-2 0 -1", output: "0", explanation: "The result cannot be 2, because [-2,-1] is not a valid subarray." }
    ],
    hiddenTestCases: [
      { input: "-2 3 -4", output: "24" },
      { input: "0 2", output: "2" }
    ],
    startCode: [
      { language: "C++", initialCode: "class Solution {\npublic:\n    int maxProduct(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};" },
      { language: "Java", initialCode: "class Solution {\n    public int maxProduct(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}" },
      { language: "Python", initialCode: "from typing import List\n\nclass Solution:\n    def maxProduct(self, nums: List[int]) -> int:\n        # Write your code here\n        pass" }
    ],
    referenceSolution: [
      { language: "C++", completeCode: "class Solution {\npublic:\n    int maxProduct(vector<int>& nums) {\n        int res = nums[0];\n        int curMax = 1, curMin = 1;\n        for (int n : nums) {\n            int tmp = curMax * n;\n            curMax = max({n, tmp, curMin * n});\n            curMin = min({n, tmp, curMin * n});\n            res = max(res, curMax);\n        }\n        return res;\n    }\n};" },
      { language: "Java", completeCode: "class Solution {\n    public int maxProduct(int[] nums) {\n        int res = nums[0];\n        int curMax = 1, curMin = 1;\n        for (int n : nums) {\n            int tmp = curMax * n;\n            curMax = Math.max(n, Math.max(tmp, curMin * n));\n            curMin = Math.min(n, Math.min(tmp, curMin * n));\n            res = Math.max(res, curMax);\n        }\n        return res;\n    }\n}" },
      { language: "Python", completeCode: "from typing import List\n\nclass Solution:\n    def maxProduct(self, nums: List[int]) -> int:\n        res = nums[0]\n        cur_max = cur_min = 1\n        for n in nums:\n            tmp = cur_max * n\n            cur_max = max(n, tmp, cur_min * n)\n            cur_min = min(n, tmp, cur_min * n)\n            res = max(res, cur_max)\n        return res" }
    ],
    testHarness: [
      { language: "C++", harnessCode: "#include <iostream>\n#include <vector>\n#include <sstream>\n#include <algorithm>\nusing namespace std;\n\n{{USER_CODE}}\n\nint main() {\n    string line; getline(cin, line); stringstream ss(line);\n    vector<int> nums; int x; while (ss >> x) nums.push_back(x);\n    Solution sol;\n    cout << sol.maxProduct(nums) << endl;\n    return 0;\n}" },
      { language: "Java", harnessCode: "import java.util.*;\nimport java.io.*;\n\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        Solution sol = new Solution();\n        System.out.println(sol.maxProduct(nums));\n    }\n}" },
      { language: "Python", harnessCode: "import sys\n\n{{USER_CODE}}\n\ndef main():\n    data = sys.stdin.read().strip()\n    if not data: return\n    nums = list(map(int, data.split()))\n    print(Solution().maxProduct(nums))\n\nif __name__ == '__main__':\n    main()" }
    ]
  },
  {
    title: "Jump Game II",
    description: "You are given a 0-indexed array of integers `nums` of length `n`. You are initially positioned at `nums[0]`.\n\nEach element `nums[i]` represents the maximum length of a forward jump from index `i`. In other words, if you are at `nums[i]`, you can jump to any `nums[i + j]` where:\n- `0 <= j <= nums[i]` and\n- `i + j < n`\n\nReturn the minimum number of jumps to reach `nums[n - 1]`. The test cases are generated such that you can reach `nums[n - 1]`.",
    difficulty: "medium",
    tags: "greedy",
    visibleTestCases: [
      { input: "2 3 1 1 4", output: "2", explanation: "The minimum number of jumps to reach the last index is 2. Jump 1 step from index 0 to 1, then 3 steps to the last index." },
      { input: "2 3 0 1 4", output: "2", explanation: "Jump 1 step from index 0 to 1, then 3 steps to the last index." }
    ],
    hiddenTestCases: [
      { input: "1 2 3", output: "2" },
      { input: "0", output: "0" }
    ],
    startCode: [
      { language: "C++", initialCode: "class Solution {\npublic:\n    int jump(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};" },
      { language: "Java", initialCode: "class Solution {\n    public int jump(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}" },
      { language: "Python", initialCode: "from typing import List\n\nclass Solution:\n    def jump(self, nums: List[int]) -> int:\n        # Write your code here\n        pass" }
    ],
    referenceSolution: [
      { language: "C++", completeCode: "class Solution {\npublic:\n    int jump(vector<int>& nums) {\n        int jumps = 0, current_end = 0, farthest = 0;\n        for (int i = 0; i < nums.size() - 1; i++) {\n            farthest = max(farthest, i + nums[i]);\n            if (i == current_end) {\n                jumps++;\n                current_end = farthest;\n            }\n        }\n        return jumps;\n    }\n};" },
      { language: "Java", completeCode: "class Solution {\n    public int jump(int[] nums) {\n        int jumps = 0, current_end = 0, farthest = 0;\n        for (int i = 0; i < nums.length - 1; i++) {\n            farthest = Math.max(farthest, i + nums[i]);\n            if (i == current_end) {\n                jumps++;\n                current_end = farthest;\n            }\n        }\n        return jumps;\n    }\n}" },
      { language: "Python", completeCode: "from typing import List\n\nclass Solution:\n    def jump(self, nums: List[int]) -> int:\n        jumps = current_end = farthest = 0\n        for i in range(len(nums) - 1):\n            farthest = max(farthest, i + nums[i])\n            if i == current_end:\n                jumps += 1\n                current_end = farthest\n        return jumps" }
    ],
    testHarness: [
      { language: "C++", harnessCode: "#include <iostream>\n#include <vector>\n#include <sstream>\n#include <algorithm>\nusing namespace std;\n\n{{USER_CODE}}\n\nint main() {\n    string line; getline(cin, line); stringstream ss(line);\n    vector<int> nums; int x; while (ss >> x) nums.push_back(x);\n    Solution sol;\n    cout << sol.jump(nums) << endl;\n    return 0;\n}" },
      { language: "Java", harnessCode: "import java.util.*;\nimport java.io.*;\n\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        Solution sol = new Solution();\n        System.out.println(sol.jump(nums));\n    }\n}" },
      { language: "Python", harnessCode: "import sys\n\n{{USER_CODE}}\n\ndef main():\n    data = sys.stdin.read().strip()\n    if not data: return\n    nums = list(map(int, data.split()))\n    print(Solution().jump(nums))\n\nif __name__ == '__main__':\n    main()" }
    ]
  },
  {
    title: "House Robber II",
    description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. All houses at this place are arranged in a circle. That means the first house is the neighbor of the last one. Meanwhile, adjacent houses have a security system connected, and it will automatically contact the police if two adjacent houses were broken into on the same night.\n\nGiven an integer array `nums` representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
    difficulty: "medium",
    tags: "dp",
    visibleTestCases: [
      { input: "2 3 2", output: "3", explanation: "You cannot rob house 1 (money = 2) and then rob house 3 (money = 2), because they are adjacent houses." },
      { input: "1 2 3 1", output: "4", explanation: "Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 1 + 3 = 4." }
    ],
    hiddenTestCases: [
      { input: "1", output: "1" },
      { input: "1 2", output: "2" }
    ],
    startCode: [
      { language: "C++", initialCode: "class Solution {\npublic:\n    int rob(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};" },
      { language: "Java", initialCode: "class Solution {\n    public int rob(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}" },
      { language: "Python", initialCode: "from typing import List\n\nclass Solution:\n    def rob(self, nums: List[int]) -> int:\n        # Write your code here\n        pass" }
    ],
    referenceSolution: [
      { language: "C++", completeCode: "class Solution {\npublic:\n    int rob(vector<int>& nums) {\n        if (nums.size() == 1) return nums[0];\n        return max(robRange(nums, 0, nums.size() - 2), robRange(nums, 1, nums.size() - 1));\n    }\nprivate:\n    int robRange(vector<int>& nums, int start, int end) {\n        int rob1 = 0, rob2 = 0;\n        for (int i = start; i <= end; i++) {\n            int temp = max(nums[i] + rob1, rob2);\n            rob1 = rob2;\n            rob2 = temp;\n        }\n        return rob2;\n    }\n};" },
      { language: "Java", completeCode: "class Solution {\n    public int rob(int[] nums) {\n        if (nums.length == 1) return nums[0];\n        return Math.max(robRange(nums, 0, nums.length - 2), robRange(nums, 1, nums.length - 1));\n    }\n    private int robRange(int[] nums, int start, int end) {\n        int rob1 = 0, rob2 = 0;\n        for (int i = start; i <= end; i++) {\n            int temp = Math.max(nums[i] + rob1, rob2);\n            rob1 = rob2;\n            rob2 = temp;\n        }\n        return rob2;\n    }\n}" },
      { language: "Python", completeCode: "from typing import List\n\nclass Solution:\n    def rob(self, nums: List[int]) -> int:\n        if len(nums) == 1: return nums[0]\n        def robRange(start, end):\n            rob1, rob2 = 0, 0\n            for i in range(start, end + 1):\n                temp = max(nums[i] + rob1, rob2)\n                rob1 = rob2\n                rob2 = temp\n            return rob2\n        return max(robRange(0, len(nums) - 2), robRange(1, len(nums) - 1))" }
    ],
    testHarness: [
      { language: "C++", harnessCode: "#include <iostream>\n#include <vector>\n#include <sstream>\n#include <algorithm>\nusing namespace std;\n\n{{USER_CODE}}\n\nint main() {\n    string line; getline(cin, line); stringstream ss(line);\n    vector<int> nums; int x; while (ss >> x) nums.push_back(x);\n    Solution sol;\n    cout << sol.rob(nums) << endl;\n    return 0;\n}" },
      { language: "Java", harnessCode: "import java.util.*;\nimport java.io.*;\n\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        Solution sol = new Solution();\n        System.out.println(sol.rob(nums));\n    }\n}" },
      { language: "Python", harnessCode: "import sys\n\n{{USER_CODE}}\n\ndef main():\n    data = sys.stdin.read().strip()\n    if not data: return\n    nums = list(map(int, data.split()))\n    print(Solution().rob(nums))\n\nif __name__ == '__main__':\n    main()" }
    ]
  },
  {
    title: "Longest Common Subsequence",
    description: "Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0.\n\nA subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.\n\nFor example, \"ace\" is a subsequence of \"abcde\".",
    difficulty: "medium",
    tags: "dp",
    visibleTestCases: [
      { input: "abcde\nace", output: "3", explanation: "The longest common subsequence is 'ace' and its length is 3." },
      { input: "abc\nabc", output: "3", explanation: "The longest common subsequence is 'abc' and its length is 3." }
    ],
    hiddenTestCases: [
      { input: "abc\ndef", output: "0" },
      { input: "bsbininm\njmjkbkjkv", output: "1" }
    ],
    startCode: [
      { language: "C++", initialCode: "class Solution {\npublic:\n    int longestCommonSubsequence(string text1, string text2) {\n        // Write your code here\n        return 0;\n    }\n};" },
      { language: "Java", initialCode: "class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        // Write your code here\n        return 0;\n    }\n}" },
      { language: "Python", initialCode: "class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        # Write your code here\n        pass" }
    ],
    referenceSolution: [
      { language: "C++", completeCode: "class Solution {\npublic:\n    int longestCommonSubsequence(string text1, string text2) {\n        int m = text1.length(), n = text2.length();\n        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (text1[i-1] == text2[j-1]) dp[i][j] = 1 + dp[i-1][j-1];\n                else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);\n            }\n        }\n        return dp[m][n];\n    }\n};" },
      { language: "Java", completeCode: "class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        int m = text1.length(), n = text2.length();\n        int[][] dp = new int[m + 1][n + 1];\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (text1.charAt(i-1) == text2.charAt(j-1)) dp[i][j] = 1 + dp[i-1][j-1];\n                else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);\n            }\n        }\n        return dp[m][n];\n    }\n}" },
      { language: "Python", completeCode: "class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        m, n = len(text1), len(text2)\n        dp = [[0] * (n + 1) for _ in range(m + 1)]\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if text1[i-1] == text2[j-1]:\n                    dp[i][j] = 1 + dp[i-1][j-1]\n                else:\n                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n        return dp[m][n]" }
    ],
    testHarness: [
      { language: "C++", harnessCode: "#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\n{{USER_CODE}}\n\nint main() {\n    string t1, t2;\n    getline(cin, t1);\n    getline(cin, t2);\n    Solution sol;\n    cout << sol.longestCommonSubsequence(t1, t2) << endl;\n    return 0;\n}" },
      { language: "Java", harnessCode: "import java.util.*;\nimport java.io.*;\n\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        Scanner sc = new Scanner(System.in);\n        String t1 = sc.nextLine();\n        String t2 = sc.nextLine();\n        Solution sol = new Solution();\n        System.out.println(sol.longestCommonSubsequence(t1, t2));\n    }\n}" },
      { language: "Python", harnessCode: "import sys\n\n{{USER_CODE}}\n\ndef main():\n    data = sys.stdin.read().strip().split('\\n')\n    if len(data) < 2: return\n    t1, t2 = data[0].strip(), data[1].strip()\n    print(Solution().longestCommonSubsequence(t1, t2))\n\nif __name__ == '__main__':\n    main()" }
    ]
  },
  {
    title: "Decode Ways",
    description: "A message containing letters from A-Z can be encoded into numbers using the following mapping:\n'A' -> \"1\"\n'B' -> \"2\"\n...\n'Z' -> \"26\"\n\nTo decode an encoded message, all the digits must be grouped then mapped back into letters using the reverse of the mapping above (there may be multiple ways).\n\nFor example, \"11106\" can be mapped into:\n- \"AAJF\" with the grouping (1 1 10 6)\n- \"KJF\" with the grouping (11 10 6)\n\nGiven a string `s` containing only digits, return the number of ways to decode it.",
    difficulty: "medium",
    tags: "dp",
    visibleTestCases: [
      { input: "12", output: "2", explanation: "It could be decoded as 'AB' (1 2) or 'L' (12)." },
      { input: "226", output: "3", explanation: "It could be decoded as 'BZ' (2 26), 'VF' (22 6), or 'BBF' (2 2 6)." }
    ],
    hiddenTestCases: [
      { input: "06", output: "0" },
      { input: "10", output: "1" }
    ],
    startCode: [
      { language: "C++", initialCode: "class Solution {\npublic:\n    int numDecodings(string s) {\n        // Write your code here\n        return 0;\n    }\n};" },
      { language: "Java", initialCode: "class Solution {\n    public int numDecodings(String s) {\n        // Write your code here\n        return 0;\n    }\n}" },
      { language: "Python", initialCode: "class Solution:\n    def numDecodings(self, s: str) -> int:\n        # Write your code here\n        pass" }
    ],
    referenceSolution: [
      { language: "C++", completeCode: "class Solution {\npublic:\n    int numDecodings(string s) {\n        int n = s.length();\n        vector<int> dp(n + 1, 0);\n        dp[0] = 1;\n        dp[1] = s[0] != '0' ? 1 : 0;\n        for (int i = 2; i <= n; i++) {\n            int one = stoi(s.substr(i - 1, 1));\n            int two = stoi(s.substr(i - 2, 2));\n            if (one >= 1 && one <= 9) dp[i] += dp[i - 1];\n            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];\n        }\n        return dp[n];\n    }\n};" },
      { language: "Java", completeCode: "class Solution {\n    public int numDecodings(String s) {\n        int n = s.length();\n        int[] dp = new int[n + 1];\n        dp[0] = 1;\n        dp[1] = s.charAt(0) != '0' ? 1 : 0;\n        for (int i = 2; i <= n; i++) {\n            int one = Integer.parseInt(s.substring(i - 1, i));\n            int two = Integer.parseInt(s.substring(i - 2, i));\n            if (one >= 1 && one <= 9) dp[i] += dp[i - 1];\n            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];\n        }\n        return dp[n];\n    }\n}" },
      { language: "Python", completeCode: "class Solution:\n    def numDecodings(self, s: str) -> int:\n        n = len(s)\n        dp = [0] * (n + 1)\n        dp[0] = 1\n        dp[1] = 1 if s[0] != '0' else 0\n        for i in range(2, n + 1):\n            one = int(s[i-1:i])\n            two = int(s[i-2:i])\n            if 1 <= one <= 9:\n                dp[i] += dp[i-1]\n            if 10 <= two <= 26:\n                dp[i] += dp[i-2]\n        return dp[n]" }
    ],
    testHarness: [
      { language: "C++", harnessCode: "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n{{USER_CODE}}\n\nint main() {\n    string s;\n    if (cin >> s) {\n        Solution sol;\n        cout << sol.numDecodings(s) << endl;\n    }\n    return 0;\n}" },
      { language: "Java", harnessCode: "import java.util.*;\nimport java.io.*;\n\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.next();\n        Solution sol = new Solution();\n        System.out.println(sol.numDecodings(s));\n    }\n}" },
      { language: "Python", harnessCode: "import sys\n\n{{USER_CODE}}\n\ndef main():\n    data = sys.stdin.read().strip()\n    if not data: return\n    print(Solution().numDecodings(data))\n\nif __name__ == '__main__':\n    main()" }
    ]
  }
];

const seedDatabase = async () => {
  try {
    console.log(`🔐 Logging in as Admin (${ADMIN_EMAIL})...`);
    const loginRes = await axios.post(`${BACKEND_URL}/user/login`, {
      emailId: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    const cookies = loginRes.headers['set-cookie'];
    if (!cookies) throw new Error("Login failed. Check credentials.");
    console.log("✅ Logged in successfully.\n");

    for (const problem of problemsData) {
      console.log(`📤 Sending "${problem.title}" to backend for Judge0 validation...`);
      try {
        await axios.post(`${BACKEND_URL}/problem/create`, problem, {
          headers: { Cookie: cookies }
        });
        console.log(`✅ Success! "${problem.title}" saved to database.\n`);
        
        // Wait 5 seconds for Judge0 API rate limit
        await new Promise(r => setTimeout(r, 5000));
      } catch (err) {
        console.error(`❌ Failed to add "${problem.title}":`);
        console.error(err.response?.data?.error || err.message);
        console.log("Skipping to next problem...\n");
      }
    }
    console.log("🎉 Database seeding complete!");
  } catch (err) {
    console.error("❌ Fatal Error:", err.message);
  }
};

seedDatabase();