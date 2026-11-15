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
// 1. KTH LARGEST ELEMENT IN A STREAM (703)
// ─────────────────────────────────────────────────────────────
const kthLargestCpp = `#include <bits/stdc++.h>\nusing namespace std;\n{{USER_CODE}}\nint main() {\n    int k; cin >> k; cin.ignore();\n    string line; getline(cin, line);\n    vector<int> nums;\n    stringstream ss(line); int x;\n    while(ss >> x) nums.push_back(x);\n    KthLargest* obj = new KthLargest(k, nums);\n    cout << "null" << endl;\n    string op; int val;\n    while(cin >> op >> val) {\n        cout << obj->add(val) << endl;\n    }\n    return 0;\n}`;
const kthLargestJava = `import java.util.*;\n{{USER_CODE}}\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int k = Integer.parseInt(sc.nextLine().trim());\n        String line2 = sc.hasNextLine() ? sc.nextLine().trim() : "";\n        String[] parts = line2.isEmpty() ? new String[0] : line2.split("\\\\s+");\n        int[] nums = new int[parts.length];\n        for(int i=0; i<parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        KthLargest obj = new KthLargest(k, nums);\n        System.out.println("null");\n        while(sc.hasNextLine()) {\n            String line = sc.nextLine().trim();\n            if(line.isEmpty()) continue;\n            String[] tokens = line.split("\\\\s+");\n            if(tokens[0].equals("add")) {\n                System.out.println(obj.add(Integer.parseInt(tokens[1])));\n            }\n        }\n    }\n}`;
const kthLargestPy = `import sys\nfrom typing import List\nimport heapq\n{{USER_CODE}}\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    k = int(lines[0].strip())\n    nums = list(map(int, lines[1].split())) if lines[1].strip() else []\n    obj = KthLargest(k, nums)\n    print("null")\n    for i in range(2, len(lines)):\n        line = lines[i].strip()\n        if not line: continue\n        parts = line.split()\n        if parts[0] == "add":\n            print(obj.add(int(parts[1])))\n\nif __name__ == "__main__":\n    main()`;

// ─────────────────────────────────────────────────────────────
// 2. REDUNDANT CONNECTION (684)
// ─────────────────────────────────────────────────────────────
const redundantCpp = `#include <bits/stdc++.h>\nusing namespace std;\n{{USER_CODE}}\nint main() {\n    int n; if(!(cin >> n)) return 0; cin.ignore();\n    string line; getline(cin, line);\n    vector<vector<int>> edges;\n    stringstream ss(line); int u, v;\n    while(ss >> u >> v) edges.push_back({u, v});\n    Solution sol;\n    vector<int> res = sol.findRedundantConnection(edges);\n    cout << res[0] << " " << res[1] << endl;\n    return 0;\n}`;
const redundantJava = `import java.util.*;\n{{USER_CODE}}\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = Integer.parseInt(sc.nextLine().trim());\n        String[] parts = sc.nextLine().trim().split("\\\\s+");\n        int[][] edges = new int[parts.length / 2][2];\n        for(int i=0; i<parts.length; i+=2) {\n            edges[i/2][0] = Integer.parseInt(parts[i]);\n            edges[i/2][1] = Integer.parseInt(parts[i+1]);\n        }\n        int[] res = new Solution().findRedundantConnection(edges);\n        System.out.println(res[0] + " " + res[1]);\n    }\n}`;
const redundantPy = `import sys\nfrom typing import List\n{{USER_CODE}}\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    n = int(lines[0].strip())\n    flat = list(map(int, lines[1].split()))\n    edges = [[flat[i], flat[i+1]] for i in range(0, len(flat), 2)]\n    res = Solution().findRedundantConnection(edges)\n    print(f"{res[0]} {res[1]}")\n\nif __name__ == "__main__":\n    main()`;

// ─────────────────────────────────────────────────────────────
// 3. EVALUATE DIVISION (399)
// ─────────────────────────────────────────────────────────────
const evalDivCpp = `#include <bits/stdc++.h>\nusing namespace std;\n{{USER_CODE}}\nint main() {\n    int m; if(!(cin >> m)) return 0;\n    vector<vector<string>> equations(m, vector<string>(2));\n    vector<double> values(m);\n    for(int i=0; i<m; i++) cin >> equations[i][0] >> equations[i][1] >> values[i];\n    int q; cin >> q;\n    vector<vector<string>> queries(q, vector<string>(2));\n    for(int i=0; i<q; i++) cin >> queries[i][0] >> queries[i][1];\n    Solution sol;\n    vector<double> res = sol.calcEquation(equations, values, queries);\n    for(int i=0; i<q; i++) { if(i) cout << " "; printf("%.5f", res[i]); }\n    cout << endl;\n    return 0;\n}`;
const evalDivJava = `import java.util.*;\n{{USER_CODE}}\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int m = Integer.parseInt(sc.nextLine().trim());\n        List<List<String>> equations = new ArrayList<>();\n        double[] values = new double[m];\n        for(int i=0; i<m; i++) {\n            String[] parts = sc.nextLine().trim().split("\\\\s+");\n            equations.add(Arrays.asList(parts[0], parts[1]));\n            values[i] = Double.parseDouble(parts[2]);\n        }\n        int q = Integer.parseInt(sc.nextLine().trim());\n        List<List<String>> queries = new ArrayList<>();\n        for(int i=0; i<q; i++) {\n            String[] parts = sc.nextLine().trim().split("\\\\s+");\n            queries.add(Arrays.asList(parts[0], parts[1]));\n        }\n        double[] res = new Solution().calcEquation(equations, values, queries);\n        StringBuilder sb = new StringBuilder();\n        for(int i=0; i<res.length; i++) {\n            if(i>0) sb.append(" ");\n            sb.append(String.format("%.5f", res[i]));\n        }\n        System.out.println(sb.toString());\n    }\n}`;
const evalDivPy = `import sys\nfrom typing import List\nimport collections\n{{USER_CODE}}\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    m = int(lines[0].strip())\n    equations = []\n    values = []\n    for i in range(1, m+1):\n        parts = lines[i].split()\n        equations.append([parts[0], parts[1]])\n        values.append(float(parts[2]))\n    q = int(lines[m+1].strip())\n    queries = []\n    for i in range(m+2, m+2+q):\n        queries.append(lines[i].split())\n    res = Solution().calcEquation(equations, values, queries)\n    print(' '.join(f"{v:.5f}" for v in res))\n\nif __name__ == "__main__":\n    main()`;

// ─────────────────────────────────────────────────────────────
// 4. RECONSTRUCT ITINERARY (332)
// ─────────────────────────────────────────────────────────────
const itineraryCpp = `#include <bits/stdc++.h>\nusing namespace std;\n{{USER_CODE}}\nint main() {\n    int n; if(!(cin >> n)) return 0;\n    vector<vector<string>> tickets(n, vector<string>(2));\n    for(int i=0; i<n; i++) cin >> tickets[i][0] >> tickets[i][1];\n    Solution sol;\n    vector<string> res = sol.findItinerary(tickets);\n    for(size_t i=0; i<res.size(); i++) { if(i) cout << " "; cout << res[i]; }\n    cout << endl;\n    return 0;\n}`;
const itineraryJava = `import java.util.*;\n{{USER_CODE}}\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = Integer.parseInt(sc.nextLine().trim());\n        List<List<String>> tickets = new ArrayList<>();\n        for(int i=0; i<n; i++) {\n            String[] parts = sc.nextLine().trim().split("\\\\s+");\n            tickets.add(Arrays.asList(parts[0], parts[1]));\n        }\n        List<String> res = new Solution().findItinerary(tickets);\n        System.out.println(String.join(" ", res));\n    }\n}`;
const itineraryPy = `import sys\nfrom typing import List\nimport collections\n{{USER_CODE}}\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    n = int(lines[0].strip())\n    tickets = []\n    for i in range(1, n+1):\n        tickets.append(lines[i].split())\n    res = Solution().findItinerary(tickets)\n    print(' '.join(res))\n\nif __name__ == "__main__":\n    main()`;

// ─────────────────────────────────────────────────────────────
// 5. MIN COST TO CONNECT ALL POINTS (1584)
// ─────────────────────────────────────────────────────────────
const minCostCpp = `#include <bits/stdc++.h>\nusing namespace std;\n{{USER_CODE}}\nint main() {\n    int n; if(!(cin >> n)) return 0;\n    vector<vector<int>> points(n, vector<int>(2));\n    for(int i=0; i<n; i++) cin >> points[i][0] >> points[i][1];\n    Solution sol;\n    cout << sol.minCostConnectPoints(points) << endl;\n    return 0;\n}`;
const minCostJava = `import java.util.*;\n{{USER_CODE}}\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = Integer.parseInt(sc.nextLine().trim());\n        int[][] points = new int[n][2];\n        for(int i=0; i<n; i++) {\n            String[] parts = sc.nextLine().trim().split("\\\\s+");\n            points[i][0] = Integer.parseInt(parts[0]);\n            points[i][1] = Integer.parseInt(parts[1]);\n        }\n        System.out.println(new Solution().minCostConnectPoints(points));\n    }\n}`;
const minCostPy = `import sys\nfrom typing import List\nimport heapq\n{{USER_CODE}}\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    n = int(lines[0].strip())\n    points = []\n    for i in range(1, n+1):\n        points.append(list(map(int, lines[i].split())))\n    print(Solution().minCostConnectPoints(points))\n\nif __name__ == "__main__":\n    main()`;

// ─────────────────────────────────────────────────────────────
// 6. NETWORK DELAY TIME (743)
// ─────────────────────────────────────────────────────────────
const networkCpp = `#include <bits/stdc++.h>\nusing namespace std;\n{{USER_CODE}}\nint main() {\n    int n, k, m; if(!(cin >> n >> k >> m)) return 0;\n    vector<vector<int>> times(m, vector<int>(3));\n    for(int i=0; i<m; i++) cin >> times[i][0] >> times[i][1] >> times[i][2];\n    Solution sol;\n    cout << sol.networkDelayTime(times, n, k) << endl;\n    return 0;\n}`;
const networkJava = `import java.util.*;\n{{USER_CODE}}\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] first = sc.nextLine().trim().split("\\\\s+");\n        int n = Integer.parseInt(first[0]);\n        int k = Integer.parseInt(first[1]);\n        int m = Integer.parseInt(first[2]);\n        int[][] times = new int[m][3];\n        for(int i=0; i<m; i++) {\n            String[] parts = sc.nextLine().trim().split("\\\\s+");\n            times[i][0] = Integer.parseInt(parts[0]);\n            times[i][1] = Integer.parseInt(parts[1]);\n            times[i][2] = Integer.parseInt(parts[2]);\n        }\n        System.out.println(new Solution().networkDelayTime(times, n, k));\n    }\n}`;
const networkPy = `import sys\nfrom typing import List\nimport heapq\nimport collections\n{{USER_CODE}}\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    first = list(map(int, lines[0].split()))\n    n, k, m = first[0], first[1], first[2]\n    times = []\n    for i in range(1, m+1):\n        times.append(list(map(int, lines[i].split())))\n    print(Solution().networkDelayTime(times, n, k))\n\nif __name__ == "__main__":\n    main()`;

// ─────────────────────────────────────────────────────────────
// 7. SWIM IN RISING WATER (778)
// ─────────────────────────────────────────────────────────────
const swimCpp = `#include <bits/stdc++.h>\nusing namespace std;\n{{USER_CODE}}\nint main() {\n    int n; if(!(cin >> n)) return 0;\n    vector<vector<int>> grid(n, vector<int>(n));\n    for(int i=0; i<n; i++) for(int j=0; j<n; j++) cin >> grid[i][j];\n    Solution sol;\n    cout << sol.swimInWater(grid) << endl;\n    return 0;\n}`;
const swimJava = `import java.util.*;\n{{USER_CODE}}\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = Integer.parseInt(sc.nextLine().trim());\n        int[][] grid = new int[n][n];\n        for(int i=0; i<n; i++) {\n            String[] parts = sc.nextLine().trim().split("\\\\s+");\n            for(int j=0; j<n; j++) grid[i][j] = Integer.parseInt(parts[j]);\n        }\n        System.out.println(new Solution().swimInWater(grid));\n    }\n}`;
const swimPy = `import sys\nfrom typing import List\nimport heapq\n{{USER_CODE}}\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    n = int(lines[0].strip())\n    grid = []\n    for i in range(1, n+1):\n        grid.append(list(map(int, lines[i].split())))\n    print(Solution().swimInWater(grid))\n\nif __name__ == "__main__":\n    main()`;

// ─────────────────────────────────────────────────────────────
// 8. CHEAPEST FLIGHTS WITHIN K STOPS (787)
// ─────────────────────────────────────────────────────────────
const flightsCpp = `#include <bits/stdc++.h>\nusing namespace std;\n{{USER_CODE}}\nint main() {\n    int n, src, dst, k, m; if(!(cin >> n >> src >> dst >> k >> m)) return 0;\n    vector<vector<int>> flights(m, vector<int>(3));\n    for(int i=0; i<m; i++) cin >> flights[i][0] >> flights[i][1] >> flights[i][2];\n    Solution sol;\n    cout << sol.findCheapestPrice(n, flights, src, dst, k) << endl;\n    return 0;\n}`;
const flightsJava = `import java.util.*;\n{{USER_CODE}}\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] first = sc.nextLine().trim().split("\\\\s+");\n        int n = Integer.parseInt(first[0]);\n        int src = Integer.parseInt(first[1]);\n        int dst = Integer.parseInt(first[2]);\n        int k = Integer.parseInt(first[3]);\n        int m = Integer.parseInt(first[4]);\n        int[][] flights = new int[m][3];\n        for(int i=0; i<m; i++) {\n            String[] parts = sc.nextLine().trim().split("\\\\s+");\n            flights[i][0] = Integer.parseInt(parts[0]);\n            flights[i][1] = Integer.parseInt(parts[1]);\n            flights[i][2] = Integer.parseInt(parts[2]);\n        }\n        System.out.println(new Solution().findCheapestPrice(n, flights, src, dst, k));\n    }\n}`;
const flightsPy = `import sys\nfrom typing import List\nimport collections\nimport heapq\n{{USER_CODE}}\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    first = list(map(int, lines[0].split()))\n    n, src, dst, k, m = first[0], first[1], first[2], first[3], first[4]\n    flights = []\n    for i in range(1, m+1):\n        flights.append(list(map(int, lines[i].split())))\n    print(Solution().findCheapestPrice(n, flights, src, dst, k))\n\nif __name__ == "__main__":\n    main()`;

// ─────────────────────────────────────────────────────────────
// PROBLEMS
// ─────────────────────────────────────────────────────────────
const problemsData = [
  {
    title: 'Kth Largest Element in a Stream', problemNumber: 703, difficulty: 'easy', tags: 'heap',
    cpp: kthLargestCpp, java: kthLargestJava, py: kthLargestPy,
    description: 'Design a class to find the `kth` largest element in a stream. Note that it is the `kth` largest element in the sorted order, not the `kth` distinct element.\n\nImplement `KthLargest` class:\n- `KthLargest(int k, int[] nums)` Initializes the object with the integer `k` and the stream of integers `nums`.\n- `int add(int val)` Appends the integer `val` to the stream and returns the element representing the `kth` largest element in the stream.',
    visibleTestCases: [
      { input: '3\n4 5 8 2\nadd 3\nadd 5\nadd 10\nadd 9\nadd 4', output: 'null\n4\n5\n5\n8\n8', explanation: 'Standard operations.' },
      { input: '1\n\nadd -3\nadd -2\nadd -4\nadd 0\nadd 4', output: 'null\n-3\n-2\n-2\n0\n4', explanation: 'Empty initial stream.' },
    ],
    hiddenTestCases: [
      { input: '2\n0\nadd -1\nadd 1\nadd -2\nadd -4\nadd 3', output: 'null\n-1\n0\n0\n0\n1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class KthLargest {\npublic:\n    KthLargest(int k, vector<int>& nums) {\n        // Write your code here\n    }\n    int add(int val) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class KthLargest {\n    public KthLargest(int k, int[] nums) {\n        // Write your code here\n    }\n    public int add(int val) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class KthLargest:\n    def __init__(self, k: int, nums: List[int]):\n        # Write your code here\n        pass\n    def add(self, val: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class KthLargest {\n    priority_queue<int, vector<int>, greater<int>> pq;\n    int k;\npublic:\n    KthLargest(int _k, vector<int>& nums) {\n        k = _k;\n        for (int n : nums) {\n            pq.push(n);\n            if (pq.size() > k) pq.pop();\n        }\n    }\n    int add(int val) {\n        pq.push(val);\n        if (pq.size() > k) pq.pop();\n        return pq.top();\n    }\n};' },
      { language: 'Java', completeCode: 'class KthLargest {\n    private PriorityQueue<Integer> pq;\n    private int k;\n    public KthLargest(int k, int[] nums) {\n        this.k = k;\n        pq = new PriorityQueue<>();\n        for (int n : nums) {\n            pq.offer(n);\n            if (pq.size() > k) pq.poll();\n        }\n    }\n    public int add(int val) {\n        pq.offer(val);\n        if (pq.size() > k) pq.poll();\n        return pq.peek();\n    }\n}' },
      { language: 'Python', completeCode: 'class KthLargest:\n    def __init__(self, k: int, nums: List[int]):\n        self.k = k\n        self.pq = nums\n        heapq.heapify(self.pq)\n        while len(self.pq) > k:\n            heapq.heappop(self.pq)\n    def add(self, val: int) -> int:\n        heapq.heappush(self.pq, val)\n        if len(self.pq) > self.k:\n            heapq.heappop(self.pq)\n        return self.pq[0]' },
    ],
  },
  {
    title: 'Redundant Connection', problemNumber: 684, difficulty: 'medium', tags: 'graph',
    cpp: redundantCpp, java: redundantJava, py: redundantPy,
    description: 'In this problem, a tree is an undirected graph that is connected and has no cycles.\n\nYou are given a graph that started as a tree with `n` nodes labeled from `1` to `n`, with one additional edge added. The added edge has two different vertices chosen from `1` to `n`, and was not an edge that already existed. The graph is represented as an array `edges` of length `n` where `edges[i] = [ai, bi]` indicates that there is an edge between nodes `ai` and `bi` in the graph.\n\nReturn an edge that can be removed so that the resulting graph is a tree of `n` nodes. If there are multiple answers, return the answer that occurs last in the input.\n\n**Input format:** Line 1 = `n`, Line 2 = flat space-separated edges.',
    visibleTestCases: [
      { input: '3\n1 2 1 3 2 3', output: '2 3', explanation: 'Removing 2-3 leaves a tree.' },
      { input: '5\n1 2 2 3 3 4 1 4 1 5', output: '1 4', explanation: 'Removing 1-4 leaves a tree.' },
    ],
    hiddenTestCases: [
      { input: '2\n1 2 2 1', output: '2 1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<int> findRedundantConnection(vector<vector<int>>& edges) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int[] findRedundantConnection(int[][] edges) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\n    int find(vector<int>& p, int x) {\n        if (p[x] != x) p[x] = find(p, p[x]);\n        return p[x];\n    }\npublic:\n    vector<int> findRedundantConnection(vector<vector<int>>& edges) {\n        vector<int> p(1001);\n        for (int i = 0; i < 1001; i++) p[i] = i;\n        for (auto& e : edges) {\n            int a = find(p, e[0]), b = find(p, e[1]);\n            if (a == b) return e;\n            p[a] = b;\n        }\n        return {};\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    private int find(int[] p, int x) {\n        if (p[x] != x) p[x] = find(p, p[x]);\n        return p[x];\n    }\n    public int[] findRedundantConnection(int[][] edges) {\n        int[] p = new int[1001];\n        for (int i = 0; i < 1001; i++) p[i] = i;\n        for (int[] e : edges) {\n            int a = find(p, e[0]), b = find(p, e[1]);\n            if (a == b) return e;\n            p[a] = b;\n        }\n        return new int[0];\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:\n        p = [i for i in range(1001)]\n        def find(x):\n            if p[x] != x:\n                p[x] = find(p[x])\n            return p[x]\n        for e in edges:\n            a, b = find(e[0]), find(e[1])\n            if a == b:\n                return e\n            p[a] = b\n        return []' },
    ],
  },
  {
    title: 'Evaluate Division', problemNumber: 399, difficulty: 'medium', tags: 'graph',
    cpp: evalDivCpp, java: evalDivJava, py: evalDivPy,
    description: 'You are given an array of variable pairs `equations` and an array of real numbers `values`, where `equations[i] = [Ai, Bi]` and `values[i]` represent the equation `Ai / Bi = values[i]`. Each `Ai` or `Bi` is a string that represents a single variable.\n\nYou are also given some `queries`, where `queries[j] = [Cj, Dj]` represents the jth query where you must find the answer for `Cj / Dj = ?`.\n\nReturn the answers to all queries. If a single answer cannot be determined, return `-1.0`.\n\n**Input format:** Line 1 = m (equations), next m lines = `A B value`, then line = q (queries), next q lines = `C D`.',
    visibleTestCases: [
      { input: '2\na b 2.0\nb c 3.0\n2\na c\nb a', output: '6.00000 0.50000', explanation: 'a/c = 6, b/a = 0.5.' },
      { input: '3\na b 0.5\nb c 0.5\nbc cd 10.0\n5\na c\nc b\nbc cd\ncd bc\nx x', output: '0.25000 2.00000 10.00000 0.10000 -1.00000', explanation: 'Various evaluations.' },
    ],
    hiddenTestCases: [
      { input: '1\na b 1.0\n1\na b', output: '1.00000' },
      { input: '1\na b 2.0\n1\nb a', output: '0.50000' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<double> calcEquation(vector<vector<string>>& equations, vector<double>& values, vector<vector<string>>& queries) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public double[] calcEquation(List<List<String>> equations, double[] values, List<List<String>> queries) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\n    unordered_map<string, unordered_map<string, double>> g;\npublic:\n    vector<double> calcEquation(vector<vector<string>>& e, vector<double>& v, vector<vector<string>>& q) {\n        for (int i = 0; i < e.size(); i++) {\n            g[e[i][0]][e[i][1]] = v[i];\n            g[e[i][1]][e[i][0]] = 1.0 / v[i];\n        }\n        vector<double> res;\n        for (auto& x : q) {\n            unordered_set<string> vis;\n            res.push_back(dfs(x[0], x[1], vis));\n        }\n        return res;\n    }\nprivate:\n    double dfs(string a, string b, unordered_set<string>& vis) {\n        if (!g.count(a) || !g.count(b)) return -1.0;\n        if (g[a].count(b)) return g[a][b];\n        vis.insert(a);\n        for (auto& [c, val] : g[a]) {\n            if (vis.count(c)) continue;\n            double r = dfs(c, b, vis);\n            if (r != -1.0) return val * r;\n        }\n        return -1.0;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    private Map<String, Map<String, Double>> g = new HashMap<>();\n    public double[] calcEquation(List<List<String>> e, double[] v, List<List<String>> q) {\n        for (int i = 0; i < e.size(); i++) {\n            String a = e.get(i).get(0), b = e.get(i).get(1);\n            g.computeIfAbsent(a, k -> new HashMap<>()).put(b, v[i]);\n            g.computeIfAbsent(b, k -> new HashMap<>()).put(a, 1.0 / v[i]);\n        }\n        double[] res = new double[q.size()];\n        for (int i = 0; i < q.size(); i++) {\n            res[i] = dfs(q.get(i).get(0), q.get(i).get(1), new HashSet<>());\n        }\n        return res;\n    }\n    private double dfs(String a, String b, Set<String> vis) {\n        if (!g.containsKey(a) || !g.containsKey(b)) return -1.0;\n        if (g.get(a).containsKey(b)) return g.get(a).get(b);\n        vis.add(a);\n        for (String c : g.get(a).keySet()) {\n            if (vis.contains(c)) continue;\n            double r = dfs(c, b, vis);\n            if (r != -1.0) return g.get(a).get(c) * r;\n        }\n        return -1.0;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:\n        g = collections.defaultdict(dict)\n        for (a, b), v in zip(equations, values):\n            g[a][b] = v\n            g[b][a] = 1.0 / v\n        def dfs(a, b, vis):\n            if a not in g or b not in g: return -1.0\n            if b in g[a]: return g[a][b]\n            vis.add(a)\n            for c in g[a]:\n                if c in vis: continue\n                r = dfs(c, b, vis)\n                if r != -1.0: return g[a][c] * r\n            return -1.0\n        return [dfs(a, b, set()) for a, b in queries]' },
    ],
  },
  {
    title: 'Reconstruct Itinerary', problemNumber: 332, difficulty: 'hard', tags: 'graph',
    cpp: itineraryCpp, java: itineraryJava, py: itineraryPy,
    description: 'You are given a list of airline `tickets` where `tickets[i] = [fromi, toi]` represent the departure and the arrival airports of one flight. Reconstruct the itinerary in order and return it.\n\nAll of the tickets belong to a man who departs from `"JFK"`, thus, the itinerary must begin with `"JFK"`. If there are multiple valid itineraries, you should return the itinerary that has the smallest lexical order when read as a single string.\n\n**Input format:** Line 1 = n (tickets), next n lines = `from to`.',
        visibleTestCases: [
      { input: '5\nJFK KUL\nJFK NRT\nNRT JFK\nKUL SAN\nSAN NRT', output: 'JFK KUL SAN NRT JFK NRT', explanation: 'Smallest lexical order.' },
      { input: '5\nJFK SFO\nJFK ATL\nSFO ATL\nATL JFK\nATL SFO', output: 'JFK ATL JFK SFO ATL SFO', explanation: 'Smallest lexical order.' },
    ],
    hiddenTestCases: [
      { input: '1\nJFK A', output: 'JFK A' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    vector<string> findItinerary(vector<vector<string>>& tickets) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public List<String> findItinerary(List<List<String>> tickets) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def findItinerary(self, tickets: List[List[str]]) -> List[str]:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\n    unordered_map<string, priority_queue<string, vector<string>, greater<string>>> g;\n    vector<string> res;\npublic:\n    vector<string> findItinerary(vector<vector<string>>& t) {\n        for (auto& x : t) g[x[0]].push(x[1]);\n        dfs("JFK");\n        reverse(res.begin(), res.end());\n        return res;\n    }\n    void dfs(string s) {\n        while (!g[s].empty()) {\n            string d = g[s].top(); g[s].pop();\n            dfs(d);\n        }\n        res.push_back(s);\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    private Map<String, PriorityQueue<String>> g = new HashMap<>();\n    private List<String> res = new ArrayList<>();\n    public List<String> findItinerary(List<List<String>> t) {\n        for (List<String> x : t) {\n            g.computeIfAbsent(x.get(0), k -> new PriorityQueue<>()).offer(x.get(1));\n        }\n        dfs("JFK");\n        Collections.reverse(res);\n        return res;\n    }\n    private void dfs(String s) {\n        PriorityQueue<String> pq = g.get(s);\n        while (pq != null && !pq.isEmpty()) {\n            dfs(pq.poll());\n        }\n        res.add(s);\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def findItinerary(self, tickets: List[List[str]]) -> List[str]:\n        g = collections.defaultdict(list)\n        for a, b in sorted(tickets)[::-1]:\n            g[a].append(b)\n        res = []\n        def dfs(s):\n            while g[s]:\n                dfs(g[s].pop())\n            res.append(s)\n        dfs("JFK")\n        return res[::-1]' },
    ],
  },
  {
    title: 'Min Cost to Connect All Points', problemNumber: 1584, difficulty: 'medium', tags: 'graph',
    cpp: minCostCpp, java: minCostJava, py: minCostPy,
    description: 'You are given an array `points` representing integer coordinates of some points on a 2D-plane, where `points[i] = [xi, yi]`.\n\nThe cost of connecting two points `[xi, yi]` and `[xj, yj]` is the **Manhattan distance** between them: `|xi - xj| + |yi - yj|`.\n\nReturn the minimum cost to make all points connected. All points are connected if there is exactly one simple path between any two points.\n\n**Input format:** Line 1 = n, next n lines = `x y`.',
    visibleTestCases: [
      { input: '3\n0 0\n2 2\n3 10', output: '13', explanation: 'MST cost is 13.' },
      { input: '3\n0 0\n2 2\n3 10', output: '13', explanation: 'MST cost is 13.' },
    ],
    hiddenTestCases: [
      { input: '1\n0 0', output: '0' },
      { input: '2\n0 0\n1 1', output: '2' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int minCostConnectPoints(vector<vector<int>>& points) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int minCostConnectPoints(int[][] points) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def minCostConnectPoints(self, points: List[List[int]]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int minCostConnectPoints(vector<vector<int>>& p) {\n        int n = p.size(), res = 0;\n        vector<bool> vis(n, false);\n        vector<int> dist(n, INT_MAX);\n        dist[0] = 0;\n        for (int i = 0; i < n; i++) {\n            int u = -1;\n            for (int j = 0; j < n; j++) if (!vis[j] && (u == -1 || dist[j] < dist[u])) u = j;\n            vis[u] = true; res += dist[u];\n            for (int v = 0; v < n; v++) {\n                int d = abs(p[u][0] - p[v][0]) + abs(p[u][1] - p[v][1]);\n                if (!vis[v] && d < dist[v]) dist[v] = d;\n            }\n        }\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int minCostConnectPoints(int[][] p) {\n        int n = p.length, res = 0;\n        boolean[] vis = new boolean[n];\n        int[] dist = new int[n];\n        Arrays.fill(dist, Integer.MAX_VALUE);\n        dist[0] = 0;\n        for (int i = 0; i < n; i++) {\n            int u = -1;\n            for (int j = 0; j < n; j++) if (!vis[j] && (u == -1 || dist[j] < dist[u])) u = j;\n            vis[u] = true; res += dist[u];\n            for (int v = 0; v < n; v++) {\n                int d = Math.abs(p[u][0] - p[v][0]) + Math.abs(p[u][1] - p[v][1]);\n                if (!vis[v] && d < dist[v]) dist[v] = d;\n            }\n        }\n        return res;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def minCostConnectPoints(self, points: List[List[int]]) -> int:\n        n = len(points)\n        vis = [False] * n\n        dist = [float("inf")] * n\n        dist[0] = 0\n        res = 0\n        for _ in range(n):\n            u = -1\n            for i in range(n):\n                if not vis[i] and (u == -1 or dist[i] < dist[u]):\n                    u = i\n            vis[u] = True\n            res += dist[u]\n            for v in range(n):\n                d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1])\n                if not vis[v] and d < dist[v]:\n                    dist[v] = d\n        return res' },
    ],
  },
  {
    title: 'Network Delay Time', problemNumber: 743, difficulty: 'medium', tags: 'graph',
    cpp: networkCpp, java: networkJava, py: networkPy,
    description: 'You are given a network of `n` nodes labeled from `1` to `n`. You are also given `times`, a list of travel times as **directed** edges `times[i] = (ui, vi, wi)`, where `ui` is the source node, `vi` is the target node, and `wi` is the time it takes for a signal to travel from source to target.\n\nWe will send a signal from a given node `k`. Return the **minimum** time it takes for all the `n` nodes to receive the signal. If it is impossible for all the `n` nodes to receive the signal, return `-1`.\n\n**Input format:** Line 1 = `n k m` (nodes, start, edges), next m lines = `u v w`.',
    visibleTestCases: [
      { input: '4 2 3\n2 1 1\n2 3 1\n3 4 1', output: '2', explanation: 'Signal reaches all in 2 units.' },
      { input: '2 1 1\n1 2 1', output: '1', explanation: 'Signal reaches in 1 unit.' },
    ],
    hiddenTestCases: [
      { input: '2 2 1\n1 2 1', output: '-1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int networkDelayTime(vector<vector<int>>& times, int n, int k) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int networkDelayTime(int[][] times, int n, int k) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int networkDelayTime(vector<vector<int>>& t, int n, int k) {\n        vector<vector<pair<int,int>>> g(n + 1);\n        for (auto& x : t) g[x[0]].push_back({x[1], x[2]});\n        vector<int> dist(n + 1, INT_MAX);\n        dist[k] = 0;\n        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;\n        pq.push({0, k});\n        while (!pq.empty()) {\n            auto [d, u] = pq.top(); pq.pop();\n            if (d > dist[u]) continue;\n            for (auto& [v, w] : g[u]) {\n                if (dist[u] + w < dist[v]) {\n                    dist[v] = dist[u] + w;\n                    pq.push({dist[v], v});\n                }\n            }\n        }\n        int res = 0;\n        for (int i = 1; i <= n; i++) {\n            if (dist[i] == INT_MAX) return -1;\n            res = max(res, dist[i]);\n        }\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int networkDelayTime(int[][] t, int n, int k) {\n        List<List<int[]>> g = new ArrayList<>();\n        for (int i = 0; i <= n; i++) g.add(new ArrayList<>());\n        for (int[] x : t) g.get(x[0]).add(new int[]{x[1], x[2]});\n        int[] dist = new int[n + 1];\n        Arrays.fill(dist, Integer.MAX_VALUE);\n        dist[k] = 0;\n        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);\n        pq.offer(new int[]{0, k});\n        while (!pq.isEmpty()) {\n            int[] curr = pq.poll();\n            int d = curr[0], u = curr[1];\n            if (d > dist[u]) continue;\n            for (int[] nx : g.get(u)) {\n                int v = nx[0], w = nx[1];\n                if (dist[u] + w < dist[v]) {\n                    dist[v] = dist[u] + w;\n                    pq.offer(new int[]{dist[v], v});\n                }\n            }\n        }\n        int res = 0;\n        for (int i = 1; i <= n; i++) {\n            if (dist[i] == Integer.MAX_VALUE) return -1;\n            res = Math.max(res, dist[i]);\n        }\n        return res;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:\n        g = collections.defaultdict(list)\n        for u, v, w in times:\n            g[u].append((v, w))\n        dist = {i: float(\'inf\') for i in range(1, n+1)}\n        dist[k] = 0\n        pq = [(0, k)]\n        while pq:\n            d, u = heapq.heappop(pq)\n            if d > dist[u]: continue\n            for v, w in g[u]:\n                if d + w < dist[v]:\n                    dist[v] = d + w\n                    heapq.heappush(pq, (dist[v], v))\n        res = max(dist.values())\n        return int(res) if res < float(\'inf\') else -1' },
    ],
  },
  {
    title: 'Swim in Rising Water', problemNumber: 778, difficulty: 'hard', tags: 'graph',
    cpp: swimCpp, java: swimJava, py: swimPy,
    description: 'You are given an `n x n` integer matrix `grid` where each value `grid[i][j]` represents the elevation at that point `(i, j)`.\n\nThe rain starts to fall. At time `t`, the depth of the water everywhere is `t`. You can swim from a square to another 4-directionally adjacent square if and only if the elevation of both squares individually are at most `t`. You can swim infinite distances in zero time. Of course, you must stay within the boundaries of the grid during your swim.\n\nReturn the least time until you can reach the bottom right square `(n - 1, n - 1)` if you start at the top left square `(0, 0)`.\n\n**Input format:** Line 1 = n, next n lines = grid.',
    visibleTestCases: [
      { input: '2\n0 2\n1 3', output: '3', explanation: 'Wait until t=3 to reach.' },
      { input: '3\n0 1 2\n3 4 5\n6 7 8', output: '8', explanation: 'Wait until t=8 to reach.' },
    ],
    hiddenTestCases: [
      { input: '1\n0', output: '0' },
      { input: '1\n5', output: '5' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int swimInWater(vector<vector<int>>& grid) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int swimInWater(int[][] grid) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def swimInWater(self, grid: List[List[int]]) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int swimInWater(vector<vector<int>>& g) {\n        int n = g.size(), res = 0;\n        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;\n        vector<vector<bool>> vis(n, vector<bool>(n, false));\n        pq.push({g[0][0], 0});\n        while (!pq.empty()) {\n            auto [t, idx] = pq.top(); pq.pop();\n            int i = idx / n, j = idx % n;\n            if (vis[i][j]) continue;\n            vis[i][j] = true;\n            res = max(res, t);\n            if (i == n - 1 && j == n - 1) return res;\n            int dirs[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};\n            for (auto& d : dirs) {\n                int ni = i + d[0], nj = j + d[1];\n                if (ni >= 0 && ni < n && nj >= 0 && nj < n && !vis[ni][nj])\n                    pq.push({g[ni][nj], ni * n + nj});\n            }\n        }\n        return res;\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int swimInWater(int[][] g) {\n        int n = g.length, res = 0;\n        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);\n        boolean[][] vis = new boolean[n][n];\n        pq.offer(new int[]{g[0][0], 0});\n        while (!pq.isEmpty()) {\n            int[] curr = pq.poll();\n            int t = curr[0], idx = curr[1];\n            int i = idx / n, j = idx % n;\n            if (vis[i][j]) continue;\n            vis[i][j] = true;\n            res = Math.max(res, t);\n            if (i == n - 1 && j == n - 1) return res;\n            int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};\n            for (int[] d : dirs) {\n                int ni = i + d[0], nj = j + d[1];\n                if (ni >= 0 && ni < n && nj >= 0 && nj < n && !vis[ni][nj])\n                    pq.offer(new int[]{g[ni][nj], ni * n + nj});\n            }\n        }\n        return res;\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def swimInWater(self, grid: List[List[int]]) -> int:\n        n = len(grid)\n        pq = [(grid[0][0], 0)]\n        vis = set()\n        res = 0\n        while pq:\n            t, idx = heapq.heappop(pq)\n            i, j = divmod(idx, n)\n            if (i, j) in vis: continue\n            vis.add((i, j))\n            res = max(res, t)\n            if i == n - 1 and j == n - 1: return res\n            for di, dj in [(1,0),(-1,0),(0,1),(0,-1)]:\n                ni, nj = i + di, j + dj\n                if 0 <= ni < n and 0 <= nj < n and (ni, nj) not in vis:\n                    heapq.heappush(pq, (grid[ni][nj], ni * n + nj))\n        return res' },
    ],
  },
  {
    title: 'Cheapest Flights Within K Stops', problemNumber: 787, difficulty: 'medium', tags: 'graph',
    cpp: flightsCpp, java: flightsJava, py: flightsPy,
    description: 'There are `n` cities connected by some number of flights. You are given an array `flights` where `flights[i] = [fromi, toi, pricei]` indicates that there is a flight from city `fromi` to city `toi` with cost `pricei`.\n\nYou are also given three integers `src`, `dst`, and `k`, return the **cheapest price** from `src` to `dst` with at most `k` stops. If there is no such route, return `-1`.\n\n**Input format:** Line 1 = `n src dst k m`, next m lines = `u v w`.',
    visibleTestCases: [
      { input: '4 0 3 1 3\n0 1 100\n1 2 100\n2 3 100', output: '-1', explanation: 'Too many stops.' },
      { input: '4 0 3 2 3\n0 1 100\n1 2 100\n2 3 100', output: '300', explanation: 'Cheapest cost is 300.' },
    ],
    hiddenTestCases: [
      { input: '3 0 2 1 3\n0 1 100\n1 2 100\n0 2 500', output: '200' },
      { input: '3 0 2 0 1\n0 1 100', output: '-1' },
    ],
    startCode: [
      { language: 'C++', initialCode: 'class Solution {\npublic:\n    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {\n        // Write your code here\n    }\n};' },
      { language: 'Java', initialCode: 'class Solution {\n    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {\n        // Write your code here\n    }\n}' },
      { language: 'Python', initialCode: 'class Solution:\n    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:\n        # Write your code here\n        pass' },
    ],
    referenceSolution: [
      { language: 'C++', completeCode: 'class Solution {\npublic:\n    int findCheapestPrice(int n, vector<vector<int>>& f, int src, int dst, int k) {\n        vector<int> dist(n, INT_MAX);\n        dist[src] = 0;\n        for (int i = 0; i <= k; i++) {\n            vector<int> tmp = dist;\n            for (auto& e : f) {\n                if (dist[e[0]] != INT_MAX && dist[e[0]] + e[2] < tmp[e[1]])\n                    tmp[e[1]] = dist[e[0]] + e[2];\n            }\n            dist = tmp;\n        }\n        return dist[dst] == INT_MAX ? -1 : dist[dst];\n    }\n};' },
      { language: 'Java', completeCode: 'class Solution {\n    public int findCheapestPrice(int n, int[][] f, int src, int dst, int k) {\n        int[] dist = new int[n];\n        Arrays.fill(dist, Integer.MAX_VALUE);\n        dist[src] = 0;\n        for (int i = 0; i <= k; i++) {\n            int[] tmp = Arrays.copyOf(dist, n);\n            for (int[] e : f) {\n                if (dist[e[0]] != Integer.MAX_VALUE && dist[e[0]] + e[2] < tmp[e[1]])\n                    tmp[e[1]] = dist[e[0]] + e[2];\n            }\n            dist = tmp;\n        }\n        return dist[dst] == Integer.MAX_VALUE ? -1 : dist[dst];\n    }\n}' },
      { language: 'Python', completeCode: 'class Solution:\n    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:\n        dist = [float("inf")] * n\n        dist[src] = 0\n        for _ in range(k + 1):\n            tmp = list(dist)\n            for u, v, w in flights:\n                if dist[u] != float("inf") and dist[u] + w < tmp[v]:\n                    tmp[v] = dist[u] + w\n            dist = tmp\n        return -1 if dist[dst] == float("inf") else int(dist[dst])' },
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
      emailId: ADMIN_EMAIL, password: ADMIN_PASSWORD,
    });
    const cookies = loginRes.headers['set-cookie'];
    if (!cookies) throw new Error('Login failed');
    const client = axios.create({ headers: { Cookie: cookies } });
    console.log('✅ Logged in\n');

    const problemsWithHarnesses = problemsData.map((p) => ({
      title: p.title, problemNumber: p.problemNumber, description: p.description,
      difficulty: p.difficulty, tags: p.tags,
      visibleTestCases: p.visibleTestCases, hiddenTestCases: p.hiddenTestCases,
      startCode: p.startCode, referenceSolution: p.referenceSolution,
      testHarness: [
        { language: 'C++', harnessCode: p.cpp },
        { language: 'Java', harnessCode: p.java },
        { language: 'Python', harnessCode: p.py },
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
          await client.put(`${BACKEND_URL}/problem/update/${existing._id}`, {
            ...adminRes.data, problemNumber: p.problemNumber, difficulty: p.difficulty,
            tags: p.tags, startCode: p.startCode, visibleTestCases: p.visibleTestCases,
            hiddenTestCases: p.hiddenTestCases, referenceSolution: p.referenceSolution,
            testHarness: p.testHarness,
          });
          console.log(`✅ Updated "${p.title}" (#${p.problemNumber})`);
          updated++;
        } catch (err) {
          const msg = err.response?.data?.error || err.message;
          console.error(`❌ Failed to update "${p.title}": ${msg}\n`);
          failures.push({ title: p.title, error: msg }); failed++;
        }
      } else {
        try {
          await client.post(`${BACKEND_URL}/problem/create`, p);
          console.log(`✅ Created "${p.title}" (#${p.problemNumber})\n`);
          created++;
        } catch (err) {
          const msg = err.response?.data?.error || err.message;
          console.error(`❌ Failed to create "${p.title}": ${msg}\n`);
          failures.push({ title: p.title, error: msg }); failed++;
        }
      }
      await new Promise((r) => setTimeout(r, 6000));
    }

    console.log('─'.repeat(60));
    console.log(`🎉 Final 8 problems complete`);
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