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

const READERS = {
  cpp: {
    'arr+int': `string line; getline(cin, line);
    stringstream ss(line); vector<int> arr; int x;
    while (ss >> x) arr.push_back(x);
    int k; cin >> k;`,
    'arr': `string line; getline(cin, line);
    stringstream ss(line); vector<int> arr; int x;
    while (ss >> x) arr.push_back(x);`,
    'str': `string s; getline(cin, s);`,
  },
  java: {
    'arr+int': `String[] parts = sc.nextLine().trim().split("\\\\s+");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i]);
        int k = Integer.parseInt(sc.nextLine().trim());`,
    'arr': `String[] parts = sc.nextLine().trim().split("\\\\s+");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i]);`,
    'str': `String s = sc.nextLine();`,
  },
  python: {
    'arr+int': `lines = sys.stdin.read().strip().split('\\n')
    arr = list(map(int, lines[0].split()))
    k = int(lines[1].strip())`,
    'arr': `arr = list(map(int, sys.stdin.read().strip().split()))`,
    'str': `s = sys.stdin.read().rstrip('\\n')`,
  },
};

const ARGS = {
  'arr+int': 'arr, k',
  'arr': 'arr',
  'str': 's',
};

function buildCppHarness(pattern, output, method) {
  const reader = READERS.cpp[pattern];
  const args = ARGS[pattern];
  const out = {
    'int': `cout << sol.${method}(${args}) << endl;`,
    'bool': `cout << (sol.${method}(${args}) ? "true" : "false") << endl;`,
    'str': `cout << sol.${method}(${args}) << endl;`,
    'arr': `vector<int> r = sol.${method}(${args}); for (size_t i = 0; i < r.size(); i++) { if (i) cout << " "; cout << r[i]; } cout << endl;`,
    'int-arr': `vector<int> r = sol.${method}(${args}); for (size_t i = 0; i < r.size(); i++) { if (i) cout << " "; cout << r[i]; } cout << endl;`,
  }[output];
  return `#include <bits/stdc++.h>
using namespace std;

{{USER_CODE}}

int main() {
    ${reader}
    Solution sol;
    ${out}
    return 0;
}`;
}

function buildJavaHarness(pattern, output, method) {
  const reader = READERS.java[pattern];
  const args = ARGS[pattern];
  const out = {
    'int': `System.out.println(new Solution().${method}(${args}));`,
    'bool': `System.out.println(new Solution().${method}(${args}) ? "true" : "false");`,
    'str': `System.out.println(new Solution().${method}(${args}));`,
    'arr': `List<Integer> r = new Solution().${method}(${args}); StringBuilder sb = new StringBuilder(); for (int i = 0; i < r.size(); i++) { if (i > 0) sb.append(" "); sb.append(r.get(i)); } System.out.println(sb.toString());`,
    'int-arr': `int[] r = new Solution().${method}(${args}); StringBuilder sb = new StringBuilder(); for (int i = 0; i < r.length; i++) { if (i > 0) sb.append(" "); sb.append(r[i]); } System.out.println(sb.toString());`,
  }[output];
  return `import java.util.*;
import java.util.stream.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        ${reader}
        ${out}
    }
}`;
}

function buildPyHarness(pattern, output, method) {
  const reader = READERS.python[pattern];
  const args = ARGS[pattern];
  const out = {
    'int': `print(Solution().${method}(${args}))`,
    'bool': `print("true" if Solution().${method}(${args}) else "false")`,
    'str': `print(Solution().${method}(${args}))`,
    'arr': `r = Solution().${method}(${args}); print(' '.join(map(str, r)))`,
    'int-arr': `r = Solution().${method}(${args}); print(' '.join(map(str, r)))`,
  }[output];
  return `import sys
from typing import List
from collections import deque, defaultdict

{{USER_CODE}}

def main():
    ${reader}
    ${out}

if __name__ == "__main__":
    main()`;
}

// ─────────────────────────────────────────────────────────────
// PROBLEMS — 10 Medium + 5 Hard
// ─────────────────────────────────────────────────────────────

const problemsData = [
  // ═══════════ MEDIUM ═══════════

  // 1. Continuous Subarray Sum (#523)
  {
    title: 'Continuous Subarray Sum',
    problemNumber: 523,
    difficulty: 'medium',
    tags: 'hashMap',
    pattern: 'arr+int', output: 'bool', method: 'checkSubarraySum',
    description: 'Given an integer array `nums` and an integer `k`, return `true` if `nums` has a good subarray, or `false` otherwise.\n\nA good subarray is a subarray where:\n- Its length is at least two, and\n- The sum of the elements of the subarray is a multiple of `k`.\n\n**Input format:** Line 1 = nums, Line 2 = k.',
    visibleTestCases: [
      { input: '23 2 4 6 7\n6', output: 'true', explanation: 'Subarray [2,4] sums to 6 (multiple of 6).' },
      { input: '23 2 6 4 7\n13', output: 'false', explanation: 'No subarray of length ≥ 2 sums to a multiple of 13.' },
    ],
    hiddenTestCases: [
      { input: '1 2 3\n5', output: 'true' },
      { input: '1 2\n5', output: 'false' },
      { input: '5 0 0 0\n3', output: 'true' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    bool checkSubarraySum(vector<int>& nums, int k) {\n        // Write your code here\n        return false;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public boolean checkSubarraySum(int[] nums, int k) {\n        // Write your code here\n        return false;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def checkSubarraySum(self, nums: List[int], k: int) -> bool:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    bool checkSubarraySum(vector<int>& nums, int k) {\n        unordered_map<int,int> mp;\n        mp[0] = -1;\n        int sum = 0;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            sum += nums[i];\n            int mod = ((sum % k) + k) % k;\n            if (mp.count(mod)) { if (i - mp[mod] >= 2) return true; }\n            else mp[mod] = i;\n        }\n        return false;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public boolean checkSubarraySum(int[] nums, int k) {\n        Map<Integer, Integer> mp = new HashMap<>();\n        mp.put(0, -1);\n        int sum = 0;\n        for (int i = 0; i < nums.length; i++) {\n            sum += nums[i];\n            int mod = ((sum % k) + k) % k;\n            if (mp.containsKey(mod)) { if (i - mp.get(mod) >= 2) return true; }\n            else mp.put(mod, i);\n        }\n        return false;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def checkSubarraySum(self, nums: List[int], k: int) -> bool:\n        mp = {0: -1}\n        s = 0\n        for i, n in enumerate(nums):\n            s += n\n            mod = ((s % k) + k) % k\n            if mod in mp:\n                if i - mp[mod] >= 2:\n                    return True\n            else:\n                mp[mod] = i\n        return False' },
    ],
  },

  // 2. 3Sum Closest (#16)
  {
    title: '3Sum Closest',
    problemNumber: 16,
    difficulty: 'medium',
    tags: 'twoPointers',
    pattern: 'arr+int', output: 'int', method: 'threeSumClosest',
    description: 'Given an integer array `nums` of `n` integers and an integer `target`, find three integers in `nums` such that the sum is closest to `target`.\n\nReturn the sum of the three integers.\n\n**Input format:** Line 1 = nums, Line 2 = target.',
    visibleTestCases: [
      { input: '-1 2 1 -4\n1', output: '2', explanation: 'Closest sum is -1 + 2 + 1 = 2.' },
      { input: '0 0 0\n1', output: '0', explanation: 'Only sum is 0.' },
    ],
    hiddenTestCases: [
      { input: '1 1 1 0\n-100', output: '2' },
      { input: '1 2 3\n6', output: '6' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int threeSumClosest(vector<int>& nums, int target) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int threeSumClosest(int[] nums, int target) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def threeSumClosest(self, nums: List[int], target: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int threeSumClosest(vector<int>& nums, int target) {\n        sort(nums.begin(), nums.end());\n        int best = nums[0] + nums[1] + nums[2];\n        int n = nums.size();\n        for (int i = 0; i < n - 2; i++) {\n            int l = i + 1, r = n - 1;\n            while (l < r) {\n                int s = nums[i] + nums[l] + nums[r];\n                if (abs(s - target) < abs(best - target)) best = s;\n                if (s < target) l++;\n                else if (s > target) r--;\n                else return target;\n            }\n        }\n        return best;\n    }\n};' },
      { language: 'Java', completeCode: 'import java.util.*;\n\nclass Solution {\n    public int threeSumClosest(int[] nums, int target) {\n        Arrays.sort(nums);\n        int best = nums[0] + nums[1] + nums[2];\n        int n = nums.length;\n        for (int i = 0; i < n - 2; i++) {\n            int l = i + 1, r = n - 1;\n            while (l < r) {\n                int s = nums[i] + nums[l] + nums[r];\n                if (Math.abs(s - target) < Math.abs(best - target)) best = s;\n                if (s < target) l++;\n                else if (s > target) r--;\n                else return target;\n            }\n        }\n        return best;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def threeSumClosest(self, nums: List[int], target: int) -> int:\n        nums.sort()\n        best = nums[0] + nums[1] + nums[2]\n        n = len(nums)\n        for i in range(n - 2):\n            l, r = i + 1, n - 1\n            while l < r:\n                s = nums[i] + nums[l] + nums[r]\n                if abs(s - target) < abs(best - target):\n                    best = s\n                if s < target:\n                    l += 1\n                elif s > target:\n                    r -= 1\n                else:\n                    return target\n        return best' },
    ],
  },

  // 3. Fruit Into Baskets (#904)
  {
    title: 'Fruit Into Baskets',
    problemNumber: 904,
    difficulty: 'medium',
    tags: 'slidingWindow',
    pattern: 'arr', output: 'int', method: 'totalFruit',
    description: 'You are visiting a farm with a single row of fruit trees. The trees are represented by an integer array `fruits`.\n\nYou have two baskets, each can hold only one type of fruit. Starting from any tree, you must pick exactly one fruit per tree while moving right. Return the maximum number of fruits you can pick.',
    visibleTestCases: [
      { input: '1 2 1', output: '3', explanation: 'All fruits fit in 2 baskets.' },
      { input: '0 1 2 2', output: '3', explanation: 'Pick trees 1-3 (values 1,2,2).' },
    ],
    hiddenTestCases: [
      { input: '1 2 3 2 2', output: '4' },
      { input: '3 3 3 1 2 1 1 2 3 3 4', output: '5' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int totalFruit(vector<int>& fruits) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int totalFruit(int[] fruits) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def totalFruit(self, fruits: List[int]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int totalFruit(vector<int>& f) {\n        unordered_map<int,int> cnt;\n        int l = 0, best = 0;\n        for (int r = 0; r < (int)f.size(); r++) {\n            cnt[f[r]]++;\n            while ((int)cnt.size() > 2) {\n                if (--cnt[f[l]] == 0) cnt.erase(f[l]);\n                l++;\n            }\n            best = max(best, r - l + 1);\n        }\n        return best;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int totalFruit(int[] f) {\n        Map<Integer, Integer> cnt = new HashMap<>();\n        int l = 0, best = 0;\n        for (int r = 0; r < f.length; r++) {\n            cnt.merge(f[r], 1, Integer::sum);\n            while (cnt.size() > 2) {\n                if (cnt.merge(f[l], -1, Integer::sum) == 0) cnt.remove(f[l]);\n                l++;\n            }\n            best = Math.max(best, r - l + 1);\n        }\n        return best;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def totalFruit(self, f: List[int]) -> int:\n        cnt = {}\n        l = 0\n        best = 0\n        for r in range(len(f)):\n            cnt[f[r]] = cnt.get(f[r], 0) + 1\n            while len(cnt) > 2:\n                cnt[f[l]] -= 1\n                if cnt[f[l]] == 0:\n                    del cnt[f[l]]\n                l += 1\n            best = max(best, r - l + 1)\n        return best' },
    ],
  },

  // 4. Subarray Product Less Than K (#713)
  {
    title: 'Subarray Product Less Than K',
    problemNumber: 713,
    difficulty: 'medium',
    tags: 'slidingWindow',
    pattern: 'arr+int', output: 'int', method: 'numSubarrayProductLessThanK',
    description: 'Given an array of integers `nums` and an integer `k`, return the number of subarrays where the product of all the elements in the subarray is strictly less than `k`.\n\n**Input format:** Line 1 = nums, Line 2 = k.',
    visibleTestCases: [
      { input: '10 5 2 6\n100', output: '8', explanation: '8 subarrays have product < 100.' },
      { input: '1 2 3\n0', output: '0', explanation: 'No product can be < 0.' },
    ],
    hiddenTestCases: [
      { input: '1 1 1\n2', output: '6' },
      { input: '1 2 3\n100', output: '6' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int numSubarrayProductLessThanK(vector<int>& nums, int k) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int numSubarrayProductLessThanK(int[] nums, int k) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def numSubarrayProductLessThanK(self, nums: List[int], k: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int numSubarrayProductLessThanK(vector<int>& nums, int k) {\n        if (k <= 1) return 0;\n        long prod = 1;\n        int l = 0, cnt = 0;\n        for (int r = 0; r < (int)nums.size(); r++) {\n            prod *= nums[r];\n            while (prod >= k) { prod /= nums[l]; l++; }\n            cnt += r - l + 1;\n        }\n        return cnt;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int numSubarrayProductLessThanK(int[] nums, int k) {\n        if (k <= 1) return 0;\n        long prod = 1;\n        int l = 0, cnt = 0;\n        for (int r = 0; r < nums.length; r++) {\n            prod *= nums[r];\n            while (prod >= k) { prod /= nums[l]; l++; }\n            cnt += r - l + 1;\n        }\n        return cnt;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def numSubarrayProductLessThanK(self, nums: List[int], k: int) -> int:\n        if k <= 1:\n            return 0\n        prod = 1\n        l = 0\n        cnt = 0\n        for r in range(len(nums)):\n            prod *= nums[r]\n            while prod >= k:\n                prod //= nums[l]\n                l += 1\n            cnt += r - l + 1\n        return cnt' },
    ],
  },

  // 5. Sum of Subarray Minimums (#907)
  {
    title: 'Sum of Subarray Minimums',
    problemNumber: 907,
    difficulty: 'medium',
    tags: 'stack',
    pattern: 'arr', output: 'int', method: 'sumSubarrayMins',
    description: 'Given an array of integers `arr`, find the sum of `min(b)`, where `b` ranges over every (contiguous) subarray of `arr`.\n\nSince the answer may be large, return the answer modulo 10^9 + 7. For the test cases here, the answer will not exceed the modulo.',
    visibleTestCases: [
      { input: '3 1 2 4', output: '17', explanation: 'Subarrays and their minimums sum to 17.' },
      { input: '11 81 94 43 3', output: '444', explanation: 'Sum of all subarray minimums.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '1' },
      { input: '1 1', output: '3' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int sumSubarrayMins(vector<int>& arr) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int sumSubarrayMins(int[] arr) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def sumSubarrayMins(self, arr: List[int]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int sumSubarrayMins(vector<int>& arr) {\n        int n = arr.size(), mod = 1e9 + 7;\n        vector<int> left(n), right(n);\n        stack<int> s;\n        for (int i = 0; i < n; i++) {\n            while (!s.empty() && arr[s.top()] > arr[i]) s.pop();\n            left[i] = s.empty() ? -1 : s.top();\n            s.push(i);\n        }\n        while (!s.empty()) s.pop();\n        for (int i = n - 1; i >= 0; i--) {\n            while (!s.empty() && arr[s.top()] >= arr[i]) s.pop();\n            right[i] = s.empty() ? n : s.top();\n            s.push(i);\n        }\n        long res = 0;\n        for (int i = 0; i < n; i++) {\n            res = (res + (long)arr[i] * (i - left[i]) * (right[i] - i)) % mod;\n        }\n        return (int)res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int sumSubarrayMins(int[] arr) {\n        int n = arr.length, mod = 1_000_000_007;\n        int[] left = new int[n], right = new int[n];\n        Deque<Integer> st = new ArrayDeque<>();\n        for (int i = 0; i < n; i++) {\n            while (!st.isEmpty() && arr[st.peek()] > arr[i]) st.pop();\n            left[i] = st.isEmpty() ? -1 : st.peek();\n            st.push(i);\n        }\n        st.clear();\n        for (int i = n - 1; i >= 0; i--) {\n            while (!st.isEmpty() && arr[st.peek()] >= arr[i]) st.pop();\n            right[i] = st.isEmpty() ? n : st.peek();\n            st.push(i);\n        }\n        long res = 0;\n        for (int i = 0; i < n; i++) {\n            res = (res + (long) arr[i] * (i - left[i]) * (right[i] - i)) % mod;\n        }\n        return (int) res;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def sumSubarrayMins(self, arr: List[int]) -> int:\n        MOD = 10**9 + 7\n        n = len(arr)\n        left = [0] * n\n        right = [0] * n\n        st = []\n        for i in range(n):\n            while st and arr[st[-1]] > arr[i]:\n                st.pop()\n            left[i] = st[-1] if st else -1\n            st.append(i)\n        st = []\n        for i in range(n - 1, -1, -1):\n            while st and arr[st[-1]] >= arr[i]:\n                st.pop()\n            right[i] = st[-1] if st else n\n            st.append(i)\n        res = 0\n        for i in range(n):\n            res = (res + arr[i] * (i - left[i]) * (right[i] - i)) % MOD\n        return res' },
    ],
  },

  // 6. Find All Duplicates in an Array (#442)
  {
    title: 'Find All Duplicates in an Array',
    problemNumber: 442,
    difficulty: 'medium',
    tags: 'array',
    pattern: 'arr', output: 'arr', method: 'findDuplicates',
    description: 'Given an integer array `nums` of length `n` where all the integers are in the range `[1, n]` and each integer appears once or twice, return an array of all the integers that appears twice.\n\nYou must write an algorithm that runs in O(n) time and uses only constant auxiliary space.',
    visibleTestCases: [
      { input: '4 3 2 7 8 2 3 1', output: '2 3', explanation: '2 and 3 each appear twice.' },
      { input: '1 1 2', output: '1', explanation: '1 appears twice.' },
    ],
    hiddenTestCases: [
      { input: '1 1', output: '1' },
      { input: '1 1 3 3', output: '1 3' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<int> findDuplicates(vector<int>& nums) {\n        // Write your code here\n        return {};\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public List<Integer> findDuplicates(int[] nums) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def findDuplicates(self, nums: List[int]) -> List[int]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    vector<int> findDuplicates(vector<int>& nums) {\n        vector<int> res;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            int idx = abs(nums[i]) - 1;\n            if (nums[idx] < 0) res.push_back(idx + 1);\n            else nums[idx] = -nums[idx];\n        }\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'import java.util.*;\n\nclass Solution {\n    public List<Integer> findDuplicates(int[] nums) {\n        List<Integer> res = new ArrayList<>();\n        for (int i = 0; i < nums.length; i++) {\n            int idx = Math.abs(nums[i]) - 1;\n            if (nums[idx] < 0) res.add(idx + 1);\n            else nums[idx] = -nums[idx];\n        }\n        return res;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def findDuplicates(self, nums: List[int]) -> List[int]:\n        res = []\n        for i in range(len(nums)):\n            idx = abs(nums[i]) - 1\n            if nums[idx] < 0:\n                res.append(idx + 1)\n            else:\n                nums[idx] = -nums[idx]\n        return res' },
    ],
  },

  // 7. Maximum Erasure Value (#1695)
  {
    title: 'Maximum Erasure Value',
    problemNumber: 1695,
    difficulty: 'medium',
    tags: 'slidingWindow',
    pattern: 'arr', output: 'int', method: 'maximumUniqueSubarray',
    description: 'You are given an array of positive integers `nums` and want to erase a subarray containing unique elements. Return the maximum score you can get by erasing exactly one subarray.\n\nA subarray is a contiguous subsequence of the original array.',
    visibleTestCases: [
      { input: '4 2 4 5 6', output: '17', explanation: 'Erase [2,4,5,6] to get score 17.' },
      { input: '5 2 1 2 5 2 1 2 5', output: '8', explanation: 'Erase [5,2,1] to get 8.' },
    ],
    hiddenTestCases: [
      { input: '1 2 3 4 5', output: '15' },
      { input: '1', output: '1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int maximumUniqueSubarray(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int maximumUniqueSubarray(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def maximumUniqueSubarray(self, nums: List[int]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int maximumUniqueSubarray(vector<int>& nums) {\n        unordered_set<int> s;\n        int l = 0, cur = 0, best = 0;\n        for (int r = 0; r < (int)nums.size(); r++) {\n            while (s.count(nums[r])) { s.erase(nums[l]); cur -= nums[l]; l++; }\n            s.insert(nums[r]); cur += nums[r];\n            best = max(best, cur);\n        }\n        return best;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int maximumUniqueSubarray(int[] nums) {\n        Set<Integer> s = new HashSet<>();\n        int l = 0, cur = 0, best = 0;\n        for (int r = 0; r < nums.length; r++) {\n            while (s.contains(nums[r])) { s.remove(nums[l]); cur -= nums[l]; l++; }\n            s.add(nums[r]); cur += nums[r];\n            best = Math.max(best, cur);\n        }\n        return best;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def maximumUniqueSubarray(self, nums: List[int]) -> int:\n        s = set()\n        l = 0\n        cur = 0\n        best = 0\n        for r in range(len(nums)):\n            while nums[r] in s:\n                s.remove(nums[l])\n                cur -= nums[l]\n                l += 1\n            s.add(nums[r])\n            cur += nums[r]\n            best = max(best, cur)\n        return best' },
    ],
  },

  // 8. Maximum Points You Can Obtain from Cards (#1423)
  {
    title: 'Maximum Points You Can Obtain from Cards',
    problemNumber: 1423,
    difficulty: 'medium',
    tags: 'slidingWindow',
    pattern: 'arr+int', output: 'int', method: 'maxScore',
    description: 'There are several cards arranged in a row, and each card has an associated number of points. The points are given in the integer array `cardPoints`.\n\nIn one step, you can take one card from the beginning or from the end of the row. You have to take exactly `k` cards.\n\nYour score is the sum of the points of the cards you have taken. Return the maximum score.\n\n**Input format:** Line 1 = cardPoints, Line 2 = k.',
    visibleTestCases: [
      { input: '1 2 3 4 5 6 1\n3', output: '12', explanation: 'Take 5, 6, 1 from the end.' },
      { input: '2 2 2\n2', output: '4', explanation: 'Take 2 cards from either end.' },
    ],
    hiddenTestCases: [
      { input: '9 7 7 9 7 7 9\n7', output: '55' },
      { input: '1 1000 1\n1', output: '1000' },
      { input: '1 79 80 1 1 1 200 1\n3', output: '202' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int maxScore(vector<int>& cardPoints, int k) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int maxScore(int[] cardPoints, int k) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def maxScore(self, cardPoints: List[int], k: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int maxScore(vector<int>& c, int k) {\n        int n = c.size(), total = 0;\n        for (int x : c) total += x;\n        int window = 0;\n        for (int i = 0; i < n - k; i++) window += c[i];\n        int minWindow = window;\n        for (int i = n - k; i < n; i++) {\n            window += c[i] - c[i - (n - k)];\n            minWindow = min(minWindow, window);\n        }\n        if (k == n) return total;\n        return total - minWindow;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int maxScore(int[] c, int k) {\n        int n = c.length, total = 0;\n        for (int x : c) total += x;\n        if (k == n) return total;\n        int window = 0;\n        for (int i = 0; i < n - k; i++) window += c[i];\n        int minWindow = window;\n        for (int i = n - k; i < n; i++) {\n            window += c[i] - c[i - (n - k)];\n            minWindow = Math.min(minWindow, window);\n        }\n        return total - minWindow;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def maxScore(self, c: List[int], k: int) -> int:\n        n = len(c)\n        total = sum(c)\n        if k == n:\n            return total\n        window = sum(c[:n-k])\n        min_window = window\n        for i in range(n - k, n):\n            window += c[i] - c[i - (n - k)]\n            min_window = min(min_window, window)\n        return total - min_window' },
    ],
  },

  // 9. Longest Continuous Subarray with Abs Diff ≤ Limit (#1438)
  {
    title: 'Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit',
    problemNumber: 1438,
    difficulty: 'medium',
    tags: 'slidingWindow',
    pattern: 'arr+int', output: 'int', method: 'longestSubarray',
    description: 'Given an array of integers `nums` and an integer `limit`, return the size of the longest non-empty subarray such that the absolute difference between any two elements of this subarray is less than or equal to `limit`.\n\n**Input format:** Line 1 = nums, Line 2 = limit.',
    visibleTestCases: [
      { input: '8 2 4 7\n4', output: '2', explanation: 'Subarrays [2,4] or [4,7] with diff 4.' },
      { input: '10 1 2 4 7 2\n5', output: '4', explanation: '[2,4,7,2] has max=7, min=2, diff 5.' },
    ],
    hiddenTestCases: [
      { input: '4 2 2 2 4 4 2 2\n0', output: '3' },
      { input: '1 5 6\n3', output: '2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int longestSubarray(vector<int>& nums, int limit) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int longestSubarray(int[] nums, int limit) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def longestSubarray(self, nums: List[int], limit: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int longestSubarray(vector<int>& nums, int limit) {\n        deque<int> maxQ, minQ;\n        int l = 0, best = 0;\n        for (int r = 0; r < (int)nums.size(); r++) {\n            while (!maxQ.empty() && nums[maxQ.back()] < nums[r]) maxQ.pop_back();\n            maxQ.push_back(r);\n            while (!minQ.empty() && nums[minQ.back()] > nums[r]) minQ.pop_back();\n            minQ.push_back(r);\n            while (nums[maxQ.front()] - nums[minQ.front()] > limit) {\n                if (maxQ.front() == l) maxQ.pop_front();\n                if (minQ.front() == l) minQ.pop_front();\n                l++;\n            }\n            best = max(best, r - l + 1);\n        }\n        return best;\n    }\n};' },
      { language: 'Java', completeCode: 'import java.util.*;\n\nclass Solution {\n    public int longestSubarray(int[] nums, int limit) {\n        Deque<Integer> maxQ = new ArrayDeque<>(), minQ = new ArrayDeque<>();\n        int l = 0, best = 0;\n        for (int r = 0; r < nums.length; r++) {\n            while (!maxQ.isEmpty() && nums[maxQ.peekLast()] < nums[r]) maxQ.pollLast();\n            maxQ.offerLast(r);\n            while (!minQ.isEmpty() && nums[minQ.peekLast()] > nums[r]) minQ.pollLast();\n            minQ.offerLast(r);\n            while (nums[maxQ.peekFirst()] - nums[minQ.peekFirst()] > limit) {\n                if (maxQ.peekFirst() == l) maxQ.pollFirst();\n                if (minQ.peekFirst() == l) minQ.pollFirst();\n                l++;\n            }\n            best = Math.max(best, r - l + 1);\n        }\n        return best;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def longestSubarray(self, nums: List[int], limit: int) -> int:\n        max_q = deque()\n        min_q = deque()\n        l = 0\n        best = 0\n        for r in range(len(nums)):\n            while max_q and nums[max_q[-1]] < nums[r]:\n                max_q.pop()\n            max_q.append(r)\n            while min_q and nums[min_q[-1]] > nums[r]:\n                min_q.pop()\n            min_q.append(r)\n            while nums[max_q[0]] - nums[min_q[0]] > limit:\n                if max_q[0] == l:\n                    max_q.popleft()\n                if min_q[0] == l:\n                    min_q.popleft()\n                l += 1\n            best = max(best, r - l + 1)\n        return best' },
    ],
  },

  // 10. Shortest Unsorted Continuous Subarray (#581)
  {
    title: 'Shortest Unsorted Continuous Subarray',
    problemNumber: 581,
    difficulty: 'medium',
    tags: 'array',
    pattern: 'arr', output: 'int', method: 'findUnsortedSubarray',
    description: 'Given an integer array `nums`, you need to find one continuous subarray such that if you only sort this subarray in non-decreasing order, then the whole array will be sorted in non-decreasing order.\n\nReturn the shortest such subarray and output its length.',
    visibleTestCases: [
      { input: '2 6 4 8 10 9 15', output: '5', explanation: 'Sorting [6,4,8,10,9] makes the whole array sorted.' },
      { input: '1 2 3 4', output: '0', explanation: 'Already sorted.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '0' },
      { input: '1 3 2 4 5', output: '2' },
      { input: '5 4 3 2 1', output: '5' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int findUnsortedSubarray(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int findUnsortedSubarray(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def findUnsortedSubarray(self, nums: List[int]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int findUnsortedSubarray(vector<int>& nums) {\n        int n = nums.size();\n        int l = -1, r = -1;\n        int mx = INT_MIN;\n        for (int i = 0; i < n; i++) {\n            if (nums[i] < mx) r = i;\n            mx = max(mx, nums[i]);\n        }\n        int mn = INT_MAX;\n        for (int i = n - 1; i >= 0; i--) {\n            if (nums[i] > mn) l = i;\n            mn = min(mn, nums[i]);\n        }\n        return r < 0 ? 0 : r - l + 1;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int findUnsortedSubarray(int[] nums) {\n        int n = nums.length, l = -1, r = -1, mx = Integer.MIN_VALUE;\n        for (int i = 0; i < n; i++) {\n            if (nums[i] < mx) r = i;\n            mx = Math.max(mx, nums[i]);\n        }\n        int mn = Integer.MAX_VALUE;\n        for (int i = n - 1; i >= 0; i--) {\n            if (nums[i] > mn) l = i;\n            mn = Math.min(mn, nums[i]);\n        }\n        return r < 0 ? 0 : r - l + 1;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def findUnsortedSubarray(self, nums: List[int]) -> int:\n        n = len(nums)\n        l, r = -1, -1\n        mx = float(\'-inf\')\n        for i in range(n):\n            if nums[i] < mx:\n                r = i\n            mx = max(mx, nums[i])\n        mn = float(\'inf\')\n        for i in range(n - 1, -1, -1):\n            if nums[i] > mn:\n                l = i\n            mn = min(mn, nums[i])\n        return 0 if r < 0 else r - l + 1' },
    ],
  },

  // ═══════════ HARD ═══════════

  // 11. Sliding Window Maximum (#239)
  {
    title: 'Sliding Window Maximum',
    problemNumber: 239,
    difficulty: 'hard',
    tags: 'slidingWindow',
    pattern: 'arr+int', output: 'int-arr', method: 'maxSlidingWindow',
    description: 'You are given an array of integers `nums`, there is a sliding window of size `k` which is moving from the very left of the array to the very right. You can only see the `k` numbers in the window. Each time the sliding window moves right by one position.\n\nReturn the max sliding window.\n\n**Input format:** Line 1 = nums, Line 2 = k.',
    visibleTestCases: [
      { input: '1 3 -1 -3 5 3 6 7\n3', output: '3 3 5 5 6 7', explanation: 'Max of each window of size 3.' },
      { input: '1\n1', output: '1', explanation: 'Single element window.' },
    ],
    hiddenTestCases: [
      { input: '1 -1\n1', output: '1 -1' },
      { input: '9 11\n2', output: '11' },
      { input: '4 -2\n2', output: '4' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        // Write your code here\n        return {};\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        // Write your code here\n        return new int[]{};\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        deque<int> q;\n        vector<int> res;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            while (!q.empty() && q.front() <= i - k) q.pop_front();\n            while (!q.empty() && nums[q.back()] < nums[i]) q.pop_back();\n            q.push_back(i);\n            if (i >= k - 1) res.push_back(nums[q.front()]);\n        }\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'import java.util.*;\n\nclass Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        Deque<Integer> q = new ArrayDeque<>();\n        int n = nums.length;\n        int[] res = new int[n - k + 1];\n        int idx = 0;\n        for (int i = 0; i < n; i++) {\n            while (!q.isEmpty() && q.peekFirst() <= i - k) q.pollFirst();\n            while (!q.isEmpty() && nums[q.peekLast()] < nums[i]) q.pollLast();\n            q.offerLast(i);\n            if (i >= k - 1) res[idx++] = nums[q.peekFirst()];\n        }\n        return res;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        q = deque()\n        res = []\n        for i in range(len(nums)):\n            while q and q[0] <= i - k:\n                q.popleft()\n            while q and nums[q[-1]] < nums[i]:\n                q.pop()\n            q.append(i)\n            if i >= k - 1:\n                res.append(nums[q[0]])\n        return res' },
    ],
  },

  // 12. Subarrays with K Different Integers (#992)
  {
    title: 'Subarrays with K Different Integers',
    problemNumber: 992,
    difficulty: 'hard',
    tags: 'slidingWindow',
    pattern: 'arr+int', output: 'int', method: 'subarraysWithKDistinct',
    description: 'Given an integer array `nums` and an integer `k`, return the number of good subarrays of `nums`.\n\nA good subarray is a subarray where there are exactly `k` distinct integers.\n\nFor example, if `nums = [1,2,3,1,2]` and `k = 2`, some good subarrays are `[1,2]`, `[2,3]`, etc.\n\n**Input format:** Line 1 = nums, Line 2 = k.',
    visibleTestCases: [
      { input: '1 2 1 2 3\n2', output: '7', explanation: '7 subarrays have exactly 2 distinct.' },
      { input: '1 2 1 3 4\n3', output: '3', explanation: '3 subarrays have exactly 3 distinct.' },
    ],
    hiddenTestCases: [
      { input: '1 2\n1', output: '2' },
      { input: '1 1 1\n1', output: '6' },
      { input: '1 2 3\n3', output: '1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int subarraysWithKDistinct(vector<int>& nums, int k) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int subarraysWithKDistinct(int[] nums, int k) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def subarraysWithKDistinct(self, nums: List[int], k: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int subarraysWithKDistinct(vector<int>& nums, int k) {\n        return atMost(nums, k) - atMost(nums, k - 1);\n    }\nprivate:\n    int atMost(vector<int>& nums, int k) {\n        if (k < 0) return 0;\n        unordered_map<int,int> cnt;\n        int l = 0, res = 0;\n        for (int r = 0; r < (int)nums.size(); r++) {\n            cnt[nums[r]]++;\n            while ((int)cnt.size() > k) {\n                if (--cnt[nums[l]] == 0) cnt.erase(nums[l]);\n                l++;\n            }\n            res += r - l + 1;\n        }\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'import java.util.*;\n\nclass Solution {\n    public int subarraysWithKDistinct(int[] nums, int k) {\n        return atMost(nums, k) - atMost(nums, k - 1);\n    }\n    private int atMost(int[] nums, int k) {\n        if (k < 0) return 0;\n        Map<Integer, Integer> cnt = new HashMap<>();\n        int l = 0, res = 0;\n        for (int r = 0; r < nums.length; r++) {\n            cnt.merge(nums[r], 1, Integer::sum);\n            while (cnt.size() > k) {\n                if (cnt.merge(nums[l], -1, Integer::sum) == 0) cnt.remove(nums[l]);\n                l++;\n            }\n            res += r - l + 1;\n        }\n        return res;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def subarraysWithKDistinct(self, nums: List[int], k: int) -> int:\n        def at_most(k):\n            if k < 0:\n                return 0\n            cnt = {}\n            l = 0\n            res = 0\n            for r in range(len(nums)):\n                cnt[nums[r]] = cnt.get(nums[r], 0) + 1\n                while len(cnt) > k:\n                    cnt[nums[l]] -= 1\n                    if cnt[nums[l]] == 0:\n                        del cnt[nums[l]]\n                    l += 1\n                res += r - l + 1\n            return res\n        return at_most(k) - at_most(k - 1)' },
    ],
  },

  // 13. Longest Valid Parentheses (#32)
  {
    title: 'Longest Valid Parentheses',
    problemNumber: 32,
    difficulty: 'hard',
    tags: 'stack',
    pattern: 'str', output: 'int', method: 'longestValidParentheses',
    description: 'Given a string containing just the characters `\'(\'` and `\')\'`, return the length of the longest valid (well-formed) parentheses substring.',
    visibleTestCases: [
      { input: '(()', output: '2', explanation: 'Longest valid: "()".' },
      { input: ')()())', output: '4', explanation: 'Longest valid: "()()".' },
    ],
    hiddenTestCases: [
      { input: '()', output: '2' },
      { input: '()(()', output: '2' },
      { input: '))))', output: '0' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int longestValidParentheses(string s) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int longestValidParentheses(String s) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def longestValidParentheses(self, s: str) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int longestValidParentheses(string s) {\n        stack<int> st;\n        st.push(-1);\n        int best = 0;\n        for (int i = 0; i < (int)s.size(); i++) {\n            if (s[i] == \'(\') st.push(i);\n            else {\n                st.pop();\n                if (st.empty()) st.push(i);\n                else best = max(best, i - st.top());\n            }\n        }\n        return best;\n    }\n};' },
      { language: 'Java', completeCode: 'import java.util.*;\n\nclass Solution {\n    public int longestValidParentheses(String s) {\n        Deque<Integer> st = new ArrayDeque<>();\n        st.push(-1);\n        int best = 0;\n        for (int i = 0; i < s.length(); i++) {\n            if (s.charAt(i) == \'(\') st.push(i);\n            else {\n                st.pop();\n                if (st.isEmpty()) st.push(i);\n                else best = Math.max(best, i - st.peek());\n            }\n        }\n        return best;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def longestValidParentheses(self, s: str) -> int:\n        st = [-1]\n        best = 0\n        for i, c in enumerate(s):\n            if c == \'(\':\n                st.append(i)\n            else:\n                st.pop()\n                if not st:\n                    st.append(i)\n                else:\n                    best = max(best, i - st[-1])\n        return best' },
    ],
  },

  // 14. Reverse Pairs (#493)
  {
    title: 'Reverse Pairs',
    problemNumber: 493,
    difficulty: 'hard',
    tags: 'array',
    pattern: 'arr', output: 'int', method: 'reversePairs',
    description: 'Given an integer array `nums`, return the number of reverse pairs in the array.\n\nA reverse pair is a pair `(i, j)` where:\n- `0 <= i < j < nums.length` and\n- `nums[i] > 2 * nums[j]`.',
    visibleTestCases: [
      { input: '1 3 2 3 1', output: '2', explanation: 'Pairs (3,1) at indices (1,4) and (3,4).' },
      { input: '2 4 3 5 1', output: '3', explanation: 'Three valid reverse pairs.' },
    ],
    hiddenTestCases: [
      { input: '1 2 3 4', output: '0' },
      { input: '4 3 2 1', output: '2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int reversePairs(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int reversePairs(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def reversePairs(self, nums: List[int]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int reversePairs(vector<int>& nums) {\n        return mergeSort(nums, 0, nums.size() - 1);\n    }\nprivate:\n    int mergeSort(vector<int>& nums, int lo, int hi) {\n        if (lo >= hi) return 0;\n        int mid = lo + (hi - lo) / 2;\n        int cnt = mergeSort(nums, lo, mid) + mergeSort(nums, mid + 1, hi);\n        int j = mid + 1;\n        for (int i = lo; i <= mid; i++) {\n            while (j <= hi && (long long)nums[i] > 2LL * nums[j]) j++;\n            cnt += j - (mid + 1);\n        }\n        vector<int> tmp(hi - lo + 1);\n        int k = 0, i = lo; j = mid + 1;\n        while (i <= mid && j <= hi) tmp[k++] = nums[i] <= nums[j] ? nums[i++] : nums[j++];\n        while (i <= mid) tmp[k++] = nums[i++];\n        while (j <= hi) tmp[k++] = nums[j++];\n        for (int t = 0; t < (int)tmp.size(); t++) nums[lo + t] = tmp[t];\n        return cnt;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int reversePairs(int[] nums) {\n        return mergeSort(nums, 0, nums.length - 1);\n    }\n    private int mergeSort(int[] nums, int lo, int hi) {\n        if (lo >= hi) return 0;\n        int mid = lo + (hi - lo) / 2;\n        int cnt = mergeSort(nums, lo, mid) + mergeSort(nums, mid + 1, hi);\n        int j = mid + 1;\n        for (int i = lo; i <= mid; i++) {\n            while (j <= hi && nums[i] > 2L * nums[j]) j++;\n            cnt += j - (mid + 1);\n        }\n        int[] tmp = new int[hi - lo + 1];\n        int k = 0, i = lo; j = mid + 1;\n        while (i <= mid && j <= hi) tmp[k++] = nums[i] <= nums[j] ? nums[i++] : nums[j++];\n        while (i <= mid) tmp[k++] = nums[i++];\n        while (j <= hi) tmp[k++] = nums[j++];\n        System.arraycopy(tmp, 0, nums, lo, tmp.length);\n        return cnt;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def reversePairs(self, nums: List[int]) -> int:\n        def merge_sort(lo, hi):\n            if lo >= hi:\n                return 0\n            mid = (lo + hi) // 2\n            cnt = merge_sort(lo, mid) + merge_sort(mid + 1, hi)\n            j = mid + 1\n            for i in range(lo, mid + 1):\n                while j <= hi and nums[i] > 2 * nums[j]:\n                    j += 1\n                cnt += j - (mid + 1)\n            nums[lo:hi+1] = sorted(nums[lo:hi+1])\n            return cnt\n        return merge_sort(0, len(nums) - 1)' },
    ],
  },

  // 15. Find K-th Smallest Pair Distance (#719)
  {
    title: 'Find K-th Smallest Pair Distance',
    problemNumber: 719,
    difficulty: 'hard',
    tags: 'binarySearch',
    pattern: 'arr+int', output: 'int', method: 'smallestDistancePair',
    description: 'The distance of a pair of integers `a` and `b` is defined as the absolute difference between `a` and `b`.\n\nGiven an integer array `nums` and an integer `k`, return the k-th smallest distance among all the pairs `nums[i]` and `nums[j]` where `0 <= i < j < nums.length`.\n\n**Input format:** Line 1 = nums, Line 2 = k.',
    visibleTestCases: [
      { input: '1 3 1\n1', output: '0', explanation: 'Distances: 0, 2, 2. 1st smallest is 0.' },
      { input: '1 1 1\n2', output: '0', explanation: 'All distances are 0.' },
    ],
    hiddenTestCases: [
      { input: '1 6 1\n3', output: '5' },
      { input: '1 2 3\n3', output: '2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int smallestDistancePair(vector<int>& nums, int k) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int smallestDistancePair(int[] nums, int k) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def smallestDistancePair(self, nums: List[int], k: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int smallestDistancePair(vector<int>& nums, int k) {\n        sort(nums.begin(), nums.end());\n        int lo = 0, hi = nums.back() - nums.front();\n        while (lo < hi) {\n            int mid = lo + (hi - lo) / 2;\n            int cnt = 0, j = 0;\n            for (int i = 0; i < (int)nums.size(); i++) {\n                while (j < (int)nums.size() && nums[j] - nums[i] <= mid) j++;\n                cnt += j - i - 1;\n            }\n            if (cnt >= k) hi = mid; else lo = mid + 1;\n        }\n        return lo;\n    }\n};' },
      { language: 'Java', completeCode: 'import java.util.*;\n\nclass Solution {\n    public int smallestDistancePair(int[] nums, int k) {\n        Arrays.sort(nums);\n        int lo = 0, hi = nums[nums.length - 1] - nums[0];\n        while (lo < hi) {\n            int mid = lo + (hi - lo) / 2;\n            int cnt = 0, j = 0;\n            for (int i = 0; i < nums.length; i++) {\n                while (j < nums.length && nums[j] - nums[i] <= mid) j++;\n                cnt += j - i - 1;\n            }\n            if (cnt >= k) hi = mid; else lo = mid + 1;\n        }\n        return lo;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def smallestDistancePair(self, nums: List[int], k: int) -> int:\n        nums.sort()\n        lo, hi = 0, nums[-1] - nums[0]\n        while lo < hi:\n            mid = (lo + hi) // 2\n            cnt = 0\n            j = 0\n            for i in range(len(nums)):\n                while j < len(nums) and nums[j] - nums[i] <= mid:\n                    j += 1\n                cnt += j - i - 1\n            if cnt >= k:\n                hi = mid\n            else:\n                lo = mid + 1\n        return lo' },
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
        { language: 'C++', harnessCode: buildCppHarness(p.pattern, p.output, p.method) },
        { language: 'Java', harnessCode: buildJavaHarness(p.pattern, p.output, p.method) },
        { language: 'Python', harnessCode: buildPyHarness(p.pattern, p.output, p.method) },
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
    console.log(`🎉 Batch 10 complete`);
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