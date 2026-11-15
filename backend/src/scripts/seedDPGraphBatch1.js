require('dotenv').config();
const axios = require('axios');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const BACKEND_URL = 'http://localhost:3000';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ ADMIN_EMAIL / ADMIN_PASSWORD missing from .env');
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────
// HARNESS BUILDERS
// ─────────────────────────────────────────────────────────────

function buildCppHarness(pattern, method) {
  const readers = {
    'arr-int': `string line; getline(cin, line);
    stringstream ss(line); vector<int> arr; int x;
    while (ss >> x) arr.push_back(x);`,
        'arr-bool': `string line; getline(cin, line);
    stringstream ss(line); vector<int> arr; int x;
    while (ss >> x) arr.push_back(x);`,
    'int-bool': `int n; cin >> n;`,
    'int-int': `int n; cin >> n;`,
    'arrint-int': `string line; getline(cin, line);
    stringstream ss(line); vector<int> arr; int x;
    while (ss >> x) arr.push_back(x);
    int k; cin >> k;`,
    'grid-int': `int rows, cols; cin >> rows >> cols;
    vector<vector<int>> grid(rows, vector<int>(cols));
    for (int i = 0; i < rows; i++) for (int j = 0; j < cols; j++) cin >> grid[i][j];`,
    'str-int': `string s; getline(cin, s);`,
    'twostr-int': `string a, b; getline(cin, a); getline(cin, b);`,
    'twostr-bool': `string a, b; getline(cin, a); getline(cin, b);`,
  };
  const call = {
    'arr-int': `Solution sol; cout << sol.${method}(arr) << endl;`,
        'arr-bool': `Solution sol; cout << (sol.${method}(arr) ? "true" : "false") << endl;`,
    'int-bool': `Solution sol; cout << (sol.${method}(n) ? "true" : "false") << endl;`,
    'int-int': `Solution sol; cout << sol.${method}(n) << endl;`,
    'arrint-int': `Solution sol; cout << sol.${method}(arr, k) << endl;`,
    'grid-int': `Solution sol; cout << sol.${method}(grid) << endl;`,
    'str-int': `Solution sol; cout << sol.${method}(s) << endl;`,
    'twostr-int': `Solution sol; cout << sol.${method}(a, b) << endl;`,
    'twostr-bool': `Solution sol; cout << (sol.${method}(a, b) ? "true" : "false") << endl;`,
  };
  return `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    ${readers[pattern]}
    ${call[pattern]}
    return 0;
}`;
}

function buildJavaHarness(pattern, method) {
  const readers = {
    'arr-int': `String[] parts = sc.nextLine().trim().split("\\\\s+");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i]);`,
            'arr-bool': `String[] parts = sc.nextLine().trim().split("\\\\s+");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i]);`,
    'int-bool': `int n = Integer.parseInt(sc.nextLine().trim());`,
    'int-int': `int n = Integer.parseInt(sc.nextLine().trim());`,
    'arrint-int': `String[] parts = sc.nextLine().trim().split("\\\\s+");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i]);
        int k = Integer.parseInt(sc.nextLine().trim());`,
    'grid-int': `int rows = sc.nextInt(), cols = sc.nextInt();
        int[][] grid = new int[rows][cols];
        for (int i = 0; i < rows; i++) for (int j = 0; j < cols; j++) grid[i][j] = sc.nextInt();`,
    'str-int': `String s = sc.nextLine();`,
    'twostr-int': `String a = sc.nextLine();
        String b = sc.nextLine();`,
    'twostr-bool': `String a = sc.nextLine();
        String b = sc.nextLine();`,
  };
  const call = {
    'arr-int': `System.out.println(new Solution().${method}(arr));`,
        'arr-bool': `System.out.println(new Solution().${method}(arr) ? "true" : "false");`,
    'int-bool': `System.out.println(new Solution().${method}(n) ? "true" : "false");`,
    'int-int': `System.out.println(new Solution().${method}(n));`,
    'arrint-int': `System.out.println(new Solution().${method}(arr, k));`,
    'grid-int': `System.out.println(new Solution().${method}(grid));`,
    'str-int': `System.out.println(new Solution().${method}(s));`,
    'twostr-int': `System.out.println(new Solution().${method}(a, b));`,
    'twostr-bool': `System.out.println(new Solution().${method}(a, b) ? "true" : "false");`,
  };
  return `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        ${readers[pattern]}
        ${call[pattern]}
    }
}`;
}

function buildPyHarness(pattern, method) {
  const readers = {
    'arr-int': `arr = list(map(int, sys.stdin.read().strip().split()))`,
        'arr-bool': `arr = list(map(int, sys.stdin.read().strip().split()))`,
    'int-bool': `n = int(sys.stdin.read().strip())`,
    'int-int': `n = int(sys.stdin.read().strip())`,
    'arrint-int': `lines = sys.stdin.read().strip().split('\\n')
    arr = list(map(int, lines[0].split()))
    k = int(lines[1].strip())`,
    'grid-int': `data = sys.stdin.read().strip().split('\\n')
    rows, cols = map(int, data[0].split())
    grid = [list(map(int, data[i+1].split())) for i in range(rows)]`,
    'str-int': `s = sys.stdin.read().rstrip('\\n')`,
    'twostr-int': `lines = sys.stdin.read().strip().split('\\n')
    a = lines[0].strip()
    b = lines[1].strip()`,
    'twostr-bool': `lines = sys.stdin.read().strip().split('\\n')
    a = lines[0].strip()
    b = lines[1].strip()`,
  };
  const call = {
    'arr-int': `print(Solution().${method}(arr))`,
        'arr-bool': `print("true" if Solution().${method}(arr) else "false")`,
    'int-bool': `print("true" if Solution().${method}(n) else "false")`,
    'int-int': `print(Solution().${method}(n))`,
    'arrint-int': `print(Solution().${method}(arr, k))`,
    'grid-int': `print(Solution().${method}(grid))`,
    'str-int': `print(Solution().${method}(s))`,
    'twostr-int': `print(Solution().${method}(a, b))`,
    'twostr-bool': `print("true" if Solution().${method}(a, b) else "false")`,
  };
  return `import sys
from typing import List
from collections import deque, defaultdict

{{USER_CODE}}

def main():
    ${readers[pattern]}
    ${call[pattern]}

if __name__ == "__main__":
    main()`;
}

// ─────────────────────────────────────────────────────────────
// PROBLEMS — 15 (3 Easy, 10 Medium, 4 Hard)
// ─────────────────────────────────────────────────────────────

const problemsData = [
  // ═══════════ EASY (3) ═══════════
  {
    title: 'Island Perimeter',
    problemNumber: 463,
    difficulty: 'easy',
    tags: 'graph',
    pattern: 'grid-int',
    method: 'islandPerimeter',
    description: 'You are given `row x col` `grid` representing a map where `grid[i][j] = 1` represents land and `grid[i][j] = 0` represents water.\n\nGrid cells are connected horizontally/vertically (not diagonally). The `grid` is completely surrounded by water, and there is exactly one island (i.e., one or more connected land cells).\n\nThe island doesn\'t have "lakes", meaning the water inside isn\'t connected to the water around the island. One cell is a square with side length 1. The grid is rectangular, width and height don\'t exceed 100. Determine the perimeter of the island.\n\n**Input format:** Line 1 = rows cols, then grid rows.',
    visibleTestCases: [
      { input: '4 4\n0 1 0 0\n1 1 1 0\n0 1 0 0\n1 1 0 0', output: '16', explanation: 'Each land cell contributes to the perimeter; shared edges are subtracted.' },
      { input: '1 1\n1', output: '4', explanation: 'Single land cell has perimeter 4.' },
    ],
    hiddenTestCases: [
      { input: '1 2\n1 0', output: '4' },
      { input: '2 2\n1 1\n1 1', output: '8' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int islandPerimeter(vector<vector<int>>& grid) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int islandPerimeter(int[][] grid) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def islandPerimeter(self, grid: List[List[int]]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int islandPerimeter(vector<vector<int>>& g) {\n        int p = 0, m = g.size(), n = g[0].size();\n        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) {\n            if (g[i][j] != 1) continue;\n            p += 4;\n            if (i > 0 && g[i-1][j] == 1) p -= 2;\n            if (j > 0 && g[i][j-1] == 1) p -= 2;\n        }\n        return p;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int islandPerimeter(int[][] g) {\n        int p = 0;\n        for (int i = 0; i < g.length; i++) for (int j = 0; j < g[0].length; j++) {\n            if (g[i][j] != 1) continue;\n            p += 4;\n            if (i > 0 && g[i-1][j] == 1) p -= 2;\n            if (j > 0 && g[i][j-1] == 1) p -= 2;\n        }\n        return p;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def islandPerimeter(self, g: List[List[int]]) -> int:\n        p = 0\n        for i in range(len(g)):\n            for j in range(len(g[0])):\n                if g[i][j] != 1:\n                    continue\n                p += 4\n                if i > 0 and g[i-1][j] == 1:\n                    p -= 2\n                if j > 0 and g[i][j-1] == 1:\n                    p -= 2\n        return p' },
    ],
  },

  {
    title: 'Min Cost Climbing Stairs',
    problemNumber: 746,
    difficulty: 'easy',
    tags: 'dp',
    pattern: 'arr-int',
    method: 'minCostClimbingStairs',
    description: 'You are given an integer array `cost` where `cost[i]` is the cost of the i-th step on a staircase. Once you pay the cost, you can either climb one or two steps.\n\nYou can either start from the step with index `0`, or the step with index `1`. Return the minimum cost to reach the top of the floor.',
    visibleTestCases: [
      { input: '10 15 20', output: '15', explanation: 'Start at index 1, pay 15, then climb 2 steps to top.' },
      { input: '1 100 1 1 1 100 1 1 100 1', output: '6', explanation: 'Pick steps 0,2,4,6,8 → 1+1+1+1+1+1 = 6.' },
    ],
    hiddenTestCases: [
      { input: '1 2', output: '1' },
      { input: '5', output: '5' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int minCostClimbingStairs(vector<int>& cost) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int minCostClimbingStairs(int[] cost) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def minCostClimbingStairs(self, cost: List[int]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int minCostClimbingStairs(vector<int>& cost) {\n        int a = 0, b = 0;\n        for (int c : cost) {\n            int t = min(a, b) + c;\n            a = b; b = t;\n        }\n        return min(a, b);\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int minCostClimbingStairs(int[] cost) {\n        int a = 0, b = 0;\n        for (int c : cost) {\n            int t = Math.min(a, b) + c;\n            a = b; b = t;\n        }\n        return Math.min(a, b);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def minCostClimbingStairs(self, cost: List[int]) -> int:\n        a = b = 0\n        for c in cost:\n            a, b = b, min(a, b) + c\n        return min(a, b)' },
    ],
  },

  {
    title: 'Divisor Game',
    problemNumber: 1025,
    difficulty: 'easy',
    tags: 'dp',
    pattern: 'int-bool',
    method: 'divisorGame',
    description: 'Alice and Bob take turns playing a game, with Alice starting first.\n\nInitially, there is a number `n` on the chalkboard. On each player\'s turn, that player makes a move consisting of:\n- Choosing any `x` with `0 < x < n` and `n % x == 0`.\n- Replacing the number `n` on the chalkboard with `n - x`.\n\nAlso, if a player cannot make a move, they lose the game.\n\nReturn `true` if and only if Alice wins the game, assuming both players play optimally.',
    visibleTestCases: [
      { input: '2', output: 'true', explanation: 'Alice picks x=1, leaving n=1. Bob cannot move.' },
      { input: '3', output: 'false', explanation: 'Alice picks x=1 (n=2), Bob picks x=1 (n=1), Alice cannot move.' },
    ],
    hiddenTestCases: [
      { input: '1', output: 'false' },
      { input: '4', output: 'true' },
      { input: '100', output: 'true' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    bool divisorGame(int n) {\n        // Write your code here\n        return false;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public boolean divisorGame(int n) {\n        // Write your code here\n        return false;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def divisorGame(self, n: int) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    bool divisorGame(int n) { return n % 2 == 0; }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public boolean divisorGame(int n) { return n % 2 == 0; }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def divisorGame(self, n: int) -> bool:\n        return n % 2 == 0' },
    ],
  },

  // ═══════════ MEDIUM (10) ═══════════
  {
    title: 'Delete and Earn',
    problemNumber: 740,
    difficulty: 'medium',
    tags: 'dp',
    pattern: 'arr-int',
    method: 'deleteAndEarn',
    description: 'You are given an integer array `nums`. You want to maximize the number of points you get by performing the following operation any number of times:\n- Pick any `nums[i]` and delete it to earn `nums[i]` points. Afterwards, you must delete every element equal to `nums[i] - 1` and every element equal to `nums[i] + 1`.\n\nReturn the maximum number of points you can earn by applying the above operation some number of times.',
    visibleTestCases: [
      { input: '3 4 2', output: '6', explanation: 'Delete 4 (4 points), then 2 (2 points). Total = 6.' },
      { input: '2 2 3 3 3 4', output: '9', explanation: 'Delete all 3s (9 points) — 2 and 4 get removed by the rule.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '1' },
      { input: '5 5 5', output: '15' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int deleteAndEarn(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int deleteAndEarn(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def deleteAndEarn(self, nums: List[int]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int deleteAndEarn(vector<int>& nums) {\n        int mx = *max_element(nums.begin(), nums.end());\n        vector<int> cnt(mx + 1, 0);\n        for (int n : nums) cnt[n] += n;\n        int take = 0, skip = 0;\n        for (int v : cnt) {\n            int ntake = skip + v;\n            int nskip = max(take, skip);\n            take = ntake; skip = nskip;\n        }\n        return max(take, skip);\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int deleteAndEarn(int[] nums) {\n        int mx = 0;\n        for (int n : nums) mx = Math.max(mx, n);\n        int[] cnt = new int[mx + 1];\n        for (int n : nums) cnt[n] += n;\n        int take = 0, skip = 0;\n        for (int v : cnt) {\n            int ntake = skip + v;\n            int nskip = Math.max(take, skip);\n            take = ntake; skip = nskip;\n        }\n        return Math.max(take, skip);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def deleteAndEarn(self, nums: List[int]) -> int:\n        mx = max(nums)\n        cnt = [0] * (mx + 1)\n        for n in nums:\n            cnt[n] += n\n        take = skip = 0\n        for v in cnt:\n            take, skip = skip + v, max(take, skip)\n        return max(take, skip)' },
    ],
  },

  {
    title: 'Combination Sum IV',
    problemNumber: 377,
    difficulty: 'medium',
    tags: 'dp',
    pattern: 'arrint-int',
    method: 'combinationSum4',
    description: 'Given an array of distinct integers `nums` and a target integer `target`, return the number of possible combinations that add up to `target`.\n\nThe test cases are generated so that the answer can fit in a 32-bit integer.\n\n**Input format:** Line 1 = nums, Line 2 = target.',
    visibleTestCases: [
      { input: '1 2 3\n4', output: '7', explanation: '7 ordered combinations sum to 4.' },
      { input: '9\n3', output: '0', explanation: 'No combination of 9 equals 3.' },
    ],
    hiddenTestCases: [
      { input: '1\n1', output: '1' },
      { input: '2 1\n3', output: '3' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int combinationSum4(vector<int>& nums, int target) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int combinationSum4(int[] nums, int target) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def combinationSum4(self, nums: List[int], target: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int combinationSum4(vector<int>& nums, int target) {\n        vector<long long> dp(target + 1, 0);\n        dp[0] = 1;\n        for (int i = 1; i <= target; i++)\n            for (int n : nums)\n                if (i >= n) dp[i] = (dp[i] + dp[i - n]) % 10000000000LL;\n        return (int)dp[target];\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int combinationSum4(int[] nums, int target) {\n        long[] dp = new long[target + 1];\n        dp[0] = 1;\n        for (int i = 1; i <= target; i++)\n            for (int n : nums)\n                if (i >= n) dp[i] += dp[i - n];\n        return (int) dp[target];\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def combinationSum4(self, nums: List[int], target: int) -> int:\n        dp = [0] * (target + 1)\n        dp[0] = 1\n        for i in range(1, target + 1):\n            for n in nums:\n                if i >= n:\n                    dp[i] += dp[i - n]\n        return dp[target]' },
    ],
  },

  {
    title: 'Integer Break',
    problemNumber: 343,
    difficulty: 'medium',
    tags: 'dp',
    pattern: 'int-int',
    method: 'integerBreak',
    description: 'Given an integer `n`, break it into the sum of `k` positive integers, where `k >= 2`, and maximize the product of those integers.\n\nReturn the maximum product you can get.',
    visibleTestCases: [
      { input: '2', output: '1', explanation: '2 = 1 + 1, product = 1.' },
      { input: '10', output: '36', explanation: '10 = 3 + 3 + 4, product = 36.' },
    ],
    hiddenTestCases: [
      { input: '3', output: '2' },
      { input: '8', output: '18' },
      { input: '5', output: '6' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int integerBreak(int n) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int integerBreak(int n) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def integerBreak(self, n: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int integerBreak(int n) {\n        if (n <= 3) return n - 1;\n        int prod = 1;\n        while (n > 4) { prod *= 3; n -= 3; }\n        return prod * n;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int integerBreak(int n) {\n        if (n <= 3) return n - 1;\n        int prod = 1;\n        while (n > 4) { prod *= 3; n -= 3; }\n        return prod * n;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def integerBreak(self, n: int) -> int:\n        if n <= 3:\n            return n - 1\n        prod = 1\n        while n > 4:\n            prod *= 3\n            n -= 3\n        return prod * n' },
    ],
  },

  {
    title: 'Perfect Squares',
    problemNumber: 279,
    difficulty: 'medium',
    tags: 'dp',
    pattern: 'int-int',
    method: 'numSquares',
    description: 'Given an integer `n`, return the least number of perfect square numbers that sum to `n`.\n\nA perfect square is an integer that is the square of an integer; in other words, it is the product of some integer with itself. For example, `1`, `4`, `9`, and `16` are perfect squares while `3` and `11` are not.',
    visibleTestCases: [
      { input: '12', output: '3', explanation: '12 = 4 + 4 + 4.' },
      { input: '13', output: '2', explanation: '13 = 4 + 9.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '1' },
      { input: '4', output: '1' },
      { input: '7', output: '4' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int numSquares(int n) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int numSquares(int n) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def numSquares(self, n: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int numSquares(int n) {\n        vector<int> dp(n + 1, INT_MAX);\n        dp[0] = 0;\n        for (int i = 1; i <= n; i++)\n            for (int j = 1; j * j <= i; j++)\n                dp[i] = min(dp[i], dp[i - j*j] + 1);\n        return dp[n];\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int numSquares(int n) {\n        int[] dp = new int[n + 1];\n        Arrays.fill(dp, Integer.MAX_VALUE);\n        dp[0] = 0;\n        for (int i = 1; i <= n; i++)\n            for (int j = 1; j * j <= i; j++)\n                dp[i] = Math.min(dp[i], dp[i - j*j] + 1);\n        return dp[n];\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def numSquares(self, n: int) -> int:\n        dp = [float(\'inf\')] * (n + 1)\n        dp[0] = 0\n        for i in range(1, n + 1):\n            j = 1\n            while j * j <= i:\n                dp[i] = min(dp[i], dp[i - j*j] + 1)\n                j += 1\n        return dp[n]' },
    ],
  },

  {
    title: 'Number of Longest Increasing Subsequence',
    problemNumber: 673,
    difficulty: 'medium',
    tags: 'dp',
    pattern: 'arr-int',
    method: 'findNumberOfLIS',
    description: 'Given an integer array `nums`, return the number of longest increasing subsequences.\n\n**Notice:** The sequence has to be strictly increasing.',
    visibleTestCases: [
      { input: '1 3 5 4 7', output: '2', explanation: 'Two LIS of length 4: [1,3,5,7] and [1,3,4,7].' },
      { input: '2 2 2 2 2', output: '5', explanation: 'All LIS have length 1; there are 5 of them.' },
    ],
    hiddenTestCases: [
      { input: '1 2 4 3 5 4 7 2', output: '3' },
      { input: '1', output: '1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int findNumberOfLIS(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int findNumberOfLIS(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def findNumberOfLIS(self, nums: List[int]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int findNumberOfLIS(vector<int>& nums) {\n        int n = nums.size(), maxLen = 0, count = 0;\n        vector<int> len(n, 1), cnt(n, 1);\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < i; j++) {\n                if (nums[j] < nums[i]) {\n                    if (len[j] + 1 > len[i]) { len[i] = len[j] + 1; cnt[i] = cnt[j]; }\n                    else if (len[j] + 1 == len[i]) cnt[i] += cnt[j];\n                }\n            }\n            if (len[i] > maxLen) { maxLen = len[i]; count = cnt[i]; }\n            else if (len[i] == maxLen) count += cnt[i];\n        }\n        return count;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int findNumberOfLIS(int[] nums) {\n        int n = nums.length, maxLen = 0, count = 0;\n        int[] len = new int[n], cnt = new int[n];\n        Arrays.fill(len, 1); Arrays.fill(cnt, 1);\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < i; j++) {\n                if (nums[j] < nums[i]) {\n                    if (len[j] + 1 > len[i]) { len[i] = len[j] + 1; cnt[i] = cnt[j]; }\n                    else if (len[j] + 1 == len[i]) cnt[i] += cnt[j];\n                }\n            }\n            if (len[i] > maxLen) { maxLen = len[i]; count = cnt[i]; }\n            else if (len[i] == maxLen) count += cnt[i];\n        }\n        return count;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def findNumberOfLIS(self, nums: List[int]) -> int:\n        n = len(nums)\n        length = [1] * n\n        count = [1] * n\n        best = 0\n        result = 0\n        for i in range(n):\n            for j in range(i):\n                if nums[j] < nums[i]:\n                    if length[j] + 1 > length[i]:\n                        length[i] = length[j] + 1\n                        count[i] = count[j]\n                    elif length[j] + 1 == length[i]:\n                        count[i] += count[j]\n            if length[i] > best:\n                best = length[i]\n                result = count[i]\n            elif length[i] == best:\n                result += count[i]\n        return result' },
    ],
  },

  {
    title: 'Longest Arithmetic Subsequence',
    problemNumber: 1027,
    difficulty: 'medium',
    tags: 'dp',
    pattern: 'arr-int',
    method: 'longestArithSeqLength',
    description: 'Given an array `nums` of integers, return the length of the longest arithmetic subsequence in `nums`.\n\nNote that:\n- A subsequence of an array `nums` is a list `nums[i1], nums[i2], ..., nums[ik]` with `0 <= i1 < i2 < ... < ik <= nums.length - 1`.\n- A sequence `seq` is arithmetic if `seq[i+1] - seq[i]` is the same for all `0 <= i < seq.length - 1`.',
    visibleTestCases: [
      { input: '3 6 9 12', output: '4', explanation: 'Whole array is an AP with diff 3.' },
      { input: '9 4 7 2 10', output: '3', explanation: 'Longest AP is [4,7,10] with diff 3.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '1' },
      { input: '20 1 15 3 10 5 8', output: '4' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int longestArithSeqLength(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int longestArithSeqLength(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def longestArithSeqLength(self, nums: List[int]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int longestArithSeqLength(vector<int>& nums) {\n        int n = nums.size(), best = 2;\n        vector<unordered_map<int,int>> dp(n);\n        for (int i = 0; i < n; i++) for (int j = 0; j < i; j++) {\n            int diff = nums[i] - nums[j];\n            dp[i][diff] = max(dp[i][diff], (dp[j].count(diff) ? dp[j][diff] : 1) + 1);\n            best = max(best, dp[i][diff]);\n        }\n        return n < 2 ? n : best;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int longestArithSeqLength(int[] nums) {\n        int n = nums.length;\n        if (n < 2) return n;\n        int best = 2;\n        Map<Integer, Integer>[] dp = new HashMap[n];\n        for (int i = 0; i < n; i++) {\n            dp[i] = new HashMap<>();\n            for (int j = 0; j < i; j++) {\n                int diff = nums[i] - nums[j];\n                int val = dp[j].getOrDefault(diff, 1) + 1;\n                dp[i].put(diff, Math.max(dp[i].getOrDefault(diff, 0), val));\n                best = Math.max(best, dp[i].get(diff));\n            }\n        }\n        return best;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def longestArithSeqLength(self, nums: List[int]) -> int:\n        n = len(nums)\n        if n < 2:\n            return n\n        best = 2\n        dp = [{} for _ in range(n)]\n        for i in range(n):\n            for j in range(i):\n                diff = nums[i] - nums[j]\n                dp[i][diff] = dp[j].get(diff, 1) + 1\n                best = max(best, dp[i][diff])\n        return best' },
    ],
  },

  {
    title: 'Minimum Falling Path Sum',
    problemNumber: 931,
    difficulty: 'medium',
    tags: 'dp',
    pattern: 'grid-int',
    method: 'minFallingPathSum',
    description: 'Given an `n x n` array of integers `matrix`, return the minimum sum of any falling path through `matrix`.\n\nA falling path starts at any element in the first row and chooses the element in the next row that is either directly below or diagonally left/right. Specifically, the next element from position `(row, col)` will be `(row + 1, col - 1)`, `(row + 1, col)`, or `(row + 1, col + 1)`.\n\n**Input format:** Line 1 = rows cols, then grid rows.',
    visibleTestCases: [
      { input: '3 3\n2 1 3\n6 5 4\n7 8 9', output: '13', explanation: 'Path 1 → 5 → 7 = 13.' },
      { input: '2 2\n1 2\n3 4', output: '4', explanation: 'Path 1 → 3 = 4.' },
    ],
    hiddenTestCases: [
      { input: '1 1\n-48', output: '-48' },
      { input: '2 2\n-19 57\n-40 -5', output: '-59' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int minFallingPathSum(vector<vector<int>>& matrix) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int minFallingPathSum(int[][] matrix) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def minFallingPathSum(self, matrix: List[List[int]]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int minFallingPathSum(vector<vector<int>>& g) {\n        int n = g.size();\n        for (int i = 1; i < n; i++) {\n            for (int j = 0; j < n; j++) {\n                int best = g[i-1][j];\n                if (j > 0) best = min(best, g[i-1][j-1]);\n                if (j < n - 1) best = min(best, g[i-1][j+1]);\n                g[i][j] += best;\n            }\n        }\n        int res = INT_MAX;\n        for (int j = 0; j < n; j++) res = min(res, g[n-1][j]);\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int minFallingPathSum(int[][] g) {\n        int n = g.length;\n        for (int i = 1; i < n; i++) {\n            for (int j = 0; j < n; j++) {\n                int best = g[i-1][j];\n                if (j > 0) best = Math.min(best, g[i-1][j-1]);\n                if (j < n - 1) best = Math.min(best, g[i-1][j+1]);\n                g[i][j] += best;\n            }\n        }\n        int res = Integer.MAX_VALUE;\n        for (int j = 0; j < n; j++) res = Math.min(res, g[n-1][j]);\n        return res;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def minFallingPathSum(self, g: List[List[int]]) -> int:\n        n = len(g)\n        for i in range(1, n):\n            for j in range(n):\n                best = g[i-1][j]\n                if j > 0:\n                    best = min(best, g[i-1][j-1])\n                if j < n - 1:\n                    best = min(best, g[i-1][j+1])\n                g[i][j] += best\n        return min(g[n-1])' },
    ],
  },

  {
    title: 'Longest Palindromic Subsequence',
    problemNumber: 516,
    difficulty: 'medium',
    tags: 'dp',
    pattern: 'str-int',
    method: 'longestPalindromeSubseq',
    description: 'Given a string `s`, find the longest palindromic subsequence\'s length in `s`.\n\nA subsequence is a sequence that can be derived from another sequence by deleting some or no elements without changing the order of the remaining elements.',
    visibleTestCases: [
      { input: 'bbbab', output: '4', explanation: 'LPS is "bbbb" with length 4.' },
      { input: 'cbbd', output: '2', explanation: 'LPS is "bb" with length 2.' },
    ],
    hiddenTestCases: [
      { input: 'a', output: '1' },
      { input: 'abcba', output: '5' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int longestPalindromeSubseq(string s) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int longestPalindromeSubseq(String s) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def longestPalindromeSubseq(self, s: str) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int longestPalindromeSubseq(string s) {\n        int n = s.size();\n        vector<vector<int>> dp(n, vector<int>(n, 0));\n        for (int i = n - 1; i >= 0; i--) {\n            dp[i][i] = 1;\n            for (int j = i + 1; j < n; j++) {\n                if (s[i] == s[j]) dp[i][j] = dp[i+1][j-1] + 2;\n                else dp[i][j] = max(dp[i+1][j], dp[i][j-1]);\n            }\n        }\n        return dp[0][n-1];\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int longestPalindromeSubseq(String s) {\n        int n = s.length();\n        int[][] dp = new int[n][n];\n        for (int i = n - 1; i >= 0; i--) {\n            dp[i][i] = 1;\n            for (int j = i + 1; j < n; j++) {\n                if (s.charAt(i) == s.charAt(j)) dp[i][j] = dp[i+1][j-1] + 2;\n                else dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1]);\n            }\n        }\n        return dp[0][n-1];\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def longestPalindromeSubseq(self, s: str) -> int:\n        n = len(s)\n        dp = [[0] * n for _ in range(n)]\n        for i in range(n - 1, -1, -1):\n            dp[i][i] = 1\n            for j in range(i + 1, n):\n                if s[i] == s[j]:\n                    dp[i][j] = dp[i+1][j-1] + 2\n                else:\n                    dp[i][j] = max(dp[i+1][j], dp[i][j-1])\n        return dp[0][n-1]' },
    ],
  },

  {
    title: 'Knight Dialer',
    problemNumber: 935,
    difficulty: 'medium',
    tags: 'dp',
    pattern: 'int-int',
    method: 'knightDialer',
    description: 'The knight in chess has a unique movement, it may move two squares vertically and one square horizontally, or two squares horizontally and one square vertically (with both forming the shape of an L).\n\nThe possible movements of a knight are shown below:\n\nA knight has 8 possible moves it can make, as illustrated. Each move is two squares in a cardinal direction, then one square in an orthogonal direction.\n\nWe place a knight on any of the 10 cells of a phone keypad numbered 0-9. A knight can move to the next cell according to the standard knight moves. How many distinct phone numbers of length `n` can we dial?\n\nReturn the number of distinct phone numbers, modulo `10^9 + 7`.',
    visibleTestCases: [
      { input: '1', output: '10', explanation: 'You can dial any of the 10 digits.' },
      { input: '2', output: '20', explanation: 'Knight has 20 possible paths for 2 digit phone numbers.' },
    ],
    hiddenTestCases: [
      { input: '3', output: '46' },
      { input: '4', output: '104' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int knightDialer(int n) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int knightDialer(int n) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def knightDialer(self, n: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int knightDialer(int n) {\n        vector<vector<int>> moves = {{4,6},{6,8},{7,9},{4,8},{0,3,9},{},{0,1,7},{2,6},{1,3},{2,4}};\n        vector<long long> cur(10, 1);\n        for (int i = 1; i < n; i++) {\n            vector<long long> next(10, 0);\n            for (int d = 0; d < 10; d++)\n                for (int nx : moves[d])\n                    next[nx] = (next[nx] + cur[d]) % 1000000007;\n            cur = next;\n        }\n        long long sum = 0;\n        for (long long v : cur) sum = (sum + v) % 1000000007;\n        return (int)sum;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int knightDialer(int n) {\n        int[][] moves = {{4,6},{6,8},{7,9},{4,8},{0,3,9},{},{0,1,7},{2,6},{1,3},{2,4}};\n        long[] cur = new long[10];\n        Arrays.fill(cur, 1);\n        for (int i = 1; i < n; i++) {\n            long[] next = new long[10];\n            for (int d = 0; d < 10; d++)\n                for (int nx : moves[d])\n                    next[nx] = (next[nx] + cur[d]) % 1000000007;\n            cur = next;\n        }\n        long sum = 0;\n        for (long v : cur) sum = (sum + v) % 1000000007;\n        return (int) sum;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def knightDialer(self, n: int) -> int:\n        moves = [[4,6],[6,8],[7,9],[4,8],[0,3,9],[],[0,1,7],[2,6],[1,3],[2,4]]\n        cur = [1] * 10\n        MOD = 10**9 + 7\n        for _ in range(1, n):\n            nxt = [0] * 10\n            for d in range(10):\n                for nx in moves[d]:\n                    nxt[nx] = (nxt[nx] + cur[d]) % MOD\n            cur = nxt\n        return sum(cur) % MOD' },
    ],
  },

  {
    title: 'Unique Paths III',
    problemNumber: 980,
    difficulty: 'medium',
    tags: 'graph',
    pattern: 'grid-int',
    method: 'uniquePathsIII',
    description: 'You are given an `m x n` integer array `grid` where `grid[i][j]` could be:\n- `1` representing the starting square. There is exactly one starting square.\n- `2` representing the ending square. There is exactly one ending square.\n- `0` representing empty squares we can walk over.\n- `-1` representing obstacles that we cannot walk over.\n\nReturn the number of 4-directional walks from the starting square to the ending square, that walk over every non-obstacle square exactly once.\n\n**Input format:** Line 1 = rows cols, then grid rows.',
    visibleTestCases: [
      { input: '3 4\n1 0 0 0\n0 0 0 0\n0 0 2 -1', output: '2', explanation: '2 valid paths visiting all non-obstacle cells.' },
      { input: '3 4\n1 0 0 0\n0 0 0 0\n0 0 0 2', output: '4', explanation: '4 valid paths.' },
    ],
    hiddenTestCases: [
      { input: '2 2\n1 0\n0 2', output: '0' },
      { input: '1 1\n2', output: '0' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int uniquePathsIII(vector<vector<int>>& grid) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int uniquePathsIII(int[][] grid) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def uniquePathsIII(self, grid: List[List[int]]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int uniquePathsIII(vector<vector<int>>& g) {\n        int m = g.size(), n = g[0].size(), si = 0, sj = 0, cells = 0;\n        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) {\n            if (g[i][j] == 1) { si = i; sj = j; cells++; }\n            else if (g[i][j] == 2) cells++;\n            else if (g[i][j] == 0) cells++;\n        }\n        int res = 0;\n        dfs(g, si, sj, cells - 1, res);\n        return res;\n    }\nprivate:\n    void dfs(vector<vector<int>>& g, int i, int j, int rem, int& res) {\n        if (i < 0 || i >= (int)g.size() || j < 0 || j >= (int)g[0].size() || g[i][j] == -1) return;\n        if (g[i][j] == 2) { if (rem == 0) res++; return; }\n        int tmp = g[i][j];\n        g[i][j] = -1;\n        dfs(g, i+1, j, rem - 1, res);\n        dfs(g, i-1, j, rem - 1, res);\n        dfs(g, i, j+1, rem - 1, res);\n        dfs(g, i, j-1, rem - 1, res);\n        g[i][j] = tmp;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    private int res = 0;\n    public int uniquePathsIII(int[][] g) {\n        int m = g.length, n = g[0].length, si = 0, sj = 0, cells = 0;\n        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) {\n            if (g[i][j] == 1) { si = i; sj = j; cells++; }\n            else if (g[i][j] == 2) cells++;\n            else if (g[i][j] == 0) cells++;\n        }\n        dfs(g, si, sj, cells - 1);\n        return res;\n    }\n    private void dfs(int[][] g, int i, int j, int rem) {\n        if (i < 0 || i >= g.length || j < 0 || j >= g[0].length || g[i][j] == -1) return;\n        if (g[i][j] == 2) { if (rem == 0) res++; return; }\n        int tmp = g[i][j];\n        g[i][j] = -1;\n        dfs(g, i+1, j, rem - 1);\n        dfs(g, i-1, j, rem - 1);\n        dfs(g, i, j+1, rem - 1);\n        dfs(g, i, j-1, rem - 1);\n        g[i][j] = tmp;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def uniquePathsIII(self, g: List[List[int]]) -> int:\n        m, n = len(g), len(g[0])\n        si = sj = cells = 0\n        for i in range(m):\n            for j in range(n):\n                if g[i][j] == 1:\n                    si, sj = i, j\n                    cells += 1\n                elif g[i][j] == 2:\n                    cells += 1\n                elif g[i][j] == 0:\n                    cells += 1\n        self.res = 0\n        def dfs(i, j, rem):\n            if i < 0 or i >= m or j < 0 or j >= n or g[i][j] == -1:\n                return\n            if g[i][j] == 2:\n                if rem == 0:\n                    self.res += 1\n                return\n            tmp = g[i][j]\n            g[i][j] = -1\n            dfs(i+1, j, rem - 1)\n            dfs(i-1, j, rem - 1)\n            dfs(i, j+1, rem - 1)\n            dfs(i, j-1, rem - 1)\n            g[i][j] = tmp\n        dfs(si, sj, cells - 1)\n        return self.res' },
    ],
  },

  // ═══════════ HARD (4) ═══════════
  {
    title: 'Burst Balloons',
    problemNumber: 312,
    difficulty: 'hard',
    tags: 'dp',
    pattern: 'arr-int',
    method: 'maxCoins',
    description: 'You are given `n` balloons, indexed from `0` to `n - 1`. Each balloon is painted with a number on it represented by an array `nums`. You are asked to burst all the balloons.\n\nIf you burst the i-th balloon, you will get `nums[i - 1] * nums[i] * nums[i + 1]` coins. If `i - 1` or `i + 1` goes out of bounds of the array, then treat it as if there is a balloon with a `1` painted on it.\n\nReturn the maximum coins you can collect by bursting the balloons wisely.',
    visibleTestCases: [
      { input: '3 1 5 8', output: '167', explanation: 'Optimal order gives 167 coins.' },
      { input: '1 5', output: '10', explanation: 'Burst 1 first (1*1*5=5), then 5 (1*5*1=5). Total = 10.' },
    ],
    hiddenTestCases: [
      { input: '7', output: '7' },
      { input: '1 2 3', output: '12' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int maxCoins(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int maxCoins(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def maxCoins(self, nums: List[int]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int maxCoins(vector<int>& nums) {\n        vector<int> a = {1};\n        for (int n : nums) a.push_back(n);\n        a.push_back(1);\n        int n = a.size();\n        vector<vector<int>> dp(n, vector<int>(n, 0));\n        for (int len = 2; len < n; len++)\n            for (int i = 0; i + len < n; i++) {\n                int j = i + len;\n                for (int k = i + 1; k < j; k++)\n                    dp[i][j] = max(dp[i][j], dp[i][k] + a[i]*a[k]*a[j] + dp[k][j]);\n            }\n        return dp[0][n-1];\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int maxCoins(int[] nums) {\n        int[] a = new int[nums.length + 2];\n        a[0] = 1; a[a.length - 1] = 1;\n        for (int i = 0; i < nums.length; i++) a[i + 1] = nums[i];\n        int n = a.length;\n        int[][] dp = new int[n][n];\n        for (int len = 2; len < n; len++)\n            for (int i = 0; i + len < n; i++) {\n                int j = i + len;\n                for (int k = i + 1; k < j; k++)\n                    dp[i][j] = Math.max(dp[i][j], dp[i][k] + a[i]*a[k]*a[j] + dp[k][j]);\n            }\n        return dp[0][n-1];\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def maxCoins(self, nums: List[int]) -> int:\n        a = [1] + nums + [1]\n        n = len(a)\n        dp = [[0] * n for _ in range(n)]\n        for length in range(2, n):\n            for i in range(n - length):\n                j = i + length\n                for k in range(i + 1, j):\n                    dp[i][j] = max(dp[i][j], dp[i][k] + a[i]*a[k]*a[j] + dp[k][j])\n        return dp[0][n-1]' },
    ],
  },

  {
    title: 'Frog Jump',
    problemNumber: 403,
    difficulty: 'hard',
    tags: 'dp',
    pattern: 'arr-bool',
    method: 'canCross',
    description: 'A frog is crossing a river. The river is divided into some number of units, and at each unit, there may or may not exist a stone. The frog can jump on a stone, but it must not jump into the water.\n\nGiven a list of stones\' positions (in units) in sorted ascending order, determine if the frog can cross the river by landing on the last stone. Initially, the frog is on the first stone and assumes the first jump must be 1 unit.\n\nIf the frog\'s last jump was `k` units, its next jump must be either `k - 1`, `k`, or `k + 1` units. The frog can only jump in the forward direction.',
    visibleTestCases: [
      { input: '0 1 3 5 6 8 12 17', output: 'true', explanation: 'Frog can reach the last stone.' },
      { input: '0 1 2 3 4 8 9 11', output: 'false', explanation: 'Frog cannot reach the last stone.' },
    ],
    hiddenTestCases: [
      { input: '0 2', output: 'false' },
      { input: '0 1', output: 'true' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    bool canCross(vector<int>& stones) {\n        // Write your code here\n        return false;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public boolean canCross(int[] stones) {\n        // Write your code here\n        return false;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def canCross(self, stones: List[int]) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    bool canCross(vector<int>& stones) {\n        int n = stones.size();\n        vector<unordered_set<int>> dp(n);\n        dp[0].insert(0);\n        for (int i = 0; i < n; i++) {\n            for (int k : dp[i]) {\n                for (int jump = k - 1; jump <= k + 1; jump++) {\n                    if (jump <= 0) continue;\n                    int target = stones[i] + jump;\n                    int j = lower_bound(stones.begin(), stones.end(), target) - stones.begin();\n                    if (j < n && stones[j] == target) dp[j].insert(jump);\n                }\n            }\n        }\n        return !dp[n-1].empty();\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public boolean canCross(int[] stones) {\n        int n = stones.length;\n        Set<Integer>[] dp = new HashSet[n];\n        for (int i = 0; i < n; i++) dp[i] = new HashSet<>();\n        dp[0].add(0);\n        Map<Integer, Integer> pos = new HashMap<>();\n        for (int i = 0; i < n; i++) pos.put(stones[i], i);\n        for (int i = 0; i < n; i++) {\n            for (int k : dp[i]) {\n                for (int jump = k - 1; jump <= k + 1; jump++) {\n                    if (jump <= 0) continue;\n                    int target = stones[i] + jump;\n                    if (pos.containsKey(target)) dp[pos.get(target)].add(jump);\n                }\n            }\n        }\n        return !dp[n-1].isEmpty();\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def canCross(self, stones: List[int]) -> bool:\n        n = len(stones)\n        dp = [set() for _ in range(n)]\n        dp[0].add(0)\n        pos = {s: i for i, s in enumerate(stones)}\n        for i in range(n):\n            for k in dp[i]:\n                for jump in (k - 1, k, k + 1):\n                    if jump <= 0:\n                        continue\n                    target = stones[i] + jump\n                    if target in pos:\n                        dp[pos[target]].add(jump)\n        return bool(dp[n-1])' },
    ],
  },

  {
    title: 'Distinct Subsequences',
    problemNumber: 115,
    difficulty: 'hard',
    tags: 'dp',
    pattern: 'twostr-int',
    method: 'numDistinct',
    description: 'Given two strings `s` and `t`, return the number of distinct subsequences of `s` which equals `t`.\n\nThe test cases are generated so that the answer fits on a 32-bit signed integer.\n\n**Input format:** Line 1 = s, Line 2 = t.',
    visibleTestCases: [
      { input: 'rabbbit\nrabbit', output: '3', explanation: 'There are 3 ways to select "rabbit" from "rabbbit".' },
      { input: 'babgbag\nbag', output: '5', explanation: 'There are 5 ways.' },
    ],
    hiddenTestCases: [
      { input: 'aaa\naa', output: '3' },
      { input: 'abc\nabc', output: '1' },
      { input: 'a\nb', output: '0' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int numDistinct(string s, string t) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int numDistinct(String s, String t) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def numDistinct(self, s: str, t: str) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int numDistinct(string s, string t) {\n        int m = s.size(), n = t.size();\n        vector<vector<long long>> dp(m + 1, vector<long long>(n + 1, 0));\n        for (int i = 0; i <= m; i++) dp[i][0] = 1;\n        for (int i = 1; i <= m; i++) for (int j = 1; j <= n; j++) {\n            dp[i][j] = dp[i-1][j];\n            if (s[i-1] == t[j-1]) dp[i][j] += dp[i-1][j-1];\n        }\n        return (int)dp[m][n];\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int numDistinct(String s, String t) {\n        int m = s.length(), n = t.length();\n        long[][] dp = new long[m + 1][n + 1];\n        for (int i = 0; i <= m; i++) dp[i][0] = 1;\n        for (int i = 1; i <= m; i++) for (int j = 1; j <= n; j++) {\n            dp[i][j] = dp[i-1][j];\n            if (s.charAt(i-1) == t.charAt(j-1)) dp[i][j] += dp[i-1][j-1];\n        }\n        return (int) dp[m][n];\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def numDistinct(self, s: str, t: str) -> int:\n        m, n = len(s), len(t)\n        dp = [[0] * (n + 1) for _ in range(m + 1)]\n        for i in range(m + 1):\n            dp[i][0] = 1\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                dp[i][j] = dp[i-1][j]\n                if s[i-1] == t[j-1]:\n                    dp[i][j] += dp[i-1][j-1]\n        return dp[m][n]' },
    ],
  },

  {
    title: 'Cherry Pickup',
    problemNumber: 741,
    difficulty: 'hard',
    tags: 'dp',
    pattern: 'grid-int',
    method: 'cherryPickup',
    description: 'You are given an `n x n` `grid` representing a field of cherries, each cell is one of three possible integers:\n- `0` means the cell is empty, so you can pass through.\n- `1` means the cell contains a cherry that you can pick up and pass through.\n- `-1` means the cell contains a thorn that blocks your way.\n\nReturn the maximum number of cherries you can collect by following the rules below:\n- Starting at `(0, 0)`, you must travel down-right to reach `(n - 1, n - 1)`.\n- Then travel up-left to reach `(0, 0)`.\n- Each cell can be visited at most once.\n\n**Input format:** Line 1 = rows cols, then grid rows.',
        visibleTestCases: [
      { input: '3 3\n0 1 -1\n1 0 -1\n1 1 1', output: '5', explanation: 'Pick 5 cherries on optimal round trip.' },
      { input: '2 2\n1 1\n1 1', output: '4', explanation: 'Round trip visits all 4 cells exactly once, collecting 4 cherries.' },
    ],
    hiddenTestCases: [
      { input: '2 2\n1 1\n1 1', output: '4' },
      { input: '3 3\n1 1 -1\n1 -1 1\n-1 1 1', output: '0' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int cherryPickup(vector<vector<int>>& grid) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int cherryPickup(int[][] grid) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def cherryPickup(self, grid: List[List[int]]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int cherryPickup(vector<vector<int>>& g) {\n        int n = g.size();\n        vector<vector<vector<int>>> memo(n, vector<vector<int>>(n, vector<int>(n, INT_MIN)));\n        int r = dfs(g, 0, 0, 0, memo);\n        return max(0, r);\n    }\nprivate:\n    int dfs(vector<vector<int>>& g, int i1, int j1, int i2, vector<vector<vector<int>>>& memo) {\n        int n = g.size(), j2 = i1 + j1 - i2;\n        if (i1 >= n || i2 >= n || j1 >= n || j2 >= n || g[i1][j1] == -1 || g[i2][j2] == -1) return INT_MIN;\n        if (i1 == n-1 && j1 == n-1) return g[i1][j1];\n        if (memo[i1][j1][i2] != INT_MIN) return memo[i1][j1][i2];\n        int val = g[i1][j1] + (i1 != i2 || j1 != j2 ? g[i2][j2] : 0);\n        int best = max({dfs(g, i1+1, j1, i2+1, memo), dfs(g, i1+1, j1, i2, memo), dfs(g, i1, j1+1, i2+1, memo), dfs(g, i1, j1+1, i2, memo)});\n        if (best == INT_MIN) return memo[i1][j1][i2] = INT_MIN;\n        return memo[i1][j1][i2] = val + best;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int cherryPickup(int[][] g) {\n        int n = g.length;\n        int[][][] memo = new int[n][n][n];\n        for (int[][] a : memo) for (int[] b : a) Arrays.fill(b, Integer.MIN_VALUE);\n        int r = dfs(g, 0, 0, 0, memo);\n        return Math.max(0, r);\n    }\n    private int dfs(int[][] g, int i1, int j1, int i2, int[][][] memo) {\n        int n = g.length, j2 = i1 + j1 - i2;\n        if (i1 >= n || i2 >= n || j1 >= n || j2 >= n || g[i1][j1] == -1 || g[i2][j2] == -1) return Integer.MIN_VALUE;\n        if (i1 == n-1 && j1 == n-1) return g[i1][j1];\n        if (memo[i1][j1][i2] != Integer.MIN_VALUE) return memo[i1][j1][i2];\n        int val = g[i1][j1] + (i1 != i2 || j1 != j2 ? g[i2][j2] : 0);\n        int best = Math.max(Math.max(dfs(g, i1+1, j1, i2+1, memo), dfs(g, i1+1, j1, i2, memo)), Math.max(dfs(g, i1, j1+1, i2+1, memo), dfs(g, i1, j1+1, i2, memo)));\n        if (best == Integer.MIN_VALUE) return memo[i1][j1][i2] = Integer.MIN_VALUE;\n        return memo[i1][j1][i2] = val + best;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def cherryPickup(self, g: List[List[int]]) -> int:\n        n = len(g)\n        from functools import lru_cache\n        @lru_cache(maxsize=None)\n        def dfs(i1, j1, i2):\n            j2 = i1 + j1 - i2\n            if i1 >= n or i2 >= n or j1 >= n or j2 >= n or g[i1][j1] == -1 or g[i2][j2] == -1:\n                return float(\'-inf\')\n            if i1 == n-1 and j1 == n-1:\n                return g[i1][j1]\n            val = g[i1][j1] + (g[i2][j2] if (i1, j1) != (i2, j2) else 0)\n            best = max(dfs(i1+1, j1, i2+1), dfs(i1+1, j1, i2), dfs(i1, j1+1, i2+1), dfs(i1, j1+1, i2))\n            return val + best\n        r = dfs(0, 0, 0)\n        return max(0, r)' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function main() {
  try {
    console.log(`🔐 Logging in as ${ADMIN_EMAIL}...`);
    const loginRes = await axios.post(`${BACKEND_URL}/user/login`, {
      emailId: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    const cookies = loginRes.headers['set-cookie'];
    if (!cookies) throw new Error('Login failed');
    const client = axios.create({ headers: { Cookie: cookies } });
    console.log('✅ Logged in\n');

    const problemsWithHarnesses = problemsData.map((p) => ({
      title: p.title,
      problemNumber: p.problemNumber,
      description: p.description,
      difficulty: p.difficulty,
      tags: p.tags,
      visibleTestCases: p.visibleTestCases,
      hiddenTestCases: p.hiddenTestCases,
      startCode: p.startCode,
      referenceSolution: p.referenceSolution,
      testHarness: [
        { language: 'C++', harnessCode: buildCppHarness(p.pattern, p.method) },
        { language: 'Java', harnessCode: buildJavaHarness(p.pattern, p.method) },
        { language: 'Python', harnessCode: buildPyHarness(p.pattern, p.method) },
      ],
    }));

    console.log('📋 Loading existing problems...');
    const { data: allProblems } = await client.get(`${BACKEND_URL}/problem/getAllProblem`);
    const existingByTitle = new Map();
    (allProblems || []).forEach((p) => existingByTitle.set(p.title, p));
    console.log(`   ${existingByTitle.size} problems in DB\n`);

    let updated = 0, created = 0, skipped = 0, failed = 0;
    const failures = [];

    for (const p of problemsWithHarnesses) {
      const existing = existingByTitle.get(p.title);

      if (existing) {
        try {
          const adminRes = await client.get(`${BACKEND_URL}/problem/admin/${existing._id}`);
          const existingFull = adminRes.data;
          if (
            Array.isArray(existingFull.testHarness) && existingFull.testHarness.length >= 3 &&
            Array.isArray(existingFull.visibleTestCases) && existingFull.visibleTestCases.length > 0
          ) {
            console.log(`⏭️  Skipping "${p.title}" (already runnable)`);
            skipped++;
            continue;
          }
          await client.put(`${BACKEND_URL}/problem/update/${existing._id}`, {
            ...existingFull,
            problemNumber: p.problemNumber,
            difficulty: p.difficulty,
            tags: p.tags,
            startCode: p.startCode,
            visibleTestCases: p.visibleTestCases,
            hiddenTestCases: p.hiddenTestCases,
            referenceSolution: p.referenceSolution,
            testHarness: p.testHarness,
          });
          console.log(`✅ Updated "${p.title}" (#${p.problemNumber})`);
          updated++;
        } catch (err) {
          const msg = err.response?.data?.error || err.message;
          console.error(`❌ Failed to update "${p.title}": ${msg}\n`);
          failures.push({ title: p.title, error: msg });
          failed++;
        }
      } else {
        try {
          await client.post(`${BACKEND_URL}/problem/create`, p);
          console.log(`✅ Created "${p.title}" (#${p.problemNumber})\n`);
          created++;
        } catch (err) {
          const msg = err.response?.data?.error || err.message;
          console.error(`❌ Failed to create "${p.title}": ${msg}\n`);
          failures.push({ title: p.title, error: msg });
          failed++;
        }
      }

      await new Promise((r) => setTimeout(r, 6000));
    }

    console.log('─'.repeat(60));
    console.log(`🎉 DP/Graph batch 2 complete`);
    console.log(`   ✅ Created:    ${created}`);
    console.log(`   🔄 Updated:    ${updated}`);
    console.log(`   ⏭️  Skipped:   ${skipped}`);
    console.log(`   ❌ Failed:     ${failed}`);
    if (failures.length > 0) {
      console.log('\n   Failures:');
      failures.forEach((f) => console.log(`      - ${f.title}: ${f.error}`));
    }
  } catch (err) {
    console.error('❌ Fatal:', err.message);
  }
}

main();