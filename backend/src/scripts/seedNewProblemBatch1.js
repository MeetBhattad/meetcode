require('dotenv').config();
const axios = require('axios');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const BACKEND_URL = 'http://localhost:3000';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ ADMIN_EMAIL / ADMIN_PASSWORD missing from .env');
  process.exit(1);
}

const problemsData = [
  // 1. Subarray Sum Equals K (#560)
  {
    title: 'Subarray Sum Equals K',
    problemNumber: 560,
    description: 'Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals to `k`.\n\nA subarray is a contiguous non-empty sequence of elements within an array.\n\n**Input format:** Line 1 = nums, Line 2 = k.',
    difficulty: 'medium',
    tags: 'hashMap',
    visibleTestCases: [
      { input: '1 1 1\n2', output: '2', explanation: 'Subarrays [1,1] at index 0-1 and index 1-2 both sum to 2.' },
      { input: '1 2 3\n3', output: '2', explanation: 'Subarrays [1,2] and [3] both sum to 3.' },
    ],
    hiddenTestCases: [
      { input: '1\n0', output: '0' },
      { input: '1 -1 0\n0', output: '3' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int subarraySum(vector<int>& nums, int k) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int subarraySum(int[] nums, int k) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'from typing import List\n\nclass Solution:\n    def subarraySum(self, nums: List[int], k: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int subarraySum(vector<int>& nums, int k) {\n        unordered_map<int,int> mp;\n        mp[0] = 1;\n        int sum = 0, res = 0;\n        for (int n : nums) {\n            sum += n;\n            res += mp[sum - k];\n            mp[sum]++;\n        }\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'import java.util.*;\n\nclass Solution {\n    public int subarraySum(int[] nums, int k) {\n        Map<Integer, Integer> mp = new HashMap<>();\n        mp.put(0, 1);\n        int sum = 0, res = 0;\n        for (int n : nums) {\n            sum += n;\n            res += mp.getOrDefault(sum - k, 0);\n            mp.put(sum, mp.getOrDefault(sum, 0) + 1);\n        }\n        return res;\n    }\n}' },
      { language: 'Python', completeCode: 'from typing import List\n\nclass Solution:\n    def subarraySum(self, nums: List[int], k: int) -> int:\n        mp = {0: 1}\n        s = res = 0\n        for n in nums:\n            s += n\n            res += mp.get(s - k, 0)\n            mp[s] = mp.get(s, 0) + 1\n        return res' },
    ],
    testHarness: [
      { language: 'C++', harnessCode: '#include <iostream>\n#include <vector>\n#include <sstream>\n#include <unordered_map>\nusing namespace std;\n\n{{USER_CODE}}\n\nint main() {\n    string line; getline(cin, line);\n    stringstream ss(line);\n    vector<int> nums; int x;\n    while (ss >> x) nums.push_back(x);\n    int k; cin >> k;\n    Solution sol;\n    cout << sol.subarraySum(nums, k) << endl;\n    return 0;\n}' },
      { language: 'Java', harnessCode: 'import java.util.*;\n\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split("\\\\s+");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        int k = Integer.parseInt(sc.nextLine().trim());\n        Solution sol = new Solution();\n        System.out.println(sol.subarraySum(nums, k));\n    }\n}' },
      { language: 'Python', harnessCode: 'import sys\n\n{{USER_CODE}}\n\ndef main():\n    lines = sys.stdin.read().strip().split(\'\\n\')\n    nums = list(map(int, lines[0].split()))\n    k = int(lines[1].strip())\n    print(Solution().subarraySum(nums, k))\n\nif __name__ == "__main__":\n    main()' },
    ],
  },

  // 2. Task Scheduler (#621)
  {
    title: 'Task Scheduler',
    problemNumber: 621,
    description: 'You are given an array of CPU `tasks`, each represented by letters A to Z, and a cooling time `n`. Each cycle or interval allows the completion of one task. Tasks can be completed in any order, but there\'s a constraint: identical tasks must be separated by at least `n` intervals due to cooling time.\n\nReturn the minimum number of intervals required to complete all tasks.\n\n**Input format:** Line 1 = tasks (space-separated chars), Line 2 = n.',
    difficulty: 'medium',
    tags: 'heap',
    visibleTestCases: [
      { input: 'A A A B B B\n2', output: '8', explanation: 'A B idle A B idle A B → 8 intervals.' },
      { input: 'A A A B B B\n0', output: '6', explanation: 'No cooldown needed.' },
    ],
    hiddenTestCases: [
      { input: 'A A A\n2', output: '7' },
      { input: 'A\n1', output: '1' },
      { input: 'A B\n1', output: '2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int leastInterval(vector<char>& tasks, int n) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int leastInterval(char[] tasks, int n) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'from typing import List\n\nclass Solution:\n    def leastInterval(self, tasks: List[str], n: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int leastInterval(vector<char>& tasks, int n) {\n        int count[26] = {0};\n        for (char c : tasks) count[c - \'A\']++;\n        int maxFreq = 0;\n        for (int c : count) maxFreq = max(maxFreq, c);\n        int maxCount = 0;\n        for (int c : count) if (c == maxFreq) maxCount++;\n        int ans = (maxFreq - 1) * (n + 1) + maxCount;\n        return max(ans, (int)tasks.size());\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int leastInterval(char[] tasks, int n) {\n        int[] count = new int[26];\n        for (char c : tasks) count[c - \'A\']++;\n        int maxFreq = 0;\n        for (int c : count) maxFreq = Math.max(maxFreq, c);\n        int maxCount = 0;\n        for (int c : count) if (c == maxFreq) maxCount++;\n        int ans = (maxFreq - 1) * (n + 1) + maxCount;\n        return Math.max(ans, tasks.length);\n    }\n}' },
      { language: 'Python', completeCode: 'from typing import List\nfrom collections import Counter\n\nclass Solution:\n    def leastInterval(self, tasks: List[str], n: int) -> int:\n        count = Counter(tasks)\n        max_freq = max(count.values())\n        max_count = sum(1 for v in count.values() if v == max_freq)\n        ans = (max_freq - 1) * (n + 1) + max_count\n        return max(ans, len(tasks))' },
    ],
    testHarness: [
      { language: 'C++', harnessCode: '#include <iostream>\n#include <vector>\n#include <sstream>\n#include <algorithm>\nusing namespace std;\n\n{{USER_CODE}}\n\nint main() {\n    string line; getline(cin, line);\n    stringstream ss(line);\n    vector<char> tasks;\n    string tok;\n    while (ss >> tok) tasks.push_back(tok[0]);\n    int n; cin >> n;\n    Solution sol;\n    cout << sol.leastInterval(tasks, n) << endl;\n    return 0;\n}' },
      { language: 'Java', harnessCode: 'import java.util.*;\n\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split("\\\\s+");\n        char[] tasks = new char[parts.length];\n        for (int i = 0; i < parts.length; i++) tasks[i] = parts[i].charAt(0);\n        int n = Integer.parseInt(sc.nextLine().trim());\n        Solution sol = new Solution();\n        System.out.println(sol.leastInterval(tasks, n));\n    }\n}' },
      { language: 'Python', harnessCode: 'import sys\n\n{{USER_CODE}}\n\ndef main():\n    lines = sys.stdin.read().strip().split(\'\\n\')\n    tasks = lines[0].split()\n    n = int(lines[1].strip())\n    print(Solution().leastInterval(tasks, n))\n\nif __name__ == "__main__":\n    main()' },
    ],
  },

  // 3. Median of Two Sorted Arrays (#4)
  {
    title: 'Median of Two Sorted Arrays',
    problemNumber: 4,
    description: 'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).\n\n**Input format:** Line 1 = nums1, Line 2 = nums2.\n\n**Output format:** Printed with 5 decimal places.',
    difficulty: 'hard',
    tags: 'binarySearch',
    visibleTestCases: [
      { input: '1 3\n2', output: '2.00000', explanation: 'Combined array [1,2,3], median = 2.' },
      { input: '1 2\n3 4', output: '2.50000', explanation: 'Combined array [1,2,3,4], median = 2.5.' },
    ],
    hiddenTestCases: [
      { input: '1\n2', output: '1.50000' },
      { input: '0 0\n0 0', output: '0.00000' },
      { input: '2 2 2\n2 2 2', output: '2.00000' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Write your code here\n        return 0.0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your code here\n        return 0.0;\n    }\n}' },
      { language: 'Python', initialCode: 'from typing import List\n\nclass Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& a, vector<int>& b) {\n        if (a.size() > b.size()) swap(a, b);\n        int m = a.size(), n = b.size();\n        int lo = 0, hi = m;\n        while (lo <= hi) {\n            int i = (lo + hi) / 2;\n            int j = (m + n + 1) / 2 - i;\n            int aL = i == 0 ? INT_MIN : a[i-1];\n            int aR = i == m ? INT_MAX : a[i];\n            int bL = j == 0 ? INT_MIN : b[j-1];\n            int bR = j == n ? INT_MAX : b[j];\n            if (aL <= bR && bL <= aR) {\n                if ((m + n) % 2 == 0) return (max(aL, bL) + min(aR, bR)) / 2.0;\n                return max(aL, bL);\n            } else if (aL > bR) hi = i - 1;\n            else lo = i + 1;\n        }\n        return 0.0;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public double findMedianSortedArrays(int[] a, int[] b) {\n        if (a.length > b.length) { int[] t = a; a = b; b = t; }\n        int m = a.length, n = b.length;\n        int lo = 0, hi = m;\n        while (lo <= hi) {\n            int i = (lo + hi) / 2;\n            int j = (m + n + 1) / 2 - i;\n            int aL = i == 0 ? Integer.MIN_VALUE : a[i-1];\n            int aR = i == m ? Integer.MAX_VALUE : a[i];\n            int bL = j == 0 ? Integer.MIN_VALUE : b[j-1];\n            int bR = j == n ? Integer.MAX_VALUE : b[j];\n            if (aL <= bR && bL <= aR) {\n                if ((m + n) % 2 == 0) return (Math.max(aL, bL) + Math.min(aR, bR)) / 2.0;\n                return Math.max(aL, bL);\n            } else if (aL > bR) hi = i - 1;\n            else lo = i + 1;\n        }\n        return 0.0;\n    }\n}' },
      { language: 'Python', completeCode: 'from typing import List\n\nclass Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        merged = sorted(nums1 + nums2)\n        n = len(merged)\n        if n % 2 == 1:\n            return float(merged[n // 2])\n        return (merged[n//2 - 1] + merged[n//2]) / 2.0' },
    ],
    testHarness: [
      { language: 'C++', harnessCode: '#include <iostream>\n#include <vector>\n#include <sstream>\n#include <algorithm>\n#include <climits>\n#include <cstdio>\nusing namespace std;\n\n{{USER_CODE}}\n\nint main() {\n    string l1, l2;\n    getline(cin, l1); getline(cin, l2);\n    stringstream s1(l1), s2(l2);\n    vector<int> a, b; int x;\n    while (s1 >> x) a.push_back(x);\n    while (s2 >> x) b.push_back(x);\n    Solution sol;\n    printf("%.5f\\n", sol.findMedianSortedArrays(a, b));\n    return 0;\n}' },
      { language: 'Java', harnessCode: 'import java.util.*;\n\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] p1 = sc.nextLine().trim().split("\\\\s+");\n        String[] p2 = sc.nextLine().trim().split("\\\\s+");\n        int[] a = new int[p1.length];\n        int[] b = new int[p2.length];\n        for (int i = 0; i < p1.length; i++) a[i] = Integer.parseInt(p1[i]);\n        for (int i = 0; i < p2.length; i++) b[i] = Integer.parseInt(p2[i]);\n        Solution sol = new Solution();\n        System.out.printf("%.5f%n", sol.findMedianSortedArrays(a, b));\n    }\n}' },
      { language: 'Python', harnessCode: 'import sys\n\n{{USER_CODE}}\n\ndef main():\n    lines = sys.stdin.read().strip().split(\'\\n\')\n    a = list(map(int, lines[0].split()))\n    b = list(map(int, lines[1].split()))\n    print(f"{Solution().findMedianSortedArrays(a, b):.5f}")\n\nif __name__ == "__main__":\n    main()' },
    ],
  },

  // 4. Longest Turbulent Subarray (#978)
  {
    title: 'Longest Turbulent Subarray',
    problemNumber: 978,
    description: 'Given an integer array `arr`, return the length of a maximum size turbulent subarray of `arr`.\n\nA subarray is turbulent if the comparison sign flips between each adjacent pair of elements in the subarray.\n\nMore formally, a subarray `[arr[i], arr[i + 1], ..., arr[j]]` of `arr` is said to be turbulent if and only if:\n- For `i <= k < j`: `arr[k] > arr[k + 1]` when `k` is odd, and `arr[k] < arr[k + 1]` when `k` is even; OR\n- For `i <= k < j`: `arr[k] > arr[k + 1]` when `k` is even, and `arr[k] < arr[k + 1]` when `k` is odd.',
    difficulty: 'medium',
    tags: 'slidingWindow',
    visibleTestCases: [
      { input: '9 4 2 10 7 8 8 1 9', output: '5', explanation: 'Subarray [4,2,10,7,8] alternates >, <, >, < — length 5.' },
      { input: '4 8 12 16', output: '2', explanation: 'All increasing — longest turbulent subarray has length 2.' },
    ],
    hiddenTestCases: [
      { input: '100', output: '1' },
      { input: '1 2 1 2 1 2 1', output: '7' },
      { input: '9 9', output: '1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int maxTurbulenceSize(vector<int>& arr) {\n        // Write your code here\n        return 1;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int maxTurbulenceSize(int[] arr) {\n        // Write your code here\n        return 1;\n    }\n}' },
      { language: 'Python', initialCode: 'from typing import List\n\nclass Solution:\n    def maxTurbulenceSize(self, arr: List[int]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int maxTurbulenceSize(vector<int>& arr) {\n        int n = arr.size(), res = 1, l = 0;\n        for (int r = 1; r < n; r++) {\n            int cmp = (arr[r-1] > arr[r]) ? 1 : (arr[r-1] < arr[r] ? -1 : 0);\n            if (cmp == 0) l = r;\n            else if (r == n - 1 || cmp * ((arr[r] > arr[r+1]) ? 1 : (arr[r] < arr[r+1] ? -1 : 0)) != -1) {\n                if (r - l + 1 > res) res = r - l + 1;\n                l = r;\n            }\n        }\n        if (n - l > res) res = n - l;\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int maxTurbulenceSize(int[] arr) {\n        int n = arr.length, res = 1, l = 0;\n        for (int r = 1; r < n; r++) {\n            int cmp = Integer.compare(arr[r-1], arr[r]);\n            if (cmp == 0) l = r;\n            else if (r == n - 1 || cmp * Integer.compare(arr[r], arr[r+1]) != -1) {\n                res = Math.max(res, r - l + 1);\n                l = r;\n            }\n        }\n        return Math.max(res, n - l);\n    }\n}' },
      { language: 'Python', completeCode: 'from typing import List\n\nclass Solution:\n    def maxTurbulenceSize(self, arr: List[int]) -> int:\n        n = len(arr)\n        res = 1\n        l = 0\n        def sign(a, b):\n            if a > b: return 1\n            if a < b: return -1\n            return 0\n        for r in range(1, n):\n            c = sign(arr[r-1], arr[r])\n            if c == 0:\n                l = r\n            elif r == n - 1 or c * sign(arr[r], arr[r+1]) != -1:\n                res = max(res, r - l + 1)\n                l = r\n        return max(res, n - l)' },
    ],
    testHarness: [
      { language: 'C++', harnessCode: '#include <iostream>\n#include <vector>\n#include <sstream>\n#include <algorithm>\nusing namespace std;\n\n{{USER_CODE}}\n\nint main() {\n    string line; getline(cin, line);\n    stringstream ss(line);\n    vector<int> arr; int x;\n    while (ss >> x) arr.push_back(x);\n    Solution sol;\n    cout << sol.maxTurbulenceSize(arr) << endl;\n    return 0;\n}' },
      { language: 'Java', harnessCode: 'import java.util.*;\n\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split("\\\\s+");\n        int[] arr = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i]);\n        Solution sol = new Solution();\n        System.out.println(sol.maxTurbulenceSize(arr));\n    }\n}' },
      { language: 'Python', harnessCode: 'import sys\n\n{{USER_CODE}}\n\ndef main():\n    data = sys.stdin.read().strip()\n    if not data: return\n    arr = list(map(int, data.split()))\n    print(Solution().maxTurbulenceSize(arr))\n\nif __name__ == "__main__":\n    main()' },
    ],
  },

  // 5. K Closest Points to Origin (#973)
  {
    title: 'K Closest Points to Origin',
    problemNumber: 973,
    description: 'Given an array of points where `points[i] = [xi, yi]` represents a point on the X-Y plane and an integer `k`, return the `k` closest points to the origin `(0, 0)`.\n\nThe distance between two points on the X-Y plane is the Euclidean distance.\n\nYou may return the answer in any order. The answer is guaranteed to be unique (except for the order that it is in).\n\n**Input format:** Line 1 = flat points (x1 y1 x2 y2 ...), Line 2 = k.\n\n**Output format:** Each point on its own line, sorted by distance then x then y.',
    difficulty: 'medium',
    tags: 'heap',
    visibleTestCases: [
      { input: '1 3 -2 2\n1', output: '-2 2', explanation: 'Distances: (1,3) → 10, (-2,2) → 8. Closest is (-2,2).' },
      { input: '3 3 5 -1 -2 4\n2', output: '3 3\n-2 4', explanation: 'Distances: 18, 26, 20. Two closest: (3,3) and (-2,4).' },
    ],
    hiddenTestCases: [
      { input: '0 1 1 0\n2', output: '0 1\n1 0' },
      { input: '-1 -1 2 2\n1', output: '-1 -1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {\n        // Write your code here\n        return {};\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int[][] kClosest(int[][] points, int k) {\n        // Write your code here\n        return new int[][]{};\n    }\n}' },
      { language: 'Python', initialCode: 'from typing import List\n\nclass Solution:\n    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {\n        sort(points.begin(), points.end(), [](auto& a, auto& b) {\n            long long da = (long long)a[0]*a[0] + (long long)a[1]*a[1];\n            long long db = (long long)b[0]*b[0] + (long long)b[1]*b[1];\n            return da < db;\n        });\n        return vector<vector<int>>(points.begin(), points.begin() + k);\n    }\n};' },
      { language: 'Java', completeCode: 'import java.util.*;\n\nclass Solution {\n    public int[][] kClosest(int[][] points, int k) {\n        Arrays.sort(points, (a, b) -> {\n            long da = (long)a[0]*a[0] + (long)a[1]*a[1];\n            long db = (long)b[0]*b[0] + (long)b[1]*b[1];\n            return Long.compare(da, db);\n        });\n        return Arrays.copyOfRange(points, 0, k);\n    }\n}' },
      { language: 'Python', completeCode: 'from typing import List\n\nclass Solution:\n    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:\n        return sorted(points, key=lambda p: p[0]**2 + p[1]**2)[:k]' },
    ],
    testHarness: [
      { language: 'C++', harnessCode: '#include <iostream>\n#include <vector>\n#include <sstream>\n#include <algorithm>\nusing namespace std;\n\n{{USER_CODE}}\n\nint main() {\n    string line; getline(cin, line);\n    stringstream ss(line);\n    vector<int> flat; int x;\n    while (ss >> x) flat.push_back(x);\n    int k; cin >> k;\n    vector<vector<int>> pts;\n    for (size_t i = 0; i + 1 < flat.size(); i += 2) pts.push_back({flat[i], flat[i+1]});\n    Solution sol;\n    auto res = sol.kClosest(pts, k);\n    sort(res.begin(), res.end(), [](auto& a, auto& b) {\n        long long da = (long long)a[0]*a[0] + (long long)a[1]*a[1];\n        long long db = (long long)b[0]*b[0] + (long long)b[1]*b[1];\n        if (da != db) return da < db;\n        if (a[0] != b[0]) return a[0] < b[0];\n        return a[1] < b[1];\n    });\n    for (auto& p : res) cout << p[0] << " " << p[1] << endl;\n    return 0;\n}' },
      { language: 'Java', harnessCode: 'import java.util.*;\n\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] flat = sc.nextLine().trim().split("\\\\s+");\n        int k = Integer.parseInt(sc.nextLine().trim());\n        int[][] pts = new int[flat.length / 2][2];\n        for (int i = 0; i < flat.length; i += 2) {\n            pts[i/2][0] = Integer.parseInt(flat[i]);\n            pts[i/2][1] = Integer.parseInt(flat[i+1]);\n        }\n        Solution sol = new Solution();\n        int[][] res = sol.kClosest(pts, k);\n        Arrays.sort(res, (a, b) -> {\n            long da = (long)a[0]*a[0] + (long)a[1]*a[1];\n            long db = (long)b[0]*b[0] + (long)b[1]*b[1];\n            if (da != db) return Long.compare(da, db);\n            if (a[0] != b[0]) return Integer.compare(a[0], b[0]);\n            return Integer.compare(a[1], b[1]);\n        });\n        for (int[] p : res) System.out.println(p[0] + " " + p[1]);\n    }\n}' },
      { language: 'Python', harnessCode: 'import sys\n\n{{USER_CODE}}\n\ndef main():\n    lines = sys.stdin.read().strip().split(\'\\n\')\n    flat = list(map(int, lines[0].split()))\n    k = int(lines[1].strip())\n    pts = [[flat[i], flat[i+1]] for i in range(0, len(flat), 2)]\n    res = Solution().kClosest(pts, k)\n    res.sort(key=lambda p: (p[0]**2 + p[1]**2, p[0], p[1]))\n    for p in res:\n        print(f"{p[0]} {p[1]}")\n\nif __name__ == "__main__":\n    main()' },
    ],
  },

  // 6. Remove Element (#27)
  {
    title: 'Remove Element',
    problemNumber: 27,
    description: 'Given an integer array `nums` and an integer `val`, remove all occurrences of `val` in `nums` in-place. The order of the elements may be changed. Then return the number of elements in `nums` which are not equal to `val`.\n\n**Input format:** Line 1 = nums, Line 2 = val.',
    difficulty: 'easy',
    tags: 'twoPointers',
    visibleTestCases: [
      { input: '3 2 2 3\n3', output: '2', explanation: 'Two elements (both 2s) remain after removing all 3s.' },
      { input: '0 1 2 2 3 0 4 2\n2', output: '5', explanation: 'Elements not equal to 2: [0,1,3,0,4], count 5.' },
    ],
    hiddenTestCases: [
      { input: '1\n1', output: '0' },
      { input: '1\n2', output: '1' },
      { input: '4 5\n5', output: '1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int removeElement(vector<int>& nums, int val) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int removeElement(int[] nums, int val) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'from typing import List\n\nclass Solution:\n    def removeElement(self, nums: List[int], val: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int removeElement(vector<int>& nums, int val) {\n        int k = 0;\n        for (int n : nums) if (n != val) nums[k++] = n;\n        return k;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int removeElement(int[] nums, int val) {\n        int k = 0;\n        for (int n : nums) if (n != val) nums[k++] = n;\n        return k;\n    }\n}' },
      { language: 'Python', completeCode: 'from typing import List\n\nclass Solution:\n    def removeElement(self, nums: List[int], val: int) -> int:\n        k = 0\n        for n in nums:\n            if n != val:\n                nums[k] = n\n                k += 1\n        return k' },
    ],
    testHarness: [
      { language: 'C++', harnessCode: '#include <iostream>\n#include <vector>\n#include <sstream>\nusing namespace std;\n\n{{USER_CODE}}\n\nint main() {\n    string line; getline(cin, line);\n    stringstream ss(line);\n    vector<int> nums; int x;\n    while (ss >> x) nums.push_back(x);\n    int val; cin >> val;\n    Solution sol;\n    cout << sol.removeElement(nums, val) << endl;\n    return 0;\n}' },
      { language: 'Java', harnessCode: 'import java.util.*;\n\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split("\\\\s+");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        int val = Integer.parseInt(sc.nextLine().trim());\n        Solution sol = new Solution();\n        System.out.println(sol.removeElement(nums, val));\n    }\n}' },
      { language: 'Python', harnessCode: 'import sys\n\n{{USER_CODE}}\n\ndef main():\n    lines = sys.stdin.read().strip().split(\'\\n\')\n    nums = list(map(int, lines[0].split()))\n    val = int(lines[1].strip())\n    print(Solution().removeElement(nums, val))\n\nif __name__ == "__main__":\n    main()' },
    ],
  },

  // 7. Evaluate Reverse Polish Notation (#150)
  {
    title: 'Evaluate Reverse Polish Notation',
    problemNumber: 150,
    description: 'You are given an array of strings `tokens` that represents an arithmetic expression in Reverse Polish Notation.\n\nEvaluate the expression. Return an integer that represents the value of the expression.\n\n**Note:**\n- The valid operators are `+`, `-`, `*`, and `/`.\n- Each operand may be an integer or another expression.\n- Division between two integers always truncates toward zero.\n- There will not be any division by zero.\n- The input represents a valid arithmetic expression in RPN.\n\n**Input format:** Tokens space-separated on one line.',
    difficulty: 'medium',
    tags: 'stack',
    visibleTestCases: [
      { input: '2 1 + 3 *', output: '9', explanation: '(2 + 1) * 3 = 9.' },
      { input: '4 13 5 / +', output: '6', explanation: '13/5 = 2 (truncated). 4 + 2 = 6.' },
    ],
    hiddenTestCases: [
      { input: '2', output: '2' },
      { input: '3 4 +', output: '7' },
      { input: '7 -2 /', output: '-3' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int evalRPN(vector<string>& tokens) {\n        // Write your code here\n        return 0;\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int evalRPN(String[] tokens) {\n        // Write your code here\n        return 0;\n    }\n}' },
      { language: 'Python', initialCode: 'from typing import List\n\nclass Solution:\n    def evalRPN(self, tokens: List[str]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int evalRPN(vector<string>& tokens) {\n        stack<int> st;\n        for (auto& t : tokens) {\n            if (t == "+" || t == "-" || t == "*" || t == "/") {\n                int b = st.top(); st.pop();\n                int a = st.top(); st.pop();\n                if (t == "+") st.push(a + b);\n                else if (t == "-") st.push(a - b);\n                else if (t == "*") st.push(a * b);\n                else st.push(a / b);\n            } else st.push(stoi(t));\n        }\n        return st.top();\n    }\n};' },
      { language: 'Java', completeCode: 'import java.util.*;\n\nclass Solution {\n    public int evalRPN(String[] tokens) {\n        Deque<Integer> st = new ArrayDeque<>();\n        for (String t : tokens) {\n            if (t.equals("+") || t.equals("-") || t.equals("*") || t.equals("/")) {\n                int b = st.pop();\n                int a = st.pop();\n                if (t.equals("+")) st.push(a + b);\n                else if (t.equals("-")) st.push(a - b);\n                else if (t.equals("*")) st.push(a * b);\n                else st.push(a / b);\n            } else st.push(Integer.parseInt(t));\n        }\n        return st.peek();\n    }\n}' },
      { language: 'Python', completeCode: 'from typing import List\n\nclass Solution:\n    def evalRPN(self, tokens: List[str]) -> int:\n        st = []\n        for t in tokens:\n            if t in ("+", "-", "*", "/"):\n                b = st.pop()\n                a = st.pop()\n                if t == "+": st.append(a + b)\n                elif t == "-": st.append(a - b)\n                elif t == "*": st.append(a * b)\n                else: st.append(int(a / b))\n            else:\n                st.append(int(t))\n        return st[0]' },
    ],
    testHarness: [
      { language: 'C++', harnessCode: '#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\n#include <stack>\nusing namespace std;\n\n{{USER_CODE}}\n\nint main() {\n    string line; getline(cin, line);\n    stringstream ss(line);\n    vector<string> tokens; string t;\n    while (ss >> t) tokens.push_back(t);\n    Solution sol;\n    cout << sol.evalRPN(tokens) << endl;\n    return 0;\n}' },
      { language: 'Java', harnessCode: 'import java.util.*;\n\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] tokens = sc.nextLine().trim().split("\\\\s+");\n        Solution sol = new Solution();\n        System.out.println(sol.evalRPN(tokens));\n    }\n}' },
      { language: 'Python', harnessCode: 'import sys\n\n{{USER_CODE}}\n\ndef main():\n    data = sys.stdin.read().strip()\n    if not data: return\n    tokens = data.split()\n    print(Solution().evalRPN(tokens))\n\nif __name__ == "__main__":\n    main()' },
    ],
  },

  // 8. Two Sum II - Input Array Is Sorted (#167)
  {
    title: 'Two Sum II - Input Array Is Sorted',
    problemNumber: 167,
    description: 'Given a 1-indexed array of integers `numbers` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific `target` number. Let these two numbers be `numbers[index1]` and `numbers[index2]` where `1 <= index1 < index2 <= numbers.length`.\n\nReturn the indices of the two numbers, `index1` and `index2`, added by one, as an integer array `[index1, index2]` of length 2.\n\nYour solution must use only constant extra space.\n\n**Input format:** Line 1 = numbers, Line 2 = target.',
    difficulty: 'medium',
    tags: 'twoPointers',
    visibleTestCases: [
      { input: '2 7 11 15\n9', output: '1 2', explanation: '2 + 7 = 9. Indices 1 and 2 (1-indexed).' },
      { input: '2 3 4\n6', output: '1 3', explanation: '2 + 4 = 6. Indices 1 and 3.' },
    ],
    hiddenTestCases: [
      { input: '-1 0\n-1', output: '1 2' },
      { input: '5 25 75\n100', output: '2 3' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& numbers, int target) {\n        // Write your code here\n        return {};\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}' },
      { language: 'Python', initialCode: 'from typing import List\n\nclass Solution:\n    def twoSum(self, numbers: List[int], target: int) -> List[int]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& numbers, int target) {\n        int l = 0, r = numbers.size() - 1;\n        while (l < r) {\n            int s = numbers[l] + numbers[r];\n            if (s == target) return {l + 1, r + 1};\n            if (s < target) l++;\n            else r--;\n        }\n        return {};\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        int l = 0, r = numbers.length - 1;\n        while (l < r) {\n            int s = numbers[l] + numbers[r];\n            if (s == target) return new int[]{l + 1, r + 1};\n            if (s < target) l++;\n            else r--;\n        }\n        return new int[]{};\n    }\n}' },
      { language: 'Python', completeCode: 'from typing import List\n\nclass Solution:\n    def twoSum(self, numbers: List[int], target: int) -> List[int]:\n        l, r = 0, len(numbers) - 1\n        while l < r:\n            s = numbers[l] + numbers[r]\n            if s == target:\n                return [l + 1, r + 1]\n            if s < target:\n                l += 1\n            else:\n                r -= 1\n        return []' },
    ],
    testHarness: [
      { language: 'C++', harnessCode: '#include <iostream>\n#include <vector>\n#include <sstream>\nusing namespace std;\n\n{{USER_CODE}}\n\nint main() {\n    string line; getline(cin, line);\n    stringstream ss(line);\n    vector<int> nums; int x;\n    while (ss >> x) nums.push_back(x);\n    int target; cin >> target;\n    Solution sol;\n    vector<int> res = sol.twoSum(nums, target);\n    for (size_t i = 0; i < res.size(); i++)\n        cout << res[i] << (i < res.size() - 1 ? " " : "");\n    cout << endl;\n    return 0;\n}' },
      { language: 'Java', harnessCode: 'import java.util.*;\n\n{{USER_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().trim().split("\\\\s+");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        int target = Integer.parseInt(sc.nextLine().trim());\n        Solution sol = new Solution();\n        int[] res = sol.twoSum(nums, target);\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < res.length; i++) {\n            sb.append(res[i]);\n            if (i < res.length - 1) sb.append(" ");\n        }\n        System.out.println(sb.toString());\n    }\n}' },
      { language: 'Python', harnessCode: 'import sys\n\n{{USER_CODE}}\n\ndef main():\n    lines = sys.stdin.read().strip().split(\'\\n\')\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1].strip())\n    res = Solution().twoSum(nums, target)\n    print(" ".join(map(str, res)))\n\nif __name__ == "__main__":\n    main()' },
    ],
  },
];

// Mapping of problem number → tags we need to force-update (in case JSON import set wrong tags)
const TAG_OVERRIDES = {
  560: 'hashMap',
  621: 'heap',
  4: 'binarySearch',
  978: 'slidingWindow',
  973: 'heap',
  27: 'twoPointers',
  150: 'stack',
  167: 'twoPointers',
};

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

    // For each problem, check via /problem/problemById/:number lookup isn't possible
    // So we'll get all problems and check by problemNumber client-side
    console.log('📋 Loading existing problem numbers...');
    const { data: allProblems } = await client.get(`${BACKEND_URL}/problem/getAllProblem`);
    // getAllProblem only returns _id, title, difficulty, tags — we need to check by title
    const existingByTitle = new Map();
    (allProblems || []).forEach((p) => existingByTitle.set(p.title, p));
    console.log(`   ${existingByTitle.size} problems in DB\n`);

    let updated = 0, created = 0, skipped = 0, failed = 0;
    const failures = [];

    for (const p of problemsData) {
      const existing = existingByTitle.get(p.title);

      if (existing) {
        // Problem exists in DB (likely from JSON import).
        // We need to check if it has harnesses via the admin endpoint.
        // If we don't have admin credentials for that, just try to update.
        // Simpler: use PUT /problem/update/:id which replaces fields.
        try {
          // We don't have easy access to test harness info via getAllProblem
          // Let's just try to update via admin endpoint using the title-based ID
          const adminRes = await client.get(`${BACKEND_URL}/problem/admin/${existing._id}`);
          const existingFull = adminRes.data;

          if (existingFull.testHarness && existingFull.testHarness.length >= 3) {
            console.log(`⏭️  Skipping "${p.title}" (already runnable)`);
            skipped++;
            continue;
          }

          // Update the runnable fields
          await client.put(`${BACKEND_URL}/problem/update/${existing._id}`, {
            ...existingFull,
            problemNumber: p.problemNumber,
            tags: TAG_OVERRIDES[p.problemNumber] || p.tags,
            startCode: p.startCode,
            visibleTestCases: p.visibleTestCases,
            hiddenTestCases: p.hiddenTestCases,
            referenceSolution: p.referenceSolution,
            testHarness: p.testHarness,
          });
          console.log(`✅ Updated "${p.title}" (#${p.problemNumber}) — made runnable`);
          updated++;
        } catch (err) {
          const msg = err.response?.data?.error || err.message;
          console.error(`❌ Failed to update "${p.title}": ${msg}\n`);
          failures.push({ title: p.title, error: msg });
          failed++;
        }
      } else {
        // Problem doesn't exist — create new
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

      await new Promise((r) => setTimeout(r, 5000));
    }

    console.log('─'.repeat(60));
    console.log(`🎉 Batch 7 complete`);
    console.log(`   ✅ Created new:  ${created}`);
    console.log(`   🔄 Updated:      ${updated}`);
    console.log(`   ⏭️  Skipped:     ${skipped}`);
    console.log(`   ❌ Failed:       ${failed}`);
    if (failures.length > 0) {
      console.log('\n   Failures:');
      failures.forEach((f) => console.log(`      - ${f.title}: ${f.error}`));
    }
  } catch (err) {
    console.error('❌ Fatal:', err.message);
  }
}

main();